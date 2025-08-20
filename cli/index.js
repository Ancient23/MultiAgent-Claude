#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const packageJson = require('../package.json');

program
  .name('multiagent-claude')
  .description('CLI tool for managing Claude Code multi-agent environment')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize multi-agent environment')
  .option('--memory-only', 'Initialize with memory focus (claude-code-init-memory-prompt.md)')
  .option('--with-docs', 'Initialize with documentation import (claude-code-init-with-docs-import.md)')
  .option('--prompt-only', 'Only output the prompt without executing')
  .action((options) => {
    const initCommand = require('./commands/init');
    initCommand.execute(options);
  });

program
  .command('add-memory')
  .description('Add memory system to existing setup')
  .option('--prompt-only', 'Only output the prompt without executing')
  .action((options) => {
    const addMemoryCommand = require('./commands/add-memory');
    addMemoryCommand.execute(options);
  });

program
  .command('agent')
  .description('Manage agents')
  .argument('<action>', 'Action to perform: create, list, add, edit, deploy, test, diff, sync')
  .argument('[name]', 'Agent name (required for some actions)')
  .action((action, name, options) => {
    const agentCommand = require('./commands/agent');
    agentCommand.execute(action, name, options);
  });

program
  .command('command')
  .description('Manage commands')
  .argument('<action>', 'Action to perform: create, list, add')
  .argument('[name]', 'Command name (required for some actions)')
  .action((action, name, options) => {
    const commandCommand = require('./commands/command');
    commandCommand.execute(action, name, options);
  });

program
  .command('memory')
  .description('Manage memory system')
  .argument('<action>', 'Action to perform: status, inspect, add-pattern, add-decision, search, cleanup, export, import, validate, report, learn, sync, update-from-commit')
  .argument('[args...]', 'Additional arguments for the action')
  .option('--type <type>', 'Memory type (patterns, decisions, project)')
  .option('--query <query>', 'Search query')
  .option('--file <file>', 'File path for import/export')
  .option('--from-session', 'Learn from current session')
  .option('--from-git-history', 'Learn from git history')
  .option('--from-diff <range>', 'Learn from git diff range')
  .option('--from-pr <number>', 'Create decision from PR')
  .option('--commit <sha>', 'Commit SHA for updates')
  .option('--output <path>', 'Output path for reports')
  .action((action, args, options) => {
    const memoryCommand = require('./commands/memory');
    memoryCommand.execute(action, args, options);
  });

program
  .command('setup')
  .description('Interactive setup wizard')
  .action(() => {
    const setupCommand = require('./commands/setup');
    setupCommand.execute();
  });

program
  .command('playwright')
  .description('Manage Playwright testing')
  .argument('<action>', 'Action to perform: init, generate-tests, add-visual-tests, setup-ci')
  .action((action, options) => {
    const playwrightCommand = require('./commands/playwright');
    playwrightCommand.execute(action, options);
  });

program
  .command('add')
  .description('Add features to existing project')
  .argument('<feature>', 'Feature to add: ci-cd, testing, both')
  .action((feature) => {
    const addCommand = require('./commands/add');
    addCommand.execute(feature);
  });

program.parse();