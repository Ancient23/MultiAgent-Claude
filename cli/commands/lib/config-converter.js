import fs from 'fs-extra';

export class ConfigConverter {
  constructor() {
    this.sectionMapping = {
      'Repository Overview': 'Project Overview',
      'Project Structure': 'Directory Structure',
      'Agent Templates': 'Role Guidelines',
      'Development Guidelines': 'Quality Standards',
      'Common Workflows': 'Workflow Patterns',
      'Quality Checklist': 'Testing Procedures',
      'Memory System': 'Memory System Navigation',
      'Anti-Patterns': 'Anti-Patterns to Avoid',
      'Tips for Development': 'Tips for Success'
    };
  }

  async claudeToAgents(claudeConfig, options = {}) {
    const sections = this.parseClaude(claudeConfig);
    const mapped = this.mapSections(sections);
    const compressed = this.compressContent(mapped, options);
    return this.generateAGENTSmd(compressed);
  }

  async agentsToClaude(agentsConfig) {
    const sections = this.parseAgents(agentsConfig);
    return this.expandToClaude(sections);
  }

  parseClaude(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    let sectionContent = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = line.replace('## ', '').trim();
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

  mapSections(sections) {
    const mapped = {};
    
    for (const [claudeSection, content] of Object.entries(sections)) {
      const agentsSection = this.sectionMapping[claudeSection] || claudeSection;
      mapped[agentsSection] = this.transformContent(content, claudeSection);
    }

    // Add Role Guidelines section
    if (!mapped['Role Guidelines']) {
      mapped['Role Guidelines'] = this.createRoleGuidelines(sections);
    }

    return mapped;
  }

  transformContent(content, sectionName) {
    // Transform agent-specific content to role-based guidance
    if (sectionName.includes('Agent')) {
      return this.convertAgentReferences(content);
    }

    // Compress verbose explanations
    if (content.length > 2000) {
      return this.compressText(content);
    }

    return content;
  }

  convertAgentReferences(content) {
    // Convert agent references to role-based language
    return content
      .replace(/agent templates/gi, 'role guidelines')
      .replace(/deploy.*agents?/gi, 'adopt appropriate role')
      .replace(/Task tool/gi, 'focused approach')
      .replace(/MCP tools?/gi, 'available resources')
      .replace(/invoke.*agent/gi, 'follow role pattern');
  }

  compressText(text, maxLength = 1500) {
    // Remove code examples and verbose explanations
    const lines = text.split('\n');
    const compressed = [];
    let length = 0;

    for (const line of lines) {
      // Skip code blocks
      if (line.startsWith('```')) continue;
      
      // Skip example sections
      if (line.toLowerCase().includes('example')) continue;

      // Keep essential information
      if (length + line.length < maxLength) {
        compressed.push(line);
        length += line.length;
      }
    }

    return compressed.join('\n');
  }

  createRoleGuidelines(sections) {
    const roles = [
      this.createFrontendRole(),
      this.createBackendRole(),
      this.createTestingRole(),
      this.createInfrastructureRole(),
      this.createDocumentationRole()
    ];

    return roles.join('\n\n');
  }

  createFrontendRole() {
    return `### When Working on Frontend/UI Tasks
**Triggers**: React, Vue, components, styling, responsive design, user interface

**Approach**:
1. Review existing component patterns in \`src/components/\`
2. Check design system conventions in docs
3. Ensure responsive design across breakpoints
4. Add component tests in adjacent \`*.test.ts\` files
5. Update documentation if present
6. Verify accessibility with semantic HTML

**Focus Areas**: Component reusability, performance optimization, user experience`;
  }

  createBackendRole() {
    return `### When Working on Backend/API Tasks
**Triggers**: API, endpoints, database, services, authentication, server

**Approach**:
1. Follow REST/GraphQL conventions
2. Implement proper error handling and validation
3. Add integration tests for new endpoints
4. Update API documentation
5. Consider security implications
6. Test database operations

**Focus Areas**: Security, scalability, data integrity, performance`;
  }

  createTestingRole() {
    return `### When Working on Testing Tasks
**Triggers**: Tests, testing, QA, validation, debugging, fixes

**Approach**:
1. Write tests before or alongside implementation
2. Ensure unit tests cover edge cases
3. Add integration tests for workflows
4. Update E2E tests for user flows
5. Maintain >80% code coverage
6. Run full test suite before submitting

**Focus Areas**: Edge cases, regression prevention, coverage`;
  }

  createInfrastructureRole() {
    return `### When Working on Infrastructure/DevOps Tasks
**Triggers**: Deployment, CI/CD, Docker, config, environment, build

**Approach**:
1. Review deployment documentation
2. Test changes in staging first
3. Update environment variable docs
4. Validate CI/CD pipeline changes
5. Monitor deployment metrics
6. Follow security best practices

**Focus Areas**: Reliability, security, automation, monitoring`;
  }

  createDocumentationRole() {
    return `### When Working on Documentation Tasks
**Triggers**: Documentation, README, guides, examples, tutorials

**Approach**:
1. Keep documentation close to code
2. Include practical examples
3. Update architectural decisions
4. Maintain setup instructions
5. Provide troubleshooting guidance
6. Use clear, concise language

**Focus Areas**: Clarity, completeness, maintainability`;
  }

  compressContent(mapped, options) {
    const { maxSize = 32768, compressionTarget = 0.6 } = options;
    
    // Calculate current size
    const currentSize = JSON.stringify(mapped).length;
    
    if (currentSize <= maxSize) {
      return mapped;
    }

    // Apply compression strategies
    const compressed = {};
    const targetSize = maxSize * compressionTarget;

    for (const [section, content] of Object.entries(mapped)) {
      const compressedContent = this.compressSection(content, targetSize / Object.keys(mapped).length);
      compressed[section] = compressedContent;
    }

    return compressed;
  }

  compressSection(content, maxSectionSize) {
    if (content.length <= maxSectionSize) {
      return content;
    }

    // Progressive compression strategies
    let compressed = content;

    // 1. Remove examples
    compressed = compressed.replace(/\n*###? Example.*?(?=\n#|$)/gs, '');

    // 2. Remove code blocks
    compressed = compressed.replace(/```[\s\S]*?```/g, '');

    // 3. Compress lists
    compressed = compressed.replace(/^\s*[-*]\s+/gm, '- ');

    // 4. Remove extra whitespace
    compressed = compressed.replace(/\n{3,}/g, '\n\n');

    // 5. Truncate if still too long
    if (compressed.length > maxSectionSize) {
      compressed = compressed.substring(0, maxSectionSize - 3) + '...';
    }

    return compressed;
  }

  generateAGENTSmd(sections) {
    const template = `# AGENTS.md - Repository Guidelines

## Project Overview
${sections['Project Overview'] || 'MultiAgent-Claude orchestration framework for AI development.'}

## Directory Structure
${sections['Directory Structure'] || this.getDefaultDirectoryStructure()}

## Role Guidelines
${sections['Role Guidelines']}

## Testing Procedures
${sections['Testing Procedures'] || this.getDefaultTestingProcedures()}

## Memory System Navigation
${sections['Memory System Navigation'] || this.getDefaultMemoryNavigation()}

## Workflow Patterns
${sections['Workflow Patterns'] || this.getDefaultWorkflowPatterns()}

## Quality Standards
${sections['Quality Standards'] || this.getDefaultQualityStandards()}

## Cross-Platform Considerations
${this.getCrossPlatformSection()}

## Anti-Patterns to Avoid
${sections['Anti-Patterns to Avoid'] || this.getDefaultAntiPatterns()}

## Tips for Success
${sections['Tips for Success'] || this.getDefaultTips()}`;

    return template;
  }

  getDefaultDirectoryStructure() {
    return `\`\`\`
src/
├── cli/                    # CLI implementation
├── Examples/              # Templates
├── templates/             # Setup templates
├── tests/                 # Test suite
└── .claude/              # Configuration
\`\`\``;
  }

  getDefaultTestingProcedures() {
    return `### Essential Commands
\`\`\`bash
npm test              # Run all tests
npm run lint          # Code style check
\`\`\``;
  }

  getDefaultMemoryNavigation() {
    return `- **Patterns**: \`.ai/memory/patterns/\`
- **Decisions**: \`.ai/memory/decisions/\`
- **Project Context**: \`.ai/memory/project.md\``;
  }

  getDefaultWorkflowPatterns() {
    return `1. Read context
2. Check memory
3. Plan approach
4. Implement
5. Validate
6. Document`;
  }

  getDefaultQualityStandards() {
    return `- Follow existing conventions
- Comprehensive testing
- Clear documentation
- Cross-platform compatibility`;
  }

  getCrossPlatformSection() {
    return `### Claude Code
- MCP tools available
- Agent orchestration
- Parallel execution

### OpenAI Platforms
- Token limits apply
- Role-based instructions
- Manual workflows`;
  }

  getDefaultAntiPatterns() {
    return `❌ Skipping tests
❌ Ignoring memory
❌ Platform silos
❌ Missing documentation`;
  }

  getDefaultTips() {
    return `1. Check memory first
2. Plan thoroughly
3. Test everything
4. Document decisions
5. Maintain compatibility`;
  }
}