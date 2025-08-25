const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');
const PromptComposer = require('../lib/prompt-composer');

function copyTemplateAgents(agents) {
  const baseDir = path.join(__dirname, '..', '..', 'Examples', 'agents');
  const targetDir = path.join(process.cwd(), '.claude', 'agents');
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  let copiedCount = 0;
  agents.forEach(agentName => {
    // Check in orchestrators and specialists subdirectories
    const orchestratorPath = path.join(baseDir, 'orchestrators', `${agentName}.md`);
    const specialistPath = path.join(baseDir, 'specialists', `${agentName}.md`);
    const targetPath = path.join(targetDir, `${agentName}.md`);
    
    let sourcePath = null;
    if (fs.existsSync(orchestratorPath)) {
      sourcePath = orchestratorPath;
    } else if (fs.existsSync(specialistPath)) {
      sourcePath = specialistPath;
    }
    
    if (sourcePath) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount++;
        console.log(chalk.green(`  ✓ Copied ${agentName}.md`));
      } catch (error) {
        console.log(chalk.red(`  ✗ Failed to copy ${agentName}.md: ${error.message}`));
      }
    } else {
      console.log(chalk.yellow(`  ⚠️  Template not found: ${agentName}.md`));
    }
  });
  
  return copiedCount;
}

function copyTemplateCommands() {
  const baseDir = path.join(__dirname, '..', '..', 'Examples', 'commands');
  const targetDir = path.join(process.cwd(), '.claude', 'commands');
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy essential command templates
  const commandsToCopy = [
    'implement-feature.md',
    'generate-playwright-tests.md',
    'WAVE_EXECUTE.md'
  ];
  
  let copiedCount = 0;
  commandsToCopy.forEach(cmdFile => {
    const sourcePath = path.join(baseDir, cmdFile);
    const targetPath = path.join(targetDir, cmdFile);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount++;
        console.log(chalk.green(`  ✓ Copied ${cmdFile}`));
      } catch (error) {
        console.log(chalk.red(`  ✗ Failed to copy ${cmdFile}: ${error.message}`));
      }
    }
  });
  
  return copiedCount;
}

async function getWorkflow(options) {
  if (options.memoryOnly) {
    return 'init-memory';
  } else if (options.withDocs) {
    return 'init-docs';
  }
  return 'init-full';
}

async function composePrompt(options) {
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  const workflow = await getWorkflow(options);
  
  // Load config if it exists to pass to context for conditional evaluation
  const configPath = path.join(process.cwd(), '.claude', 'config.json');
  let config = null;
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.warn('Config file exists but could not be parsed:', e.message);
    }
  }
  
  const context = {
    options: {
      cicd: options.cicd || false,
      testing: options.testing || false,
      docs: options.withDocs || false
    },
    project: {
      name: path.basename(process.cwd()),
      path: process.cwd()
    },
    config: config  // CRITICAL: Pass config to context for conditional evaluation
  };
  
  return await composer.compose(workflow, context);
}

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

function copyWorkflowTemplate(filename) {
  const source = path.join(__dirname, '..', '..', 'templates', 'workflows', filename);
  const dest = path.join(process.cwd(), '.github', 'workflows', filename);
  
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  fs.copyFileSync(source, dest);
  console.log(chalk.green(`✓ Added ${filename}`));
}

function copyTestTemplate(filename) {
  const source = path.join(__dirname, '..', '..', 'templates', 'tests', filename);
  const dest = path.join(process.cwd(), 'tests', filename);
  
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  fs.copyFileSync(source, dest);
  console.log(chalk.green(`✓ Added ${filename}`));
}

function copyVisualTestTemplates() {
  // Copy visual test templates and helpers
  const visualTestsSource = path.join(__dirname, '..', '..', 'tests', 'visual', 'development.visual.spec.js');
  const visualTestsDest = path.join(process.cwd(), 'tests', 'visual');
  
  // Create directory
  if (!fs.existsSync(visualTestsDest)) {
    fs.mkdirSync(visualTestsDest, { recursive: true });
  }
  
  // Copy visual test file if it exists
  if (fs.existsSync(visualTestsSource)) {
    const destFile = path.join(visualTestsDest, 'development.visual.spec.js');
    fs.copyFileSync(visualTestsSource, destFile);
    console.log(chalk.green('✓ Added visual test template'));
  }
  
  // Copy test utilities
  const utilsSource = path.join(__dirname, '..', '..', 'tests', 'utils');
  const utilsDest = path.join(process.cwd(), 'tests', 'utils');
  
  if (!fs.existsSync(utilsDest)) {
    fs.mkdirSync(utilsDest, { recursive: true });
  }
  
  // Copy helper files
  const helperFiles = ['visual-helpers.js', 'cli-helpers.js'];
  helperFiles.forEach(file => {
    const source = path.join(utilsSource, file);
    if (fs.existsSync(source)) {
      const dest = path.join(utilsDest, file);
      fs.copyFileSync(source, dest);
      console.log(chalk.green(`✓ Added ${file}`));
    }
  });
  
  // Copy visual regression spec
  const visualRegressionSource = path.join(__dirname, '..', '..', 'tests', 'visual-regression.spec.js');
  if (fs.existsSync(visualRegressionSource)) {
    const visualRegressionDest = path.join(process.cwd(), 'tests', 'visual-regression.spec.js');
    fs.copyFileSync(visualRegressionSource, visualRegressionDest);
    console.log(chalk.green('✓ Added visual-regression.spec.js'));
  }
}


