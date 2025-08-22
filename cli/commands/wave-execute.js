const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;
const chalk = require('chalk');
const { getSessionId } = require('../lib/session-helper');

async function executeWavePattern() {
  console.log(chalk.blue('🌊 Starting Wave Execution Pattern...'));
  console.log(chalk.gray('The Wave Pattern executes tasks in 7 systematic phases:\n'));
  
  const waves = [
    { name: 'Wave 1: Discovery & Validation', color: 'cyan', icon: '🔍' },
    { name: 'Wave 2: Architecture & Planning', color: 'blue', icon: '📐' },
    { name: 'Wave 3: Core Implementation', color: 'green', icon: '⚙️' },
    { name: 'Wave 4: Testing & Validation', color: 'yellow', icon: '🧪' },
    { name: 'Wave 5: Documentation', color: 'magenta', icon: '📚' },
    { name: 'Wave 6: Review & Optimization', color: 'white', icon: '🔄' },
    { name: 'Wave 7: Deployment & Monitoring', color: 'red', icon: '🚀' }
  ];
  
  // Display wave overview
  waves.forEach((wave) => {
    console.log(chalk[wave.color](`${wave.icon} ${wave.name}`));
  });
  
  // Get available agents from Examples/agents (both orchestrators and specialists)
  const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
  let availableAgents = [];
  
  if (fs.existsSync(agentsDir)) {
    // Get orchestrators
    const orchestratorsDir = path.join(agentsDir, 'orchestrators');
    if (fs.existsSync(orchestratorsDir)) {
      const orchestrators = fs.readdirSync(orchestratorsDir)
        .filter(file => file.endsWith('.md') && !file.startsWith('TEMPLATE'))
        .map(file => `orchestrators/${file.replace('.md', '')}`);
      availableAgents.push(...orchestrators);
    }
    
    // Get specialists
    const specialistsDir = path.join(agentsDir, 'specialists');
    if (fs.existsSync(specialistsDir)) {
      const specialists = fs.readdirSync(specialistsDir)
        .filter(file => file.endsWith('.md') && !file.startsWith('TEMPLATE'))
        .map(file => `specialists/${file.replace('.md', '')}`);
      availableAgents.push(...specialists);
    }
    
    // Also check root directory for backward compatibility
    const rootAgents = fs.readdirSync(agentsDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('TEMPLATE'))
      .map(file => file.replace('.md', ''));
    availableAgents.push(...rootAgents);
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'task',
      message: 'What task would you like to execute with the Wave pattern?',
      validate: input => input.trim() !== ''
    },
    {
      type: 'checkbox',
      name: 'selectedWaves',
      message: 'Select waves to execute (or leave all checked for full execution):',
      choices: waves.map((wave, idx) => ({
        name: wave.name,
        value: idx + 1,
        checked: true
      }))
    },
    {
      type: 'confirm',
      name: 'customAgents',
      message: 'Would you like to assign specific agents to waves? (No = use smart defaults)',
      default: false
    }
  ]);
  
  // Agent assignment for each wave
  let waveAgents = getDefaultAgentsForWaves();
  
  if (answers.customAgents && availableAgents.length > 0) {
    console.log(chalk.cyan('\n📋 Assign agents to each wave (leave empty for defaults):'));
    
    for (const waveNum of answers.selectedWaves) {
      const wave = waves[waveNum - 1];
      const agentAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'agents',
          message: `Select agents for ${wave.name}:`,
          choices: availableAgents,
          default: waveAgents[waveNum] || []
        }
      ]);
      
      if (agentAnswers.agents.length > 0) {
        waveAgents[waveNum] = agentAnswers.agents;
      }
    }
  }
  
  // Create Wave 0: Session initialization
  const sessionId = getSessionId('wave');
  const contextDir = path.join(process.cwd(), '.claude', 'tasks');
  fs.mkdirSync(contextDir, { recursive: true });
  
  const contextSessionPath = path.join(contextDir, `context_session_${sessionId}.md`);
  
  // Create context session file with proper structure
  const contextContent = `# Session Context: ${answers.task}

**Session ID**: ${sessionId}
**Date**: ${new Date().toISOString()}
**Type**: wave-execution
**Status**: Active
**Current Wave**: 0

## Objectives
${answers.task}

## Wave Progress
${answers.selectedWaves.map(num => `- [ ] ${waves[num - 1].name}`).join('\n')}

## Wave Agents Assignment
${answers.selectedWaves.map(num => {
  const agents = waveAgents[num] || [];
  return `### ${waves[num - 1].name}
