#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export default async function bundleCommand(args) {
  const taskType = args[0];
  
  console.log(chalk.cyan('\n📦 Creating ChatGPT Project Bundle\n'));

  try {
    // Select bundle type if not provided
    const bundleType = taskType || await selectBundleType();
    
    // Load file manifest
    const manifestPath = path.join(process.cwd(), '.chatgpt', 'file-manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error('File manifest not found. Run "mac openai init" first.');
    }
    
    const manifest = await fs.readJson(manifestPath);
    const bundleConfig = manifest.bundles[bundleType];
    
    if (!bundleConfig) {
      throw new Error(`Unknown bundle type: ${bundleType}`);
    }

    console.log(chalk.blue(`Creating ${bundleType} bundle...`));
    
    // Prepare bundle files
    const bundleFiles = await prepareBundleFiles(bundleConfig);
    
    // Create bundle archive
    const outputPath = await createBundleArchive(bundleType, bundleFiles);
    
    // Display summary
    displayBundleSummary(bundleFiles, outputPath);
    
    console.log(chalk.green('\n✨ Bundle created successfully!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray('1. Upload the bundle to ChatGPT Projects'));
    console.log(chalk.gray('2. Reference AGENTS.md in your conversation'));
    console.log(chalk.gray('3. Use role instructions from .chatgpt/roles/'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error creating bundle:'), error.message);
    process.exit(1);
  }
}

async function selectBundleType() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'bundleType',
      message: 'Select bundle type:',
      choices: [
        { value: 'core', name: 'Core - Essential configuration files' },
        { value: 'cli-development', name: 'CLI Development - CLI implementation files' },
        { value: 'agent-development', name: 'Agent Development - Agent templates and tools' },
        { value: 'testing', name: 'Testing - Test suite and workflows' },
        { value: 'memory-management', name: 'Memory Management - Knowledge base files' }
      ]
    }
  ]);
  return answers.bundleType;
}

async function prepareBundleFiles(bundleConfig) {
  const files = [];
  const baseDir = process.cwd();
  
  for (const pattern of bundleConfig.files) {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const dir = path.dirname(pattern);
      const dirPath = path.join(baseDir, dir);
      
      if (await fs.pathExists(dirPath)) {
        const dirFiles = await fs.readdir(dirPath);
        const ext = path.extname(pattern);
        
        for (const file of dirFiles) {
          if (!ext || file.endsWith(ext)) {
            const filePath = path.join(dir, file);
            if (await validateFile(path.join(baseDir, filePath))) {
              files.push({
                path: filePath,
                size: (await fs.stat(path.join(baseDir, filePath))).size
              });
            }
          }
        }
      }
    } else {
      // Handle specific files
      const filePath = pattern;
      const fullPath = path.join(baseDir, filePath);
      
      if (await fs.pathExists(fullPath)) {
        files.push({
          path: filePath,
          size: (await fs.stat(fullPath)).size
        });
      }
    }
  }
  
  // Add memory snapshot if available
  const snapshotPath = await createMemorySnapshot();
  if (snapshotPath) {
    files.push({
      path: path.relative(baseDir, snapshotPath),
      size: (await fs.stat(snapshotPath)).size
    });
  }
  
  return files;
}

async function validateFile(filePath) {
  const stats = await fs.stat(filePath);
  
  // Skip directories
  if (stats.isDirectory()) return false;
  
  // Skip large files (>10MB)
  if (stats.size > 10 * 1024 * 1024) return false;
  
  // Skip binary files
  const ext = path.extname(filePath);
  const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json', '.yml', '.yaml', '.txt'];
  if (!textExtensions.includes(ext)) return false;
  
  return true;
}