function executeWithClaude(prompt, config = null, queuedItemsData = {}) {
  // Destructure the queued items data
  const {
    hasQueuedItems = false,
    queuedAgents = [],
    queuedRoles = [],
    agentsMdAction = 'skip',
    projectAnalysis = null
  } = queuedItemsData;

  try {
    const claudeExists = execSync('which claude', { encoding: 'utf8' }).trim();
    if (!claudeExists) {
      console.log(chalk.yellow('Claude CLI not found. Please install it first:'));
      console.log(chalk.cyan('npm install -g @anthropic-ai/claude-cli'));
      return false;
    }

    console.log(chalk.green('✓ Claude CLI found'));
    console.log(chalk.blue('Executing initialization with Claude...'));
    
    // Add status indicators
    console.log(chalk.gray('\nClaude will perform the following tasks:'));
    console.log(chalk.gray('  1. Analyze project structure'));
    console.log(chalk.gray('  2. Create memory system at .ai/memory/'));
    console.log(chalk.gray('  3. Generate specialized agents in .claude/agents/'));
    console.log(chalk.gray('  4. Create commands in .claude/commands/'));
    console.log(chalk.gray('  5. Update CLAUDE.md with orchestration rules'));
    
    if (hasQueuedItems) {
      console.log(chalk.yellow('\n  Additionally, Claude will:'));
      let stepNum = 6;
      if (queuedAgents.length > 0) {
        console.log(chalk.gray(`  ${stepNum}. Create ${queuedAgents.length} custom agent(s) using agent-factory patterns`));
        stepNum++;
      }
      if (queuedRoles.length > 0) {
        console.log(chalk.gray(`  ${stepNum}. Create ${queuedRoles.length} ChatGPT/Codex role(s) using role-instruction-engineer`));
        stepNum++;
      }
      if (agentsMdAction !== 'skip') {
        console.log(chalk.gray(`  ${stepNum}. ${agentsMdAction === 'update' ? 'Intelligently update' : 'Create'} AGENTS.md using codex-configuration-expert`));
      }
    }
    
    console.log(chalk.blue('\n🎭 Claude is working...'));
    console.log(chalk.gray('This may take a few moments as Claude analyzes your project'));
    console.log(chalk.gray('You will see Claude\'s output below:\n'));
    console.log(chalk.gray('─'.repeat(80)));
    
    const tempFile = path.join('/tmp', `claude-init-${Date.now()}.md`);
    
    // Enhanced prompt with queued items
    let enhancedPrompt = prompt;
    
    // Debug: Show what we're about to send
    if (hasQueuedItems) {
      console.log(chalk.blue('📝 Building enhanced prompt with queued items...'));
    }
    if (hasQueuedItems) {
      enhancedPrompt += `\n\n## 🤖 Intelligent Creation Phase\n\n`;
      enhancedPrompt += `**CRITICAL**: You MUST create ALL the files listed below. This is not optional.\n\n`;
      
      // Include full project analysis
      if (projectAnalysis) {
        enhancedPrompt += `### Project Analysis\n`;
        enhancedPrompt += `\`\`\`json\n${JSON.stringify(projectAnalysis, null, 2)}\n\`\`\`\n\n`;
      }
      
      // Custom agents using agent-factory
      if (queuedAgents.length > 0) {
        enhancedPrompt += `### Custom Agents to Create (${queuedAgents.length} files REQUIRED)\n`;
        enhancedPrompt += `**YOU MUST CREATE ALL OF THESE FILES:**\n\n`;
        
        queuedAgents.forEach((agent, index) => {
          enhancedPrompt += `#### ${index + 1}. CREATE FILE: .claude/agents/${agent}.md\n`;
          enhancedPrompt += `- Analyze the domain: "${agent.replace(/-/g, ' ')}"\n`;
          enhancedPrompt += `- Use agent-factory patterns from .claude/agents/agent-factory.md\n`;
          enhancedPrompt += `- Include appropriate MCP tools for this domain\n`;
          enhancedPrompt += `- Create specialized workflows based on project structure\n`;
          enhancedPrompt += `- **REQUIRED**: Save to .claude/agents/${agent}.md\n\n`;
        });
        
        enhancedPrompt += `**VERIFICATION**: You must create exactly ${queuedAgents.length} agent files.\n\n`;
      }
      
      // AGENTS.md using codex-configuration-expert
      if (agentsMdAction !== 'skip') {
        enhancedPrompt += `### AGENTS.md Configuration (REQUIRED)\n`;
        enhancedPrompt += `**YOU MUST ${agentsMdAction === 'update' ? 'UPDATE' : 'CREATE'} AGENTS.md FILE:**\n\n`;
        
        if (agentsMdAction === 'update' && fs.existsSync('AGENTS.md')) {
          enhancedPrompt += `**Action: UPDATE EXISTING AGENTS.md**\n`;
          enhancedPrompt += `1. Read the existing AGENTS.md file\n`;
          enhancedPrompt += `2. Preserve ALL custom sections and user content\n`;
          enhancedPrompt += `3. ADD/UPDATE the Memory System Navigation section\n`;
          enhancedPrompt += `4. UPDATE project overview with technologies: ${projectAnalysis?.technologies?.join(', ') || 'detected'}\n`;
          enhancedPrompt += `5. ADD role guidelines for ALL ${queuedAgents.length + queuedRoles.length} agents\n`;
          enhancedPrompt += `6. Optimize for Codex 192k context window\n`;
          enhancedPrompt += `7. **SAVE THE UPDATED FILE to AGENTS.md**\n\n`;
        } else if (agentsMdAction === 'merge' && fs.existsSync('AGENTS.md')) {
          enhancedPrompt += `**Action: INTELLIGENT MERGE WITH EXISTING AGENTS.md**\n`;
          enhancedPrompt += `1. Read the existing AGENTS.md file\n`;
          enhancedPrompt += `2. Preserve ALL existing content\n`;
          enhancedPrompt += `3. MERGE new Memory System Navigation section\n`;
          enhancedPrompt += `4. ADD technologies: ${projectAnalysis?.technologies?.join(', ') || 'detected'}\n`;
          enhancedPrompt += `5. ADD role guidelines for new agents (${queuedAgents.length} custom + ${queuedRoles.length} roles)\n`;
          enhancedPrompt += `6. **SAVE THE MERGED FILE to AGENTS.md**\n\n`;
        } else {
          enhancedPrompt += `**Action: CREATE NEW AGENTS.md**\n`;
          enhancedPrompt += `1. Create comprehensive AGENTS.md following codex-configuration-expert template\n`;
          enhancedPrompt += `2. Include technologies: ${projectAnalysis?.technologies?.join(', ') || 'all detected'}\n`;
          enhancedPrompt += `3. Add complete Memory System Navigation section\n`;
          enhancedPrompt += `4. Create role guidelines for ALL ${queuedAgents.length + queuedRoles.length} agents\n`;
          enhancedPrompt += `5. Include testing procedures from package.json\n`;
          enhancedPrompt += `6. **SAVE THE NEW FILE to AGENTS.md**\n\n`;
        }
      }
      
      // ChatGPT roles using role-instruction-engineer
      if (queuedRoles.length > 0) {
        enhancedPrompt += `### ChatGPT/Codex Roles (${queuedRoles.length} files REQUIRED)\n`;
        enhancedPrompt += `**YOU MUST CREATE ALL OF THESE FILES:**\n\n`;
        
        queuedRoles.forEach((role, index) => {
          enhancedPrompt += `#### ${index + 1}. CREATE FILE: .chatgpt/roles/${role}.md\n`;
          enhancedPrompt += `- Extract capabilities from corresponding agent or create based on domain\n`;
          enhancedPrompt += `- Compress to <1500 characters\n`;
          enhancedPrompt += `- Include workflow, principles, output format\n`;
          enhancedPrompt += `- **REQUIRED**: Save to .chatgpt/roles/${role}.md\n\n`;
        });
        
        enhancedPrompt += `**ALSO REQUIRED TO CREATE:**\n`;
        enhancedPrompt += `- .chatgpt/roles/manifest.json with ALL ${queuedRoles.length} roles listed\n`;
        enhancedPrompt += `- .chatgpt/AGENTS.md combining ALL ${queuedRoles.length} roles\n\n`;
        enhancedPrompt += `**VERIFICATION**: You must create exactly ${queuedRoles.length} role files + 2 additional files (manifest.json and AGENTS.md).\n\n`;
      }
      
      // Add commands section
      enhancedPrompt += `### Commands to Create (REQUIRED)\n`;
      enhancedPrompt += `**YOU MUST CREATE these command files in .claude/commands/:**\n\n`;
      
      // List essential commands based on project type and agents
      const essentialCommands = [
        'implement-feature',
        'debug-issue',
        'optimize-performance',
        'refactor-code',
        'update-docs'
      ];
      
      // Add specialized commands based on selected agents
      if (config && config.agents) {
        if (config.agents.includes('playwright-test-engineer')) {
          essentialCommands.push('generate-playwright-tests');
        }
        if (config.agents.includes('aws-backend-architect') || config.agents.includes('aws-deployment-specialist')) {
          essentialCommands.push('deploy-aws');
        }
      }
      
      essentialCommands.forEach((cmd, index) => {
        enhancedPrompt += `#### ${index + 1}. CREATE FILE: .claude/commands/${cmd}.md\n`;
        enhancedPrompt += `- Use command template patterns\n`;
        enhancedPrompt += `- Include triggers, workflow type, and agent assignments\n`;
        enhancedPrompt += `- **REQUIRED**: Save to .claude/commands/${cmd}.md\n\n`;
      });
      
      enhancedPrompt += `**VERIFICATION**: You must create exactly ${essentialCommands.length} command files.\n\n`;
      
      enhancedPrompt += `### EXECUTION CHECKLIST\n`;
      enhancedPrompt += `**YOU MUST COMPLETE ALL OF THESE:**\n`;
      if (queuedAgents.length > 0) {
        enhancedPrompt += `☐ Create ${queuedAgents.length} custom agent files in .claude/agents/\n`;
      }
      if (queuedRoles.length > 0) {
        enhancedPrompt += `☐ Create ${queuedRoles.length} ChatGPT role files in .chatgpt/roles/\n`;
        enhancedPrompt += `☐ Create .chatgpt/roles/manifest.json\n`;
        enhancedPrompt += `☐ Create .chatgpt/AGENTS.md\n`;
      }
      enhancedPrompt += `☐ Create ${essentialCommands.length} command files in .claude/commands/\n`;
      if (agentsMdAction !== 'skip') {
        enhancedPrompt += `☐ ${agentsMdAction === 'update' ? 'Update' : agentsMdAction === 'merge' ? 'Merge' : 'Create'} AGENTS.md in root directory\n`;
      }
      enhancedPrompt += `☐ Update CLAUDE.md with orchestration rules and agent list\n`;
      enhancedPrompt += `\n**IMPORTANT**: This is not a suggestion. You MUST create ALL files listed above.\n`;
      enhancedPrompt += `\n**WHEN COMPLETE**: After creating all files, please exit so the initialization can continue.\n`;
    }
    
    // Add exit instruction even without queued items
    enhancedPrompt += `\n\n---\n**IMPORTANT**: When you have completed all tasks, please exit/stop so the script can continue with verification.\n`;
    
    fs.writeFileSync(tempFile, enhancedPrompt);
    
    // Execute with Claude - requires user interaction
    console.log(chalk.gray('Claude is now creating the files and configurations...'));
    console.log(chalk.yellow('\n📝 Instructions:'));
    console.log(chalk.yellow('1. When Claude asks for permission, approve the file operations'));
    console.log(chalk.yellow('2. After Claude completes all tasks, type "exit" and press Enter'));
    console.log(chalk.cyan('\nThis will allow the script to continue with verification.\n'));
    console.log(chalk.gray('─'.repeat(80)));
    
    try {
      // Use execSync with stdio: 'inherit' to allow full interaction with Claude
      execSync(`claude < ${tempFile}`, { 
        stdio: 'inherit',
        encoding: 'utf8' 
      });
      console.log(chalk.gray('\n' + '─'.repeat(80)));
      console.log(chalk.green('✓ Claude execution completed'));
    } catch (execError) {
      // Claude exits with code 130 when user types exit or Ctrl+D, which is normal
      if (execError.status === 130) {
        console.log(chalk.gray('\n' + '─'.repeat(80)));
        console.log(chalk.green('✓ Claude execution completed'));
      } else {
        console.log(chalk.gray('\n' + '─'.repeat(80)));
        console.log(chalk.yellow('Claude execution ended. Verifying results...'));
      }
    }
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // Verify that files were actually created
    const verifyCreation = () => {
      console.log(chalk.blue('\n📁 Verifying created files...'));
      let successCount = 0;
      let expectedCount = 0;
      
      // Check template agents (should already be copied)
      if (config && config.agents && config.agents.length > 0) {
        let templateAgentsFound = 0;
        config.agents.forEach(agent => {
          const agentFile = path.join('.claude', 'agents', `${agent}.md`);
          if (fs.existsSync(agentFile)) {
            templateAgentsFound++;
          }
        });
        if (templateAgentsFound > 0) {
          console.log(chalk.green(`✓ Template agents present: ${templateAgentsFound}/${config.agents.length}`));
        } else {
          console.log(chalk.red(`✗ Template agents missing (expected ${config.agents.length})`));
        }
      }
      
      // Check custom agents
      if (queuedAgents.length > 0) {
        expectedCount += queuedAgents.length;
        let agentsCreated = 0;
        queuedAgents.forEach(agent => {
          const agentFile = path.join('.claude', 'agents', `${agent}.md`);
          if (fs.existsSync(agentFile)) {
            agentsCreated++;
          }
        });
        if (agentsCreated > 0) {
          successCount += agentsCreated;
          console.log(chalk.green(`✓ Created ${agentsCreated}/${queuedAgents.length} custom agents in .claude/agents/`));
        } else {
          console.log(chalk.red(`✗ No custom agents created (expected ${queuedAgents.length})`));
        }
      }
      
      // Check ChatGPT roles
      if (queuedRoles.length > 0) {
        expectedCount += queuedRoles.length;
        let rolesCreated = 0;
        queuedRoles.forEach(role => {
          const roleFile = path.join('.chatgpt', 'roles', `${role}.md`);
          if (fs.existsSync(roleFile)) {
            rolesCreated++;
          }
        });
        if (rolesCreated > 0) {
          successCount += rolesCreated;
          console.log(chalk.green(`✓ Created ${rolesCreated}/${queuedRoles.length} ChatGPT roles in .chatgpt/roles/`));
        } else {
          console.log(chalk.red(`✗ No ChatGPT roles created (expected ${queuedRoles.length})`));
        }
      }
      
      // Check AGENTS.md
      if (agentsMdAction !== 'skip') {
        expectedCount++;
        if (fs.existsSync('AGENTS.md')) {
          successCount++;
          console.log(chalk.green(`✓ AGENTS.md ${agentsMdAction === 'update' ? 'updated' : 'created'}`));
        } else {
          console.log(chalk.red(`✗ AGENTS.md not ${agentsMdAction === 'update' ? 'updated' : 'created'}`));
        }
      }
      
      // Check CLAUDE.md update
      if (fs.existsSync('CLAUDE.md')) {
        console.log(chalk.green(`✓ CLAUDE.md updated with orchestration rules`));
      } else {
        console.log(chalk.yellow(`⚠️  CLAUDE.md not found or not updated`));
      }
      
      // Check commands
      const commandsDir = '.claude/commands';
      if (fs.existsSync(commandsDir)) {
        const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
        if (commandFiles.length > 0) {
          console.log(chalk.green(`✓ Created ${commandFiles.length} command files in .claude/commands/`));
          commandFiles.forEach(cmd => console.log(chalk.gray(`    • ${cmd}`)));
        } else {
          console.log(chalk.red(`✗ No command files created in .claude/commands/`));
        }
      } else {
        console.log(chalk.red(`✗ Commands directory not found`));
      }
      
      // Summary
      if (expectedCount > 0) {
        if (successCount === 0) {
          console.log(chalk.red(`\n⚠️  Warning: No queued files were created (0/${expectedCount})`));
          console.log(chalk.yellow('This may indicate Claude needs explicit permission to write files.'));
          console.log(chalk.yellow('Try running with --prompt-only and manually paste into Claude.'));
          return false;
        } else if (successCount < expectedCount) {
          console.log(chalk.yellow(`\n⚠️  Partially successful: ${successCount}/${expectedCount} items created`));
          return true;
        } else {
          console.log(chalk.green(`\n✅ All queued items created successfully (${successCount}/${expectedCount})`));
          return true;
        }
      }
      return true;
    };
    
    return verifyCreation();
  } catch (error) {
    console.error(chalk.red('Error executing with Claude:'), error.message);
    return false;
  }
}

