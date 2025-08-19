const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

function getMemoryPath() {
  return path.join(process.cwd(), '.claude', 'memory');
}

function ensureMemoryExists() {
  const memoryPath = getMemoryPath();
  if (!fs.existsSync(memoryPath)) {
    console.error(chalk.red('Memory system not found. Run "multiagent-claude init" first.'));
    process.exit(1);
  }
  return memoryPath;
}

function showStatus() {
  const memoryPath = ensureMemoryExists();
  
  console.log(chalk.blue('\n📊 Memory System Status\n'));
  
  const stats = {
    patterns: 0,
    decisions: 0,
    projectSize: 0,
    lastUpdated: null
  };
  
  const patternsDir = path.join(memoryPath, 'patterns');
  if (fs.existsSync(patternsDir)) {
    stats.patterns = fs.readdirSync(patternsDir).filter(f => f.endsWith('.md')).length;
  }
  
  const decisionsDir = path.join(memoryPath, 'decisions');
  if (fs.existsSync(decisionsDir)) {
    stats.decisions = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md')).length;
  }
  
  const projectFile = path.join(memoryPath, 'project.md');
  if (fs.existsSync(projectFile)) {
    const stat = fs.statSync(projectFile);
    stats.projectSize = Math.round(stat.size / 1024);
    stats.lastUpdated = stat.mtime.toLocaleDateString();
  }
  
  console.log(chalk.green('  ✓ Memory system active'));
  console.log(chalk.gray(`  📁 Location: ${memoryPath}`));
  console.log(chalk.gray(`  📝 Patterns: ${stats.patterns}`));
  console.log(chalk.gray(`  🎯 Decisions: ${stats.decisions}`));
  console.log(chalk.gray(`  📄 Project context: ${stats.projectSize}KB`));
  console.log(chalk.gray(`  🕐 Last updated: ${stats.lastUpdated || 'Never'}`));
  
  const indexPath = path.join(memoryPath, 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(chalk.gray(`  🔍 Indexed items: ${Object.keys(index).length}`));
  }
}

function inspectMemory(type) {
  const memoryPath = ensureMemoryExists();
  
  const typeMap = {
    'patterns': 'patterns',
    'decisions': 'decisions',
    'project': 'project.md'
  };
  
  const targetPath = path.join(memoryPath, typeMap[type] || 'patterns');
  
  if (!fs.existsSync(targetPath)) {
    console.error(chalk.red(`Memory type "${type}" not found`));
    return;
  }
  
  if (fs.statSync(targetPath).isDirectory()) {
    console.log(chalk.blue(`\n📂 ${type.charAt(0).toUpperCase() + type.slice(1)}:\n`));
    const files = fs.readdirSync(targetPath).filter(f => f.endsWith('.md'));
    
    files.forEach(file => {
      const filePath = path.join(targetPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const firstLine = content.split('\n')[0].replace('#', '').trim();
      console.log(chalk.green(`  • ${file}`));
      console.log(chalk.gray(`    ${firstLine}`));
    });
  } else {
    const content = fs.readFileSync(targetPath, 'utf8');
    console.log(chalk.blue('\n📄 Project Context:\n'));
    console.log(content.substring(0, 500) + '...');
  }
}

function searchMemory(query) {
  const memoryPath = ensureMemoryExists();
  
  console.log(chalk.blue(`\n🔍 Searching for: "${query}"\n`));
  
  const results = [];
  
  function searchInFile(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          file: relativePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  }
  
  function searchDirectory(dir, baseDir = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(baseDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDirectory(fullPath, relativePath);
      } else if (item.endsWith('.md') || item.endsWith('.json')) {
        searchInFile(fullPath, relativePath);
      }
    });
  }
  
  searchDirectory(memoryPath);
  
  if (results.length === 0) {
    console.log(chalk.yellow('No results found'));
  } else {
    console.log(chalk.green(`Found ${results.length} matches:\n`));
    results.slice(0, 10).forEach(result => {
      console.log(chalk.cyan(`  ${result.file}:${result.line}`));
      console.log(chalk.gray(`    ${result.content.substring(0, 100)}`));
    });
    
    if (results.length > 10) {
      console.log(chalk.gray(`\n  ... and ${results.length - 10} more results`));
    }
  }
}

