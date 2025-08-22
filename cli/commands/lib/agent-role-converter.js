export class AgentRoleConverter {
  constructor() {
    this.maxRoleLength = 1500; // ChatGPT custom instruction limit
    this.mcpToolMapping = {
      'mcp__context7': 'research latest documentation',
      'mcp__sequential-thinking': 'think step-by-step',
      'mcp__magic': 'generate UI components',
      'mcp__playwright': 'test browser interactions',
      'WebSearch': 'search for information',
      'Task': 'delegate to specialized approach',
      'Read': 'review file contents',
      'Write': 'create or update files',
      'Bash': 'execute commands'
    };
  }

  convertToRole(agentContent, agentName) {
    const parsed = this.parseAgent(agentContent);
    const role = this.createRole(parsed, agentName);
    return this.compressRole(role);
  }

  parseAgent(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    let sectionContent = [];
    let inYaml = false;
    let yamlContent = [];

    for (const line of lines) {
      // Handle YAML frontmatter
      if (line === '---') {
        if (!inYaml) {
          inYaml = true;
          continue;
        } else {
          inYaml = false;
          sections['metadata'] = this.parseYaml(yamlContent.join('\n'));
          yamlContent = [];
          continue;
        }
      }

      if (inYaml) {
        yamlContent.push(line);
        continue;
      }

      // Parse markdown sections
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = line.replace(/^#+\s+/, '').trim();
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
  }

  parseYaml(yamlContent) {
    const metadata = {};
    const lines = yamlContent.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key] = value.replace(/['"]/g, '').trim();
      }
    }

    return metadata;
  }

  createRole(parsed, agentName) {
    const metadata = parsed.metadata || {};
    const expertise = this.extractExpertise(parsed);
    const triggers = this.extractTriggers(parsed);
    const approach = this.extractApproach(parsed);
    const focus = this.extractFocus(parsed);

    return `# ${this.formatAgentName(agentName)} Role

Act as ${this.createRoleDescription(metadata, expertise)}.

## Activation
When the user mentions: ${triggers.join(', ')}

## Approach
${approach}

## Focus Areas
${focus}

## Quality Standards
${this.extractQualityStandards(parsed)}

## Output
${this.extractOutputGuidance(parsed)}`;
  }

  formatAgentName(name) {
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/Ui/g, 'UI')
      .replace(/Api/g, 'API')
      .replace(/Aws/g, 'AWS');
  }

  createRoleDescription(metadata, expertise) {
    const role = metadata.role || 'a specialized expert';
    const model = metadata.model === 'opus' ? 'a strategic coordinator' : 'a domain specialist';
    
    return `${role} with expertise in ${expertise}. You are ${model} who follows a structured approach to problem-solving`;
  }

  extractExpertise(parsed) {
    const expertise = [];
    
    // Extract from metadata
    if (parsed.metadata?.expertise) {
      expertise.push(parsed.metadata.expertise);
    }

    // Extract from objective section
    if (parsed['Objective'] || parsed['Core Responsibilities']) {
      const text = parsed['Objective'] || parsed['Core Responsibilities'];
      const keywords = text.match(/(?:expertise in|specializing in|focused on)\s+([^.]+)/gi);
      if (keywords) {
        expertise.push(...keywords.map(k => k.replace(/^.*(?:in|on)\s+/i, '')));
      }
    }

    return expertise.join(', ') || 'software development';
  }

  extractTriggers(parsed) {
    const triggers = new Set();

    // Extract from trigger patterns section
    if (parsed['Trigger Patterns']) {
      const patterns = parsed['Trigger Patterns'].match(/["`']([^"`']+)["`']/g);
      if (patterns) {
        patterns.forEach(p => triggers.add(p.replace(/["`']/g, '')));
      }
    }

    // Extract from keywords
    if (parsed['Keywords']) {
      const keywords = parsed['Keywords'].split(/[,\n]/).map(k => k.trim());
      keywords.forEach(k => triggers.add(k));
    }

    // Add common triggers based on agent name
    if (parsed.metadata?.name) {
      const name = parsed.metadata.name;
      if (name.includes('frontend')) triggers.add('UI', 'components', 'React', 'Vue');
      if (name.includes('backend')) triggers.add('API', 'database', 'server');
      if (name.includes('test')) triggers.add('testing', 'QA', 'validation');
    }

    return Array.from(triggers).slice(0, 10); // Limit triggers
  }

  extractApproach(parsed) {
    const steps = [];

    // Look for workflow or approach sections
    const approachSections = ['Workflow', 'Approach', 'Process', 'Execution Pattern'];
    
    for (const section of approachSections) {
      if (parsed[section]) {
        const content = parsed[section];
        // Extract numbered steps
        const numberedSteps = content.match(/^\d+\.\s+(.+)$/gm);
        if (numberedSteps) {
          steps.push(...numberedSteps.map(s => this.convertMCPReferences(s)));
        }
        break;
      }
    }

    if (steps.length === 0) {
      // Create default approach
      steps.push(
        '1. Analyze the requirements and context',
        '2. Research existing patterns and solutions',
        '3. Create a structured implementation plan',
        '4. Execute with validation at each step',
        '5. Document the solution and patterns'
      );
    }

    return steps.slice(0, 6).join('\n');
  }

  convertMCPReferences(text) {
    let converted = text;
    
    for (const [mcp, replacement] of Object.entries(this.mcpToolMapping)) {
      const regex = new RegExp(`use\\s+${mcp}|${mcp}\\s+tool`, 'gi');
      converted = converted.replace(regex, replacement);
    }

    // Convert agent references
    converted = converted
      .replace(/deploy\s+\w+-agent/gi, 'follow specialized approach')
      .replace(/invoke\s+agent/gi, 'apply role pattern')
      .replace(/Task tool/gi, 'focused methodology');

    return converted;
  }

  extractFocus(parsed) {
    const focus = [];

    // Extract from quality standards or focus sections
    const focusSections = ['Quality Standards', 'Focus Areas', 'Key Principles'];
    
    for (const section of focusSections) {
      if (parsed[section]) {
        const items = parsed[section].match(/^[-*]\s+(.+)$/gm);
        if (items) {
          focus.push(...items.map(i => i.replace(/^[-*]\s+/, '').trim()));
        }
        break;
      }
    }

    if (focus.length === 0) {
      // Default focus areas
      focus.push(
        'Code quality and maintainability',
        'Comprehensive testing',
        'Clear documentation',
        'Performance optimization',
        'Security best practices'
      );
    }

    return focus.slice(0, 5).map(f => `- ${f}`).join('\n');
  }

  extractQualityStandards(parsed) {
    if (parsed['Quality Standards']) {
      return this.compressText(parsed['Quality Standards'], 200);
    }

    return `- Follow existing code patterns
- Include comprehensive tests
- Document decisions and rationale
- Ensure cross-platform compatibility`;
  }

  extractOutputGuidance(parsed) {
    if (parsed['Output'] || parsed['Deliverables']) {
      return this.compressText(parsed['Output'] || parsed['Deliverables'], 150);
    }

    return `Create structured plans with clear implementation steps. Document patterns for reuse.`;
  }

  compressRole(role) {
    if (role.length <= this.maxRoleLength) {
      return role;
    }

    // Progressive compression
    let compressed = role;

    // 1. Remove examples
    compressed = compressed.replace(/\n*###?\s*Example.*?(?=\n#|$)/gs, '');

    // 2. Compress lists
    compressed = compressed.replace(/\n\s*[-*]\s+/g, '\n- ');

    // 3. Remove extra whitespace
    compressed = compressed.replace(/\n{3,}/g, '\n\n');

    // 4. Shorten sections if still too long
    if (compressed.length > this.maxRoleLength) {
      const sections = compressed.split(/\n##\s+/);
      const header = sections[0];
      const compressedSections = sections.slice(1).map(s => {
        const [title, ...content] = s.split('\n');
        const compressedContent = this.compressText(content.join('\n'), 200);
        return `## ${title}\n${compressedContent}`;
      });

      compressed = header + '\n' + compressedSections.join('\n');
    }

    // 5. Final truncation if needed
    if (compressed.length > this.maxRoleLength) {
      compressed = compressed.substring(0, this.maxRoleLength - 20) + '\n\n[Role compressed for ChatGPT]';
    }

    return compressed;
  }

  compressText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    // Keep first part and add ellipsis
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let compressed = '';
    
    for (const sentence of sentences) {
      if (compressed.length + sentence.length <= maxLength - 3) {
        compressed += sentence;
      } else {
        break;
      }
    }

    return compressed + '...';
  }
}