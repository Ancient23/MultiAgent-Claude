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

  console.log(chalk.yellow('\nTesting Framework:'));
  const enablePlaywright = await question(chalk.cyan('Enable Playwright testing for UI/E2E tests? (y/n): '));
  
  let playwrightOptions = {};
  if (enablePlaywright.toLowerCase() === 'y') {
    playwrightOptions = {
      enabled: true,
      e2e: (await question(chalk.cyan('Include E2E testing? (y/n): '))).toLowerCase() === 'y',
      visual: (await question(chalk.cyan('Include visual regression testing? (y/n): '))).toLowerCase() === 'y',
      accessibility: (await question(chalk.cyan('Include accessibility testing? (y/n): '))).toLowerCase() === 'y',
      ciIntegration: (await question(chalk.cyan('Add Playwright to CI/CD workflow? (y/n): '))).toLowerCase() === 'y'
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
  if (playwrightOptions.enabled) {
    console.log(chalk.gray(`  Playwright Testing: Enabled`));
    console.log(chalk.gray(`    - E2E: ${playwrightOptions.e2e}`));
    console.log(chalk.gray(`    - Visual: ${playwrightOptions.visual}`));
    console.log(chalk.gray(`    - Accessibility: ${playwrightOptions.accessibility}`));
    console.log(chalk.gray(`    - CI Integration: ${playwrightOptions.ciIntegration}`));
  }

  console.log(chalk.yellow('\n🔧 Setting up environment...\n'));

  setupEnvironment(variant, selectedAgents, mcpServers, ciOptions, playwrightOptions);
  
  console.log(chalk.green('\n✅ Setup complete!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray('1. Run ') + chalk.cyan('multiagent-claude init') + chalk.gray(' to initialize'));
  console.log(chalk.gray('2. Use ') + chalk.cyan('multiagent-claude agent create') + chalk.gray(' to add custom agents'));
  console.log(chalk.gray('3. Check ') + chalk.cyan('.ai/memory/') + chalk.gray(' for the memory system'));
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

function setupEnvironment(variant, agents, mcpServers, ciOptions = {}, playwrightOptions = {}) {
  const configPath = path.join('.claude', 'config.json');
  
  if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }
  
  const config = {
    variant,
    agents,
    mcpServers,
    ciOptions,
    playwrightOptions,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(chalk.green('✓ Configuration saved to .claude/config.json'));
  
  if (!fs.existsSync('.ai/memory')) {
    fs.mkdirSync('.ai/memory', { recursive: true });
    fs.mkdirSync('.ai/memory/patterns', { recursive: true });
    fs.mkdirSync('.ai/memory/decisions', { recursive: true });
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
      console.log(chalk.green('✓ GitHub Actions memory workflow created'));
    }
  }
  
  if (playwrightOptions.enabled) {
    // Create Playwright directories
    const playwrightDirs = [
      '.playwright/tests/e2e',
      '.playwright/tests/visual',
      '.playwright/tests/interaction',
      '.playwright/tests/accessibility',
      '.playwright/baseline',
      '.playwright/fixtures',
      '.playwright/page-objects',
      '.playwright/config',
      '.ai/memory/test-results'
    ];
    
    playwrightDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    console.log(chalk.green('✓ Playwright directory structure created'));
    
    // Copy Playwright workflow if CI integration is enabled
    if (playwrightOptions.ciIntegration) {
      const workflowPath = path.join('.github', 'workflows');
      if (!fs.existsSync(workflowPath)) {
        fs.mkdirSync(workflowPath, { recursive: true });
      }
      
      const playwrightWorkflowSource = path.join(__dirname, '..', '..', '.github', 'workflows', 'playwright-tests.yml');
      const playwrightWorkflowDest = path.join(workflowPath, 'playwright-tests.yml');
      
      if (fs.existsSync(playwrightWorkflowSource)) {
        fs.copyFileSync(playwrightWorkflowSource, playwrightWorkflowDest);
        console.log(chalk.green('✓ Playwright CI/CD workflow created'));
      }
    }
    
    // Add playwright-test-engineer agent if not already selected
    if (!agents.includes('playwright-test-engineer')) {
      agents.push('playwright-test-engineer');
      console.log(chalk.green('✓ Added playwright-test-engineer agent'));
    }
  }
}

module.exports = { execute };