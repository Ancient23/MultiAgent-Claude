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

async function execute() {
  console.log(chalk.blue('\n🚀 MultiAgent Claude Setup Wizard\n'));

  console.log(chalk.yellow('This wizard will help you set up the multi-agent environment.\n'));

  const projectType = await detectProjectType();
  console.log(chalk.green(`✓ Detected project type: ${projectType}`));

  console.log(chalk.yellow('\nChoose initialization variant:'));
  console.log('1. Standard multi-agent setup (recommended)');
  console.log('2. Memory-focused setup (minimal agents)');
  console.log('3. Setup with documentation import (imports existing docs)');
  
  const choice = await question(chalk.cyan('Enter choice (1-3): '));
  
  const variants = {
    '1': 'standard',
    '2': 'memory-only',
    '3': 'with-docs'
  };
  
  const variant = variants[choice] || 'standard';

  console.log(chalk.yellow('\nSelect agents to include:'));
  const agents = [
    'frontend-ui-expert',
    'aws-backend-architect',
    'ai-agent-architect',
    'documentation-architect',
    'fullstack-feature-orchestrator'
  ];
  
  const selectedAgents = [];
  for (const agent of agents) {
    const include = await question(chalk.cyan(`Include ${agent}? (y/n): `));
    if (include.toLowerCase() === 'y') {
      selectedAgents.push(agent);
    }
  }

  console.log(chalk.yellow('\nMCP Server Configuration:'));
  const hasMcp = await question(chalk.cyan('Do you have MCP servers configured? (y/n): '));
  
  let mcpServers = [];
  if (hasMcp.toLowerCase() === 'y') {
    console.log('Select MCP servers to use:');
    const servers = ['Context7', 'Sequential', 'Magic', 'Playwright', 'AWS', 'WebSearch'];
    
    for (const server of servers) {
      const use = await question(chalk.cyan(`Use ${server}? (y/n): `));
      if (use.toLowerCase() === 'y') {
        mcpServers.push(server);
      }
    }
  }

  console.log(chalk.yellow('\nCI/CD Integration:'));
  const enableCI = await question(chalk.cyan('Enable GitHub Actions for automated memory updates? (y/n): '));
  
  let ciOptions = {};
  if (enableCI.toLowerCase() === 'y') {
    ciOptions = {
      enabled: true,
      autoPatterns: (await question(chalk.cyan('Auto-detect patterns from commits? (y/n): '))).toLowerCase() === 'y',
      autoADRs: (await question(chalk.cyan('Create ADRs from Pull Requests? (y/n): '))).toLowerCase() === 'y',
      conflictStrategy: await question(chalk.cyan('On conflicts (merge/replace/keep-both): ')) || 'keep-both',
      deduplication: true
    };
  }

  rl.close();

  console.log(chalk.blue('\n📝 Configuration Summary:\n'));
  console.log(chalk.gray(`  Project type: ${projectType}`));
  console.log(chalk.gray(`  Variant: ${variant}`));
  console.log(chalk.gray(`  Agents: ${selectedAgents.join(', ')}`));
  console.log(chalk.gray(`  MCP Servers: ${mcpServers.join(', ')}`));
  if (ciOptions.enabled) {
    console.log(chalk.gray(`  CI/CD: Enabled`));
    console.log(chalk.gray(`    - Auto patterns: ${ciOptions.autoPatterns}`));
    console.log(chalk.gray(`    - Auto ADRs: ${ciOptions.autoADRs}`));
    console.log(chalk.gray(`    - Conflict strategy: ${ciOptions.conflictStrategy}`));
  }

  console.log(chalk.yellow('\n🔧 Setting up environment...\n'));

  setupEnvironment(variant, selectedAgents, mcpServers, ciOptions);
  
  console.log(chalk.green('\n✅ Setup complete!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray('1. Run ') + chalk.cyan('multiagent-claude init') + chalk.gray(' to initialize'));
  console.log(chalk.gray('2. Use ') + chalk.cyan('multiagent-claude agent create') + chalk.gray(' to add custom agents'));
  console.log(chalk.gray('3. Check ') + chalk.cyan('.claude/memory/') + chalk.gray(' for the memory system'));
}

function detectProjectType() {
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.dependencies?.react || pkg.dependencies?.next) return 'React/Next.js';
    if (pkg.dependencies?.vue) return 'Vue.js';
    if (pkg.dependencies?.angular) return 'Angular';
    return 'Node.js';
  }
  if (fs.existsSync('requirements.txt') || fs.existsSync('setup.py')) return 'Python';
  if (fs.existsSync('Cargo.toml')) return 'Rust';
  if (fs.existsSync('go.mod')) return 'Go';
  return 'Unknown';
}

function setupEnvironment(variant, agents, mcpServers, ciOptions = {}) {
  const configPath = path.join('.claude', 'config.json');
  
  if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }
  
  const config = {
    variant,
    agents,
    mcpServers,
    ciOptions,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(chalk.green('✓ Configuration saved to .claude/config.json'));
  
  if (!fs.existsSync('.claude/memory')) {
    fs.mkdirSync('.claude/memory', { recursive: true });
    fs.mkdirSync('.claude/memory/patterns', { recursive: true });
    fs.mkdirSync('.claude/memory/decisions', { recursive: true });
    fs.mkdirSync('.claude/tasks', { recursive: true });
    fs.mkdirSync('.claude/doc', { recursive: true });
    fs.mkdirSync('.claude/agents', { recursive: true });
    fs.mkdirSync('.claude/commands', { recursive: true });
    
    console.log(chalk.green('✓ Created directory structure'));
  }
  
  if (ciOptions.enabled) {
    const workflowPath = path.join('.github', 'workflows');
    if (!fs.existsSync(workflowPath)) {
      fs.mkdirSync(workflowPath, { recursive: true });
    }
    
    const workflowSource = path.join(__dirname, '..', '..', '.github', 'workflows', 'claude-memory-update.yml');
    const workflowDest = path.join(workflowPath, 'claude-memory-update.yml');
    
    if (fs.existsSync(workflowSource)) {
      fs.copyFileSync(workflowSource, workflowDest);
      console.log(chalk.green('✓ GitHub Actions workflow created'));
    }
  }
}

module.exports = { execute };