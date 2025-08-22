#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { select, input } from '@inquirer/prompts';
import { AgentRoleConverter } from '../lib/agent-role-converter.js';

export default async function convertAgentCommand(args) {
  const agentName = args[0];
  
  console.log(chalk.cyan('\n🤖 Converting Agent to ChatGPT Role\n'));

  try {
    // Select agent if not provided
    const selectedAgent = agentName || await selectAgent();
    
    if (!selectedAgent) {
      console.log(chalk.yellow('No agent selected.'));
      return;
    }

    // Find agent file
    const agentPath = await findAgentFile(selectedAgent);
    
    if (!agentPath) {
      throw new Error(`Agent not found: ${selectedAgent}`);
    }

    console.log(chalk.blue(`Converting ${selectedAgent}...`));
    
    // Convert agent to role
    const roleContent = await convertAgent(agentPath, selectedAgent);
    
    // Save role file
    const outputPath = await saveRole(selectedAgent, roleContent);
    
    // Display summary
    displayConversionSummary(selectedAgent, agentPath, outputPath, roleContent);
    
    console.log(chalk.green('\n✨ Agent converted successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray('1. Review the role at:'), chalk.cyan(path.relative(process.cwd(), outputPath)));
    console.log(chalk.gray('2. Copy role content to ChatGPT custom instructions'));
    console.log(chalk.gray('3. Test the role in your ChatGPT conversation'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Conversion error:'), error.message);
    process.exit(1);
  }
}

async function selectAgent() {
  const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
  
  if (!await fs.pathExists(agentsDir)) {
    throw new Error('Agents directory not found. Are you in a MultiAgent-Claude project?');
  }

  // Get all available agents
  const agents = [];
  
  // Get specialists
  const specialistsDir = path.join(agentsDir, 'specialists');
  if (await fs.pathExists(specialistsDir)) {
    const files = await fs.readdir(specialistsDir);
    for (const file of files) {
      if (file.endsWith('.md') && !file.includes('TEMPLATE')) {
        agents.push({
          name: file.replace('.md', ''),
          type: 'specialist',
          path: path.join(specialistsDir, file)
        });
      }
    }
  }

  // Get orchestrators
  const orchestratorsDir = path.join(agentsDir, 'orchestrators');
  if (await fs.pathExists(orchestratorsDir)) {
    const files = await fs.readdir(orchestratorsDir);
    for (const file of files) {
      if (file.endsWith('.md') && !file.includes('TEMPLATE')) {
        agents.push({
          name: file.replace('.md', ''),
          type: 'orchestrator',
          path: path.join(orchestratorsDir, file)
        });
      }
    }
  }

  if (agents.length === 0) {
    throw new Error('No agents found in Examples/agents/');
  }

  // Check for already converted agents
  const rolesDir = path.join(process.cwd(), '.chatgpt', 'roles');
  const existingRoles = await fs.pathExists(rolesDir) 
    ? await fs.readdir(rolesDir) 
    : [];

  const choices = agents.map(agent => ({
    value: agent,
    name: `${agent.name} (${agent.type})${
      existingRoles.includes(`${agent.name}-role.md`) 
        ? chalk.green(' ✓ converted') 
        : ''
    }`
  }));

  const selected = await select({
    message: 'Select agent to convert:',
    choices: choices
  });

  return selected.name;
}

async function findAgentFile(agentName) {
  const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
  
  // Check specialists
  let agentPath = path.join(agentsDir, 'specialists', `${agentName}.md`);
  if (await fs.pathExists(agentPath)) {
    return agentPath;
  }

  // Check orchestrators
  agentPath = path.join(agentsDir, 'orchestrators', `${agentName}.md`);
  if (await fs.pathExists(agentPath)) {
    return agentPath;
  }

  // Check project-specific agents
  agentPath = path.join(process.cwd(), '.claude', 'agents', `${agentName}.md`);
  if (await fs.pathExists(agentPath)) {
    return agentPath;
  }

  return null;
}

async function convertAgent(agentPath, agentName) {
  const converter = new AgentRoleConverter();
  const agentContent = await fs.readFile(agentPath, 'utf-8');
  
  // Convert to role
  const roleContent = converter.convertToRole(agentContent, agentName);
  
  // Validate length
  if (roleContent.length > 1500) {
    console.log(chalk.yellow(`⚠️  Role exceeds 1500 character limit (${roleContent.length} chars)`));
    console.log(chalk.gray('   The role has been compressed to fit ChatGPT limits'));
  }
  
  return roleContent;
}

async function saveRole(agentName, roleContent) {
  const rolesDir = path.join(process.cwd(), '.chatgpt', 'roles');
  await fs.ensureDir(rolesDir);
  
  const outputPath = path.join(rolesDir, `${agentName}-role.md`);
  
  // Check if role already exists
  if (await fs.pathExists(outputPath)) {
    const overwrite = await select({
      message: 'Role already exists. What would you like to do?',
      choices: [
        { value: 'overwrite', name: 'Overwrite existing role' },
        { value: 'backup', name: 'Backup and overwrite' },
        { value: 'rename', name: 'Save with different name' },
        { value: 'cancel', name: 'Cancel' }
      ]
    });

    if (overwrite === 'cancel') {
      console.log(chalk.yellow('Conversion cancelled.'));
      process.exit(0);
    }

    if (overwrite === 'backup') {
      const backupPath = outputPath.replace('.md', `-backup-${Date.now()}.md`);
      await fs.copy(outputPath, backupPath);
      console.log(chalk.gray(`Backup created: ${path.basename(backupPath)}`));
    }

    if (overwrite === 'rename') {
      const newName = await input({
        message: 'Enter new role name:',
        default: `${agentName}-v2`
      });
      
      return path.join(rolesDir, `${newName}-role.md`);
    }
  }

  await fs.writeFile(outputPath, roleContent);
  return outputPath;
}

function displayConversionSummary(agentName, agentPath, outputPath, roleContent) {
  console.log(chalk.blue('\n📊 Conversion Summary:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  console.log(chalk.white('Agent:'), agentName);
  console.log(chalk.white('Source:'), path.relative(process.cwd(), agentPath));
  console.log(chalk.white('Output:'), path.relative(process.cwd(), outputPath));
  console.log(chalk.white('Size:'), `${roleContent.length} characters`);
  
  if (roleContent.length <= 1500) {
    console.log(chalk.green('✓ Within ChatGPT limit (1500 chars)'));
  } else {
    console.log(chalk.yellow('⚠️  Compressed to fit ChatGPT limit'));
  }

  // Show preview
  console.log(chalk.blue('\n📝 Role Preview:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  const preview = roleContent.substring(0, 300);
  console.log(chalk.gray(preview + '...'));
  
  // Show key features extracted
  const features = extractKeyFeatures(roleContent);
  if (features.length > 0) {
    console.log(chalk.blue('\n🎯 Key Features:'));
    features.forEach(f => console.log(chalk.gray(`  • ${f}`)));
  }
}

function extractKeyFeatures(roleContent) {
  const features = [];
  
  // Extract triggers
  const triggersMatch = roleContent.match(/When the user mentions: ([^\n]+)/);
  if (triggersMatch) {
    const triggers = triggersMatch[1].split(',').slice(0, 3).join(', ');
    features.push(`Triggers: ${triggers}`);
  }

  // Extract approach steps
  const approachMatch = roleContent.match(/## Approach\n([\s\S]*?)(?=\n##|$)/);
  if (approachMatch) {
    const steps = approachMatch[1].split('\n').filter(l => l.match(/^\d+\./)).length;
    features.push(`${steps} approach steps defined`);
  }

  // Extract focus areas
  const focusMatch = roleContent.match(/## Focus Areas\n([\s\S]*?)(?=\n##|$)/);
  if (focusMatch) {
    const areas = focusMatch[1].split('\n').filter(l => l.startsWith('-')).length;
    features.push(`${areas} focus areas`);
  }

  return features;
}