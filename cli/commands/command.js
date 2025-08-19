const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function createCommand() {
  console.log(chalk.blue('\n⚡ Interactive Command Creator\n'));

  const commandConfig = {};
  
  commandConfig.name = await question(chalk.cyan('Command name (e.g., implement-feature): '));
  commandConfig.description = await question(chalk.cyan('Brief description: '));
  commandConfig.trigger = await question(chalk.cyan('Trigger phrase (e.g., "implement", "create feature"): '));
  
  console.log(chalk.yellow('\nCommand phases:'));
  console.log('1. Research phase (gather information)');
  console.log('2. Planning phase (create implementation plan)');
  console.log('3. Execution phase (implement the plan)');
  
  commandConfig.hasResearch = (await question(chalk.cyan('Include research phase? (y/n): '))).toLowerCase() === 'y';
  commandConfig.hasPlanning = (await question(chalk.cyan('Include planning phase? (y/n): '))).toLowerCase() === 'y';
  
  commandConfig.example = await question(chalk.cyan('\nProvide an example use case: '));

  rl.close();

  const template = fs.readFileSync(
    path.join(__dirname, '..', '..', 'Examples', 'commands', 'TEMPLATE-COMMAND.md'),
    'utf8'
  );

  let commandContent = template
    .replace(/TEMPLATE-COMMAND/g, commandConfig.name)
    .replace(/\[Command Name\]/g, commandConfig.name)
    .replace(/\[trigger phrase\]/g, commandConfig.trigger)
    .replace(/\[Brief description\]/g, commandConfig.description)
    .replace(/\[example use case\]/g, commandConfig.example);

  if (!commandConfig.hasResearch) {
    commandContent = commandContent.replace(/## Phase 1: Research[\s\S]*?(?=## Phase 2:)/g, '');
  }
  
  if (!commandConfig.hasPlanning) {
    commandContent = commandContent.replace(/## Phase 2: Planning[\s\S]*?(?=## Phase 3:)/g, '');
  }

  const commandPath = path.join('.claude', 'commands', `${commandConfig.name}.md`);
  
  if (!fs.existsSync(path.dirname(commandPath))) {
    fs.mkdirSync(path.dirname(commandPath), { recursive: true });
  }
  
  fs.writeFileSync(commandPath, commandContent);

  console.log(chalk.green(`\n✅ Command created at ${commandPath}`));
  console.log(chalk.yellow('\nTo use this command:'));
  console.log(chalk.gray('1. Open the command file'));
  console.log(chalk.gray('2. Copy its content'));
  console.log(chalk.gray('3. Paste into Claude when you want to execute this workflow'));
}

function listCommands() {
  const commandsDir = path.join(__dirname, '..', '..', 'Examples', 'commands');
  const localCommandsDir = path.join('.claude', 'commands');
  
  console.log(chalk.blue('\n📋 Available Command Templates:\n'));
  
  if (fs.existsSync(commandsDir)) {
    const templates = fs.readdirSync(commandsDir)
      .filter(f => f.endsWith('.md') && f !== 'TEMPLATE-COMMAND.md');
    
    templates.forEach(template => {
      const name = template.replace('.md', '');
      console.log(chalk.green(`  • ${name}`));
    });
  }
  
  if (fs.existsSync(localCommandsDir)) {
    console.log(chalk.blue('\n📦 Local Commands:\n'));
    const localCommands = fs.readdirSync(localCommandsDir).filter(f => f.endsWith('.md'));
    
    localCommands.forEach(command => {
      const name = command.replace('.md', '');
      console.log(chalk.cyan(`  • ${name}`));
    });
  }
}

function addCommand(name) {
  const templatePath = path.join(__dirname, '..', '..', 'Examples', 'commands', `${name}.md`);
  const targetPath = path.join('.claude', 'commands', `${name}.md`);
  
  if (!fs.existsSync(templatePath)) {
    console.error(chalk.red(`Command template "${name}" not found`));
    return;
  }
  
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }
  
  fs.copyFileSync(templatePath, targetPath);
  console.log(chalk.green(`✅ Command "${name}" added to local commands`));
}

function execute(action, name, options) {
  switch(action) {
    case 'create':
      createCommand();
      break;
    case 'list':
      listCommands();
      break;
    case 'add':
      if (!name) {
        console.error(chalk.red('Command name required'));
        process.exit(1);
      }
      addCommand(name);
      break;
    default:
      console.error(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.gray('Available actions: create, list, add'));
  }
}

module.exports = { execute };