async function execute(options) {
  const workflow = await getWorkflow(options);
  
  // Create all required directories at the very start
  const dirsToCreate = [
    '.claude',
    '.claude/agents',
    '.claude/commands',
    '.claude/tasks',
    '.claude/doc',
    '.ai/memory',
    '.ai/memory/patterns',
    '.ai/memory/patterns/testing',
    '.ai/memory/decisions',
    '.ai/memory/implementation-plans',
    '.ai/memory/sessions',
    '.ai/memory/sessions/archive'
  ];
  
  // Create directories immediately
  dirsToCreate.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Skip interactive prompts if --minimal flag is set for CI
  if (options.minimal) {
    console.log(chalk.blue(`\n🚀 Initializing Multi-Agent Claude Environment (CI Mode)`));
    console.log(chalk.gray(`Using minimal setup for CI/CD environments\n`));
    
    // Create minimal config
    const configPath = path.join(process.cwd(), '.claude', 'config.json');
    const minimalConfig = {
      variant: 'base',
      initialized: true,
      ciMode: true,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(configPath, JSON.stringify(minimalConfig, null, 2));
    
    // Create basic CLAUDE.md
    const claudeMd = `# CLAUDE.md\n\nMinimal configuration for CI/CD testing.\n\nGenerated: ${new Date().toISOString()}\n`;
    fs.writeFileSync(path.join(process.cwd(), 'CLAUDE.md'), claudeMd);
    
    // Create basic memory files
    const projectMd = `# Project Memory\n\nCI Mode - Minimal Setup\n\nGenerated: ${new Date().toISOString()}\n`;
    fs.writeFileSync(path.join(process.cwd(), '.ai/memory/project.md'), projectMd);
    
    console.log(chalk.green('✅ Minimal CI environment initialized successfully!'));
    console.log(chalk.gray('All directories created:'));
    dirsToCreate.forEach(dir => console.log(chalk.gray(`  ✓ ${dir}`)));
    return;
  }
  
  console.log(chalk.blue(`\n🚀 Initializing Multi-Agent Claude Environment`));
  console.log(chalk.gray(`Using workflow: ${workflow}\n`));
  
  // FIXED: Declare variables before use
  let hasQueuedItems = false;
  let queuedAgents = [];
  let queuedRoles = [];
  let agentsMdAction = 'skip';
  let projectType = 'Unknown';
  let projectAnalysis = null;
  
  // Check for setup config with queued items
  const configPath = path.join(process.cwd(), '.claude', 'config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Get project info from config
      projectType = config.projectType || 'Unknown';
      projectAnalysis = config.projectAnalysis || null;
      
      // Handle template agents that need to be copied
      let templateAgentsToCopy = [];
      if (config.agents && config.agents.length > 0) {
        templateAgentsToCopy = config.agents;
        console.log(chalk.yellow('📋 Template agents to copy from Examples:'));
        console.log(chalk.gray(`  Template agents: ${templateAgentsToCopy.length}`));
        templateAgentsToCopy.forEach(agent => console.log(chalk.gray(`    • ${agent}`)));
      }
      
      if (config.queuedForCreation && config.queuedForCreation.needsProcessing) {
        hasQueuedItems = true;
        queuedAgents = config.queuedForCreation.customAgents || [];
        queuedRoles = config.queuedForCreation.codexRoles || [];
        agentsMdAction = config.queuedForCreation.agentsMd || 'skip';
        
        console.log(chalk.yellow('\n📋 Custom items to create intelligently:'));
        if (queuedAgents.length > 0) {
          console.log(chalk.gray(`  Custom agents to create: ${queuedAgents.length}`));
          queuedAgents.forEach(agent => console.log(chalk.gray(`    • ${agent}`)));
        }
        if (queuedRoles.length > 0) {
          console.log(chalk.gray(`  Codex roles to create: ${queuedRoles.length}`));
          queuedRoles.forEach(role => console.log(chalk.gray(`    • ${role}`)));
        }
        if (agentsMdAction !== 'skip') {
          console.log(chalk.gray(`  AGENTS.md: ${agentsMdAction === 'update' ? 'Update existing' : 'Create new'}`));
        }
        console.log('');
      }
    } catch (e) {
      // Config exists but couldn't parse - continue normally
    }
  }

  try {
    const prompt = await composePrompt(options);

    if (options.promptOnly) {
      console.log(chalk.yellow('Prompt output mode - Copy the following into Claude:\n'));
      console.log(chalk.gray('─'.repeat(80)));
      console.log(prompt);
      console.log(chalk.gray('─'.repeat(80)));
      return;
    }

    // Pass config and queued items data to executeWithClaude for intelligent creation
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : null;
    
    // Copy template agents BEFORE executing with Claude
    if (config && config.agents && config.agents.length > 0) {
      console.log(chalk.blue('\n📂 Copying template agents from Examples...'));
      const copiedCount = copyTemplateAgents(config.agents);
      if (copiedCount > 0) {
        console.log(chalk.green(`✓ Successfully copied ${copiedCount}/${config.agents.length} template agents\n`));
      } else {
        console.log(chalk.yellow(`⚠️  No template agents were copied\n`));
      }
    }
    
    // Copy template commands as well
    console.log(chalk.blue('📂 Copying template commands from Examples...'));
    const copiedCommands = copyTemplateCommands();
    if (copiedCommands > 0) {
      console.log(chalk.green(`✓ Successfully copied ${copiedCommands} command templates\n`));
    } else {
      console.log(chalk.yellow(`⚠️  No command templates were copied\n`));
    }
    const queuedItemsData = {
      hasQueuedItems,
      queuedAgents,
      queuedRoles,
      agentsMdAction,
      projectAnalysis
    };
    const success = executeWithClaude(prompt, config, queuedItemsData);
    
    if (!success) {
      console.log(chalk.yellow('\nAlternative: Copy the prompt manually'));
      console.log(chalk.gray('Run with --prompt-only flag to see the full prompt'));
      console.log(chalk.cyan('multiagent-claude init --prompt-only'));
    } else {
      console.log(chalk.green('\n✅ Multi-agent environment initialized successfully!'));
      
      // Show what was created
      if (fs.existsSync('.ai/memory')) {
        console.log(chalk.blue('\n🧠 Memory System Created:'));
        console.log(chalk.gray('  .ai/memory/'));
        console.log(chalk.gray('  ├── project.md - Project conventions'));
        console.log(chalk.gray('  ├── patterns/ - Successful solutions'));
        console.log(chalk.gray('  ├── decisions/ - Architectural records'));
        console.log(chalk.gray('  └── index.json - Quick lookup'));
      }
      
      if (fs.existsSync('.claude')) {
        console.log(chalk.blue('\n🤖 Claude Configuration:'));
        console.log(chalk.gray('  .claude/'));
        console.log(chalk.gray('  ├── agents/ - Specialized agents'));
        console.log(chalk.gray('  ├── commands/ - Custom commands'));
        console.log(chalk.gray('  ├── tasks/ - Session contexts'));
        console.log(chalk.gray('  └── doc/ - Agent plans'));
      }
      
      if (fs.existsSync('.chatgpt')) {
        console.log(chalk.blue('\n💬 ChatGPT/Codex Integration:'));
        console.log(chalk.gray('  .chatgpt/'));
        console.log(chalk.gray('  ├── roles/ - Compressed agent roles'));
        console.log(chalk.gray('  └── bundles/ - Optimized file bundles'));
      }
      
      // Clear queued items from config
      if (hasQueuedItems && fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          config.queuedForCreation = {
            customAgents: [],
            codexRoles: [],
            agentsMd: 'skip',
            needsProcessing: false
          };
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log(chalk.gray('\n✓ Cleared processed queue from config'));
        } catch (e) {
          // Couldn't update config - not critical
        }
      }

      // CI/CD and Testing Options - Skip if minimal
      if (!options.minimal) {
        console.log(chalk.cyan('\n\nCI/CD and Testing Configuration:'));
        const cicdOptions = {
          memoryWorkflow: (await question('Enable GitHub Actions for memory updates? (y/n): ')).toLowerCase() === 'y',
          playwrightTests: (await question('Add Playwright testing framework? (y/n): ')).toLowerCase() === 'y',
          includeCliTests: false,
          includeWebTests: false
        };

        // If Playwright enabled, ask about test types
        if (cicdOptions.playwrightTests) {
          cicdOptions.includeCliTests = (await question('Include CLI tests? (y/n): ')).toLowerCase() === 'y';
          cicdOptions.includeWebTests = (await question('Include web application tests? (y/n): ')).toLowerCase() === 'y';
          
          // Ask about deployment detection for web tests
          if (cicdOptions.includeWebTests) {
            console.log(chalk.cyan('\nDeployment Configuration for Visual Testing:'));
            cicdOptions.deploymentProvider = await question('Deployment provider (vercel/custom/manual/none): ') || 'none';
            
            if (cicdOptions.deploymentProvider === 'vercel') {
              cicdOptions.vercelAutoDetect = (await question('Enable automatic Vercel preview URL detection? (y/n): ')).toLowerCase() === 'y';
              if (!cicdOptions.vercelAutoDetect) {
                cicdOptions.vercelProjectName = await question('Vercel project name (optional): ');
              }
            } else if (cicdOptions.deploymentProvider === 'manual') {
              cicdOptions.manualDeploymentUrl = await question('Manual deployment URL (leave empty to set in GitHub secrets): ');
            }
            
            cicdOptions.visualTestingOnCI = (await question('Enable visual regression testing on CI? (y/n): ')).toLowerCase() === 'y';
          }
        }

        // Save deployment configuration if provided
        if (cicdOptions.deploymentProvider && cicdOptions.deploymentProvider !== 'none') {
          const deploymentConfig = {
            deployment: {
              provider: cicdOptions.deploymentProvider,
              autoDetect: cicdOptions.vercelAutoDetect || false,
              vercel: cicdOptions.deploymentProvider === 'vercel' ? {
                projectName: cicdOptions.vercelProjectName || null
              } : undefined,
              fallbackUrl: cicdOptions.manualDeploymentUrl || 'http://localhost:3000',
              waitTimeout: 300000,
              retryInterval: 5000
            },
            visualTesting: {
              enableOnCI: cicdOptions.visualTestingOnCI || false,
              viewports: ['mobile', 'desktop'],
              threshold: 0.05
            }
          };
          
          const deploymentConfigPath = path.join('.claude', 'config', 'deployment.json');
          if (!fs.existsSync(path.dirname(deploymentConfigPath))) {
            fs.mkdirSync(path.dirname(deploymentConfigPath), { recursive: true });
          }
          fs.writeFileSync(deploymentConfigPath, JSON.stringify(deploymentConfig, null, 2));
          console.log(chalk.green('✓ Saved deployment configuration'));
        }
        
        // Copy workflow files if enabled
        if (cicdOptions.memoryWorkflow) {
          console.log(chalk.blue('\nAdding CI/CD workflows...'));
          copyWorkflowTemplate('claude-memory-update.yml');
        }
        if (cicdOptions.playwrightTests) {
          if (cicdOptions.includeCliTests) {
            console.log(chalk.blue('\nAdding Playwright CLI testing...'));
            copyWorkflowTemplate('playwright-cli-tests.yml');
            copyTestTemplate('cli.cli.spec.js');
          }
          if (cicdOptions.includeWebTests) {
            console.log(chalk.blue('\nAdding Playwright web testing...'));
            copyWorkflowTemplate('playwright-web-tests.yml');
          }
          if (cicdOptions.includeCliTests || cicdOptions.includeWebTests) {
            // Copy visual test templates if web tests enabled
            if (cicdOptions.includeWebTests && cicdOptions.visualTestingOnCI) {
              console.log(chalk.blue('\nAdding visual test templates...'));
              copyVisualTestTemplates();
            }
            
            // Create basic playwright.config.js if it doesn't exist
            const playwrightConfigPath = path.join(process.cwd(), 'playwright.config.js');
            if (!fs.existsSync(playwrightConfigPath)) {
              const playwrightConfig = `const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '.playwright/reports' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`;
              fs.writeFileSync(playwrightConfigPath, playwrightConfig);
              console.log(chalk.green('✓ Created playwright.config.js'));
            }
            
            console.log(chalk.yellow('\nRun the following to install Playwright:'));
            console.log(chalk.cyan('npm install --save-dev @playwright/test'));
            console.log(chalk.cyan('npx playwright install'));
          }
        }
        
        // Visual Development Setup
        if (config && config.visualDevOptions && config.visualDevOptions.enabled) {
          console.log(chalk.blue('\n🎨 Setting up Visual Development Environment...'));
          
          // Import and run visual development setup
          try {
            const { setupPlaywrightDirectories } = require('./mcp');
            setupPlaywrightDirectories();
          } catch (error) {
            console.log(chalk.yellow('⚠️  Warning: Could not set up Playwright directories'));
            console.log(chalk.gray(`  Error: ${error.message}`));
          }
          
          // Copy playwright-visual-developer agent if not already present
          const visualAgentPath = path.join(process.cwd(), '.claude', 'agents', 'playwright-visual-developer.md');
          if (!fs.existsSync(visualAgentPath)) {
            copyTemplateAgents(['playwright-visual-developer']);
          }
          
          // Copy cli-web-bridge-architect agent if not already present
          const bridgeAgentPath = path.join(process.cwd(), '.claude', 'agents', 'cli-web-bridge-architect.md');
          if (!fs.existsSync(bridgeAgentPath)) {
            copyTemplateAgents(['cli-web-bridge-architect']);
          }
          
          // Create /visual-iterate command
          const visualIterateCommand = `# Visual Iteration Command

Trigger: /visual-iterate [component-name] [mock-path?]

You are implementing pixel-perfect UI using Playwright MCP tools to achieve < ${config.visualDevOptions.defaultThreshold || 5}% visual difference.

## Configuration
- Max Iterations: ${config.visualDevOptions.maxIterations || 10}
- Threshold: ${config.visualDevOptions.defaultThreshold || 5}%

## Required MCP Tools
- playwright_navigate(url) - Navigate to component
- playwright_screenshot(selector?, path?) - Capture screenshots
- playwright_set_viewport(width, height) - Change viewport
- playwright_evaluate(script) - Inject CSS/JS changes

## Workflow

### Phase 1: Setup
1. Check for mock at .claude/mocks/[component-name].png
2. Create session directory: .claude/visual-iterations/session-[timestamp]/
3. Navigate to component
4. Capture initial state

### Phase 2: Iterative Refinement (${config.visualDevOptions.maxIterations || 10} iterations max)
For each iteration:
1. Compare screenshot with mock visually
2. Identify differences (layout, colors, typography, spacing)
3. Apply fixes using playwright_evaluate
4. Capture new screenshot
5. If < ${config.visualDevOptions.defaultThreshold || 5}% difference, proceed to Phase 3

### Phase 3: Responsive Testing
Test mobile (375x667), tablet (768x1024), and desktop (1920x1080) viewports

### Phase 4: Documentation
Create report at .claude/visual-reports/[component]-[timestamp].md with:
- Number of iterations
- Final difference percentage
- Changes made per iteration
- Responsive screenshots

## Success Criteria
✅ Visual difference < ${config.visualDevOptions.defaultThreshold || 5}%
✅ All viewports tested
✅ Report generated
`;
          
          const visualCommandPath = path.join(process.cwd(), '.claude', 'commands', 'visual-iterate.md');
          fs.writeFileSync(visualCommandPath, visualIterateCommand);
          console.log(chalk.green('  ✓ Created /visual-iterate command'));
          
          // Setup Playwright MCP if configured
          if (config.visualDevOptions.mcpPlaywright && config.mcpServers && config.mcpServers.includes('playwright')) {
            console.log(chalk.blue('\n📦 Setting up Playwright MCP...'));
            const { setupMCP } = require('./mcp');
            setupMCP('playwright');
          }
          
          console.log(chalk.green('\n✅ Visual Development Environment Ready!'));
          console.log(chalk.cyan('\nNext steps:'));
          console.log(chalk.gray('  1. Add design mocks to .claude/mocks/'));
          console.log(chalk.gray('  2. Start your dev server'));
          console.log(chalk.gray('  3. Tell Claude: /visual-iterate [component-name]'));
        }
      }

      console.log(chalk.green('\n✅ Setup complete!'));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = { execute };