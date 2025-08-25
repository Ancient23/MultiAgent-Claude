const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');
const inquirer = require('inquirer').default;
const Ajv = require('ajv');
const { glob } = require('glob');

class LOPManager {
  constructor() {
    this.projectLopPath = path.join(process.cwd(), '.claude/prompts/lop');
    this.templateLopPath = path.join(__dirname, '../../templates/prompts/lop');
    this.schemaPath = path.join(this.projectLopPath, 'schema/lop-base-schema.json');
    this.hopPath = path.join(process.cwd(), '.claude/prompts/hop/implementation-master.md');
    this.fileTimeout = 5000; // 5 second timeout for file operations
  }

  // Wrapper for file operations with timeout
  async withTimeout(promise, operation = 'file operation') {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: ${operation} took longer than ${this.fileTimeout}ms`)), this.fileTimeout)
    );
    
    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      if (error.message.includes('Timeout')) {
        console.error(chalk.red(`⚠️  ${operation} timed out after ${this.fileTimeout}ms`));
      }
      throw error;
    }
  }

  // Safe file read with timeout
  async safeReadFile(filepath, encoding = 'utf8') {
    return await this.withTimeout(
      new Promise((resolve, reject) => {
        fs.readFile(filepath, encoding, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      }),
      `Reading file ${path.basename(filepath)}`
    );
  }

  // Safe file write with timeout
  async safeWriteFile(filepath, content, encoding = 'utf8') {
    return await this.withTimeout(
      new Promise((resolve, reject) => {
        fs.writeFile(filepath, content, encoding, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
      `Writing file ${path.basename(filepath)}`
    );
  }

  // Error boundary wrapper for async operations
  async safeExecute(operation, context = 'operation') {
    try {
      return await operation();
    } catch (error) {
      // Log error with context
      console.error(chalk.red(`✗ ${context} failed: ${error.message}`));
      
      // Handle specific error types
      if (error.code === 'ENOENT') {
        console.error(chalk.yellow('  File or directory not found'));
      } else if (error.code === 'EACCES') {
        console.error(chalk.yellow('  Permission denied'));
      } else if (error.code === 'EISDIR') {
        console.error(chalk.yellow('  Expected file but found directory'));
      } else if (error.message.includes('Timeout')) {
        console.error(chalk.yellow('  Operation timed out - try again or check file locks'));
      } else if (error.name === 'YAMLException') {
        console.error(chalk.yellow('  Invalid YAML syntax in file'));
      }
      
      // Re-throw with additional context
      const contextualError = new Error(`${context}: ${error.message}`);
      contextualError.originalError = error;
      contextualError.context = context;
      throw contextualError;
    }
  }

  async validate(filePath) {
    return await this.safeExecute(async () => {
      console.log(chalk.cyan('🔍 Validating LOP file...'));
      
      // Read the LOP file
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        console.error(chalk.red(`✗ File not found: ${absolutePath}`));
        return false;
      }
      
      const content = await this.safeReadFile(absolutePath, 'utf8');
      const lopData = yaml.load(content);
      
      // Load and validate against schema
      const schemaPath = fs.existsSync(this.schemaPath) 
        ? this.schemaPath 
        : path.join(this.templateLopPath, 'schema/lop-base-schema.json');
      
      if (!fs.existsSync(schemaPath)) {
        console.error(chalk.red('✗ Schema file not found'));
        return false;
      }
      
      const schema = JSON.parse(await this.safeReadFile(schemaPath, 'utf8'));
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(schema);
      const valid = validate(lopData);
      
      if (valid) {
        console.log(chalk.green('✅ LOP validation successful!'));
        console.log(chalk.gray(`  Name: ${lopData.metadata.name}`));
        console.log(chalk.gray(`  Type: ${lopData.metadata.type}`));
        console.log(chalk.gray(`  Priority: ${lopData.metadata.priority}`));
        console.log(chalk.gray(`  Phases: ${lopData.phases.length}`));
        console.log(chalk.gray(`  Agents: ${lopData.agents.length}`));
        return true;
      } else {
        console.error(chalk.red('✗ Validation failed:'));
        validate.errors.forEach(err => {
          console.error(chalk.red(`  - ${err.instancePath || '/'}: ${err.message}`));
        });
        return false;
      }
    }, 'LOP validation');
  }

  async create() {
    try {
      console.log(chalk.cyan('🎨 Interactive LOP Creation\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'LOP name:',
          validate: input => input.length > 3 || 'Name must be at least 3 characters'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          validate: input => input.length > 10 || 'Description must be at least 10 characters'
        },
        {
          type: 'list',
          name: 'type',
          message: 'Implementation type:',
          choices: ['testing', 'feature', 'refactor', 'infrastructure', 'documentation', 'integration']
        },
        {
          type: 'list',
          name: 'priority',
          message: 'Priority:',
          choices: ['HIGH', 'MEDIUM', 'LOW']
        },
        {
          type: 'input',
          name: 'planLocation',
          message: 'Implementation plan location:',
          default: '.ai/memory/implementation-plans/new-plan.md'
        },
        {
          type: 'input',
          name: 'sessionType',
          message: 'Session type identifier:',
          default: answers => answers.type,
          validate: input => /^[a-z_]+$/.test(input) || 'Must be lowercase with underscores'
        }
      ]);
      
      // Select agents
      const availableAgents = await this.getAvailableAgents();
      const { selectedAgents } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedAgents',
          message: 'Select agents to use:',
          choices: availableAgents.map(agent => ({
            name: `${agent.name} - ${agent.description || 'No description'}`,
            value: agent.name,
            checked: ['meta-development-orchestrator', 'documentation-sync-guardian'].includes(agent.name)
          }))
        }
      ]);
      
      // Create LOP structure
      const lop = {
        metadata: {
          name: answers.name,
          description: answers.description,
          type: answers.type,
          priority: answers.priority,
          version: '1.0.0',
          tags: [answers.type]
        },
        variables: {
          plan_location: answers.planLocation,
          session_type: answers.sessionType
        },
        agents: selectedAgents.map(name => ({
          name,
          role: `Role for ${name}`,
          deploy_for: 'Update with specific tasks'
        })),
        mcp_servers: [],
        phases: [
          {
            name: 'Setup',
            description: 'Initial setup phase',
            tasks: ['Task 1', 'Task 2'],
            agents: [selectedAgents[0]]
          },
          {
            name: 'Implementation',
            description: 'Main implementation phase',
            tasks: ['Task 1', 'Task 2'],
            agents: selectedAgents.slice(0, 2)
          },
          {
            name: 'Testing',
            description: 'Testing and validation',
            tasks: ['Task 1', 'Task 2'],
            agents: []
          }
        ],
        verification: {
          criteria: [
            'All code implemented',
            'Tests passing',
            'Documentation updated'
          ]
        },
        memory_patterns: [
          `Document patterns in .ai/memory/patterns/${answers.type}/`,
          'Create ADR for architectural decisions',
          'Update project.md with conventions'
        ],
        anti_patterns: []
      };
      
      // Save LOP
      const filename = `${answers.sessionType}.yaml`;
      const filepath = path.join(this.projectLopPath, filename);
      
      // Ensure directory exists
      if (!fs.existsSync(this.projectLopPath)) {
        fs.mkdirSync(this.projectLopPath, { recursive: true });
      }
      
      fs.writeFileSync(filepath, yaml.dump(lop, { lineWidth: 120 }));
      
      console.log(chalk.green(`\n✅ LOP created successfully at: ${filepath}`));
      console.log(chalk.yellow('\n⚠️  Remember to update:'));
      console.log('  - Agent roles and deployment tasks');
      console.log('  - Phase tasks with specific actions');
      console.log('  - Verification criteria');
      console.log('  - MCP servers if needed');
      
      return filepath;
    } catch (error) {
      console.error(chalk.red(`✗ Error creating LOP: ${error.message}`));
      return null;
    }
  }

  async list() {
    try {
      console.log(chalk.cyan('📋 Available LOPs\n'));
      
      // Find all LOP files
      const patterns = [
        path.join(this.projectLopPath, '*.yaml'),
        path.join(this.projectLopPath, '*.yml'),
        path.join(this.templateLopPath, '*.yaml'),
        path.join(this.templateLopPath, '*.yml')
      ];
      
      const files = [];
      for (const pattern of patterns) {
        const matches = await glob(pattern);
        files.push(...matches);
      }
      
      if (files.length === 0) {
        console.log(chalk.yellow('No LOP files found'));
        console.log(chalk.gray('Create one with: mac lop create'));
        return;
      }
      
      // Load and display each LOP
      const lops = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const lop = yaml.load(content);
          const source = file.includes(this.projectLopPath) ? 'project' : 'template';
          
          lops.push({
            name: lop.metadata.name,
            type: lop.metadata.type,
            priority: lop.metadata.priority,
            description: lop.metadata.description,
            path: file,
            source
          });
        } catch (err) {
          console.warn(chalk.yellow(`⚠️  Could not load: ${path.basename(file)}`));
        }
      }
      
      // Display in table format
      console.log(chalk.bold('Project LOPs:'));
      lops.filter(l => l.source === 'project').forEach(lop => {
        console.log(`  ${chalk.green('●')} ${chalk.bold(lop.name)}`);
        console.log(`    Type: ${lop.type} | Priority: ${lop.priority}`);
        console.log(`    ${chalk.gray(lop.description)}`);
        console.log(`    ${chalk.gray(path.relative(process.cwd(), lop.path))}\n`);
      });
      
      console.log(chalk.bold('\nTemplate LOPs:'));
      lops.filter(l => l.source === 'template').forEach(lop => {
        console.log(`  ${chalk.blue('●')} ${chalk.bold(lop.name)}`);
        console.log(`    Type: ${lop.type} | Priority: ${lop.priority}`);
        console.log(`    ${chalk.gray(lop.description)}`);
        console.log(`    ${chalk.gray(path.basename(lop.path))}\n`);
      });
      
    } catch (error) {
      console.error(chalk.red(`✗ Error listing LOPs: ${error.message}`));
    }
  }

  async execute(filePath) {
    try {
      console.log(chalk.cyan('🚀 Executing LOP...\n'));
      
      // Validate first
      const isValid = await this.validate(filePath);
      if (!isValid) {
        console.error(chalk.red('✗ Cannot execute invalid LOP'));
        return;
      }
      
      // Load LOP
      const absolutePath = path.resolve(filePath);
      const content = fs.readFileSync(absolutePath, 'utf8');
      const lop = yaml.load(content);
      
      // Process the LOP through the HOP template
      const prompt = await this.processLOP(lop);
      
      // Display the processed prompt
      console.log(chalk.green('\n✅ Generated Implementation Prompt:\n'));
      console.log(chalk.gray('─'.repeat(80)));
      console.log(prompt);
      console.log(chalk.gray('─'.repeat(80)));
      
      // Ask if user wants to save it
      const { save } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'save',
          message: 'Save this prompt to a file?',
          default: true
        }
      ]);
      
      if (save) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.join(
          process.cwd(),
          `.claude/prompts/generated/`,
          `${lop.variables.session_type}-${timestamp}.md`
        );
        
        // Ensure directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, prompt);
        console.log(chalk.green(`\n✅ Prompt saved to: ${outputPath}`));
        console.log(chalk.cyan('\n📋 Copy this prompt to Claude to begin implementation'));
      }
      
    } catch (error) {
      console.error(chalk.red(`✗ Error executing LOP: ${error.message}`));
    }
  }

  async processLOP(lop) {
    // Load HOP template
    const hopTemplatePath = fs.existsSync(this.hopPath)
      ? this.hopPath
      : path.join(__dirname, '../../templates/prompts/hop/implementation-master.md');
    
    let template = fs.readFileSync(hopTemplatePath, 'utf8');
    
    // Simple variable replacement (in real implementation, use a proper template engine)
    template = this.interpolateVariables(template, lop);
    
    return template;
  }

  // Escape HTML/template characters to prevent injection
  escapeTemplate(str) {
    if (!str) return '';
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '$': '&#36;',
      '{': '&#123;',
      '}': '&#125;'
    };
    return String(str).replace(/[<>&"'`=$/{}]/g, char => escapeMap[char] || char);
  }

  // Validate path to prevent directory traversal
  validatePath(filePath, allowedBasePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path provided');
    }

    // Normalize and resolve the path
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(process.cwd(), normalizedPath);
    const resolvedBasePath = path.resolve(process.cwd(), allowedBasePath);

    // Check if the resolved path is within the allowed base path
    if (!resolvedPath.startsWith(resolvedBasePath + path.sep) && resolvedPath !== resolvedBasePath) {
      throw new Error(`Path traversal detected: ${filePath} is outside allowed directory ${allowedBasePath}`);
    }

    // Additional checks for malicious patterns
    if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
      throw new Error(`Potentially unsafe path pattern: ${filePath}`);
    }

    // Validate filename characters (alphanumeric, hyphens, underscores, dots only)
    const filename = path.basename(normalizedPath);
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      throw new Error(`Invalid filename characters: ${filename}`);
    }

    return normalizedPath;
  }

  interpolateVariables(template, lop) {
    // Validate plan_location path to prevent traversal
    if (lop.variables && lop.variables.plan_location) {
      try {
        this.validatePath(lop.variables.plan_location, '.ai/memory/implementation-plans');
      } catch (error) {
        throw new Error(`Invalid plan_location path: ${error.message}`);
      }
    }

    // Replace simple variables with proper escaping
    template = template.replace(/\$\{lop\.metadata\.name\}/g, this.escapeTemplate(lop.metadata.name));
    template = template.replace(/\$\{lop\.metadata\.priority\}/g, this.escapeTemplate(lop.metadata.priority));
    template = template.replace(/\$\{lop\.metadata\.type\}/g, this.escapeTemplate(lop.metadata.type));
    template = template.replace(/\$\{lop\.metadata\.description\}/g, this.escapeTemplate(lop.metadata.description));
    template = template.replace(/\$\{lop\.variables\.plan_location\}/g, this.escapeTemplate(lop.variables.plan_location));
    template = template.replace(/\$\{lop\.variables\.session_type\}/g, this.escapeTemplate(lop.variables.session_type));
    
    // Process agents with proper escaping
    let agentsSection = '';
    lop.agents.forEach(agent => {
      agentsSection += `### ${this.escapeTemplate(agent.name)}\n`;
      agentsSection += `- **Role**: ${this.escapeTemplate(agent.role)}\n`;
      agentsSection += `- **Deploy for**: ${this.escapeTemplate(agent.deploy_for || 'See phases below')}\n\n`;
    });
    template = template.replace(/\$\{#foreach lop\.agents as agent\}[\s\S]*?\$\{\/foreach\}/g, agentsSection);
    
    // Process MCP servers with proper escaping
    if (lop.mcp_servers && lop.mcp_servers.length > 0) {
      let mcpSection = '## Required MCP Servers\n\n';
      lop.mcp_servers.forEach(server => {
        mcpSection += `- ${this.escapeTemplate(server)}\n`;
      });
      template = template.replace(/\$\{#if lop\.mcp_servers\}[\s\S]*?\$\{\/if\}/g, mcpSection);
    } else {
      template = template.replace(/\$\{#if lop\.mcp_servers\}[\s\S]*?\$\{\/if\}/g, '');
    }
    
    // Process phases with proper escaping
    let phasesSection = '';
    lop.phases.forEach((phase, index) => {
      phasesSection += `### Phase ${index + 1}: ${this.escapeTemplate(phase.name)}\n\n`;
      phasesSection += `**Description**: ${this.escapeTemplate(phase.description)}\n\n`;
      phasesSection += `**Tasks**:\n`;
      phase.tasks.forEach(task => {
        phasesSection += `- ${this.escapeTemplate(task)}\n`;
      });
      
      if (phase.agents && phase.agents.length > 0) {
        phasesSection += `\n**Deploy Agents**:\n`;
        phase.agents.forEach(agent => {
          const agentTask = phase.agent_tasks && phase.agent_tasks[agent] 
            ? phase.agent_tasks[agent] 
            : 'assist with this phase';
          phasesSection += `- Use ${this.escapeTemplate(agent)} to ${this.escapeTemplate(agentTask)}\n`;
        });
      }
      
      phasesSection += '\n**Session Update Required**: Update context session after completing this phase with:\n';
      phasesSection += '- Completed tasks\n';
      phasesSection += '- Files modified\n';
      phasesSection += '- Discoveries made\n';
      phasesSection += '- Any blockers encountered\n\n';
    });
    template = template.replace(/\$\{#foreach lop\.phases as phase index\}[\s\S]*?\$\{\/foreach\}/g, phasesSection);
    
    // Process verification criteria with proper escaping
    let criteriaSection = '';
    lop.verification.criteria.forEach(criterion => {
      criteriaSection += `□ ${this.escapeTemplate(criterion)}\n`;
    });
    template = template.replace(/\$\{#foreach lop\.verification\.criteria as criterion\}[\s\S]*?\$\{\/foreach\}/g, criteriaSection);
    
    // Process memory patterns with proper escaping
    let memorySection = '';
    lop.memory_patterns.forEach(pattern => {
      memorySection += `- ${this.escapeTemplate(pattern)}\n`;
    });
    template = template.replace(/\$\{#foreach lop\.memory_patterns as pattern\}[\s\S]*?\$\{\/foreach\}/g, memorySection);
    
    // Process testing section
    if (lop.testing) {
      let testingSection = '### Required Tests\n';
      if (lop.testing.required_tests) {
        lop.testing.required_tests.forEach(test => {
          testingSection += `- ${this.escapeTemplate(test)}\n`;
        });
      }
      testingSection += '\n### Test Commands\n';
      if (lop.testing.test_commands) {
        lop.testing.test_commands.forEach(command => {
          testingSection += `- \`${this.escapeTemplate(command)}\`\n`;
        });
      }
      testingSection += '\n### Success Criteria\n';
      if (lop.testing.success_criteria) {
        lop.testing.success_criteria.forEach(criterion => {
          testingSection += `- ${this.escapeTemplate(criterion)}\n`;
        });
      }
      template = template.replace(/\$\{#if lop\.testing\}[\s\S]*?\$\{\/if\}/g, testingSection);
    } else {
      template = template.replace(/\$\{#if lop\.testing\}[\s\S]*?\$\{\/if\}/g, '');
    }
    
    // Process anti-patterns
    if (lop.anti_patterns && lop.anti_patterns.length > 0) {
      let antiPatternsSection = '';
      lop.anti_patterns.forEach(pattern => {
        antiPatternsSection += `- ❌ ${this.escapeTemplate(pattern)}\n`;
      });
      template = template.replace(/\$\{#foreach lop\.anti_patterns as pattern\}[\s\S]*?\$\{\/foreach\}/g, antiPatternsSection);
    } else {
      template = template.replace(/\$\{#foreach lop\.anti_patterns as pattern\}[\s\S]*?\$\{\/foreach\}/g, '- ❌ None specified\n');
    }
    
    return template;
  }

  async getAvailableAgents() {
    const agentsPath = path.join(process.cwd(), 'Examples/agents');
    const agents = [];
    
    if (fs.existsSync(agentsPath)) {
      const files = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const name = path.basename(file, '.md');
        const content = fs.readFileSync(path.join(agentsPath, file), 'utf8');
        
        // Try to extract description from frontmatter
        const match = content.match(/description:\s*(.+)/);
        const description = match ? match[1] : null;
        
        agents.push({ name, description });
      }
    }
    
    // Add some default agents if Examples/agents doesn't exist
    if (agents.length === 0) {
      agents.push(
        { name: 'meta-development-orchestrator', description: 'Overall coordination' },
        { name: 'cli-test-engineer', description: 'CLI testing' },
        { name: 'playwright-test-engineer', description: 'E2E testing' },
        { name: 'documentation-sync-guardian', description: 'Documentation updates' },
        { name: 'implementation-verifier', description: 'Verify implementations' }
      );
    }
    
    return agents;
  }
}

module.exports = new LOPManager();