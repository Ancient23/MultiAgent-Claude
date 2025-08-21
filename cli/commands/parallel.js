const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;
const chalk = require('chalk');

async function deployParallel() {
  // List available agents
  const agentsDir = path.join(process.cwd(), '.claude/agents');
  if (!fs.existsSync(agentsDir)) {
    console.error(chalk.red('No agents directory found. Run "mac init" first.'));
    return;
  }
  
  const agents = fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
  
  if (agents.length === 0) {
    console.error(chalk.red('No agents found. Create agents first.'));
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedAgents',
      message: 'Select agents to run in parallel:',
      choices: agents,
      validate: input => input.length > 0 ? true : 'Select at least one agent'
    },
    {
      type: 'input',
      name: 'task',
      message: 'Describe the overall task:',
      validate: input => input.length > 0
    }
  ]);
  
  const parallelConfig = {
    task: answers.task,
    agents: answers.selectedAgents,
    mode: 'parallel',
    coordination: 'orchestrator-worker',
    outputPath: '.claude/doc/',
    timestamp: new Date().toISOString()
  };
  
  const configPath = path.join(process.cwd(), '.claude/parallel-execution.json');
  fs.writeFileSync(configPath, JSON.stringify(parallelConfig, null, 2));
  
  console.log(chalk.green('\n✅ Parallel execution plan created!'));
  console.log(chalk.blue(`\n📊 ${answers.selectedAgents.length} agents will run in parallel`));
  console.log(chalk.yellow('\n💡 Tell Claude:'));
  console.log(chalk.cyan('   "Execute the parallel agents defined in .claude/parallel-execution.json"'));
}

module.exports = { deployParallel };