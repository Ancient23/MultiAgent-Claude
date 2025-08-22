const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const VariableResolver = require('./variable-resolver');
const WorkflowLoader = require('./workflow-loader');
const ComponentCache = require('./component-cache');

/**
 * PromptComposer - Main composition engine for building prompts from YAML components
 */
class PromptComposer {
    constructor(options = {}) {
        this.options = options;
        this.baseDir = options.baseDir || path.join(process.cwd(), 'prompts');
        this.variableResolver = new VariableResolver(options);
        this.workflowLoader = new WorkflowLoader(this.baseDir);
        this.cache = new ComponentCache(options.cacheDir);
        this.loadedComponents = new Map();
        this.compositionDepth = 0;
        this.maxDepth = options.maxDepth || 10;
    }

    /**
     * Compose a complete prompt from a workflow definition
     * @param {string} workflowName - Name of the workflow to compose
     * @param {Object} context - Context object with variables and options
     * @returns {Promise<string>} - Composed prompt text
     */
    async compose(workflowName, context = {}) {
        try {
            // Check cache first
            const cacheKey = this.getCacheKey(workflowName, context);
            const cached = await this.cache.get(cacheKey);
            if (cached && !this.options.skipCache) {
                return cached;
            }

            // Load workflow definition
            const workflow = await this.workflowLoader.load(workflowName);
            
            // Merge context with workflow variables
            const mergedContext = this.mergeContext(workflow, context);
            
            // Build component list based on workflow
            const componentList = await this.buildComponentList(workflow, mergedContext);
            
            // Load and compose components
            const sections = [];
            for (const componentPath of componentList) {
                const content = await this.loadComponent(componentPath, mergedContext);
                if (content) {
                    sections.push(content);
                }
            }
            
            // Apply post-processing
            let result = sections.join('\n\n');
            result = await this.applyPostProcessing(result, workflow, mergedContext);
            
            // Cache the result
            await this.cache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            throw new Error(`Failed to compose prompt '${workflowName}': ${error.message}`);
        }
    }

    /**
     * Build a list of components to load based on workflow definition
     */
    async buildComponentList(workflow, context) {
        const components = [];
        
        // Add required components
        if (workflow.required) {
            components.push(...workflow.required);
        }
        
        // Process conditional components
        if (workflow.conditional) {
            for (const condition of workflow.conditional) {
                if (await this.evaluateCondition(condition.if, context)) {
                    if (Array.isArray(condition.then)) {
                        components.push(...condition.then);
                    } else {
                        components.push(condition.then);
                    }
                } else if (condition.else) {
                    if (Array.isArray(condition.else)) {
                        components.push(...condition.else);
                    } else {
                        components.push(condition.else);
                    }
                }
            }
        }
        
        // Add optional components based on context
        if (workflow.optional && context.options) {
            for (const [option, componentPath] of Object.entries(workflow.optional)) {
                if (context.options[option]) {
                    components.push(componentPath);
                }
            }
        }
        
        return components;
    }

    /**
     * Load a single component and resolve its content
     */
    async loadComponent(componentPath, context) {
        // Check for circular dependencies
        if (this.compositionDepth > this.maxDepth) {
            throw new Error(`Maximum composition depth exceeded at ${componentPath}`);
        }
        
        // Check if already loaded
        if (this.loadedComponents.has(componentPath)) {
            return this.loadedComponents.get(componentPath);
        }
        
        try {
            this.compositionDepth++;
            
            // Load component file
            const fullPath = path.join(this.baseDir, `${componentPath}.yml`);
            const componentData = await fs.readFile(fullPath, 'utf8');
            const component = yaml.load(componentData);
            
            // Check version compatibility
            if (component.version && !this.isVersionCompatible(component.version)) {
                console.warn(`Component ${componentPath} version ${component.version} may not be compatible`);
            }
            
            // Process dependencies
            if (component.dependencies) {
                for (const dep of component.dependencies) {
                    await this.loadComponent(dep, context);
                }
            }
            
            // Merge component variables with context
            const componentContext = {
                ...context,
                ...component.variables,
                component: {
                    name: component.name,
                    version: component.version,
                    path: componentPath
                }
            };
            
            // Resolve variables in content
            let content = component.content || '';
            content = await this.variableResolver.resolve(content, componentContext);
            
            // Process includes
            if (component.includes) {
                const includes = [];
                for (const include of component.includes) {
                    const includeContent = await this.loadComponent(include, componentContext);
                    includes.push(includeContent);
                }
                content = includes.join('\n\n') + '\n\n' + content;
            }
            
            // Store in cache
            this.loadedComponents.set(componentPath, content);
            
            return content;
        } finally {
            this.compositionDepth--;
        }
    }

