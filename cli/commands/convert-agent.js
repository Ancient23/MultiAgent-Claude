#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Enhanced Bidirectional Agent/Role Converter
 * Properly converts between Claude agents (with YAML frontmatter) and ChatGPT roles
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
      try {
        return yaml.load(fs.readFileSync(templatePath, 'utf8'));
      } catch (error) {
        console.warn(`Warning: Could not load template ${filename}:`, error.message);
        return null;
      }
    }
    return null;
  }

  /**
   * Parse agent file with YAML frontmatter
   */
  parseAgentFile(content) {
    // Handle YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (frontmatterMatch) {
      const [, yamlContent, markdownContent] = frontmatterMatch;
      try {
        const frontmatter = yaml.load(yamlContent);
        return {
          frontmatter,
          content: markdownContent.trim(),
          hasYamlFrontmatter: true
        };
      } catch (error) {
        console.warn('Warning: Could not parse YAML frontmatter:', error.message);
      }
    }
    
    // Fallback to old format detection
    return {
      frontmatter: null,
      content: content.trim(),
      hasYamlFrontmatter: false
    };
  }

  /**
   * Convert Claude agent to ChatGPT role
   */
  claudeToChatGPT(agentContent) {
    const parsed = this.parseAgentFile(agentContent);
    
    if (parsed.hasYamlFrontmatter) {
      return this.convertModernAgentToChatGPT(parsed);
    } else {
      return this.convertLegacyAgentToChatGPT(parsed);
    }
  }

  /**
   * Convert modern agent (with YAML frontmatter) to ChatGPT role
   */
  convertModernAgentToChatGPT(parsed) {
    const { frontmatter, content } = parsed;
    const name = frontmatter.name || 'unnamed-specialist';
    const description = frontmatter.description || '';
    
    // Extract core competencies and approach from content
    const goalMatch = content.match(/## Goal\s*\n([\s\S]*?)(?=\n##|$)/);
    const competenciesMatch = content.match(/## Core Competencies[^]*?1\.\s*\*\*([^*]+)\*\*:\s*([^\n]+)/);
    const planningMatch = content.match(/## Planning Approach[^]*?When creating implementation plans, you will:\s*\n([\s\S]*?)(?=\nYour plans|$)/);
    
    const goal = goalMatch ? goalMatch[1].trim().split('\n')[0] : '';
    const expertise = this.extractExpertiseDomains(description, content);
    const approach = planningMatch ? this.extractApproachSteps(planningMatch[1]) : [];
    
    // Convert research-plan-execute pattern to ChatGPT instructions
    const roleInstructions = this.convertResearchPatternToChatGPT(content, frontmatter);
    
    let chatgptContent = `# ${name}

You are a ${expertise.join(' and ')} specialist.

## Role
${roleInstructions}

## Expertise
${expertise.join(', ')}

## Approach
${approach.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Key Capabilities
- Create detailed implementation plans
- Research latest best practices
- Provide expert technical guidance
- Document comprehensive strategies
- Ensure quality standards compliance

## Response Pattern
When asked to help with relevant tasks:
1. Acknowledge the request and confirm your expertise applies
2. Ask clarifying questions if needed
3. Create a comprehensive implementation plan
4. Provide specific, actionable recommendations
5. Include quality standards and success criteria

*Optimized for ChatGPT context window*`;

    // Compress to fit ChatGPT's limits
    if (chatgptContent.length > 1500) {
      chatgptContent = this.compressForChatGPT(chatgptContent, 1400);
    }

    return {
      name,
      content: chatgptContent,
      metadata: {
        source: 'claude-agent',
        converted: new Date().toISOString(),
        originalType: frontmatter.model || 'sonnet'
      }
    };
  }

  /**
   * Convert research-plan-execute pattern to ChatGPT instructions
   */
  convertResearchPatternToChatGPT(content, frontmatter) {
    const goalMatch = content.match(/## Goal\s*\n([\s\S]*?)(?=\n\*\*IMPORTANT\*\*|$)/);
    const goal = goalMatch ? goalMatch[1].trim() : '';
    
    // Simplify the research-plan-execute pattern for ChatGPT
    const description = frontmatter.description || '';
    const triggerKeywords = this.extractTriggerKeywords(description);
    
    return `Create detailed implementation plans for ${goal.toLowerCase()}. 
Focus on providing comprehensive guidance with latest best practices. 
Triggered by: ${triggerKeywords.join(', ')}.
Always provide actionable, step-by-step implementation strategies.`;
  }

  /**
   * Extract expertise domains from description and content
   */
  extractExpertiseDomains(description, content) {
    const domains = [];
    
    // Extract from description
    const descMatch = description.match(/specializes in (.+?)(?:\.|Use PROACTIVELY)/);
    if (descMatch) {
      const specializations = descMatch[1].split(/,| and /).map(s => s.trim());
      domains.push(...specializations);
    }
    
    // Extract from competencies section
    const compMatch = content.match(/## Core Competencies.*?\n([\s\S]*?)(?=\n##|$)/);
    if (compMatch) {
      const compLines = compMatch[1].split('\n')
        .filter(line => line.match(/^\d+\.\s*\*\*(.+?)\*\*/))
        .map(line => line.match(/^\d+\.\s*\*\*(.+?)\*\*/)[1]);
      domains.push(...compLines);
    }
    
    return [...new Set(domains.filter(d => d && d.length > 2))].slice(0, 3);
  }

  /**
   * Extract approach steps from planning section
   */
  extractApproachSteps(planningText) {
    const steps = [];
    const stepMatches = planningText.match(/\d+\.\s*\*\*(.+?)\*\*:\s*(.+?)(?=\n\d+\.|$)/g);
    
    if (stepMatches) {
      stepMatches.forEach(match => {
        const stepMatch = match.match(/\d+\.\s*\*\*(.+?)\*\*:\s*(.+)/);
        if (stepMatch) {
          steps.push(`${stepMatch[1]}: ${stepMatch[2].trim()}`);
        }
      });
    }
    
    return steps.slice(0, 5); // Limit to 5 steps for ChatGPT
  }

  /**
   * Extract trigger keywords from description
   */
  extractTriggerKeywords(description) {
    const keywords = [];
    
    // Extract from "when user mentions" patterns
    const mentionMatches = description.match(/when user mentions ([^.]+)/gi);
    if (mentionMatches) {
      mentionMatches.forEach(match => {
        const mentioned = match.replace(/when user mentions /i, '');
        keywords.push(...mentioned.split(/,| or /).map(k => k.trim()));
      });
    }
    
    // Extract from "PROACTIVELY when" patterns  
    const proactiveMatches = description.match(/PROACTIVELY when (.+?)(?:\.|Use)/gi);
    if (proactiveMatches) {
      proactiveMatches.forEach(match => {
        const triggers = match.replace(/PROACTIVELY when /i, '').replace(/\.$/, '');
        keywords.push(...triggers.split(/,| or /).map(k => k.trim()));
      });
    }
    
    return [...new Set(keywords.filter(k => k.length > 2))].slice(0, 8);
  }

  /**
   * Convert ChatGPT role to Claude agent
   */
  chatGPTToClaude(roleContent) {
    const parsed = this.parseRoleContent(roleContent);
    return this.generateClaudeAgent(parsed);
  }

  /**
   * Parse ChatGPT role content
   */
  parseRoleContent(content) {
    const lines = content.split('\n');
    const name = lines[0]?.replace(/^#\s*/, '') || 'converted-agent';
    
    const sections = {};
    let currentSection = null;
    let currentContent = [];
    
    lines.forEach(line => {
      const headerMatch = line.match(/^##\s*(.+)/);
      if (headerMatch) {
        if (currentSection) {
          sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
        }
        currentSection = headerMatch[1];
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });
    
    if (currentSection) {
      sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
    }
    
    return { name, sections };
  }

  /**
   * Generate proper Claude agent from ChatGPT role
   */
  generateClaudeAgent(parsed) {
    const { name, sections } = parsed;
    const expertise = sections.expertise || '';
    const role = sections.role || '';
    const approach = sections.approach || '';
    
    // Generate trigger keywords from role and expertise
    const triggerKeywords = expertise.split(',').map(e => e.trim()).slice(0, 5);
    
    const agentContent = `---
name: ${name}
description: Use this agent PROACTIVELY when working with ${expertise}. This agent excels at ${role.split('.')[0].toLowerCase()} and specializes in comprehensive planning and guidance.

Examples:
- <example>
  Context: User needs help with ${triggerKeywords[0] || 'the domain'}
  user: "I need help with ${triggerKeywords[0] || 'this task'}"
  assistant: "I'll use the ${name} to create a comprehensive plan"
  <commentary>
  This agent specializes in ${expertise} and can create detailed implementation strategies
  </commentary>
</example>

model: sonnet
color: blue
---

You are an expert specialist with deep expertise in ${expertise}. ${role}

## Goal
Your goal is to propose a detailed implementation plan for the current project, including specifically ${approach.split('\n')[0]?.replace(/^[\d.-]\s*/, '') || 'comprehensive analysis and planning'} (assume others only have outdated knowledge and you are here to provide expert guidance with the latest best practices).

**IMPORTANT**: This agent ONLY creates plans and documentation. NEVER do the actual implementation. The parent agent will handle all implementation based on your plan.

Save the implementation plan to .claude/doc/${name}-[task]-[timestamp].md in the project directory.

## Core Workflow
1. Check .claude/tasks/ for the most recent context_session_*.md file for full context
2. Use mcp-catalog to list candidate MCP tools for this task
3. Use Context7 MCP to get latest documentation for relevant technologies
4. Use WebSearch for latest updates and changelogs not in Context7
5. Use Sequential MCP for complex analysis
6. Create detailed implementation plan with specific configurations
7. Save plan to .claude/doc/ in the project directory

## Output Format
Your final message MUST include the implementation file path you created. No need to recreate the same content again in the final message.

Example: "I've created a detailed plan at .claude/doc/${name}-implementation-20240817.md, please read that first before you proceed with implementation."

## Rules
- NEVER do the actual implementation or execute commands
- Your goal is to research and plan - the parent agent will handle implementation
- Before doing any work, check .claude/tasks/ for any context_session_*.md files
- After finishing work, MUST create the .claude/doc/*.md file in the project directory
- Use Context7 MCP for latest documentation
- Use WebSearch for recent updates
- Use mcp-catalog to discover relevant MCP tools
- Always include quality standards and success criteria

## Core Competencies for Creating Implementation Plans

1. **Analysis & Research**: ${approach.split('\n').slice(0, 2).map(a => a.replace(/^[\d.-]\s*/, '')).join(', ')}

2. **Implementation Planning**: Create comprehensive step-by-step implementation strategies

3. **Quality Assurance**: Define success criteria and validation requirements

## Planning Approach

When creating implementation plans, you will:

${approach.split('\n').slice(0, 5).map((step, i) => `${i + 1}. **${step.replace(/^[\d.-]\s*/, '').split(':')[0] || `Step ${i + 1}`}**: ${step.replace(/^[\d.-]\s*/, '')}`).join('\n')}

Your plans prioritize latest best practices and comprehensive guidance. You stay current with relevant technologies to ensure your plans reflect the latest capabilities.

## Quality Standards

Your implementation plans must include:
- Comprehensive analysis and research findings
- Step-by-step implementation instructions
- Quality requirements and success criteria
- Risk assessment and mitigation strategies
- Validation and testing approaches

Always document specific technologies and techniques that the implementing team must follow.`;

    return {
      name,
      content: agentContent,
      metadata: {
        source: 'chatgpt-role',
        converted: new Date().toISOString(),
        format: 'yaml-frontmatter'
      }
    };
  }

  /**
   * Compress content to fit ChatGPT character limits
   */
  compressForChatGPT(content, maxLength) {
    if (content.length <= maxLength) return content;
    
    // Progressive compression strategies
    let compressed = content;
    
    // 1. Remove extra whitespace
    compressed = compressed.replace(/\n{3,}/g, '\n\n');
    compressed = compressed.replace(/[ \t]+/g, ' ');
    
    // 2. Shorten section headers
    compressed = compressed.replace(/## Key Capabilities/g, '## Capabilities');
    compressed = compressed.replace(/## Response Pattern/g, '## Pattern');
    
    // 3. Compress lists
    compressed = compressed.replace(/(\d+\.\s+[^\n]+)\n/g, '$1; ');
    compressed = compressed.replace(/^- /gm, '• ');
    
    // 4. Truncate if still too long
    if (compressed.length > maxLength) {
      const lines = compressed.split('\n');
      let result = [];
      let currentLength = 0;
      
      for (const line of lines) {
        if (currentLength + line.length + 1 <= maxLength - 50) {
          result.push(line);
          currentLength += line.length + 1;
        } else {
          break;
        }
      }
      
      result.push('\n*Optimized for ChatGPT context window*');
      compressed = result.join('\n');
    }
    
    return compressed;
  }

  /**
   * Legacy conversion for old format agents
   */
  convertLegacyAgentToChatGPT(parsed) {
    // Simplified conversion for old format
    const content = parsed.content;
    const name = this.extractAgentName(content);
    const purpose = this.extractPurpose(content);
    
    const chatgptContent = `# ${name}

You are a specialist focused on ${purpose}.

## Approach
1. Analyze the requirements
2. Create implementation plan  
3. Provide step-by-step guidance
4. Ensure quality standards

*Converted from legacy format*`;

    return {
      name,
      content: chatgptContent,
      metadata: {
        source: 'legacy-agent',
        converted: new Date().toISOString()
      }
    };
  }

  extractAgentName(content) {
    const match = content.match(/^#\s*(.+)/m);
    return match ? match[1].trim() : 'converted-specialist';
  }

  extractPurpose(content) {
    const match = content.match(/\*\*Purpose\*\*:\s*(.+)/);
    return match ? match[1].trim() : 'specialized tasks';
  }
}

module.exports = AgentRoleConverter;

// CLI interface when run directly
if (require.main === module) {
  const converter = new AgentRoleConverter();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  const [sourceType, targetType, filePath] = args;
  
  if (!sourceType || !targetType || !filePath) {
    console.log(`
Usage: node convert-agent.js <source> <target> <file>

Examples:
  node convert-agent.js claude chatgpt agent.md
  node convert-agent.js chatgpt claude role.md
    `);
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let result;
    
    if (sourceType === 'claude' && targetType === 'chatgpt') {
      result = converter.claudeToChatGPT(content);
    } else if (sourceType === 'chatgpt' && targetType === 'claude') {
      result = converter.chatGPTToClaude(content);
    } else {
      throw new Error('Invalid conversion type. Use: claude->chatgpt or chatgpt->claude');
    }
    
    // Output the conversion result
    console.log('Conversion successful!');
    console.log('---');
    console.log(result.content);
    
  } catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
  }
}