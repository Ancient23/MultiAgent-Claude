#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Bidirectional Agent/Role Converter
 * Converts between Claude agents and ChatGPT roles using universal template
 */

class AgentRoleConverter {
  constructor() {
    this.universalBase = this.loadTemplate('universal-template-base.yaml');
    this.claudeExtensions = this.loadTemplate('claude-extensions.yaml');
    this.chatgptExtensions = this.loadTemplate('chatgpt-extensions.yaml');
  }

  loadTemplate(filename) {
    const templatePath = path.join(
      process.cwd(),
      'Examples/agents/templates',
      filename
    );
    if (fs.existsSync(templatePath)) {
      return yaml.load(fs.readFileSync(templatePath, 'utf8'));
    }
    return null;
  }

  /**
   * Convert Claude agent to ChatGPT role
   */
  claudeToChatGPT(claudeAgent) {
    const universal = this.extractUniversalFromClaude(claudeAgent);
    return this.universalToChatGPT(universal);
  }

  /**
   * Convert ChatGPT role to Claude agent
   */
  chatGPTToClaude(chatgptRole) {
    const universal = this.extractUniversalFromChatGPT(chatgptRole);
    return this.universalToClaude(universal);
  }

  /**
   * Extract universal template from Claude agent
   */
  extractUniversalFromClaude(agent) {
    const universal = JSON.parse(JSON.stringify(this.universalBase));
    
    // Map Claude-specific fields to universal
    universal.core.identifier.name = agent.name || '';
    universal.core.identifier.type = this.determineType(agent);
    
    // Extract purpose from agent description
    const descriptionMatch = agent.content?.match(/\*\*Purpose\*\*:\s*(.+?)(?:\n|$)/);
    universal.core.purpose.brief = descriptionMatch?.[1] || '';
    universal.core.purpose.detailed = agent.description || '';
    
    // Extract triggers
    const triggersMatch = agent.content?.match(/\*\*Trigger\*\*:\s*(.+?)(?:\n\n|$)/s);
    if (triggersMatch) {
      universal.core.triggers.keywords = this.extractKeywords(triggersMatch[1]);
    }
    
    // Extract capabilities
    const capabilitiesMatch = agent.content?.match(/## Capabilities\s*\n([\s\S]+?)(?:\n##|$)/);
    if (capabilitiesMatch) {
      universal.core.capabilities.domains = this.extractListItems(capabilitiesMatch[1]);
    }
    
    // Extract workflow phases
    const workflowMatch = agent.content?.match(/## (?:Workflow|Process)\s*\n([\s\S]+?)(?:\n##|$)/);
    if (workflowMatch) {
      universal.core.workflow.phases = this.extractPhases(workflowMatch[1]);
    }
    
    // Preserve Claude-specific extensions
    universal.extensions.claude = this.extractClaudeExtensions(agent);
    
    return universal;
  }

  /**
   * Extract universal template from ChatGPT role
   */
  extractUniversalFromChatGPT(role) {
    const universal = JSON.parse(JSON.stringify(this.universalBase));
    
    // ChatGPT roles are typically more concise
    universal.core.identifier.name = role.name || '';
    universal.core.identifier.type = 'specialist'; // Most ChatGPT roles are specialists
    
    // Parse the role content
    const lines = role.content?.split('\n') || [];
    universal.core.purpose.brief = lines[0]?.replace(/^#\s*/, '') || '';
    
    // Extract sections
    const sections = this.parseSections(role.content);
    
    if (sections['role']) {
      universal.core.purpose.detailed = sections['role'];
    }
    
    if (sections['expertise']) {
      universal.core.capabilities.domains = sections['expertise'].split(',').map(s => s.trim());
    }
    
    if (sections['approach']) {
      universal.core.workflow.phases = this.extractListItems(sections['approach']);
    }
    
    // Preserve ChatGPT-specific extensions
    universal.extensions.chatgpt = this.extractChatGPTExtensions(role);
    
    return universal;
  }

  /**
   * Convert universal template to Claude agent
   */
  universalToClaude(universal) {
    const claudeAgent = {
      name: universal.core.identifier.name,
      type: 'agent',
      content: this.generateClaudeContent(universal),
      metadata: {
        version: universal.core.identifier.version,
        created: new Date().toISOString(),
        source: 'universal-converter'
      }
    };
    
    return claudeAgent;
  }

  /**
   * Convert universal template to ChatGPT role
   */
  universalToChatGPT(universal) {
    const chatgptRole = {
      name: universal.core.identifier.name,
      type: 'role',
      content: this.generateChatGPTContent(universal),
      metadata: {
        version: universal.core.identifier.version,
        created: new Date().toISOString(),
        source: 'universal-converter'
      }
    };
    
    return chatgptRole;
  }

  /**
   * Generate Claude agent content from universal template
   */
  generateClaudeContent(universal) {
    const { core, extensions } = universal;
    const claude = extensions?.claude || {};
    
    let content = `# ${core.identifier.name}

**Type**: ${core.identifier.type}
**Purpose**: ${core.purpose.brief}

## Description
${core.purpose.detailed}

## Trigger
${this.formatTriggers(core.triggers)}

## Capabilities
${this.formatList(core.capabilities.domains)}

## Operations
${this.formatList(core.capabilities.operations)}

## Workflow
${this.formatPhases(core.workflow.phases)}

## Requirements
${this.formatRequirements(core.requirements)}

## Quality Standards
${this.formatList(core.standards.success_criteria)}
`;

    // Add Claude-specific sections
    if (claude.mcp_tools?.enabled) {
      content += `
## MCP Tools
${this.formatMCPTools(claude.mcp_tools)}
`;
    }

    if (claude.memory) {
      content += `
## Memory Integration
${this.formatMemory(claude.memory)}
`;
    }

    return content;
  }

  /**
   * Generate ChatGPT role content from universal template
   */
  generateChatGPTContent(universal) {
    const { core, extensions } = universal;
    const chatgpt = extensions?.chatgpt || {};
    
    // ChatGPT roles are more concise, max 1500 chars
    let content = `# ${core.identifier.name}

You are a ${core.identifier.type} specialized in ${core.capabilities.domains.join(', ')}.

## Role
${core.purpose.detailed}

## Expertise
${core.capabilities.domains.join(', ')}

## Approach
${core.workflow.phases.map(p => `- ${p}`).join('\n')}

## Key Capabilities
${core.capabilities.operations.slice(0, 5).map(o => `- ${o}`).join('\n')}
`;

    // Add response style if specified
    if (chatgpt.custom_instructions?.how_to_respond) {
      content += `
## Response Style
${chatgpt.custom_instructions.how_to_respond}
`;
    }

    // Ensure within ChatGPT's character limit
    if (content.length > 1500) {
      content = this.compressForChatGPT(content, 1500);
    }

    return content;
  }

  // Helper methods
  determineType(agent) {
    const content = agent.content?.toLowerCase() || '';
    if (content.includes('orchestrat')) return 'orchestrator';
    if (content.includes('specialist')) return 'specialist';
    return 'utility';
  }

  extractKeywords(text) {
    const keywords = [];
    const matches = text.match(/`([^`]+)`/g);
    if (matches) {
      keywords.push(...matches.map(m => m.replace(/`/g, '')));
    }
    // Also extract words after "when user mentions"
    const mentionMatch = text.match(/when user mentions?\s+(.+?)(?:\.|,|\n|$)/gi);
    if (mentionMatch) {
      mentionMatch.forEach(m => {
        const words = m.replace(/when user mentions?\s+/i, '').split(/[,\s]+/);
        keywords.push(...words.filter(w => w.length > 2));
      });
    }
    return [...new Set(keywords)];
  }

  extractListItems(text) {
    const items = [];
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^[\s-*]+(.+)/);
      if (match) {
        items.push(match[1].trim());
      }
    });
    return items;
  }

  extractPhases(text) {
    const phases = [];
    const matches = text.match(/\d+\.\s*(.+?)(?=\d+\.|$)/gs);
    if (matches) {
      phases.push(...matches.map(m => m.replace(/^\d+\.\s*/, '').trim()));
    }
    return phases.length > 0 ? phases : this.extractListItems(text);
  }

  parseSections(content) {
    const sections = {};
    const sectionMatches = content.match(/##\s*([^\n]+)\n([\s\S]+?)(?=\n##|$)/g);
    if (sectionMatches) {
      sectionMatches.forEach(match => {
        const [, title, body] = match.match(/##\s*([^\n]+)\n([\s\S]+)/);
        sections[title.toLowerCase()] = body.trim();
      });
    }
    return sections;
  }

  extractClaudeExtensions(agent) {
    // Extract Claude-specific features from agent content
    const extensions = {};
    
    // MCP tools
    const mcpMatch = agent.content?.match(/## MCP Tools?\s*\n([\s\S]+?)(?:\n##|$)/);
    if (mcpMatch) {
      extensions.mcp_tools = { enabled: true, tools: this.extractListItems(mcpMatch[1]) };
    }
    
    // Memory integration
    const memoryMatch = agent.content?.match(/## Memory/i);
    if (memoryMatch) {
      extensions.memory_integration = true;
    }
    
    return extensions;
  }

  extractChatGPTExtensions(role) {
    // Extract ChatGPT-specific features
    const extensions = {};
    
    // Response style
    const styleMatch = role.content?.match(/## Response Style\s*\n([\s\S]+?)(?:\n##|$)/);
    if (styleMatch) {
      extensions.response_style = styleMatch[1].trim();
    }
    
    return extensions;
  }

  formatTriggers(triggers) {
    const parts = [];
    if (triggers.keywords?.length) {
      parts.push(`Keywords: ${triggers.keywords.map(k => `\`${k}\``).join(', ')}`);
    }
    if (triggers.patterns?.length) {
      parts.push(`Patterns: ${triggers.patterns.join(', ')}`);
    }
    if (triggers.contexts?.length) {
      parts.push(`Contexts: ${triggers.contexts.join(', ')}`);
    }
    return parts.join('\n');
  }

  formatList(items) {
    if (!items || items.length === 0) return '- None specified';
    return items.map(item => `- ${item}`).join('\n');
  }

  formatPhases(phases) {
    if (!phases || phases.length === 0) return '1. No phases specified';
    return phases.map((phase, i) => `${i + 1}. ${phase}`).join('\n');
  }

  formatRequirements(requirements) {
    const parts = [];
    if (requirements.tools?.length) {
      parts.push(`### Tools\n${this.formatList(requirements.tools)}`);
    }
    if (requirements.knowledge?.length) {
      parts.push(`### Knowledge\n${this.formatList(requirements.knowledge)}`);
    }
    return parts.join('\n\n') || 'No specific requirements';
  }

  formatMCPTools(mcpTools) {
    if (!mcpTools.servers?.length) return 'No MCP tools configured';
    return mcpTools.servers.map(server => 
      `- ${server.name}: ${server.tools?.join(', ') || 'all tools'}`
    ).join('\n');
  }

  formatMemory(memory) {
    const parts = [];
    if (memory.read_patterns?.length) {
      parts.push(`Read: ${memory.read_patterns.join(', ')}`);
    }
    if (memory.write_suggestions?.length) {
      parts.push(`Suggest: ${memory.write_suggestions.join(', ')}`);
    }
    return parts.join('\n') || 'Standard memory integration';
  }

  compressForChatGPT(content, maxLength) {
    // Intelligent compression for ChatGPT's character limit
    if (content.length <= maxLength) return content;
    
    // Remove less critical sections
    content = content.replace(/## Requirements[\s\S]+?(?=\n##|$)/g, '');
    content = content.replace(/## Quality Standards[\s\S]+?(?=\n##|$)/g, '');
    
    // Truncate lists to top items
    content = content.replace(/(\n- [^\n]+){6,}/g, (match) => {
      const items = match.split('\n').filter(i => i);
      return items.slice(0, 3).join('\n') + '\n- [...]';
    });
    
    // Final truncation if still too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength - 20) + '\n\n[Truncated]';
    }
    
    return content;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Usage: mac convert-agent <source-type> <target-type> <file-path>

Examples:
  mac convert-agent claude chatgpt ./agent.md
  mac convert-agent chatgpt claude ./role.md
  mac convert-agent universal claude ./template.yaml
  
Options:
  --output <path>  Output file path (default: stdout)
  --validate       Validate output against schema
  --batch          Process all files in directory
    `);
    process.exit(1);
  }

  const [sourceType, targetType, filePath] = args;
  const converter = new AgentRoleConverter();
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let result;
    
    // Parse input based on extension
    const input = filePath.endsWith('.yaml') || filePath.endsWith('.yml')
      ? yaml.load(content)
      : { content, name: path.basename(filePath, path.extname(filePath)) };
    
    // Perform conversion
    if (sourceType === 'claude' && targetType === 'chatgpt') {
      result = converter.claudeToChatGPT(input);
    } else if (sourceType === 'chatgpt' && targetType === 'claude') {
      result = converter.chatGPTToClaude(input);
    } else if (sourceType === 'universal') {
      if (targetType === 'claude') {
        result = converter.universalToClaude(input);
      } else if (targetType === 'chatgpt') {
        result = converter.universalToChatGPT(input);
      }
    } else {
      throw new Error(`Unsupported conversion: ${sourceType} to ${targetType}`);
    }
    
    // Output result
    const outputIndex = args.indexOf('--output');
    if (outputIndex !== -1 && args[outputIndex + 1]) {
      const outputPath = args[outputIndex + 1];
      const outputContent = typeof result === 'object' 
        ? yaml.dump(result) 
        : result.content || result;
      fs.writeFileSync(outputPath, outputContent);
      console.log(`✅ Converted ${sourceType} to ${targetType}: ${outputPath}`);
    } else {
      console.log(result.content || yaml.dump(result));
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = { AgentRoleConverter };

// Run if called directly
if (require.main === module) {
  main();
}