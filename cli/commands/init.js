const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

function getPromptFile(options) {
  if (options.memoryOnly) {
    return 'claude-code-init-memory-prompt.md';
  } else if (options.withDocs) {
    return 'claude-code-init-with-docs-import.md';
  }
  return 'claude-code-init-prompts.md';
}

function readPrompt(promptFile) {
  const promptPath = path.join(__dirname, '..', '..', promptFile);
  return fs.readFileSync(promptPath, 'utf8');
}

function extractPromptContent(content) {
  const match = content.match(/```markdown\n([\s\S]*?)\n```/);
  if (match) {
    return match[1];
  }
  const lines = content.split('\n');
  const startIdx = lines.findIndex(line => line.includes('## Master Initialization Prompt'));
  if (startIdx !== -1) {
    return lines.slice(startIdx + 1).join('\n');
  }
  return content;
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

function execute(options) {
  const promptFile = getPromptFile(options);
  
  console.log(chalk.blue(`\n🚀 Initializing Multi-Agent Claude Environment`));
  console.log(chalk.gray(`Using prompt: ${promptFile}\n`));

  try {
    const fullContent = readPrompt(promptFile);
    const prompt = extractPromptContent(fullContent);

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
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = { execute };