async function createMemorySnapshot() {
  const memoryDir = path.join(process.cwd(), '.claude', 'memory');
  const snapshotDir = path.join(process.cwd(), '.chatgpt', 'snapshots');
  
  if (!await fs.pathExists(memoryDir)) {
    return null;
  }
  
  await fs.ensureDir(snapshotDir);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = path.join(snapshotDir, `memory-snapshot-${timestamp}.md`);
  
  let snapshot = `# Memory Snapshot
Generated: ${new Date().toISOString()}

## Project Context
`;

  // Add project.md if exists
  const projectPath = path.join(memoryDir, 'project.md');
  if (await fs.pathExists(projectPath)) {
    const content = await fs.readFile(projectPath, 'utf-8');
    snapshot += content.substring(0, 2000) + '\n\n';
  }

  snapshot += `## Recent Patterns\n`;
  
  // Add recent patterns
  const patternsDir = path.join(memoryDir, 'patterns');
  if (await fs.pathExists(patternsDir)) {
    const patterns = await fs.readdir(patternsDir);
    for (const pattern of patterns.slice(0, 3)) {
      if (pattern.endsWith('.md')) {
        snapshot += `### ${pattern.replace('.md', '')}\n`;
        const content = await fs.readFile(path.join(patternsDir, pattern), 'utf-8');
        snapshot += content.substring(0, 500) + '...\n\n';
      }
    }
  }

  snapshot += `## Key Decisions\n`;
  
  // Add recent ADRs
  const decisionsDir = path.join(memoryDir, 'decisions');
  if (await fs.pathExists(decisionsDir)) {
    const decisions = await fs.readdir(decisionsDir);
    for (const decision of decisions.slice(0, 2)) {
      if (decision.endsWith('.md')) {
        snapshot += `### ${decision}\n`;
        const content = await fs.readFile(path.join(decisionsDir, decision), 'utf-8');
        const summary = content.match(/## Decision\n([\s\S]*?)(?=\n##|$)/);
        if (summary) {
          snapshot += summary[1].substring(0, 300) + '...\n\n';
        }
      }
    }
  }
  
  await fs.writeFile(snapshotPath, snapshot);
  return snapshotPath;
}

async function createBundleArchive(bundleType, files) {
  const outputDir = path.join(process.cwd(), '.chatgpt', 'bundles');
  await fs.ensureDir(outputDir);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const bundleDir = path.join(outputDir, `${bundleType}-bundle-${timestamp}`);
  await fs.ensureDir(bundleDir);
  
  // Copy files to bundle directory
  for (const file of files) {
    const sourcePath = path.join(process.cwd(), file.path);
    const targetPath = path.join(bundleDir, file.path);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(sourcePath, targetPath);
  }
  
  // Add bundle README
  const readme = createBundleReadme(bundleType, files);
  await fs.writeFile(path.join(bundleDir, 'BUNDLE_README.md'), readme);
  
  return bundleDir;
}

function createBundleReadme(bundleType, files) {
  return `# ${bundleType} Bundle

Created: ${new Date().toISOString()}

## Contents
${files.map(f => `- ${f.path} (${formatFileSize(f.size)})`).join('\n')}

## Total Files: ${files.length}
## Total Size: ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}

## Usage Instructions

1. Upload these files to ChatGPT Projects
2. Start with: "I'm working on the MultiAgent-Claude project"
3. Reference AGENTS.md for project guidelines
4. Use role instructions from .chatgpt/roles/ as needed

## Bundle Type: ${bundleType}

This bundle contains files optimized for ${bundleType} tasks.`;
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function displayBundleSummary(files, outputPath) {
  console.log(chalk.blue('\n📊 Bundle Summary:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  console.log(chalk.white(`Files included: ${files.length}`));
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  console.log(chalk.white(`Total size: ${formatFileSize(totalSize)}`));
  
  console.log(chalk.white(`\nOutput: ${chalk.cyan(path.relative(process.cwd(), outputPath))}`));
  
  // Check against ChatGPT limits
  if (files.length > 20) {
    console.log(chalk.yellow('\n⚠️  Warning: Bundle contains more than 20 files (ChatGPT Plus limit)'));
    console.log(chalk.gray('   Consider using ChatGPT Pro/Team or creating smaller bundles'));
  }
  
  if (totalSize > 500 * 1024 * 1024) {
    console.log(chalk.yellow('\n⚠️  Warning: Bundle exceeds 500MB size limit'));
    console.log(chalk.gray('   Consider excluding large files or creating smaller bundles'));
  }
}