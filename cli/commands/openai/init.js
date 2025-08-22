#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigConverter } from '../lib/config-converter.js';
import { AgentRoleConverter } from '../lib/agent-role-converter.js';

export default async function initCommand(options) {
  console.log(chalk.cyan('\n🚀 Initializing OpenAI/ChatGPT Compatibility Layer\n'));

  try {
    // Check for existing setup
    const openaiDir = path.join(process.cwd(), '.openai');
    const chatgptDir = path.join(process.cwd(), '.chatgpt');
    const agentsFile = path.join(process.cwd(), 'AGENTS.md');
    
    if (await fs.pathExists(openaiDir) || await fs.pathExists(chatgptDir) || await fs.pathExists(agentsFile)) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'OpenAI configuration already exists. Overwrite?',
          default: false
        }
      ]);
      const overwrite = answers.overwrite;
      
      if (!overwrite) {
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }
    }

    // Step 1: Create AGENTS.md from CLAUDE.md
    console.log(chalk.blue('📄 Converting CLAUDE.md to AGENTS.md...'));
    const claudeConfig = await readCLAUDEmd();
    const agentsConfig = await convertToAgents(claudeConfig);
    await fs.writeFile(agentsFile, agentsConfig);
    console.log(chalk.green('✓ AGENTS.md created'));

    // Step 2: Create .chatgpt directory structure
    console.log(chalk.blue('\n📁 Creating .chatgpt directory structure...'));
    await createChatGPTStructure();
    console.log(chalk.green('✓ Directory structure created'));

    // Step 3: Select and convert priority agents
    console.log(chalk.blue('\n🤖 Converting agents to ChatGPT roles...'));
    const agents = await selectPriorityAgents();
    await convertAgentsToRoles(agents);
    console.log(chalk.green(`✓ ${agents.length} agents converted to roles`));

    // Step 4: Create workflow templates
    console.log(chalk.blue('\n📋 Creating workflow templates...'));
    await createWorkflowTemplates();
    console.log(chalk.green('✓ Workflow templates created'));

    // Step 5: Initialize sync metadata
    console.log(chalk.blue('\n🔄 Initializing sync metadata...'));
    await initializeSyncMetadata();
    console.log(chalk.green('✓ Sync system initialized'));

    // Success message
    console.log(chalk.green('\n✨ OpenAI compatibility layer successfully initialized!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray('1. Run'), chalk.cyan('mac openai bundle'), chalk.gray('to create your first ChatGPT bundle'));
    console.log(chalk.gray('2. Upload bundle files to ChatGPT Projects'));
    console.log(chalk.gray('3. Use'), chalk.cyan('mac openai sync'), chalk.gray('to keep configurations synchronized'));
    console.log(chalk.gray('\nFor more information, see .chatgpt/README.md'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error during initialization:'), error.message);
    process.exit(1);
  }
}

async function readCLAUDEmd() {
  const claudePath = path.join(process.cwd(), 'CLAUDE.md');
  if (!await fs.pathExists(claudePath)) {
    throw new Error('CLAUDE.md not found. Please run "mac init" first.');
  }
  return await fs.readFile(claudePath, 'utf-8');
}

async function convertToAgents(claudeConfig) {
  const converter = new ConfigConverter();
  return converter.claudeToAgents(claudeConfig, {
    maxSize: 32768,
    preserveEssential: true,
    compressionTarget: 0.6
  });
}

async function createChatGPTStructure() {
  const baseDir = path.join(process.cwd(), '.chatgpt');
  
  const dirs = [
    'bundles',
    'roles',
    'snapshots',
    'workflows'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(baseDir, dir));
  }

  // Create project instructions
  const instructions = await createProjectInstructions();
  await fs.writeFile(path.join(baseDir, 'project-instructions.md'), instructions);

  // Create file manifest
  const manifest = createFileManifest();
  await fs.writeFile(path.join(baseDir, 'file-manifest.json'), JSON.stringify(manifest, null, 2));

  // Create README
  const readme = createChatGPTReadme();
  await fs.writeFile(path.join(baseDir, 'README.md'), readme);
}

async function selectPriorityAgents() {
  const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
  
  // Get available agents
  const specialists = await fs.readdir(path.join(agentsDir, 'specialists')).catch(() => []);
  const orchestrators = await fs.readdir(path.join(agentsDir, 'orchestrators')).catch(() => []);
  
  const allAgents = [
    ...specialists.filter(f => f.endsWith('.md')).map(f => ({ name: f.replace('.md', ''), type: 'specialist' })),
    ...orchestrators.filter(f => f.endsWith('.md')).map(f => ({ name: f.replace('.md', ''), type: 'orchestrator' }))
  ];

  // Default priority agents
  const defaultAgents = [
    'frontend-ui-expert',
    'aws-backend-architect',
    'playwright-test-engineer',
    'documentation-architect',
    'fullstack-feature-orchestrator'
  ];

  const availableDefaults = allAgents.filter(a => defaultAgents.includes(a.name));
  
  if (availableDefaults.length === 0) {
    return allAgents.slice(0, 5); // Take first 5 if no defaults found
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedAgents',
      message: 'Select agents to convert to ChatGPT roles (max 5 recommended):',
      choices: allAgents.map(a => ({
        value: a,
        name: `${a.name} (${a.type})`,
        checked: defaultAgents.includes(a.name)
      }))
    }
  ]);
  const selectedAgents = answers.selectedAgents;

  return selectedAgents.slice(0, 5); // Limit to 5 for initial setup
}

