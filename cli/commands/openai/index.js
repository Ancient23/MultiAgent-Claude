#!/usr/bin/env node

import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import initCommand from './init.js';
import bundleCommand from './bundle.js';
import syncCommand from './sync.js';
import convertAgentCommand from './convert-agent.js';

export default async function openaiCommand(args) {
  const subcommand = args[0];
  const options = args.slice(1);

  if (!subcommand) {
    const choice = await select({
      message: 'Select OpenAI integration command:',
      choices: [
        { value: 'init', name: `${chalk.green('init')} - Initialize OpenAI compatibility layer` },
        { value: 'bundle', name: `${chalk.blue('bundle')} - Create optimized ChatGPT Project bundles` },
        { value: 'sync', name: `${chalk.yellow('sync')} - Synchronize between Claude and OpenAI configurations` },
        { value: 'convert-agent', name: `${chalk.cyan('convert-agent')} - Convert individual agents to role instructions` },
      ],
    });
    
    return await executeSubcommand(choice, options);
  }

  return await executeSubcommand(subcommand, options);
}

async function executeSubcommand(subcommand, options) {
  switch (subcommand) {
    case 'init':
      return await initCommand(options);
    case 'bundle':
      return await bundleCommand(options);
    case 'sync':
      return await syncCommand(options);
    case 'convert-agent':
      return await convertAgentCommand(options);
    default:
      console.error(chalk.red(`Unknown OpenAI subcommand: ${subcommand}`));
      console.log('Available commands: init, bundle, sync, convert-agent');
      process.exit(1);
  }
}