    /**
     * Apply post-processing steps to the composed prompt
     */
    async applyPostProcessing(content, workflow, context) {
        let result = content;
        
        // Apply workflow-specific post-processing
        if (workflow.post_processing) {
            for (const processor of workflow.post_processing) {
                result = await this.runProcessor(processor, result, context);
            }
        }
        
        // Apply global post-processing
        if (this.options.postProcessors) {
            for (const processor of this.options.postProcessors) {
                result = await processor(result, context);
            }
        }
        
        return result;
    }

    /**
     * Run a named post-processor
     */
    async runProcessor(processorName, content, context) {
        switch (processorName) {
            case 'validate_markdown':
                return this.validateMarkdown(content);
            case 'check_required_sections':
                return this.checkRequiredSections(content, context);
            case 'optimize_length':
                return this.optimizeLength(content, context);
            case 'remove_duplicates':
                return this.removeDuplicates(content);
            case 'format_code_blocks':
                return this.formatCodeBlocks(content);
            default:
                // Try to load custom processor
                if (this.options.customProcessors && this.options.customProcessors[processorName]) {
                    return await this.options.customProcessors[processorName](content, context);
                }
                console.warn(`Unknown post-processor: ${processorName}`);
                return content;
        }
    }

    /**
     * Validate markdown syntax
     */
    validateMarkdown(content) {
        // Basic markdown validation
        const lines = content.split('\n');
        const processed = [];
        let inCodeBlock = false;
        
        for (let line of lines) {
            // Fix unclosed code blocks
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
            }
            
            // Fix heading spacing
            if (line.match(/^#+\s/)) {
                // Ensure blank line before headings
                if (processed.length > 0 && processed[processed.length - 1].trim() !== '') {
                    processed.push('');
                }
            }
            
            processed.push(line);
        }
        
        // Close any unclosed code blocks
        if (inCodeBlock) {
            processed.push('```');
        }
        
        return processed.join('\n');
    }

    /**
     * Check for required sections in the prompt
     */
    checkRequiredSections(content, context) {
        const required = context.requiredSections || [];
        const missing = [];
        
        for (const section of required) {
            const regex = new RegExp(`^#+\\s+${section}`, 'mi');
            if (!content.match(regex)) {
                missing.push(section);
            }
        }
        
        if (missing.length > 0) {
            console.warn(`Missing required sections: ${missing.join(', ')}`);
        }
        
        return content;
    }

    /**
     * Optimize prompt length by removing redundancy
     */
    optimizeLength(content, context) {
        const maxLength = context.maxLength || 50000;
        
        if (content.length <= maxLength) {
            return content;
        }
        
        // Remove excessive blank lines
        content = content.replace(/\n{3,}/g, '\n\n');
        
        // Remove trailing whitespace
        content = content.split('\n').map(line => line.trimEnd()).join('\n');
        
        // If still too long, truncate with warning
        if (content.length > maxLength) {
            console.warn(`Prompt truncated from ${content.length} to ${maxLength} characters`);
            content = content.substring(0, maxLength) + '\n\n[... truncated ...]';
        }
        
        return content;
    }

