const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

async function orchestrate() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select orchestration mode:',
      choices: [
        { name: '🤖 Auto - Let master orchestrator decide', value: 'auto' },
        { name: '📋 Plan Only - Generate plans without implementation', value: 'plan' },
        { name: '🚀 Parallel - Deploy multiple agents', value: 'parallel' },
        { name: '📝 Sequential - Step by step execution', value: 'sequential' },
        { name: '🏗️ Meta - Complex architectural changes', value: 'meta' }
      ]
    },
    {
      type: 'input',
      name: 'task',
      message: 'Describe the task:',
      validate: input => input.length > 0
    },
    {
      type: 'checkbox',
      name: 'options',
      message: 'Additional options:',
      choices: [
        { name: 'Enable verification after each phase', value: 'verify', checked: true },
        { name: 'Use visual iteration for UI changes', value: 'visual' },
        { name: 'Optimize for context window', value: 'optimize' },
        { name: 'Create rollback points', value: 'rollback' }
      ]
    }
  ]);

  const config = {
    mode: answers.mode,
    task: answers.task,
    options: answers.options,
    timestamp: new Date().toISOString()
  };

  // Create orchestration directory
  const orchestrationDir = path.join(process.cwd(), '.claude/orchestration');
  fs.mkdirSync(orchestrationDir, { recursive: true });
  
  const configPath = path.join(orchestrationDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green('\n✅ Orchestration configured!'));
  
  // Mode-specific instructions
  const instructions = {
    auto: 'Use the master-orchestrator agent to analyze and execute the task in .claude/orchestration/config.json',
    plan: 'Execute in plan-mode using the configuration in .claude/orchestration/config.json. All agents should only create plans, no implementation.',
    parallel: 'Deploy parallel agents as configured in .claude/orchestration/config.json',
    sequential: 'Execute sequentially as configured in .claude/orchestration/config.json',
    meta: 'Use meta-agent pattern for the complex task in .claude/orchestration/config.json'
  };
  
  console.log(chalk.yellow('\n💡 Tell Claude:'));
  console.log(chalk.cyan(`   "${instructions[answers.mode]}"`));
}

module.exports = { orchestrate };