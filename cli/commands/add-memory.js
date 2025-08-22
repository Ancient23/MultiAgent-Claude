const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

function readPrompt() {
  const promptPath = path.join(__dirname, '..', '..', 'memory-system-addon-prompt.md');
  return fs.readFileSync(promptPath, 'utf8');
}

function extractPromptContent(content) {
  const match = content.match(/```markdown\n([\s\S]*?)\n```/);
  if (match) {
    return match[1];
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
    console.log(chalk.blue('Adding memory system with Claude...'));
    
    const tempFile = path.join('/tmp', `claude-memory-${Date.now()}.md`);
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
  console.log(chalk.blue(`\n🧠 Adding Memory System to Existing Setup`));

  try {
    const fullContent = readPrompt();
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
      console.log(chalk.cyan('multiagent-claude add-memory --prompt-only'));
    } else {
      console.log(chalk.green('\n✅ Memory system added successfully!'));
      console.log(chalk.blue('\nMemory structure created at .ai/memory/'));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = { execute };