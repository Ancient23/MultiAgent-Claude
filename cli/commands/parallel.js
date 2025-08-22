const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;
const chalk = require('chalk');
const { getSessionId } = require('../lib/session-helper');

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
  
  // Generate session ID for parallel execution
  const sessionId = getSessionId('parallel');
  
  // Create context session file
  const tasksDir = path.join(process.cwd(), '.claude/tasks');
  fs.mkdirSync(tasksDir, { recursive: true });
  
  const contextPath = path.join(tasksDir, `context_session_${sessionId}.md`);
  const contextContent = `# Session Context: ${answers.task}

**Session ID**: ${sessionId}
**Date**: ${new Date().toISOString()}
**Mode**: parallel
**Status**: Active

## Objectives
${answers.task}

## Parallel Execution Configuration
- Agents: ${answers.selectedAgents.join(', ')}
- Coordination: orchestrator-worker
- Output Path: .claude/doc/

## Current State
- Initialization complete
- ${answers.selectedAgents.length} agents ready for parallel execution

## Next Steps
1. Each agent will read this context
2. Agents will execute in parallel
3. Results will be consolidated in .claude/doc/
`;

  fs.writeFileSync(contextPath, contextContent);
  
  const parallelConfig = {
    sessionId: sessionId,
    task: answers.task,
    agents: answers.selectedAgents,
    mode: 'parallel',
    coordination: 'orchestrator-worker',
    outputPath: '.claude/doc/',
    contextPath: contextPath,
    timestamp: new Date().toISOString()
  };
  
  const configPath = path.join(process.cwd(), '.claude/parallel-execution.json');
  fs.writeFileSync(configPath, JSON.stringify(parallelConfig, null, 2));
  
  console.log(chalk.green('\n✅ Parallel execution plan created!'));
  console.log(chalk.blue(`📝 Session ID: ${sessionId}`));
  console.log(chalk.blue(`📄 Context: ${contextPath}`));
  console.log(chalk.blue(`\n📊 ${answers.selectedAgents.length} agents will run in parallel`));
  console.log(chalk.yellow('\n💡 Tell Claude:'));
  console.log(chalk.cyan('   "Execute the parallel agents defined in .claude/parallel-execution.json"'));
}

module.exports = { deployParallel };