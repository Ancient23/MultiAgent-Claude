const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function createAgent() {
  console.log(chalk.blue('\n🤖 Interactive Agent Creator\n'));

  const agentConfig = {};
  
  agentConfig.name = await question(chalk.cyan('Agent name (e.g., frontend-specialist): '));
  agentConfig.description = await question(chalk.cyan('Brief description: '));
  agentConfig.triggers = await question(chalk.cyan('Trigger keywords (comma-separated): '));
  agentConfig.expertise = await question(chalk.cyan('Domain expertise areas: '));
  
  console.log(chalk.yellow('\nSelect MCP tools this agent needs:'));
  console.log('1. Context7 (documentation)')
  console.log('2. Sequential (complex reasoning)')
  console.log('3. Magic (UI components)')
  console.log('4. Playwright (browser automation)')
  console.log('5. AWS API')
  console.log('6. WebSearch')
  const toolChoices = await question(chalk.cyan('Enter numbers (comma-separated): '));
  
  const toolMap = {
    '1': 'Context7',
    '2': 'Sequential',
    '3': 'Magic',
    '4': 'Playwright',
    '5': 'AWS API',
    '6': 'WebSearch'
  };
  
  agentConfig.tools = toolChoices.split(',').map(c => toolMap[c.trim()]).filter(Boolean);
  
  const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'pink'];
  console.log(chalk.yellow('\nSelect agent color:'));
  colors.forEach((c, i) => console.log(`${i + 1}. ${c}`));
  const colorChoice = await question(chalk.cyan('Enter number: '));
  agentConfig.color = colors[parseInt(colorChoice) - 1] || 'blue';

  agentConfig.example = await question(chalk.cyan('\nProvide an example use case: '));

  rl.close();

  const template = fs.readFileSync(
    path.join(__dirname, '..', '..', 'Examples', 'agents', 'TEMPLATE-agent.md'),
    'utf8'
  );

  let agentContent = template
    .replace(/template-agent-name/g, agentConfig.name)
    .replace(/\[agent-name\]/g, agentConfig.name)
    .replace(/\[specific triggers\]/g, agentConfig.triggers)
    .replace(/\[keywords, technologies, or concepts\]/g, agentConfig.triggers)
    .replace(/\[core competency\]/g, agentConfig.expertise)
    .replace(/\[specific domains\]/g, agentConfig.expertise)
    .replace(/\[domain\]/g, agentConfig.expertise.split(',')[0].trim())
    .replace(/\[blue\|green\|red\|yellow\|purple\|orange\|pink\]/g, agentConfig.color)
    .replace(/\[Example user request\]/g, agentConfig.example)
    .replace(/\[agent-type\]/g, agentConfig.name);

  const memoryIntegration = `
## Memory System Integration
1. Check .ai/memory/project.md for project conventions
2. Read .claude/tasks/context_session_[session_id].md for current session context
3. Review .ai/memory/patterns/ for existing successful solutions
4. Consult .ai/memory/decisions/ for architectural decisions`;

  agentContent = agentContent.replace('## Core Workflow', memoryIntegration + '\n\n## Core Workflow');

  const yamlConfig = `---
name: ${agentConfig.name}
description: Research-only agent that creates plans at .claude/doc/. ${agentConfig.description}
model: sonnet
color: ${agentConfig.color}
---

${agentContent}`;

  const localPath = path.join('.claude', 'agents', `${agentConfig.name}.yaml`);
  
  if (!fs.existsSync(path.dirname(localPath))) {
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
  }
  
  fs.writeFileSync(localPath, yamlConfig);

  // Create context session for agent creation
  const sessionId = `${new Date().toISOString().replace(/[:.]/g, '-')}_create_${agentConfig.name}`;
  const tasksDir = path.join(process.cwd(), '.claude/tasks');
  fs.mkdirSync(tasksDir, { recursive: true });
  
  const contextPath = path.join(tasksDir, `context_session_${sessionId}.md`);
  const contextContent = `# Session Context: Agent Creation

**Session ID**: ${sessionId}
**Date**: ${new Date().toISOString()}
**Type**: Agent Creation
**Status**: Active

## Objectives
- Create new agent: ${agentConfig.name}
- Configure for: ${agentConfig.expertise}
- Triggers: ${agentConfig.triggers}

## Agent Configuration
- Name: ${agentConfig.name}
- Description: ${agentConfig.description}
- Tools: ${agentConfig.tools.join(', ')}
- Color: ${agentConfig.color}
- Configuration saved: ${localPath}

## Current State
- Agent configuration created
- Ready for deployment
`;

  fs.writeFileSync(contextPath, contextContent);

  console.log(chalk.green(`\n✅ Agent configuration created at ${localPath}`));
  console.log(chalk.blue(`📝 Session context created at ${contextPath}`));
  console.log(chalk.yellow('\nTo deploy this agent in Claude:'));
  console.log(chalk.gray('1. Run: ') + chalk.cyan('/agents create'));
  console.log(chalk.gray('2. Paste the configuration from: ') + chalk.cyan(localPath));
  console.log(chalk.gray('\nOr run: ') + chalk.cyan(`multiagent-claude agent deploy ${agentConfig.name}`));
}

