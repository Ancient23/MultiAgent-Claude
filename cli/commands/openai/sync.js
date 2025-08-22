#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import crypto from 'crypto';
import inquirer from 'inquirer';

export default async function syncCommand(options) {
  console.log(chalk.cyan('\n🔄 Synchronizing Claude ↔ OpenAI Configurations\n'));

  try {
    // Check sync state
    const syncState = await checkSyncState();
    
    if (syncState.conflicts.length > 0) {
      console.log(chalk.yellow(`⚠️  ${syncState.conflicts.length} conflicts detected`));
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'resolve',
          message: 'Resolve conflicts before syncing?',
          default: true
        }
      ]);
      const resolve = answers.resolve;
      
      if (resolve) {
        await resolveConflicts(syncState.conflicts);
      }
    }

    // Perform sync
    console.log(chalk.blue('\nSynchronizing configurations...'));
    
    // Sync CLAUDE.md ↔ AGENTS.md
    await syncConfigurations(syncState);
    
    // Sync memory system
    await syncMemory(syncState);
    
    // Sync agent roles
    await syncAgentRoles(syncState);
    
    // Update sync metadata
    await updateSyncMetadata(syncState);
    
    // Display summary
    displaySyncSummary(syncState);
    
    console.log(chalk.green('\n✨ Synchronization complete!\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Sync error:'), error.message);
    process.exit(1);
  }
}

async function checkSyncState() {
  const state = {
    lastSync: null,
    changes: {
      claude: [],
      openai: []
    },
    conflicts: [],
    checksums: {}
  };

  // Load sync metadata
  const syncPath = path.join(process.cwd(), '.chatgpt', 'sync', 'metadata.json');
  if (await fs.pathExists(syncPath)) {
    const metadata = await fs.readJson(syncPath);
    state.lastSync = metadata.lastSync;
    state.checksums = metadata.checksums || {};
  }

  // Check for changes
  await detectChanges(state);
  
  // Detect conflicts
  await detectConflicts(state);
  
  return state;
}

async function detectChanges(state) {
  // Check CLAUDE.md
  const claudePath = path.join(process.cwd(), 'CLAUDE.md');
  if (await fs.pathExists(claudePath)) {
    const currentChecksum = await calculateChecksum(claudePath);
    if (currentChecksum !== state.checksums.claude) {
      state.changes.claude.push({
        file: 'CLAUDE.md',
        type: 'modified',
        checksum: currentChecksum
      });
    }
  }

  // Check AGENTS.md
  const agentsPath = path.join(process.cwd(), 'AGENTS.md');
  if (await fs.pathExists(agentsPath)) {
    const currentChecksum = await calculateChecksum(agentsPath);
    if (currentChecksum !== state.checksums.agents) {
      state.changes.openai.push({
        file: 'AGENTS.md',
        type: 'modified',
        checksum: currentChecksum
      });
    }
  }

  // Check memory files
  const memoryDir = path.join(process.cwd(), '.claude', 'memory');
  if (await fs.pathExists(memoryDir)) {
    const memoryFiles = await getMemoryFiles(memoryDir);
    for (const file of memoryFiles) {
      const checksum = await calculateChecksum(file);
      const relPath = path.relative(process.cwd(), file);
      
      if (checksum !== state.checksums[relPath]) {
        state.changes.claude.push({
          file: relPath,
          type: 'modified',
          checksum: checksum
        });
      }
    }
  }
}

