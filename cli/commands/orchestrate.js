const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;
const chalk = require('chalk');

async function orchestrate(options = {}) {
  let mode = options.mode;
  
  // If mode not provided via CLI, prompt for it
  if (!mode) {
    const modeAnswer = await inquirer.prompt([
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
      }
    ]);
    mode = modeAnswer.mode;
  }
  
  const answers = await inquirer.prompt([
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
    mode: mode,
    task: answers.task,
    options: answers.options,
    timestamp: new Date().toISOString()
  };

  // Create orchestration directory
  const orchestrationDir = path.join(process.cwd(), '.claude/orchestration');
  fs.mkdirSync(orchestrationDir, { recursive: true });
  
  const configPath = path.join(orchestrationDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Initialize context session
  const sessionId = `${new Date().toISOString().replace(/[:.]/g, '-')}_${answers.mode}`;
  const tasksDir = path.join(process.cwd(), '.claude/tasks');
  fs.mkdirSync(tasksDir, { recursive: true });
  
  const contextPath = path.join(tasksDir, `context_session_${sessionId}.md`);
  const contextContent = `# Session Context: ${answers.task}

**Session ID**: ${sessionId}
**Date**: ${new Date().toISOString()}
**Mode**: ${answers.mode}
**Status**: Active

## Objectives
${answers.task}

## Configuration
- Mode: ${answers.mode}
- Options: ${answers.options.join(', ')}
- Timestamp: ${config.timestamp}

## Current State
- Initialization complete
- Awaiting orchestration execution

## Available Resources
- Orchestration config: .claude/orchestration/config.json
- Session context: .claude/tasks/context_session_${sessionId}.md
`;

  fs.writeFileSync(contextPath, contextContent);
  
  console.log(chalk.green('\n✅ Orchestration configured!'));
  console.log(chalk.blue(`📝 Session context created: ${contextPath}`));
  
  // Mode-specific instructions
  const instructions = {
    auto: `Use the master-orchestrator agent to analyze and execute the task in .claude/orchestration/config.json. Session context is at ${contextPath}`,
    plan: `Execute in plan-mode using the configuration in .claude/orchestration/config.json. All agents should only create plans, no implementation. Session context is at ${contextPath}`,
    parallel: `Deploy parallel agents as configured in .claude/orchestration/config.json. Session context is at ${contextPath}`,
    sequential: `Execute sequentially as configured in .claude/orchestration/config.json. Session context is at ${contextPath}`,
    meta: `Use meta-agent pattern for the complex task in .claude/orchestration/config.json. Session context is at ${contextPath}`
  };
  
  console.log(chalk.yellow('\n💡 Tell Claude:'));
  console.log(chalk.cyan(`   "${instructions[answers.mode]}"`));
}

module.exports = { orchestrate };