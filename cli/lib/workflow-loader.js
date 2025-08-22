const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * WorkflowLoader - Loads and validates workflow definitions
 */
class WorkflowLoader {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.workflowCache = new Map();
        this.manifestCache = null;
    }

    /**
     * Load a workflow definition
     * @param {string} workflowName - Name of the workflow to load
     * @returns {Promise<Object>} - Workflow definition object
     */
    async load(workflowName) {
        // Check cache
        if (this.workflowCache.has(workflowName)) {
            return this.workflowCache.get(workflowName);
        }

        try {
            // Try loading from workflows directory
            const workflowPath = path.join(this.baseDir, 'workflows', `${workflowName}.yml`);
            const workflowData = await fs.readFile(workflowPath, 'utf8');
            const workflow = yaml.load(workflowData);

            // Validate workflow structure
            this.validateWorkflow(workflow, workflowName);

            // Process inheritance
            if (workflow.extends) {
                workflow = await this.processInheritance(workflow);
            }

            // Process imports
            if (workflow.imports) {
                workflow = await this.processImports(workflow);
            }

            // Cache the workflow
            this.workflowCache.set(workflowName, workflow);

            return workflow;
        } catch (error) {
            throw new Error(`Failed to load workflow '${workflowName}': ${error.message}`);
        }
    }

    /**
     * Validate workflow structure
     */
    validateWorkflow(workflow, name) {
        const errors = [];

        // Required fields
        if (!workflow.name) {
            errors.push('Workflow must have a name');
        }
        if (!workflow.version) {
            errors.push('Workflow must have a version');
        }
        if (!workflow.description) {
            errors.push('Workflow must have a description');
        }

        // Validate component references
        if (workflow.required && !Array.isArray(workflow.required)) {
            errors.push('Required components must be an array');
        }

        // Validate conditional structure
        if (workflow.conditional) {
            if (!Array.isArray(workflow.conditional)) {
                errors.push('Conditional must be an array');
            } else {
                workflow.conditional.forEach((condition, index) => {
                    if (!condition.if) {
                        errors.push(`Conditional ${index} missing 'if' clause`);
                    }
                    if (!condition.then && !condition.else) {
                        errors.push(`Conditional ${index} must have 'then' or 'else' clause`);
                    }
                });
            }
        }

        // Validate post-processing
        if (workflow.post_processing && !Array.isArray(workflow.post_processing)) {
            errors.push('Post-processing must be an array');
        }

        if (errors.length > 0) {
            throw new Error(`Invalid workflow '${name}': ${errors.join(', ')}`);
        }
    }

    /**
     * Process workflow inheritance
     */
    async processInheritance(workflow) {
        const parent = await this.load(workflow.extends);
        
        // Deep merge parent and child workflows
        const merged = this.deepMerge(parent, workflow);
        
        // Remove extends field from result
        delete merged.extends;
        
        return merged;
    }

    /**
     * Process workflow imports
     */
    async processImports(workflow) {
        const imports = {};
        
        for (const importPath of workflow.imports) {
            const imported = await this.loadImport(importPath);
            Object.assign(imports, imported);
        }
        
        // Merge imports with workflow
        if (imports.variables) {
            workflow.variables = { ...imports.variables, ...workflow.variables };
        }
        if (imports.required) {
            workflow.required = [...(imports.required || []), ...(workflow.required || [])];
        }
        
        return workflow;
    }

    /**
     * Load an import file
     */
    async loadImport(importPath) {
        const fullPath = path.join(this.baseDir, `${importPath}.yml`);
        const data = await fs.readFile(fullPath, 'utf8');
        return yaml.load(data);
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else if (Array.isArray(source[key])) {
                    // For arrays, concatenate unique values
                    if (Array.isArray(result[key])) {
                        const combined = [...result[key], ...source[key]];
                        result[key] = [...new Set(combined)];
                    } else {
                        result[key] = [...source[key]];
                    }
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Load the manifest file
     */
    async loadManifest() {
        if (this.manifestCache) {
            return this.manifestCache;
        }

        try {
            const manifestPath = path.join(this.baseDir, 'manifest.json');
            const manifestData = await fs.readFile(manifestPath, 'utf8');
            this.manifestCache = JSON.parse(manifestData);
            return this.manifestCache;
        } catch (error) {
            // Return default manifest if not found
            return {
                version: '1.0.0',
                components: {},
                workflows: {},
                templates: {}
            };
        }
    }

    /**
     * Get workflow metadata from manifest
     */
    async getWorkflowMetadata(workflowName) {
        const manifest = await this.loadManifest();
        return manifest.workflows[workflowName] || null;
    }

    /**
     * List all available workflows
     */
    async listWorkflows() {
        const workflowDir = path.join(this.baseDir, 'workflows');
        
        try {
            const files = await fs.readdir(workflowDir);
            const workflows = [];
            
            for (const file of files) {
                if (file.endsWith('.yml')) {
                    const name = path.basename(file, '.yml');
                    try {
                        const workflow = await this.load(name);
                        workflows.push({
                            name: workflow.name || name,
                            description: workflow.description || 'No description',
                            version: workflow.version || '1.0.0',
                            tags: workflow.tags || [],
                            category: workflow.category || 'general'
                        });
                    } catch (error) {
                        console.warn(`Failed to load workflow ${name}: ${error.message}`);
                    }
                }
            }
            
            return workflows;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    /**
     * Get workflow dependencies
     */
    async getWorkflowDependencies(workflowName) {
        const workflow = await this.load(workflowName);
        const dependencies = new Set();
        
        // Add required components
        if (workflow.required) {
            workflow.required.forEach(dep => dependencies.add(dep));
        }
        
        // Add conditional components
        if (workflow.conditional) {
            workflow.conditional.forEach(condition => {
                if (condition.then) {
                    if (Array.isArray(condition.then)) {
                        condition.then.forEach(dep => dependencies.add(dep));
                    } else {
                        dependencies.add(condition.then);
                    }
                }
                if (condition.else) {
                    if (Array.isArray(condition.else)) {
                        condition.else.forEach(dep => dependencies.add(dep));
                    } else {
                        dependencies.add(condition.else);
                    }
                }
            });
        }
        
        // Add optional components
        if (workflow.optional) {
            Object.values(workflow.optional).forEach(dep => {
                if (Array.isArray(dep)) {
                    dep.forEach(d => dependencies.add(d));
                } else {
                    dependencies.add(dep);
                }
            });
        }
        
        return Array.from(dependencies);
    }

    /**
     * Validate all workflows
     */
    async validateAll() {
        const workflows = await this.listWorkflows();
        const results = {};
        
        for (const workflow of workflows) {
            try {
                await this.load(workflow.name);
                results[workflow.name] = { valid: true };
            } catch (error) {
                results[workflow.name] = { 
                    valid: false, 
                    error: error.message 
                };
            }
        }
        
        return results;
    }

    /**
     * Export a workflow with all dependencies resolved
     */
    async exportWorkflow(workflowName) {
        const workflow = await this.load(workflowName);
        const dependencies = await this.getWorkflowDependencies(workflowName);
        const components = {};
        
        // Load all component definitions
        for (const dep of dependencies) {
            try {
                const componentPath = path.join(this.baseDir, `${dep}.yml`);
                const componentData = await fs.readFile(componentPath, 'utf8');
                components[dep] = yaml.load(componentData);
            } catch (error) {
                console.warn(`Failed to load component ${dep}: ${error.message}`);
            }
        }
        
        return {
            workflow,
            components,
            metadata: {
                exported: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }

    /**
     * Clear the workflow cache
     */
    clearCache() {
        this.workflowCache.clear();
        this.manifestCache = null;
    }
}

module.exports = WorkflowLoader;