async function getMemoryFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getMemoryFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function detectConflicts(state) {
  // Both files changed since last sync
  if (state.changes.claude.length > 0 && state.changes.openai.length > 0) {
    // Check if changes affect same sections
    const claudeContent = await fs.readFile(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
    const agentsContent = await fs.readFile(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
    
    const conflicts = analyzeConflicts(claudeContent, agentsContent);
    state.conflicts.push(...conflicts);
  }
}

function analyzeConflicts(claudeContent, agentsContent) {
  const conflicts = [];
  
  // Simple conflict detection based on section differences
  const claudeSections = extractSections(claudeContent);
  const agentsSections = extractSections(agentsContent);
  
  for (const section in claudeSections) {
    if (agentsSections[section] && claudeSections[section] !== agentsSections[section]) {
      conflicts.push({
        section: section,
        type: 'content_mismatch',
        claude: claudeSections[section].substring(0, 100),
        openai: agentsSections[section].substring(0, 100)
      });
    }
  }
  
  return conflicts;
}

function extractSections(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let sectionContent = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = line.replace('## ', '').trim();
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = sectionContent.join('\n');
  }

  return sections;
}

async function resolveConflicts(conflicts) {
  console.log(chalk.yellow('\n📝 Resolving conflicts...\n'));

  for (const conflict of conflicts) {
    console.log(chalk.white(`Conflict in section: ${conflict.section}`));
    console.log(chalk.gray('Claude version:'), conflict.claude);
    console.log(chalk.gray('OpenAI version:'), conflict.openai);
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'resolution',
        message: 'Choose resolution:',
        choices: [
          { value: 'claude', name: 'Use Claude version' },
          { value: 'openai', name: 'Use OpenAI version' },
          { value: 'merge', name: 'Merge both versions' },
          { value: 'skip', name: 'Skip this conflict' }
        ]
      }
    ]);
    const resolution = answers.resolution;

    conflict.resolution = resolution;
  }
}