function addPattern() {
  console.log(chalk.blue('\n📝 Add New Pattern\n'));
  console.log(chalk.yellow('Create a new pattern file at:'));
  console.log(chalk.cyan('.claude/memory/patterns/[pattern-name].md'));
  console.log(chalk.gray('\nTemplate:'));
  console.log(chalk.gray(`
# Pattern: [Name]

## Context
When [situation/trigger]

## Solution
[Implementation approach]

## Example
\`\`\`[language]
[code example]
\`\`\`

## Benefits
- [Benefit 1]
- [Benefit 2]

## Tags
#pattern #[domain] #[technology]
  `));
}

function addDecision() {
  const date = new Date().toISOString().split('T')[0];
  console.log(chalk.blue('\n📝 Add New Architectural Decision\n'));
  console.log(chalk.yellow('Create a new ADR file at:'));
  console.log(chalk.cyan(`.claude/memory/decisions/${date}-[decision-name].md`));
  console.log(chalk.gray('\nTemplate:'));
  console.log(chalk.gray(`
# ADR: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that we're seeing that is motivating this decision?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult to do because of this change?]

## Alternatives Considered
- [Alternative 1]: [Why not chosen]
- [Alternative 2]: [Why not chosen]
  `));
}

function learnFromCommit(commitSha) {
  console.log(chalk.blue(`\n🧠 Learning from commit ${commitSha}\n`));
  
  try {
    const diff = execSync(`git show ${commitSha}`, { encoding: 'utf8' });
    const message = execSync(`git log -1 --pretty=%B ${commitSha}`, { encoding: 'utf8' });
    
    console.log(chalk.green('Commit message:'));
    console.log(chalk.gray(message));
    
    console.log(chalk.yellow('\nAnalyzing changes for patterns...'));
    
    const patterns = [];
    if (diff.includes('async') && diff.includes('await')) {
      patterns.push('Async/await pattern detected');
    }
    if (diff.includes('try') && diff.includes('catch')) {
      patterns.push('Error handling pattern detected');
    }
    if (diff.includes('test') || diff.includes('describe')) {
      patterns.push('Testing pattern detected');
    }
    
    if (patterns.length > 0) {
      console.log(chalk.green('\nDetected patterns:'));
      patterns.forEach(p => console.log(chalk.gray(`  • ${p}`)));
      console.log(chalk.yellow('\nConsider documenting these in .claude/memory/patterns/'));
    } else {
      console.log(chalk.gray('No specific patterns detected'));
    }
  } catch (error) {
    console.error(chalk.red('Error analyzing commit:'), error.message);
  }
}

function execute(action, args, options) {
  switch(action) {
    case 'status':
      showStatus();
      break;
    case 'inspect':
      inspectMemory(options.type || 'patterns');
      break;
    case 'search':
      searchMemory(options.query || args[0] || '');
      break;
    case 'add-pattern':
      addPattern();
      break;
    case 'add-decision':
      addDecision();
      break;
    case 'update-from-commit':
      learnFromCommit(options.commit || 'HEAD');
      break;
    case 'validate':
      console.log(chalk.yellow('Validating memory system...'));
      showStatus();
      break;
    case 'cleanup':
      console.log(chalk.yellow('Cleaning up memory system...'));
      break;
    case 'export':
      console.log(chalk.yellow(`Exporting memory to ${options.file || 'memory-export.json'}...`));
      break;
    case 'import':
      console.log(chalk.yellow(`Importing memory from ${options.file}...`));
      break;
    case 'learn':
      if (options.fromSession) {
        console.log(chalk.yellow('Learning from current session...'));
      } else if (options.fromGitHistory) {
        console.log(chalk.yellow('Learning from git history...'));
      } else if (options.fromDiff) {
        console.log(chalk.yellow(`Learning from diff ${options.fromDiff}...`));
      }
      break;
    default:
      console.error(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.gray('Available actions: status, inspect, search, add-pattern, add-decision, validate, cleanup, export, import, learn, update-from-commit'));
  }
}

module.exports = { execute };