    /**
     * Remove duplicate sections
     */
    removeDuplicates(content) {
        const sections = content.split(/^#{1,3}\s+/m);
        const seen = new Set();
        const unique = [];
        
        for (const section of sections) {
            const normalized = section.trim().toLowerCase();
            const hash = this.hashSection(normalized);
            
            if (!seen.has(hash)) {
                seen.add(hash);
                unique.push(section);
            }
        }
        
        return unique.join('\n## ');
    }

    /**
     * Format code blocks consistently
     */
    formatCodeBlocks(content) {
        return content.replace(/```(\w+)?\n/g, (match, lang) => {
            return lang ? `\`\`\`${lang}\n` : '```\n';
        });
    }

    /**
     * Evaluate a condition expression
     */
    async evaluateCondition(expression, context) {
        // Simple property check
        if (expression.startsWith('!')) {
            const prop = expression.substring(1);
            return !this.getNestedProperty(context, prop);
        }
        
        // Property existence check
        if (!expression.includes('==') && !expression.includes('!=')) {
            return !!this.getNestedProperty(context, expression);
        }
        
        // Comparison operations
        const [left, operator, right] = expression.match(/(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)/).slice(1);
        const leftValue = this.getNestedProperty(context, left.trim());
        const rightValue = this.parseValue(right.trim());
        
        switch (operator) {
            case '==': return leftValue == rightValue;
            case '!=': return leftValue != rightValue;
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            default: return false;
        }
    }

    /**
     * Get nested property from object
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current ? current[prop] : undefined;
        }, obj);
    }

    /**
     * Parse a value string
     */
    parseValue(value) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;
        if (value === 'undefined') return undefined;
        if (value.match(/^\d+$/)) return parseInt(value);
        if (value.match(/^\d+\.\d+$/)) return parseFloat(value);
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1);
        }
        return value;
    }

    /**
     * Check version compatibility
     */
    isVersionCompatible(version) {
        // Simple semver check
        const [major] = version.split('.');
        const [currentMajor] = (this.options.version || '1.0.0').split('.');
        return major === currentMajor;
    }

    /**
     * Merge workflow and context variables
     */
    mergeContext(workflow, context) {
        return {
            ...context,
            workflow: {
                name: workflow.name,
                version: workflow.version,
                ...workflow.variables
            }
        };
    }

    /**
     * Generate cache key for a composition
     */
    getCacheKey(workflowName, context) {
        const contextHash = this.hashObject(context);
        return `${workflowName}-${contextHash}`;
    }

    /**
     * Hash an object for caching
     */
    hashObject(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Hash a section for duplicate detection
     */
    hashSection(text) {
        // Simple hash for section comparison
        return text.substring(0, 100);
    }

    /**
     * List available workflows
     */
    async listWorkflows() {
        const workflowDir = path.join(this.baseDir, 'workflows');
        const files = await fs.readdir(workflowDir);
        const workflows = [];
        
        for (const file of files) {
            if (file.endsWith('.yml')) {
                const name = path.basename(file, '.yml');
                const workflow = await this.workflowLoader.load(name);
                workflows.push({
                    name,
                    description: workflow.description,
                    version: workflow.version
                });
            }
        }
        
        return workflows;
    }

    /**
     * Validate a workflow and its components
     */
    async validateWorkflow(workflowName) {
        const errors = [];
        const warnings = [];
        
        try {
            const workflow = await this.workflowLoader.load(workflowName);
            
            // Check all referenced components exist
            const components = await this.buildComponentList(workflow, {});
            for (const component of components) {
                try {
                    await this.loadComponent(component, {});
                } catch (error) {
                    errors.push(`Component '${component}' not found or invalid: ${error.message}`);
                }
            }
            
            // Validate workflow structure
            if (!workflow.name) warnings.push('Workflow missing name field');
            if (!workflow.version) warnings.push('Workflow missing version field');
            if (!workflow.description) warnings.push('Workflow missing description field');
            
        } catch (error) {
            errors.push(`Failed to load workflow: ${error.message}`);
        }
        
        return { errors, warnings, valid: errors.length === 0 };
    }
}

module.exports = PromptComposer;