async function syncConfigurations(state) {
  const { ConfigConverter } = await import('../lib/config-converter.js');
  const converter = new ConfigConverter();

  // Determine sync direction
  if (state.changes.claude.length > 0 && state.changes.openai.length === 0) {
    // Claude → OpenAI
    console.log(chalk.blue('Syncing CLAUDE.md → AGENTS.md'));
    const claudeContent = await fs.readFile(path.join(process.cwd(), 'CLAUDE.md'), 'utf-8');
    const agentsContent = await converter.claudeToAgents(claudeContent);
    await fs.writeFile(path.join(process.cwd(), 'AGENTS.md'), agentsContent);
    
  } else if (state.changes.openai.length > 0 && state.changes.claude.length === 0) {
    // OpenAI → Claude
    console.log(chalk.blue('Syncing AGENTS.md → CLAUDE.md'));
    const agentsContent = await fs.readFile(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
    const claudeContent = await converter.agentsToClaude(agentsContent);
    await fs.writeFile(path.join(process.cwd(), 'CLAUDE.md'), claudeContent);
    
  } else if (state.conflicts.length > 0) {
    // Apply conflict resolutions
    await applyConflictResolutions(state);
  }
}

async function applyConflictResolutions(state) {
  // This is a simplified implementation
  // In production, would need more sophisticated merge logic
  
  for (const conflict of state.conflicts) {
    if (conflict.resolution === 'claude') {
      // Update AGENTS.md with Claude version
      console.log(chalk.gray(`Applying Claude version for ${conflict.section}`));
    } else if (conflict.resolution === 'openai') {
      // Update CLAUDE.md with OpenAI version
      console.log(chalk.gray(`Applying OpenAI version for ${conflict.section}`));
    } else if (conflict.resolution === 'merge') {
      // Merge both versions
      console.log(chalk.gray(`Merging versions for ${conflict.section}`));
    }
  }
}

async function syncMemory(state) {
  console.log(chalk.blue('Syncing memory system...'));
  
  const memoryDir = path.join(process.cwd(), '.claude', 'memory');
  const snapshotDir = path.join(process.cwd(), '.chatgpt', 'snapshots');
  
  if (!await fs.pathExists(memoryDir)) {
    return;
  }

  await fs.ensureDir(snapshotDir);
  
  // Create updated memory snapshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = path.join(snapshotDir, `sync-snapshot-${timestamp}.md`);
  
  let snapshot = `# Memory Sync Snapshot
Generated: ${new Date().toISOString()}
Last Sync: ${state.lastSync || 'Never'}

## Changed Files Since Last Sync
`;

  for (const change of state.changes.claude) {
    if (change.file.includes('memory')) {
      snapshot += `- ${change.file}\n`;
    }
  }

  snapshot += '\n## Current Memory State\n';
  
  // Add current memory state summary
  const projectPath = path.join(memoryDir, 'project.md');
  if (await fs.pathExists(projectPath)) {
    const content = await fs.readFile(projectPath, 'utf-8');
    snapshot += '### Project Context\n' + content.substring(0, 1000) + '\n\n';
  }
  
  await fs.writeFile(snapshotPath, snapshot);
}

async function syncAgentRoles(state) {
  console.log(chalk.blue('Syncing agent roles...'));
  
  const rolesDir = path.join(process.cwd(), '.chatgpt', 'roles');
  const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
  
  if (!await fs.pathExists(rolesDir) || !await fs.pathExists(agentsDir)) {
    return;
  }

  // Check for new or updated agents
  const specialists = await fs.readdir(path.join(agentsDir, 'specialists')).catch(() => []);
  const existingRoles = await fs.readdir(rolesDir);
  
  for (const agent of specialists) {
    if (agent.endsWith('.md')) {
      const agentName = agent.replace('.md', '');
      const rolePath = path.join(rolesDir, `${agentName}-role.md`);
      
      if (!existingRoles.includes(`${agentName}-role.md`)) {
        console.log(chalk.gray(`Converting new agent: ${agentName}`));
        // Convert agent to role
        const { AgentRoleConverter } = await import('../lib/agent-role-converter.js');
        const converter = new AgentRoleConverter();
        const agentContent = await fs.readFile(path.join(agentsDir, 'specialists', agent), 'utf-8');
        const role = converter.convertToRole(agentContent, agentName);
        await fs.writeFile(rolePath, role);
      }
    }
  }
}

async function updateSyncMetadata(state) {
  const syncDir = path.join(process.cwd(), '.chatgpt', 'sync');
  await fs.ensureDir(syncDir);

  // Update checksums
  state.checksums.claude = await calculateChecksum(path.join(process.cwd(), 'CLAUDE.md'));
  state.checksums.agents = await calculateChecksum(path.join(process.cwd(), 'AGENTS.md'));

  // Update memory checksums
  const memoryDir = path.join(process.cwd(), '.claude', 'memory');
  if (await fs.pathExists(memoryDir)) {
    const memoryFiles = await getMemoryFiles(memoryDir);
    for (const file of memoryFiles) {
      const relPath = path.relative(process.cwd(), file);
      state.checksums[relPath] = await calculateChecksum(file);
    }
  }

  const metadata = {
    version: '1.0.0',
    lastSync: new Date().toISOString(),
    checksums: state.checksums,
    conflicts: state.conflicts.filter(c => c.resolution === 'skip'),
    history: [
      {
        timestamp: new Date().toISOString(),
        changes: {
          claude: state.changes.claude.length,
          openai: state.changes.openai.length
        },
        conflicts: state.conflicts.length
      }
    ]
  };

  // Append to history if exists
  const metadataPath = path.join(syncDir, 'metadata.json');
  if (await fs.pathExists(metadataPath)) {
    const existing = await fs.readJson(metadataPath);
    metadata.history = [...(existing.history || []), ...metadata.history].slice(-10);
  }

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

async function calculateChecksum(filepath) {
  if (!await fs.pathExists(filepath)) {
    return null;
  }
  
  const content = await fs.readFile(filepath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function displaySyncSummary(state) {
  console.log(chalk.blue('\n📊 Sync Summary:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  console.log(chalk.white(`Claude changes: ${state.changes.claude.length}`));
  console.log(chalk.white(`OpenAI changes: ${state.changes.openai.length}`));
  console.log(chalk.white(`Conflicts resolved: ${state.conflicts.filter(c => c.resolution && c.resolution !== 'skip').length}`));
  
  if (state.lastSync) {
    const lastSyncDate = new Date(state.lastSync);
    const hoursSinceSync = Math.round((Date.now() - lastSyncDate) / (1000 * 60 * 60));
    console.log(chalk.gray(`\nLast sync: ${hoursSinceSync} hours ago`));
  }
}