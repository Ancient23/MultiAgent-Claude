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
    
    const tempFile = path.join('/tmp', `claude-init-${Date.now()}.md`);
    fs.writeFileSync(tempFile, prompt);
    
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
      
      if (fs.existsSync('.claude')) {
        console.log(chalk.blue('\nCreated structure:'));
        console.log(chalk.gray('  .claude/'));
        console.log(chalk.gray('  ├── memory/'));
        console.log(chalk.gray('  │   ├── project.md'));
        console.log(chalk.gray('  │   ├── patterns/'));
        console.log(chalk.gray('  │   ├── decisions/'));
        console.log(chalk.gray('  │   └── index.json'));
        console.log(chalk.gray('  ├── tasks/'));
        console.log(chalk.gray('  ├── doc/'));
        console.log(chalk.gray('  └── agents/'));
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