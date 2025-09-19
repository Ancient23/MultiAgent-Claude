#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');

/**
 * Validation Framework for Agent/Role Templates
 * Ensures consistency, quality, and cross-platform compatibility
 */

class AgentValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.loadSchemas();
    this.validationResults = [];
  }

  loadSchemas() {
    // Load universal template schema
    const schemaPath = path.join(process.cwd(), 'Examples', 'agents', 'templates');
    
    // JSON Schema for universal template
    this.universalSchema = {
      type: 'object',
      required: ['core', 'extensions', 'tracking', 'validation', 'conversion'],
      properties: {
        metadata: {
          type: 'object',
          required: ['schema_version', 'compatibility', 'template_type'],
          properties: {
            schema_version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
            compatibility: { type: 'array', items: { type: 'string' } },
            template_type: { type: 'string', enum: ['universal-base', 'claude', 'chatgpt'] }
          }
        },
        core: {
          type: 'object',
          required: ['identifier', 'purpose', 'triggers', 'capabilities', 'workflow'],
          properties: {
            identifier: {
              type: 'object',
              required: ['name', 'type'],
              properties: {
                name: { type: 'string', pattern: '^[a-z0-9-]+$' },
                type: { type: 'string', enum: ['orchestrator', 'specialist', 'utility'] },
                version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' }
              }
            },
            purpose: {
              type: 'object',
              required: ['brief', 'detailed'],
              properties: {
                brief: { type: 'string', minLength: 10, maxLength: 100 },
                detailed: { type: 'string', minLength: 50 },
                use_cases: { type: 'array', items: { type: 'string' } }
              }
            },
            triggers: {
              type: 'object',
              required: ['keywords'],
              properties: {
                keywords: { type: 'array', items: { type: 'string' }, minItems: 1 },
                patterns: { type: 'array', items: { type: 'string' } },
                contexts: { type: 'array', items: { type: 'string' } }
              }
            },
            capabilities: {
              type: 'object',
              required: ['domains', 'operations'],
              properties: {
                domains: { type: 'array', items: { type: 'string' }, minItems: 1 },
                operations: { type: 'array', items: { type: 'string' }, minItems: 1 },
                limitations: { type: 'array', items: { type: 'string' } }
              }
            },
            workflow: {
              type: 'object',
              required: ['phases'],
              properties: {
                phases: { type: 'array', items: { type: 'string' }, minItems: 1 },
                decision_points: { type: 'array', items: { type: 'string' } },
                output_format: { type: 'string' }
              }
            }
          }
        }
      }
    };
    
    // Compile schemas
    this.validateUniversal = this.ajv.compile(this.universalSchema);
  }

  /**
   * Validate a single agent file
   */
  validateAgent(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const name = path.basename(filepath, path.extname(filepath));
    
    const results = {
      name,
      filepath,
      valid: true,
      errors: [],
      warnings: [],
      score: 0
    };
    
    // Structural validation
    this.validateStructure(content, results);
    
    // Content validation
    this.validateContent(content, results);
    
    // Cross-platform compatibility
    this.validateCompatibility(content, results);
    
    // Quality checks
    this.validateQuality(content, results);
    
    // Calculate overall score
    results.score = this.calculateScore(results);
    results.valid = results.errors.length === 0;
    
    this.validationResults.push(results);
    return results;
  }

  /**
   * Validate structure
   */
  validateStructure(content, results) {
    const requiredSections = [
      { pattern: /\*\*Type\*\*:/i, name: 'Type declaration' },
      { pattern: /\*\*Purpose\*\*:/i, name: 'Purpose declaration' },
      { pattern: /## Description/i, name: 'Description section' },
      { pattern: /## Trigger/i, name: 'Trigger section' },
      { pattern: /## Capabilities/i, name: 'Capabilities section' },
      { pattern: /## Workflow/i, name: 'Workflow section' }
    ];
    
    requiredSections.forEach(section => {
      if (!section.pattern.test(content)) {
        results.errors.push(`Missing required section: ${section.name}`);
      }
    });
    
    // Check for proper markdown structure
    const headers = content.match(/^#{1,6}\s.+$/gm) || [];
    if (headers.length < 5) {
      results.warnings.push('Insufficient section headers');
    }
  }

  /**
   * Validate content quality
   */
  validateContent(content, results) {
    // Check trigger keywords
    const triggerMatch = content.match(/\*\*Primary Keywords\*\*:\s*(.+)/);
    if (triggerMatch) {
      const keywords = triggerMatch[1].split(',').map(k => k.trim());
      if (keywords.length < 2) {
        results.warnings.push('Too few trigger keywords (recommend 3+)');
      }
    } else {
      results.errors.push('No primary keywords defined');
    }
    
    // Check for examples
    if (!content.includes('```')) {
      results.warnings.push('No code examples provided');
    }
    
    // Check workflow phases
    const workflowMatch = content.match(/### Phase \d+:/g);
    if (!workflowMatch || workflowMatch.length < 3) {
      results.warnings.push('Workflow should have at least 3 phases');
    }
    
    // Check for MCP tools (Claude agents)
    if (content.includes('**Type**: specialist') && !content.includes('## MCP Tools')) {
      results.warnings.push('Specialist agents should define MCP tools');
    }
  }

  /**
   * Validate cross-platform compatibility
   */
  validateCompatibility(content, results) {
    // Check for platform-specific features
    const claudeSpecific = ['MCP Tools', 'Memory Integration', 'Task tool'];
    const chatgptSpecific = ['Custom Instructions', 'GPT Actions', '1500 chars'];
    
    let hasClaude = false;
    let hasChatGPT = false;
    
    claudeSpecific.forEach(feature => {
      if (content.includes(feature)) hasClaude = true;
    });
    
    chatgptSpecific.forEach(feature => {
      if (content.includes(feature)) hasChatGPT = true;
    });
    
    // Check for platform compatibility section
    if (!content.includes('## Platform Compatibility')) {
      results.warnings.push('Missing platform compatibility section');
    }
    
    // Warn if only one platform is supported
    if (hasClaude && !hasChatGPT) {
      results.warnings.push('Consider adding ChatGPT compatibility');
    } else if (hasChatGPT && !hasClaude) {
      results.warnings.push('Consider adding Claude compatibility');
    }
  }

  /**
   * Validate quality standards
   */
  validateQuality(content, results) {
    // Length checks
    const lines = content.split('\n').length;
    if (lines < 100) {
      results.warnings.push('Agent description too brief (< 100 lines)');
    } else if (lines > 500) {
      results.warnings.push('Agent description too long (> 500 lines)');
    }
    
    // Check for quality standards section
    if (!content.includes('### Success Criteria')) {
      results.warnings.push('Missing success criteria');
    }
    
    if (!content.includes('### Anti-Patterns')) {
      results.warnings.push('Missing anti-patterns to avoid');
    }
    
    // Check for version info
    if (!content.includes('Version:')) {
      results.errors.push('Missing version information');
    }
    
    // Check for proper categorization
    const typeMatch = content.match(/\*\*Type\*\*:\s*(orchestrator|specialist|utility)/i);
    if (!typeMatch) {
      results.errors.push('Invalid or missing agent type');
    }
  }

  /**
   * Calculate validation score
   */
  calculateScore(results) {
    let score = 100;
    
    // Deduct for errors (major issues)
    score -= results.errors.length * 15;
    
    // Deduct for warnings (minor issues)
    score -= results.warnings.length * 5;
    
    return Math.max(0, score);
  }

  /**
   * Validate all agents in a directory
   */
  validateDirectory(directory) {
    const files = fs.readdirSync(directory)
      .filter(f => f.endsWith('.md') && !f.includes('README') && !f.includes('TEMPLATE'));
    
    const results = [];
    files.forEach(file => {
      const filepath = path.join(directory, file);
      const result = this.validateAgent(filepath);
      results.push(result);
    });
    
    return results;
  }

  /**
   * Validate YAML template
   */
  validateYAMLTemplate(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const template = yaml.load(content);
    
    const valid = this.validateUniversal(template);
    
    return {
      filepath,
      valid,
      errors: valid ? [] : this.ajv.errors
    };
  }

  /**
   * Test conversion between platforms
   */
  async testConversion(agentPath) {
    const ConverterClass = require('./convert-agent.js').AgentRoleConverter;
    const converter = new ConverterClass();
    
    const content = fs.readFileSync(agentPath, 'utf8');
    const agent = { content, name: path.basename(agentPath) };
    
    try {
      // Test Claude to ChatGPT
      const chatgpt = converter.claudeToChatGPT(agent);
      
      // Test ChatGPT back to Claude
      const claude = converter.chatGPTToClaude(chatgpt);
      
      // Check if critical information preserved
      const preserved = 
        agent.content.includes('**Type**') === claude.content.includes('**Type**') &&
        agent.content.includes('**Purpose**') === claude.content.includes('**Purpose**');
      
      return {
        success: true,
        preserved,
        chatgptLength: chatgpt.content.length,
        roundTripMatch: agent.content.length === claude.content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.validationResults.length,
        valid: this.validationResults.filter(r => r.valid).length,
        errors: this.validationResults.reduce((sum, r) => sum + r.errors.length, 0),
        warnings: this.validationResults.reduce((sum, r) => sum + r.warnings.length, 0),
        averageScore: 0
      },
      agents: this.validationResults,
      recommendations: []
    };
    
    // Calculate average score
    const scores = this.validationResults.map(r => r.score);
    report.summary.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Generate recommendations
    const commonErrors = {};
    const commonWarnings = {};
    
    this.validationResults.forEach(result => {
      result.errors.forEach(error => {
        commonErrors[error] = (commonErrors[error] || 0) + 1;
      });
      result.warnings.forEach(warning => {
        commonWarnings[warning] = (commonWarnings[warning] || 0) + 1;
      });
    });
    
    // Add recommendations for common issues
    Object.entries(commonErrors).forEach(([error, count]) => {
      if (count > 2) {
        report.recommendations.push({
          type: 'error',
          issue: error,
          affected: count,
          suggestion: this.getSuggestion(error)
        });
      }
    });
    
    Object.entries(commonWarnings).forEach(([warning, count]) => {
      if (count > 5) {
        report.recommendations.push({
          type: 'warning',
          issue: warning,
          affected: count,
          suggestion: this.getSuggestion(warning)
        });
      }
    });
    
    return report;
  }

  /**
   * Get suggestion for common issues
   */
  getSuggestion(issue) {
    const suggestions = {
      'Missing version information': 'Add version field to all agents',
      'Missing success criteria': 'Define clear success criteria for each agent',
      'No code examples provided': 'Add code examples to demonstrate usage',
      'Too few trigger keywords': 'Add more specific trigger keywords',
      'Missing platform compatibility section': 'Document platform-specific features'
    };
    
    return suggestions[issue] || 'Review and update agent documentation';
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const validator = new AgentValidator();
  
  switch (command) {
    case 'agent':
      const agentPath = args[1];
      if (!agentPath) {
        console.error('Usage: mac validate agent <path>');
        process.exit(1);
      }
      const result = validator.validateAgent(agentPath);
      console.log(`\n📋 Validation Results for ${result.name}`);
      console.log(`Valid: ${result.valid ? '✅' : '❌'}`);
      console.log(`Score: ${result.score}/100`);
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(e => console.log(`  - ${e}`));
      }
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(w => console.log(`  - ${w}`));
      }
      break;
      
    case 'all':
      const dirs = [
        path.join(process.cwd(), 'Examples', 'agents'),
        path.join(process.cwd(), 'Examples', 'agents', 'specialists'),
        path.join(process.cwd(), 'Examples', 'roles')
      ];
      
      dirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          console.log(`\n📁 Validating ${path.basename(dir)}...`);
          validator.validateDirectory(dir);
        }
      });
      
      const report = validator.generateReport();
      console.log('\n📊 Validation Summary');
      console.log(`Total Agents: ${report.summary.total}`);
      console.log(`Valid: ${report.summary.valid}/${report.summary.total}`);
      console.log(`Average Score: ${report.summary.averageScore.toFixed(1)}/100`);
      console.log(`Total Errors: ${report.summary.errors}`);
      console.log(`Total Warnings: ${report.summary.warnings}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => {
          console.log(`- ${rec.issue} (affects ${rec.affected} agents)`);
          console.log(`  Suggestion: ${rec.suggestion}`);
        });
      }
      break;
      
    case 'conversion':
      const testPath = args[1];
      if (!testPath) {
        console.error('Usage: mac validate conversion <agent-path>');
        process.exit(1);
      }
      const conversionResult = await validator.testConversion(testPath);
      console.log('\n🔄 Conversion Test');
      console.log(`Success: ${conversionResult.success ? '✅' : '❌'}`);
      if (conversionResult.success) {
        console.log(`ChatGPT Length: ${conversionResult.chatgptLength} chars`);
        console.log(`Information Preserved: ${conversionResult.preserved ? '✅' : '⚠️'}`);
        console.log(`Round-trip Match: ${conversionResult.roundTripMatch ? '✅' : '⚠️'}`);
      } else {
        console.log(`Error: ${conversionResult.error}`);
      }
      break;
      
    case 'yaml':
      const yamlPath = args[1];
      if (!yamlPath) {
        console.error('Usage: mac validate yaml <template-path>');
        process.exit(1);
      }
      const yamlResult = validator.validateYAMLTemplate(yamlPath);
      console.log(`\n📋 YAML Validation`);
      console.log(`Valid: ${yamlResult.valid ? '✅' : '❌'}`);
      if (!yamlResult.valid) {
        console.log('Errors:', yamlResult.errors);
      }
      break;
      
    default:
      console.log(`
Agent Validation Framework

Commands:
  agent <path>        Validate a single agent
  all                 Validate all agents
  conversion <path>   Test platform conversion
  yaml <path>         Validate YAML template

Examples:
  mac validate agent ./agents/my-agent.md
  mac validate all
  mac validate conversion ./agents/test-agent.md
  mac validate yaml ./templates/universal-template.yaml
      `);
  }
}

// Export for testing
module.exports = { AgentValidator };

// Run if called directly
if (require.main === module) {
  main();
}