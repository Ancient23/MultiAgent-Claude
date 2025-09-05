#!/usr/bin/env node
/**
 * Wave 6: Automated Agent Fix Tool
 * Automatically applies standard quality improvements to agent files
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

class AgentAutoFixer {
  constructor() {
    this.fixedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
    this.backupDir = path.join(__dirname, '..', '.claude', 'backups', `auto-fix-${Date.now()}`);
    
    // Standard templates and patterns
    this.standardSections = {
      Goal: `## Goal
Your goal is to [SPECIFIC DOMAIN GOAL]. You specialize in [DOMAIN EXPERTISE] with deep understanding of [KEY TECHNOLOGIES].

**IMPORTANT**: This agent ONLY creates plans and specifications. NEVER do the actual implementation. The parent agent will handle all implementation based on your plan.`,

      CoreWorkflow: `## Core Workflow
1. Check .claude/tasks/ for the most recent context_session_*.md file for full context
2. Analyze [DOMAIN-SPECIFIC ANALYSIS]
3. Review existing [RELEVANT FILES/PATTERNS]
4. Check .ai/memory/patterns/ for existing [DOMAIN] patterns
5. Use Context7 MCP to get latest documentation for:
   - [KEY TECHNOLOGY 1]
   - [KEY TECHNOLOGY 2] 
   - [DOMAIN-SPECIFIC TOOLS]
6. Use Sequential MCP for complex [DOMAIN] analysis
7. Create detailed implementation plan with examples
8. Save plan to .claude/doc/ in the project directory`,

      OutputFormat: `## Output Format
Your final message MUST include the implementation file path you created. No need to recreate the same content again in the final message.

Example: "I've created a detailed [DOMAIN] implementation plan at .claude/doc/[domain]-implementation-[timestamp].md, please read that first before you proceed with implementation."`,

      Rules: `## Rules
- NEVER do the actual implementation or create files directly
- Your goal is to analyze and plan - the parent agent will handle implementation
- Before doing any work, check .claude/tasks/ for any context_session_*.md files
- After finishing work, MUST create the .claude/doc/*.md file in the project directory
- Use Context7 MCP for latest [DOMAIN] documentation
- Use Sequential MCP for complex [DOMAIN] analysis
- Always include both [SPECIFIC APPROACHES] in specifications`,

      CoreCompetencies: `## Core Competencies for Creating Implementation Plans

1. **[COMPETENCY 1]**: [Description of core competency area]

2. **[COMPETENCY 2]**: [Description of core competency area] 

3. **[COMPETENCY 3]**: [Description of core competency area]

4. **[COMPETENCY 4]**: [Description of core competency area]`,

      PlanningApproach: `## Planning Approach

When creating [DOMAIN] implementation plans, you will:

1. **[STEP 1]**: [Detailed description of planning step]
2. **[STEP 2]**: [Detailed description of planning step]
3. **[STEP 3]**: [Detailed description of planning step]
4. **[STEP 4]**: [Detailed description of planning step]
5. **[STEP 5]**: [Detailed description of planning step]

Your plans prioritize [KEY PRIORITIES] and ensure [QUALITY ASPECTS].`,

      QualityStandards: `## Quality Standards

Your implementation plans must include:
- [QUALITY REQUIREMENT 1]
- [QUALITY REQUIREMENT 2]  
- [QUALITY REQUIREMENT 3]
- [QUALITY REQUIREMENT 4]
- [QUALITY REQUIREMENT 5]

Always document the [APPROACH] rationale and provide clear procedures that the implementing team must follow.`
    };
  }

  async autoFixAgents(options = {}) {
    console.log('🔧 Starting automated agent quality fixes...');
    
    const { dryRun = false, pattern = 'Examples/agents/**/*.md', backup = true } = options;
    
    if (backup && !dryRun) {
      this.createBackup();
    }
    
    const agentFiles = glob.sync(pattern, {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    console.log(`📋 Found ${agentFiles.length} agent files to analyze`);
    
    for (const file of agentFiles) {
      await this.fixSingleAgent(file, dryRun);
    }
    
    this.reportResults();
  }

  createBackup() {
    console.log(`💾 Creating backup at ${this.backupDir}...`);
    fs.mkdirSync(this.backupDir, { recursive: true });
    
    const agentFiles = glob.sync('Examples/agents/**/*.md', {
      ignore: ['**/README.md']
    });
    
    for (const file of agentFiles) {
      const backupPath = path.join(this.backupDir, file);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(file, backupPath);
    }
    
    console.log(`✅ Backed up ${agentFiles.length} files`);
  }

  async fixSingleAgent(filePath, dryRun = false) {
    console.log(`  Analyzing: ${path.basename(filePath)}`);
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const fixes = this.analyzeAndCreateFixes(filePath, originalContent);
      
      if (fixes.length === 0) {
        this.skippedCount++;
        console.log(`    ✅ No fixes needed`);
        return;
      }
      
      console.log(`    🔧 Applying ${fixes.length} fixes:`);
      fixes.forEach(fix => console.log(`      - ${fix.description}`));
      
      if (dryRun) {
        console.log(`    🏃 Dry run - would apply fixes but not saving`);
        return;
      }
      
      const fixedContent = this.applyFixes(originalContent, fixes);
      fs.writeFileSync(filePath, fixedContent);
      
      this.fixedCount++;
      console.log(`    ✅ Fixed and saved`);
      
    } catch (error) {
      this.errorCount++;
      console.error(`    ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  analyzeAndCreateFixes(filePath, content) {
    const fixes = [];
    
    // Parse frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    const contentAfterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    let frontmatter = {};
    try {
      if (frontmatterMatch) {
        frontmatter = yaml.load(frontmatterMatch[1]) || {};
      }
    } catch (error) {
      fixes.push({
        type: 'yaml-syntax',
        description: 'Fix YAML syntax errors',
        action: 'fix-yaml'
      });
    }
    
    // YAML frontmatter fixes
    if (!frontmatterMatch) {
      fixes.push({
        type: 'add-frontmatter',
        description: 'Add missing YAML frontmatter',
        action: 'add-yaml-frontmatter',
        data: this.generateFrontmatter(filePath)
      });
    } else {
      if (!frontmatter.name) {
        fixes.push({
          type: 'yaml-field',
          description: 'Add missing name field',
          action: 'add-yaml-field',
          field: 'name',
          value: this.generateAgentName(filePath)
        });
      }
      
      if (!frontmatter.description) {
        fixes.push({
          type: 'yaml-field',
          description: 'Add missing description field',
          action: 'add-yaml-field',
          field: 'description',
          value: this.generateAgentDescription(filePath)
        });
      }
      
      if (!frontmatter.model) {
        fixes.push({
          type: 'yaml-field',
          description: 'Add missing model field',
          action: 'add-yaml-field',
          field: 'model',
          value: filePath.includes('/orchestrators/') ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022'
        });
      }
      
      if (!frontmatter.Examples || !Array.isArray(frontmatter.Examples) || frontmatter.Examples.length < 2) {
        fixes.push({
          type: 'yaml-field',
          description: 'Add/fix Examples array',
          action: 'fix-examples',
          value: this.generateExamples(filePath)
        });
      }
    }
    
    // Section structure fixes
    const requiredSections = [
      'Goal', 'Core Workflow', 'Output Format', 'Rules',
      'Core Competencies for Creating Implementation Plans',
      'Planning Approach', 'Quality Standards'
    ];
    
    for (const section of requiredSections) {
      const sectionPattern = new RegExp(`## ${section}`, 'i');
      if (!sectionPattern.test(contentAfterFrontmatter)) {
        fixes.push({
          type: 'add-section',
          description: `Add missing ${section} section`,
          action: 'add-section',
          section,
          content: this.generateSectionContent(section, filePath)
        });
      }
    }
    
    // Research-only directive fix
    if (!filePath.includes('/orchestrators/')) {
      if (!content.includes('NEVER do the actual implementation') && 
          !content.includes('ONLY creates plans')) {
        fixes.push({
          type: 'add-directive',
          description: 'Add research-only directive',
          action: 'add-research-directive'
        });
      }
    }
    
    // Session context integration
    if (!content.includes('.claude/tasks/') && !content.includes('context_session_')) {
      fixes.push({
        type: 'add-context',
        description: 'Add session context integration',
        action: 'add-context-check'
      });
    }
    
    // MCP workflow integration
    if (!content.includes('Context7 MCP') && !content.includes('mcp__context7')) {
      fixes.push({
        type: 'add-mcp',
        description: 'Add Context7 MCP integration',
        action: 'add-mcp-context7'
      });
    }
    
    if (!content.includes('Sequential MCP') && !content.includes('mcp__sequential')) {
      fixes.push({
        type: 'add-mcp',
        description: 'Add Sequential MCP integration',
        action: 'add-mcp-sequential'
      });
    }
    
    // Output specification
    if (!content.includes('.claude/doc/')) {
      fixes.push({
        type: 'add-output',
        description: 'Add output path specification',
        action: 'add-output-spec'
      });
    }
    
    return fixes;
  }

  applyFixes(content, fixes) {
    let fixedContent = content;
    
    for (const fix of fixes) {
      switch (fix.action) {
        case 'add-yaml-frontmatter':
          fixedContent = `---\n${yaml.dump(fix.data)}---\n\n${fixedContent}`;
          break;
          
        case 'add-yaml-field':
          fixedContent = this.addYamlField(fixedContent, fix.field, fix.value);
          break;
          
        case 'fix-examples':
          fixedContent = this.fixExamplesField(fixedContent, fix.value);
          break;
          
        case 'add-section':
          fixedContent = this.addSection(fixedContent, fix.section, fix.content);
          break;
          
        case 'add-research-directive':
          fixedContent = this.addResearchDirective(fixedContent);
          break;
          
        case 'add-context-check':
          fixedContent = this.addContextCheck(fixedContent);
          break;
          
        case 'add-mcp-context7':
        case 'add-mcp-sequential':
          fixedContent = this.addMcpIntegration(fixedContent, fix.action);
          break;
          
        case 'add-output-spec':
          fixedContent = this.addOutputSpecification(fixedContent);
          break;
      }
    }
    
    return fixedContent;
  }

  generateFrontmatter(filePath) {
    const agentName = this.generateAgentName(filePath);
    const isOrchestrator = filePath.includes('/orchestrators/');
    
    return {
      name: agentName,
      description: this.generateAgentDescription(filePath),
      model: isOrchestrator ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022',
      color: this.generateAgentColor(filePath),
      Examples: this.generateExamples(filePath)
    };
  }

  generateAgentName(filePath) {
    const filename = path.basename(filePath, '.md');
    return filename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateAgentDescription(filePath) {
    const filename = path.basename(filePath, '.md');
    const isOrchestrator = filePath.includes('/orchestrators/');
    const domain = filename.split('-').slice(0, -1).join(' ');
    
    if (isOrchestrator) {
      return `Use this agent PROACTIVELY when tasks require ${domain} orchestration and coordination. Analyzes tasks requiring multiple specialists and coordinates systematic execution across ${domain} domains.`;
    } else {
      return `Use this agent PROACTIVELY when tasks involve ${domain}. Specializes in ${domain} analysis, planning, and implementation strategy with deep expertise in related technologies and best practices.`;
    }
  }

  generateAgentColor(filePath) {
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', 
      '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5'
    ];
    
    const hash = filePath.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  generateExamples(filePath) {
    const agentName = this.generateAgentName(filePath);
    const domain = path.basename(filePath, '.md').split('-').slice(0, -1).join(' ');
    
    return [
      `Complex ${domain} architecture design requiring systematic analysis`,
      `${domain} implementation with multiple integration points`,
      `${domain} optimization and performance enhancement planning`
    ];
  }

  generateSectionContent(section, filePath) {
    const domain = path.basename(filePath, '.md').split('-').slice(0, -1).join(' ');
    const isOrchestrator = filePath.includes('/orchestrators/');
    
    let template = this.standardSections[section.replace(/ /g, '')] || `## ${section}\n\n[Section content to be customized]`;
    
    // Replace placeholders with domain-specific content
    template = template
      .replace(/\[SPECIFIC DOMAIN GOAL\]/g, `create comprehensive ${domain} implementation plans`)
      .replace(/\[DOMAIN EXPERTISE\]/g, domain)
      .replace(/\[KEY TECHNOLOGIES\]/g, `modern ${domain} technologies and frameworks`)
      .replace(/\[DOMAIN-SPECIFIC ANALYSIS\]/g, `${domain} requirements and constraints`)
      .replace(/\[RELEVANT FILES\/PATTERNS\]/g, `${domain} patterns and existing implementations`)
      .replace(/\[DOMAIN\]/g, domain)
      .replace(/\[KEY TECHNOLOGY 1\]/g, `${domain} frameworks`)
      .replace(/\[KEY TECHNOLOGY 2\]/g, `${domain} best practices`)
      .replace(/\[DOMAIN-SPECIFIC TOOLS\]/g, `${domain} development tools`)
      .replace(/\[domain\]/g, domain.toLowerCase().replace(/ /g, '-'))
      .replace(/\[timestamp\]/g, '[timestamp]');
    
    return template;
  }

  addYamlField(content, field, value) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatterMatch) return content;
    
    try {
      const frontmatter = yaml.load(frontmatterMatch[1]) || {};
      frontmatter[field] = value;
      
      return content.replace(
        /^---\n[\s\S]*?\n---\n/,
        `---\n${yaml.dump(frontmatter)}---\n`
      );
    } catch (error) {
      return content;
    }
  }

  fixExamplesField(content, examples) {
    return this.addYamlField(content, 'Examples', examples);
  }

  addSection(content, sectionName, sectionContent) {
    // Add section at the end of the document
    return `${content}\n\n${sectionContent}`;
  }

  addResearchDirective(content) {
    // Add to Goal section if it exists, otherwise create Goal section
    if (content.includes('## Goal')) {
      return content.replace(
        '## Goal',
        '## Goal\nYour goal is to create comprehensive implementation plans and specifications.\n\n**IMPORTANT**: This agent ONLY creates plans and specifications. NEVER do the actual implementation. The parent agent will handle all implementation based on your plan.\n\n## Original Goal'
      );
    } else {
      return content + '\n\n## Goal\nYour goal is to create comprehensive implementation plans and specifications.\n\n**IMPORTANT**: This agent ONLY creates plans and specifications. NEVER do the actual implementation. The parent agent will handle all implementation based on your plan.';
    }
  }

  addContextCheck(content) {
    if (content.includes('## Core Workflow')) {
      return content.replace(
        '## Core Workflow',
        '## Core Workflow\n1. Check .claude/tasks/ for the most recent context_session_*.md file for full context'
      );
    } else {
      return content + '\n\n## Core Workflow\n1. Check .claude/tasks/ for the most recent context_session_*.md file for full context';
    }
  }

  addMcpIntegration(content, type) {
    const mcpText = type === 'add-mcp-context7' 
      ? '5. Use Context7 MCP to get latest documentation for relevant technologies'
      : '6. Use Sequential MCP for complex analysis and multi-step reasoning';
    
    if (content.includes('## Core Workflow')) {
      // Add to existing workflow
      const workflowMatch = content.match(/(## Core Workflow[\s\S]*?)(?=\n## |$)/);
      if (workflowMatch) {
        const updatedWorkflow = workflowMatch[1] + `\n${mcpText}`;
        return content.replace(workflowMatch[1], updatedWorkflow);
      }
    }
    
    return content + `\n\n${mcpText}`;
  }

  addOutputSpecification(content) {
    const outputSpec = `## Output Format\nYour final message MUST include the implementation file path you created at .claude/doc/[agent-name]-[task]-[timestamp].md`;
    
    if (content.includes('## Output Format')) {
      return content;
    }
    
    return content + `\n\n${outputSpec}`;
  }

  reportResults() {
    console.log('\n📊 Auto-fix Results:');
    console.log(`✅ Fixed: ${this.fixedCount} agents`);
    console.log(`⏭️  Skipped: ${this.skippedCount} agents (no fixes needed)`);
    console.log(`❌ Errors: ${this.errorCount} agents`);
    
    if (this.fixedCount > 0) {
      console.log('\n💡 Next steps:');
      console.log('1. Review fixed agents for domain-specific customizations');
      console.log('2. Run quality validation: npm run test:agent-validation');
      console.log('3. Commit fixes with descriptive message');
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  if (args.includes('--dry-run')) {
    options.dryRun = true;
  }
  
  if (args.includes('--no-backup')) {
    options.backup = false;
  }
  
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.pattern = args[patternIndex + 1];
  }
  
  const fixer = new AgentAutoFixer();
  
  fixer.autoFixAgents(options)
    .then(() => {
      console.log('✅ Auto-fix completed!');
    })
    .catch(error => {
      console.error('❌ Auto-fix failed:', error);
      process.exit(1);
    });
}

module.exports = AgentAutoFixer;