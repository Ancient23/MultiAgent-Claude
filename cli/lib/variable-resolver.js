const os = require('os');
const path = require('path');

/**
 * VariableResolver - Handles variable substitution in prompt templates
 */
class VariableResolver {
    constructor(options = {}) {
        this.options = options;
        this.customResolvers = options.customResolvers || {};
        this.maxIterations = options.maxIterations || 10;
        
        // Built-in resolvers
        this.resolvers = {
            date: () => new Date().toISOString().split('T')[0],
            time: () => new Date().toTimeString().split(' ')[0].replace(/:/g, ''),
            timestamp: () => Date.now().toString(),
            datetime: () => new Date().toISOString(),
            year: () => new Date().getFullYear().toString(),
            month: () => String(new Date().getMonth() + 1).padStart(2, '0'),
            day: () => String(new Date().getDate()).padStart(2, '0'),
            random: () => Math.random().toString(36).substring(7),
            uuid: () => this.generateUUID(),
            hostname: () => os.hostname(),
            platform: () => os.platform(),
            user: () => os.userInfo().username,
            cwd: () => process.cwd(),
            ...this.customResolvers
        };
    }

    /**
     * Resolve all variables in a template string
     * @param {string} template - Template string with variables
     * @param {Object} context - Context object with variable values
     * @returns {Promise<string>} - Resolved string
     */
    async resolve(template, context = {}) {
        let result = template;
        let iterations = 0;
        let hasChanges = true;
        
        // Keep resolving until no more changes or max iterations reached
        while (hasChanges && iterations < this.maxIterations) {
            const before = result;
            
            // Resolve different variable patterns with single regex for better performance
            result = await this.resolvePattern(result, context, /\$\{([^}]+)\}|\{\{([^}]+)\}\}|<%=\s*([^%]+)\s*%>/g);
            
