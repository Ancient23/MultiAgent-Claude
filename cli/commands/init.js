const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');
const PromptComposer = require('../lib/prompt-composer');

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
  const context = {
    options: {
      cicd: options.cicd || false,
      testing: options.testing || false,
      docs: options.withDocs || false
    },
    project: {
      name: path.basename(process.cwd()),
      path: process.cwd()
    }
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


function executeWithClaude(prompt) {
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
        console.log(chalk.gray(`  ${stepNum}. Create ${queuedAgents.length} custom agent(s) with proper implementations`));
        stepNum++;
      }
      if (queuedRoles.length > 0) {
        console.log(chalk.gray(`  ${stepNum}. Create ${queuedRoles.length} ChatGPT/Codex role(s) in .chatgpt/roles/`));
        stepNum++;
      }
      if (agentsMdAction !== 'skip') {
        console.log(chalk.gray(`  ${stepNum}. ${agentsMdAction === 'update' ? 'Intelligently update' : 'Create'} AGENTS.md for ChatGPT/Codex`));
      }
    }
    
    console.log(chalk.blue('\n🎭 Claude is working...'));
    console.log(chalk.gray('This may take a few moments as Claude analyzes your project\n'));
    
    const tempFile = path.join('/tmp', `claude-init-${Date.now()}.md`);
    
    // Enhanced prompt with queued items
    let enhancedPrompt = prompt;
    if (hasQueuedItems) {
      enhancedPrompt += `\n\n## 📋 Queued Items from Setup\n\n`;
      
      // AGENTS.md handling
      if (agentsMdAction !== 'skip') {
        enhancedPrompt += `### AGENTS.md for ChatGPT/Codex\n`;
        if (agentsMdAction === 'update' && fs.existsSync('AGENTS.md')) {
          enhancedPrompt += `**Intelligently update the existing AGENTS.md file:**\n`;
          enhancedPrompt += `- Read and analyze the current AGENTS.md\n`;
          enhancedPrompt += `- Preserve all custom sections and user additions\n`;
          enhancedPrompt += `- Add or update the "Memory System Navigation" section if missing or incomplete\n`;
          enhancedPrompt += `- Ensure .ai/memory/ paths are documented\n`;
          enhancedPrompt += `- Update project overview with detected technologies: ${JSON.stringify(projectType)}\n`;
          enhancedPrompt += `- Add role guidelines for configured agents\n`;
          enhancedPrompt += `- Create a backup before modifying (AGENTS.md.backup.[timestamp])\n`;
          enhancedPrompt += `- Maintain existing formatting and structure where possible\n\n`;
        } else if (agentsMdAction === 'create') {
          enhancedPrompt += `**Create a new AGENTS.md file with:**\n`;
          enhancedPrompt += `- Project overview with technologies: ${JSON.stringify(projectType)}\n`;
          enhancedPrompt += `- Directory structure including .ai/memory/, .claude/, and .chatgpt/\n`;
          enhancedPrompt += `- **Critical**: Memory System Navigation section explaining how to use .ai/memory/\n`;
          enhancedPrompt += `- Role guidelines for each configured agent\n`;
          enhancedPrompt += `- Testing procedures and workflow patterns\n`;
          enhancedPrompt += `- Cross-platform considerations for Claude/ChatGPT compatibility\n\n`;
        }
      }
      
      // Custom agents
      if (queuedAgents.length > 0) {
        enhancedPrompt += `### Custom Agents to Create\n`;
        enhancedPrompt += `Please create the following custom agents using the /generate-agent command pattern:\n\n`;
        queuedAgents.forEach(agent => {
          enhancedPrompt += `- **${agent}**: Create a specialized agent for ${agent.replace(/-/g, ' ')} with appropriate domain expertise, MCP tools, and workflow patterns\n`;
        });
        enhancedPrompt += `\n`;
      }
      
      // Codex roles
      if (queuedRoles.length > 0) {
        enhancedPrompt += `### ChatGPT/Codex Roles to Create\n`;
        enhancedPrompt += `Please create compressed, token-efficient roles in .chatgpt/roles/ for:\n\n`;
        queuedRoles.forEach(role => {
          enhancedPrompt += `- **${role}**: Codex-optimized role matching the agent capabilities\n`;
        });
        enhancedPrompt += `\nEach role should be <1500 characters and include workflow, principles, and output format.\n`;
      }
      
      enhancedPrompt += `\n**Important**: Use your expertise to create proper, high-quality implementations - not boilerplate templates.\n`;
    }
    
    fs.writeFileSync(tempFile, enhancedPrompt);
    
    execSync(`claude --print < ${tempFile}`, { 
      stdio: 'inherit',
      encoding: 'utf8' 
    });
    
    fs.unlinkSync(tempFile);
    return true;
  } catch (error) {
    console.error(chalk.red('Error executing with Claude:'), error.message);
    return false;
  }
}

async function execute(options) {
  const workflow = await getWorkflow(options);
  
  console.log(chalk.blue(`\n🚀 Initializing Multi-Agent Claude Environment`));
  console.log(chalk.gray(`Using workflow: ${workflow}\n`));
  
  // Check for setup config with queued items
  const configPath = path.join(process.cwd(), '.claude', 'config.json');
  let hasQueuedItems = false;
  let queuedAgents = [];
  let queuedRoles = [];
  let agentsMdAction = 'skip';
  let projectType = 'Unknown';
  let projectAnalysis = null;
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Get project info from config
      projectType = config.projectType || 'Unknown';
      projectAnalysis = config.projectAnalysis || null;
      
      if (config.queuedForCreation && config.queuedForCreation.needsProcessing) {
        hasQueuedItems = true;
        queuedAgents = config.queuedForCreation.customAgents || [];
        queuedRoles = config.queuedForCreation.codexRoles || [];
        agentsMdAction = config.queuedForCreation.agentsMd || 'skip';
        
        console.log(chalk.yellow('📋 Detected queued items from setup:'));
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

    const success = executeWithClaude(prompt);
    
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

      // CI/CD and Testing Options
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
          console.log(chalk.yellow('\nRun the following to install Playwright:'));
          console.log(chalk.cyan('npm install --save-dev @playwright/test playwright'));
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