Agents: ${agents.length > 0 ? agents.join(', ') : 'To be determined'}`;
}).join('\n\n')}

## Current State
Wave 0: Session initialized, ready for execution

## Files Modified
_None yet_

## Discovered Issues
_To be populated during Wave 1_

## Next Steps
1. Execute Wave 1: Discovery & Validation
2. Analyze current implementation
3. Document findings in this session context

## Notes
- This session was created by the wave-execute CLI command
- Each wave should update this context file with its findings
- Agents should read this context before starting their work
`;
  
  fs.writeFileSync(contextSessionPath, contextContent);
  
  // Create wave execution plan
  const docDir = path.join(process.cwd(), '.claude', 'doc');
  fs.mkdirSync(docDir, { recursive: true });
  
  const planPath = path.join(docDir, `wave-execution-plan-${sessionId}.md`);
  const planContent = `# Wave Execution Plan

**Session**: ${sessionId}
**Task**: ${answers.task}
**Created**: ${new Date().toISOString()}

## Execution Instructions

This plan was generated by the wave-execute CLI command. To execute:

1. Tell Claude: "Execute the wave pattern from session ${sessionId}"
2. Claude will read the context from: \`.claude/tasks/context_session_${sessionId}.md\`
3. Claude will follow the wave progression defined below

## Wave Execution Details

${answers.selectedWaves.map(num => {
  const wave = waves[num - 1];
  const agents = waveAgents[num] || [];
  return `### ${wave.name}

**Assigned Agents**: ${agents.length > 0 ? agents.join(', ') : 'Claude will select appropriate agents'}

**Actions**:
1. Read context session file for current state
2. Deploy assigned agents for planning
3. Execute plans created by agents
4. Update context session with findings
5. Mark wave as complete in context

**Expected Outputs**:
- Updated context session file
- Agent plans in \`.claude/doc/\`
- Implementation/changes as per wave objectives
`;
}).join('\n')}

## Context Management Protocol

Each wave MUST:
1. Read the latest context from \`.claude/tasks/context_session_${sessionId}.md\`
2. Update the context with findings and progress
3. Mark its wave as complete when done
4. Document any blockers or issues discovered

## Completion Criteria

The wave execution is complete when:
- All selected waves are marked as complete in context
- Final retrospective is documented
- Session status is updated to "Completed"
`;
  
  fs.writeFileSync(planPath, planContent);
  
  console.log(chalk.green(`\n✅ Wave execution session initialized`));
  console.log(chalk.yellow(`📋 Session ID: ${sessionId}`));
  console.log(chalk.cyan('\n📁 Created files:'));
  console.log(chalk.gray(`  - Context: ${contextSessionPath}`));
  console.log(chalk.gray(`  - Plan: ${planPath}`));
  
  console.log(chalk.magenta('\n🎯 Next steps:'));
  console.log(chalk.white('1. Tell Claude: "Execute the wave pattern from session ' + sessionId + '"'));
  console.log(chalk.white('2. Claude will read the context and follow the wave progression'));
  console.log(chalk.white('3. Monitor progress in .claude/tasks/context_session_[session_id].md'));
  console.log(chalk.white('4. Each wave will update the context with its findings'));
}

function getDefaultAgentsForWaves() {
  // Smart defaults based on common patterns
  return {
    1: ['codebase-truth-analyzer', 'aws-backend-architect'],
    2: ['fullstack-feature-orchestrator', 'infrastructure-migration-architect'],
    3: ['backend-api-frontend-integrator', 'ai-agent-architect'],
    4: ['playwright-test-engineer', 'ui-design-auditor'],
    5: ['documentation-architect'],
    6: ['code-review-orchestrator'],
    7: ['aws-deployment-specialist', 'vercel-deployment-troubleshooter']
  };
}

module.exports = { executeWavePattern };