            hasChanges = result !== before;
            iterations++;
        }
        
        if (iterations >= this.maxIterations) {
            console.warn('Maximum variable resolution iterations reached. Some variables may be unresolved.');
        }
        
        return result;
    }

    /**
     * Resolve variables matching a specific pattern
     */
    async resolvePattern(template, context, pattern) {
        return template.replace(pattern, (match, ...groups) => {
            try {
                // Find the first non-undefined capture group
                const expression = groups.find(group => group !== undefined);
                if (!expression) return match;
                
                return this.evaluateExpression(expression.trim(), context);
            } catch (error) {
                console.warn(`Failed to resolve variable '${match}': ${error.message}`);
                return match; // Keep original if resolution fails
            }
        });
    }

    /**
     * Evaluate a variable expression
     */
    evaluateExpression(expression, context) {
        // Handle pipes for transformations
        const parts = expression.split('|').map(p => p.trim());
        let value = this.getValue(parts[0], context);
        
        // Apply transformations
        for (let i = 1; i < parts.length; i++) {
            value = this.applyTransformation(value, parts[i], context);
        }
        
        return value !== undefined ? String(value) : '';
    }

    /**
     * Get value from expression
     */
    getValue(expression, context) {
        // Check for function calls
        if (expression.includes('(') && expression.includes(')')) {
            return this.callFunction(expression, context);
        }
        
        // Check for array index
        if (expression.match(/\[(\d+)\]$/)) {
            const [base, index] = expression.match(/(.+?)\[(\d+)\]$/).slice(1);
            const array = this.getValue(base, context);
            return Array.isArray(array) ? array[parseInt(index)] : undefined;
        }
        
        // Check for property access
        if (expression.includes('.')) {
            return this.getNestedValue(expression, context);
        }
        
        // Check built-in resolvers
        if (this.resolvers[expression]) {
            return this.resolvers[expression](context);
        }
        
        // Check context directly
        if (context[expression] !== undefined) {
            return context[expression];
        }
        
        // Check environment variables
        if (expression.startsWith('env.')) {
            const envVar = expression.substring(4);
            return process.env[envVar];
        }
        
        // Check process properties
        if (expression.startsWith('process.')) {
            const prop = expression.substring(8);
            switch (prop) {
                case 'cwd()': return process.cwd();
                case 'pid': return process.pid;
                case 'version': return process.version;
                case 'platform': return process.platform;
                case 'arch': return process.arch;
                default: return undefined;
            }
        }
        
        return undefined;
    }

    /**
     * Get nested value from object
     */
    getNestedValue(path, context) {
        const parts = path.split('.');
        let current = context;
        
        for (const part of parts) {
            // Handle array index in path
            if (part.includes('[') && part.includes(']')) {
                const [base, index] = part.match(/(.+?)\[(\d+)\]/).slice(1);
                current = current[base];
                if (Array.isArray(current)) {
                    current = current[parseInt(index)];
                } else {
                    return undefined;
                }
            } else {
                // Check if it's a built-in resolver at this level
                if (current === context && this.resolvers[part]) {
                    return this.resolvers[part](context);
                }
                current = current ? current[part] : undefined;
            }
            
            if (current === undefined) break;
        }
        
        return current;
    }

    /**
     * Call a function in the expression
     */
    callFunction(expression, context) {
        const match = expression.match(/(\w+)\((.*)\)/);
        if (!match) return undefined;
        
        const [, funcName, args] = match;
        
        // Built-in functions
        switch (funcName) {
            case 'upper':
                return this.getValue(args, context)?.toUpperCase();
            case 'lower':
                return this.getValue(args, context)?.toLowerCase();
            case 'capitalize':
                return this.capitalize(this.getValue(args, context));
            case 'trim':
                return this.getValue(args, context)?.trim();
            case 'length':
                const val = this.getValue(args, context);
                return Array.isArray(val) || typeof val === 'string' ? val.length : 0;
            case 'join':
                const [arrayExpr, separator] = args.split(',').map(a => a.trim());
                const array = this.getValue(arrayExpr, context);
                const sep = separator ? this.getValue(separator.replace(/['"]/g, ''), context) : ',';
                return Array.isArray(array) ? array.join(sep) : '';
            case 'default':
                const [valueExpr, defaultExpr] = args.split(',').map(a => a.trim());
                const value = this.getValue(valueExpr, context);
                return value !== undefined && value !== null && value !== '' 
                    ? value 
                    : this.getValue(defaultExpr.replace(/['"]/g, ''), context);
            case 'exists':
                return this.getValue(args, context) !== undefined;
            case 'empty':
                const checkVal = this.getValue(args, context);
                return !checkVal || (Array.isArray(checkVal) && checkVal.length === 0);
            case 'not':
                return !this.getValue(args, context);
            case 'if':
                const [condition, trueVal, falseVal] = args.split(',').map(a => a.trim());
                return this.getValue(condition, context) 
                    ? this.getValue(trueVal, context)
                    : this.getValue(falseVal, context);
            default:
                // Check custom functions
                if (this.options.customFunctions && this.options.customFunctions[funcName]) {
                    return this.options.customFunctions[funcName](args, context);
                }
                return undefined;
        }
    }

    /**
     * Apply transformation to a value
     */
    applyTransformation(value, transformation, context) {
        // Parse transformation with arguments
        const match = transformation.match(/(\w+)(?:\((.*)\))?/);
        if (!match) return value;
        
        const [, transform, args] = match;
        
        switch (transform) {
            case 'upper':
            case 'uppercase':
                return String(value).toUpperCase();
            case 'lower':
            case 'lowercase':
                return String(value).toLowerCase();
            case 'capitalize':
                return this.capitalize(String(value));
            case 'camelCase':
                return this.toCamelCase(String(value));
            case 'pascalCase':
                return this.toPascalCase(String(value));
            case 'snakeCase':
            case 'snake_case':
                return this.toSnakeCase(String(value));
            case 'kebabCase':
            case 'kebab-case':
                return this.toKebabCase(String(value));
            case 'trim':
                return String(value).trim();
            case 'truncate':
                const length = args ? parseInt(args) : 50;
                return String(value).length > length 
                    ? String(value).substring(0, length) + '...'
                    : String(value);
            case 'replace':
                if (args) {
                    const [search, replace] = args.split(',').map(a => a.trim().replace(/['"]/g, ''));
                    return String(value).replace(new RegExp(search, 'g'), replace);
                }
                return value;
            case 'prefix':
                return args ? args.replace(/['"]/g, '') + String(value) : value;
            case 'suffix':
                return args ? String(value) + args.replace(/['"]/g, '') : value;
            case 'indent':
                const spaces = args ? parseInt(args) : 2;
                return String(value).split('\n').map(line => ' '.repeat(spaces) + line).join('\n');
            case 'json':
                try {
                    return JSON.stringify(value, null, args ? parseInt(args) : 2);
                } catch {
                    return String(value);
                }
            case 'base64':
                return Buffer.from(String(value)).toString('base64');
            case 'md5':
                return this.md5Hash(String(value));
            case 'escape':
                return String(value)
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t');
            case 'default':
                // Handle default transformation (fallback value)
                if (value !== undefined && value !== null && value !== '') {
                    return value;
                }
                if (args) {
                    // Handle function calls in default value like process.cwd()
                    return this.getValue(args.replace(/['"]/g, ''), context);
                }
                return '';
            default:
                // Check custom transformations
                if (this.options.customTransformations && this.options.customTransformations[transform]) {
                    return this.options.customTransformations[transform](value, args, context);
                }
                return value;
        }
    }

    /**
     * Capitalize first letter of each word
     */
    capitalize(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Convert to camelCase
     */
    toCamelCase(str) {
        return str.replace(/[-_\s]+(.)?/g, (match, char) => char ? char.toUpperCase() : '');
    }

    /**
     * Convert to PascalCase
     */
    toPascalCase(str) {
        const camel = this.toCamelCase(str);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    }

    /**
     * Convert to snake_case
     */
    toSnakeCase(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
            .replace(/[-\s]+/g, '_')
            .replace(/^_/, '')
            .toLowerCase();
    }

    /**
     * Convert to kebab-case
     */
    toKebabCase(str) {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            .replace(/[_\s]+/g, '-')
            .replace(/^-/, '')
            .toLowerCase();
    }

    /**
     * Generate a UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Simple MD5 hash (for non-cryptographic use)
     */
    md5Hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Add custom resolver
     */
    addResolver(name, resolver) {
        this.resolvers[name] = resolver;
    }

    /**
     * Add custom transformation
     */
    addTransformation(name, transformation) {
        this.options.customTransformations = this.options.customTransformations || {};
        this.options.customTransformations[name] = transformation;
    }

    /**
     * Add custom function
     */
    addFunction(name, func) {
        this.options.customFunctions = this.options.customFunctions || {};
        this.options.customFunctions[name] = func;
    }
}

module.exports = VariableResolver;