function listAgents() {
  const agentsDir = path.join(__dirname, '..', '..', 'Examples', 'agents');
  const localAgentsDir = path.join('.claude', 'agents');
  
  console.log(chalk.blue('\n📋 Available Agent Templates:\n'));
  
  if (fs.existsSync(agentsDir)) {
    // List orchestrators
    const orchestratorsDir = path.join(agentsDir, 'orchestrators');
    if (fs.existsSync(orchestratorsDir)) {
      console.log(chalk.yellow('🎭 Orchestrators (Opus):'));
      const orchestrators = fs.readdirSync(orchestratorsDir)
        .filter(f => f.endsWith('.md') && !f.startsWith('TEMPLATE'));
      orchestrators.forEach(template => {
        const name = template.replace('.md', '');
        console.log(chalk.green(`  • ${name}`));
      });
    }
    
    // List specialists
    const specialistsDir = path.join(agentsDir, 'specialists');
    if (fs.existsSync(specialistsDir)) {
      console.log(chalk.cyan('\n🔬 Specialists (Sonnet):'));
      const specialists = fs.readdirSync(specialistsDir)
        .filter(f => f.endsWith('.md') && !f.startsWith('TEMPLATE'));
      specialists.forEach(template => {
        const name = template.replace('.md', '');
        console.log(chalk.green(`  • ${name}`));
      });
    }
  }
  
  if (fs.existsSync(localAgentsDir)) {
    console.log(chalk.blue('\n📦 Local Agents:\n'));
    const localAgents = fs.readdirSync(localAgentsDir).filter(f => f.endsWith('.yaml'));
    
    localAgents.forEach(agent => {
      const name = agent.replace('.yaml', '');
      console.log(chalk.cyan(`  • ${name}`));
    });
  }
}

async function deployAgent(name) {
  const localPath = path.join('.claude', 'agents', `${name}.yaml`);
  
  if (!fs.existsSync(localPath)) {
    console.error(chalk.red(`Agent ${name} not found locally`));
    return;
  }
  
  const content = fs.readFileSync(localPath, 'utf8');
  
  // Create context session for agent deployment
  const sessionId = `${new Date().toISOString().replace(/[:.]/g, '-')}_agent_${name}`;
  const tasksDir = path.join(process.cwd(), '.claude/tasks');
  fs.mkdirSync(tasksDir, { recursive: true });
  
  const contextPath = path.join(tasksDir, `context_session_${sessionId}.md`);
  const contextContent = `# Session Context: Agent Deployment

**Session ID**: ${sessionId}
**Date**: ${new Date().toISOString()}
**Type**: Agent Deployment
**Status**: Active

## Objectives
- Deploy agent: ${name}
- Configure in Claude environment
- Verify agent functionality

## Agent Details
- Name: ${name}
- Configuration: ${localPath}
- Deployment method: Manual paste

## Current State
- Agent configuration loaded
- Ready for deployment in Claude
`;

  fs.writeFileSync(contextPath, contextContent);
  console.log(chalk.blue(`📝 Session context created: ${contextPath}`));
  
  try {
    execSync(`echo '${content}' | pbcopy`, { encoding: 'utf8' });
    console.log(chalk.green(`✅ Agent configuration copied to clipboard`));
    console.log(chalk.yellow('\nNow in Claude:'));
    console.log(chalk.gray('1. Run: ') + chalk.cyan('/agents create'));
    console.log(chalk.gray('2. Paste the configuration (Cmd+V)'));
    console.log(chalk.gray('3. The agent will check: ') + chalk.cyan(contextPath));
  } catch (error) {
    console.log(chalk.yellow('Could not copy to clipboard. Configuration:'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(content);
    console.log(chalk.gray('─'.repeat(80)));
  }
}

function execute(action, name, options) {
  switch(action) {
    case 'create':
      createAgent();
      break;
    case 'list':
      listAgents();
      break;
    case 'deploy':
      if (!name) {
        console.error(chalk.red('Agent name required for deploy'));
        process.exit(1);
      }
      deployAgent(name);
      break;
    case 'add':
      console.log(chalk.yellow('Adding agent from template...'));
      break;
    case 'test':
      console.log(chalk.yellow('Testing agent configuration...'));
      break;
    case 'sync':
      console.log(chalk.yellow('Syncing agents with Claude...'));
      break;
    default:
      console.error(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.gray('Available actions: create, list, add, deploy, test, sync'));
  }
}

module.exports = { execute };