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
      if (agentsMdAction !== 'skip') {
        enhancedPrompt += `☐ ${agentsMdAction === 'update' ? 'Update' : agentsMdAction === 'merge' ? 'Merge' : 'Create'} AGENTS.md in root directory\n`;
      }
      enhancedPrompt += `☐ Update CLAUDE.md with orchestration rules and agent list\n`;
      enhancedPrompt += `\n**IMPORTANT**: This is not a suggestion. You MUST create ALL files listed above.\n`;
    }
    
    fs.writeFileSync(tempFile, enhancedPrompt);
    
    // Execute with Claude without --print flag to actually perform the tasks
    // Use stdio: 'inherit' to show Claude's output in real-time
    console.log(chalk.gray('Claude is now creating the files and configurations...\n'));
    
    try {
      execSync(`claude < ${tempFile}`, { 
        stdio: 'inherit',
        encoding: 'utf8' 
      });
      console.log(chalk.gray('\n' + '─'.repeat(80)));
      console.log(chalk.green('✓ Claude execution completed successfully'));
    } catch (execError) {
      // Claude might exit with non-zero code even on success, so check if files were created
      console.log(chalk.gray('\n' + '─'.repeat(80)));
      console.log(chalk.yellow('Claude execution completed. Verifying results...'));
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