async function convertAgentsToRoles(agents) {
  const converter = new AgentRoleConverter();
  const rolesDir = path.join(process.cwd(), '.chatgpt', 'roles');

  for (const agent of agents) {
    const agentPath = path.join(process.cwd(), 'Examples', 'agents', 
      agent.type === 'specialist' ? 'specialists' : 'orchestrators', 
      `${agent.name}.md`);
    
    if (await fs.pathExists(agentPath)) {
      const agentContent = await fs.readFile(agentPath, 'utf-8');
      const role = converter.convertToRole(agentContent, agent.name);
      await fs.writeFile(path.join(rolesDir, `${agent.name}-role.md`), role);
    }
  }
}

async function createWorkflowTemplates() {
  const workflowsDir = path.join(process.cwd(), '.chatgpt', 'workflows');
  
  const workflows = {
    'feature-development.md': createFeatureWorkflow(),
    'bug-fixing.md': createBugFixWorkflow(),
    'code-review.md': createCodeReviewWorkflow(),
    'testing-workflow.md': createTestingWorkflow()
  };

  for (const [filename, content] of Object.entries(workflows)) {
    await fs.writeFile(path.join(workflowsDir, filename), content);
  }
}

async function initializeSyncMetadata() {
  const syncDir = path.join(process.cwd(), '.chatgpt', 'sync');
  await fs.ensureDir(syncDir);

  const metadata = {
    version: '1.0.0',
    lastSync: new Date().toISOString(),
    claudeChecksum: await calculateChecksum('CLAUDE.md'),
    agentsChecksum: await calculateChecksum('AGENTS.md'),
    conflicts: [],
    history: []
  };

  await fs.writeFile(path.join(syncDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
}

async function calculateChecksum(filepath) {
  const crypto = await import('crypto');
  const fullPath = path.join(process.cwd(), filepath);
  
  if (!await fs.pathExists(fullPath)) {
    return null;
  }
  
  const content = await fs.readFile(fullPath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function createProjectInstructions() {
  return `# MultiAgent-Claude Project Instructions

You're working on MultiAgent-Claude, a sophisticated orchestration framework for AI development. Follow these guidelines:

## Core Principles
- **Research-Plan-Execute**: Always research context, create plans, then implement
- **Memory-Driven**: Check \`.ai/memory/\` for patterns and decisions before implementing
- **Cross-Platform**: Ensure compatibility between Claude and ChatGPT

## Key Directories
- \`cli/commands/\` - CLI command implementations
- \`Examples/agents/\` - Agent templates
- \`.ai/memory/\` - Knowledge base and patterns
- \`.chatgpt/\` - OpenAI-specific configs

## Development Workflow
1. Check session context in \`.claude/tasks/context_session_*.md\`
2. Review relevant patterns in memory
3. Plan implementation approach
4. Execute with validation
5. Document successful patterns

## Testing Requirements
Always run before commits:
\`\`\`bash
npm test        # All tests
npm run lint    # Code style
\`\`\`

## Sync Protocol
Run \`mac openai sync\` to synchronize between platforms. Check AGENTS.md for detailed guidelines.`;
}

function createFileManifest() {
  return {
    version: '1.0.0',
    description: 'Essential files for ChatGPT Projects upload',
    bundles: {
      core: {
        description: 'Core configuration and documentation',
        files: [
          'AGENTS.md',
          '.chatgpt/project-instructions.md',
          'package.json',
          'README.md'
        ],
        maxSize: '5MB'
      },
      cli: {
        description: 'CLI development bundle',
        files: [
          'AGENTS.md',
          '.chatgpt/project-instructions.md',
          'cli/index.js',
          'cli/commands/*.js',
          'package.json'
        ],
        maxSize: '10MB'
      }
    },
    uploadLimits: {
      chatgptPlus: { maxFiles: 20, maxTotalSize: '500MB' },
      chatgptPro: { maxFiles: 40, maxTotalSize: '500MB' }
    }
  };
}

function createChatGPTReadme() {
  return `# ChatGPT Integration Guide

This directory contains configurations optimized for ChatGPT Projects and Codex.

## Quick Start

1. Upload the core bundle to ChatGPT Projects:
   - AGENTS.md
   - .chatgpt/project-instructions.md
   - Selected role from .chatgpt/roles/

2. Activate a role by referencing it in your conversation

3. Follow workflows in .chatgpt/workflows/ for structured tasks

## Synchronization

Keep configurations in sync:
\`\`\`bash
mac openai sync
\`\`\`

## Bundle Creation

Create task-specific bundles:
\`\`\`bash
mac openai bundle [frontend|backend|testing]
\`\`\`

## Role Conversion

Convert additional agents:
\`\`\`bash
mac openai convert-agent <agent-name>
\`\`\``;
}

function createFeatureWorkflow() {
  return `# Feature Development Workflow

## Phase 1: Research & Planning
1. Check session context in \`.claude/tasks/context_session_*.md\`
2. Review memory for similar patterns
3. Research requirements and constraints
4. Create implementation plan

## Phase 2: Implementation
1. Follow established patterns from memory
2. Implement with test coverage
3. Validate functionality
4. Update documentation

## Phase 3: Validation
1. Run full test suite
2. Check for regressions
3. Review code quality
4. Update memory with successful patterns`;
}

function createBugFixWorkflow() {
  return `# Bug Fixing Workflow

## Phase 1: Investigation
1. Reproduce the issue
2. Search memory for similar issues
3. Identify root cause
4. Plan fix approach

## Phase 2: Resolution
1. Implement fix with tests
2. Verify issue is resolved
3. Check for side effects
4. Document solution pattern`;
}

function createCodeReviewWorkflow() {
  return `# Code Review Workflow

## Review Checklist
- [ ] Code follows project conventions
- [ ] Tests provide adequate coverage
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Cross-platform compatibility maintained`;
}

function createTestingWorkflow() {
  return `# Testing Workflow

## Test Development
1. Write tests before or with implementation
2. Cover edge cases and error scenarios
3. Include integration tests
4. Maintain >80% coverage

## Test Execution
\`\`\`bash
npm test              # All tests
npm run test:cli     # CLI tests
npm run test:ui      # Interactive mode
\`\`\``;
}