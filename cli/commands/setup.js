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

  // Scan available agents and get suggestions
  const availableAgents = scanAvailableAgents();
  const agentRecommendations = getSuggestedAgents(global.projectStructureAnalysis, availableAgents);
  
  console.log(chalk.yellow('\n📋 Agent Selection'));
  console.log(chalk.gray(`Found ${availableAgents.all.length} available agents`));
  
  if (agentRecommendations.suggested.length > 0) {
    console.log(chalk.green(`\n✓ Recommended agents based on your project:`));
    agentRecommendations.suggested.forEach(agent => {
      console.log(chalk.gray(`  - ${agent}`));
    });
  }
  
  if (agentRecommendations.customNeeded.length > 0) {
    console.log(chalk.yellow(`\n⚡ Custom agents that could be created for your project:`));
    agentRecommendations.customNeeded.forEach(agent => {
      console.log(chalk.gray(`  - ${agent}`));
    });
  }
  
  console.log(chalk.yellow('\nSelect agents to include:'));
  console.log(chalk.gray('(Recommended agents are marked with *)'));
  
  const selectedAgents = [];
  const customAgentsToCreate = [];
  
  // First, ask about available agents
  for (const agent of availableAgents.all) {
    const isRecommended = agentRecommendations.suggested.includes(agent);
    const displayName = isRecommended ? `${agent} *` : agent;
    const defaultAnswer = isRecommended ? 'y' : 'n';
    const include = await question(chalk.cyan(`Include ${displayName}? (${defaultAnswer}): `)) || defaultAnswer;
    if (include.toLowerCase() === 'y') {
      selectedAgents.push(agent);
    }
  }
  
  // Then ask about creating custom agents
  if (agentRecommendations.customNeeded.length > 0) {
    console.log(chalk.yellow('\n🔧 Custom Agent Creation:'));
    for (const customAgent of agentRecommendations.customNeeded) {
      const create = await question(chalk.cyan(`Create custom agent '${customAgent}'? (y/n): `));
      if (create.toLowerCase() === 'y') {
        customAgentsToCreate.push(customAgent);
      }
    }
  }
  
  // Option to create additional custom agents
  const createMore = await question(chalk.cyan('\nCreate additional custom agents? (y/n): '));
  if (createMore.toLowerCase() === 'y') {
    let agentName = '';
    while (true) {
      agentName = await question(chalk.cyan('Agent name (or blank to finish): '));
      if (!agentName) break;
      customAgentsToCreate.push(agentName);
    }
  }
  
  // Ask about creating Codex/ChatGPT integration
  console.log(chalk.yellow('\n🤖 ChatGPT/Codex Integration:'));
  
  // Check for existing AGENTS.md
  let agentsMdAction = 'create';
  if (fs.existsSync('AGENTS.md')) {
    console.log(chalk.yellow('⚠️  Existing AGENTS.md found'));
    console.log(chalk.gray('Default action: Intelligently merge new content'));
    const mergeChoice = await question(chalk.cyan('Action (merge/overwrite/skip) [merge]: ')) || 'merge';
    if (mergeChoice.toLowerCase() === 'skip') {
      agentsMdAction = 'skip';
    } else if (mergeChoice.toLowerCase() === 'overwrite') {
      agentsMdAction = 'overwrite';
    } else {
      agentsMdAction = 'merge';
    }
  } else {
    const create = await question(chalk.cyan('Create AGENTS.md for Codex/ChatGPT? (y/n): '));
    agentsMdAction = create.toLowerCase() === 'y' ? 'create' : 'skip';
  }
  
  // Check if .chatgpt directory already exists
  let preserveExisting = false;
  if (fs.existsSync('.chatgpt')) {
    const existingFiles = fs.readdirSync('.chatgpt');
    if (existingFiles.length > 0) {
      console.log(chalk.yellow('⚠️  Existing .chatgpt directory found with files'));
      preserveExisting = (await question(chalk.cyan('Preserve existing files? (y/n): '))).toLowerCase() === 'y';
    }
  }
  
  const createCodexRoles = await question(chalk.cyan('Create matching ChatGPT/Codex roles in .chatgpt/roles? (y/n): '));
  const codexRolesToCreate = [];
  
  if (createCodexRoles.toLowerCase() === 'y') {
    // Add all selected agents and custom agents to Codex roles
    codexRolesToCreate.push(...selectedAgents);
    codexRolesToCreate.push(...customAgentsToCreate);
    console.log(chalk.gray(`Will create ${codexRolesToCreate.length} Codex-friendly roles`));
  }

  console.log(chalk.yellow('\nMCP Server Configuration:'));
  const hasMcp = await question(chalk.cyan('Do you have MCP servers configured? (y/n): '));
  
  let mcpServers = [];
  if (hasMcp.toLowerCase() === 'y') {
    console.log('Select MCP servers to use:');
    const servers = ['Context7', 'Sequential', 'Magic', 'Playwright', 'AWS', 'WebSearch', 'Catalog'];
    
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

  // Visual Development Integration
  console.log(chalk.yellow('\n🎨 Visual Development (NEW):'));
  const enableVisualDev = await question(chalk.cyan('Enable Playwright MCP visual development for pixel-perfect UI iteration? (y/n): '));
  
  let visualDevOptions = {};
  if (enableVisualDev.toLowerCase() === 'y') {
    visualDevOptions = {
      enabled: true,
      mcpPlaywright: true,
      iterativeRefinement: true,
      mockComparison: true,
      defaultThreshold: 5, // 5% difference threshold
      maxIterations: 10
    };
    
    // Auto-select playwright-visual-developer agent if not already selected
    if (!selectedAgents.includes('playwright-visual-developer')) {
      selectedAgents.push('playwright-visual-developer');
      console.log(chalk.green('  ✓ Added playwright-visual-developer agent'));
    }
    
    // Auto-select cli-web-bridge-architect for CLI-browser integration
    if (!selectedAgents.includes('cli-web-bridge-architect')) {
      selectedAgents.push('cli-web-bridge-architect');
      console.log(chalk.green('  ✓ Added cli-web-bridge-architect agent'));
    }
    
    // Ensure Playwright MCP is in the list
    if (!mcpServers.includes('playwright')) {
      mcpServers.push('playwright');
      console.log(chalk.green('  ✓ Added Playwright MCP server'));
    }
    
    console.log(chalk.cyan('  Visual development will be configured during initialization'));
    console.log(chalk.gray('  • Mock directory: .claude/mocks/'));
    console.log(chalk.gray('  • Iterations saved: .claude/visual-iterations/'));
    console.log(chalk.gray('  • Goal: < 5% visual difference from design mocks'));
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
  if (visualDevOptions.enabled) {
    console.log(chalk.gray(`  Visual Development: Enabled`));
    console.log(chalk.gray(`    - MCP Playwright: ${visualDevOptions.mcpPlaywright}`));
    console.log(chalk.gray(`    - Threshold: ${visualDevOptions.defaultThreshold}%`));
    console.log(chalk.gray(`    - Max Iterations: ${visualDevOptions.maxIterations}`));
  }

  console.log(chalk.yellow('\n🔧 Setting up environment...\n'));

  setupEnvironment(variant, selectedAgents, mcpServers, ciOptions, playwrightOptions, visualDevOptions, projectType, global.projectStructureAnalysis, customAgentsToCreate, codexRolesToCreate, agentsMdAction);
  
  console.log(chalk.green('\n✅ Setup complete!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log(chalk.gray('1. Run ') + chalk.cyan('multiagent-claude init') + chalk.gray(' to initialize'));
  console.log(chalk.gray('2. Use ') + chalk.cyan('multiagent-claude agent create') + chalk.gray(' to add custom agents'));
  console.log(chalk.gray('3. Check ') + chalk.cyan('.ai/memory/') + chalk.gray(' for the memory system'));
}

function scanAvailableAgents() {
  const agentsDir = path.join(__dirname, '..', '..', 'Examples', 'agents');
  const availableAgents = {
    orchestrators: [],
    specialists: [],
    all: []
  };
  
  try {
    // Scan orchestrators
    const orchestratorPath = path.join(agentsDir, 'orchestrators');
    if (fs.existsSync(orchestratorPath)) {
      const files = fs.readdirSync(orchestratorPath)
        .filter(f => f.endsWith('.md') && f !== 'README.md');
      files.forEach(file => {
        const name = file.replace('.md', '');
        availableAgents.orchestrators.push(name);
        availableAgents.all.push(name);
      });
    }
    
    // Scan specialists
    const specialistPath = path.join(agentsDir, 'specialists');
    if (fs.existsSync(specialistPath)) {
      const files = fs.readdirSync(specialistPath)
        .filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'TEMPLATE-agent.md');
      files.forEach(file => {
        const name = file.replace('.md', '');
        availableAgents.specialists.push(name);
        availableAgents.all.push(name);
      });
    }
  } catch (e) {
    console.error('Error scanning agents:', e);
  }
  
  return availableAgents;
}

function getSuggestedAgents(projectStructure, availableAgents) {
  if (!projectStructure) return ['documentation-architect'];
  
  const suggested = [];
  const customAgentsNeeded = [];
  
  // Match available agents based on keywords in their names and project features
  availableAgents.all.forEach(agent => {
    const agentLower = agent.toLowerCase();
    
    // Frontend frameworks
    if ((projectStructure.frameworks.has('React') || projectStructure.frameworks.has('Next.js')) && 
        (agentLower.includes('react') || agentLower.includes('frontend') || agentLower.includes('ui'))) {
      suggested.push(agent);
    }
    
    if (projectStructure.frameworks.has('Vue.js') && agentLower.includes('vue')) {
      suggested.push(agent);
    }
    
    // Backend
    if ((projectStructure.frameworks.has('Express') || projectStructure.frameworks.has('Fastify')) && 
        (agentLower.includes('backend') || agentLower.includes('api'))) {
      suggested.push(agent);
    }
    
    // AWS
    if (projectStructure.technologies.has('AWS') && agentLower.includes('aws')) {
      suggested.push(agent);
    }
    
    // Testing
    if (projectStructure.features.has('Playwright') && agentLower.includes('playwright')) {
      suggested.push(agent);
    }
    
    // Desktop
    if (projectStructure.features.has('Electron') && agentLower.includes('electron')) {
      suggested.push(agent);
    }
    
    // Deployment
    if (projectStructure.features.has('Vercel') && agentLower.includes('vercel')) {
      suggested.push(agent);
    }
    
    // AI/ML
    if ((projectStructure.features.has('OpenAI') || projectStructure.features.has('LangChain')) && 
        (agentLower.includes('ai') || agentLower.includes('multimodal'))) {
      suggested.push(agent);
    }
    
    // Documentation is always useful
    if (agentLower.includes('documentation')) {
      suggested.push(agent);
    }
    
    // Monorepo needs orchestration
    if (projectStructure.monorepo && agentLower.includes('orchestrator')) {
      suggested.push(agent);
    }
  });
  
  // Identify needed custom agents based on technologies not covered
  if (projectStructure.technologies.has('Web3/Blockchain') && 
      !suggested.some(a => a.toLowerCase().includes('web3') || a.toLowerCase().includes('blockchain'))) {
    customAgentsNeeded.push('web3-blockchain-specialist');
  }
  
  if (projectStructure.technologies.has('Smart Contracts') && 
      !suggested.some(a => a.toLowerCase().includes('smart') || a.toLowerCase().includes('contract'))) {
    customAgentsNeeded.push('smart-contract-developer');
  }
  
  if (projectStructure.technologies.has('Solana') && 
      !suggested.some(a => a.toLowerCase().includes('solana'))) {
    customAgentsNeeded.push('solana-blockchain-specialist');
  }
  
  if (projectStructure.features.has('GraphQL') && 
      !suggested.some(a => a.toLowerCase().includes('graphql'))) {
    customAgentsNeeded.push('graphql-api-specialist');
  }
  
  if (projectStructure.features.has('Docker') && 
      !suggested.some(a => a.toLowerCase().includes('docker'))) {
    customAgentsNeeded.push('docker-container-specialist');
  }
  
  if (projectStructure.features.has('Kubernetes') && 
      !suggested.some(a => a.toLowerCase().includes('kubernetes') || a.toLowerCase().includes('k8s'))) {
    customAgentsNeeded.push('kubernetes-orchestration-specialist');
  }
  
  if (projectStructure.technologies.has('Python') && 
      !suggested.some(a => a.toLowerCase().includes('python'))) {
    customAgentsNeeded.push('python-development-specialist');
  }
  
  if (projectStructure.technologies.has('Rust') && 
      !suggested.some(a => a.toLowerCase().includes('rust'))) {
    customAgentsNeeded.push('rust-systems-specialist');
  }
  
  return {
    suggested: [...new Set(suggested)],
    customNeeded: customAgentsNeeded
  };
}

function detectProjectType() {
  const projectStructure = {
    monorepo: false,
    packages: [],
    technologies: new Set(),
    frameworks: new Set(),
    features: new Set()
  };
  
  // Check for monorepo indicators
  if (fs.existsSync('lerna.json')) {
    projectStructure.monorepo = true;
    projectStructure.features.add('Lerna monorepo');
  }
  if (fs.existsSync('pnpm-workspace.yaml')) {
    projectStructure.monorepo = true;
    projectStructure.features.add('pnpm workspace');
  }
  if (fs.existsSync('rush.json')) {
    projectStructure.monorepo = true;
    projectStructure.features.add('Rush monorepo');
  }
  
  // Check root package.json
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for workspace configuration (npm/yarn/pnpm workspaces)
    if (pkg.workspaces) {
      projectStructure.monorepo = true;
      projectStructure.features.add('npm/yarn workspaces');
      
      // Get workspace packages
      const workspacePatterns = Array.isArray(pkg.workspaces) 
        ? pkg.workspaces 
        : pkg.workspaces.packages || [];
      
      workspacePatterns.forEach(pattern => {
        const globPattern = pattern.replace('*', '');
        try {
          const dirs = fs.readdirSync(globPattern).filter(dir => 
            fs.statSync(path.join(globPattern, dir)).isDirectory() &&
            fs.existsSync(path.join(globPattern, dir, 'package.json'))
          );
          dirs.forEach(dir => {
            projectStructure.packages.push(path.join(globPattern, dir));
          });
        } catch (e) {
          // Pattern might not match any directories
        }
      });
    }
    
    // Analyze dependencies
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    
    // Frontend frameworks
    if (allDeps.react || allDeps['react-dom']) projectStructure.frameworks.add('React');
    if (allDeps.next) projectStructure.frameworks.add('Next.js');
    if (allDeps.vue) projectStructure.frameworks.add('Vue.js');
    if (allDeps.nuxt) projectStructure.frameworks.add('Nuxt');
    if (allDeps.angular) projectStructure.frameworks.add('Angular');
    if (allDeps.svelte) projectStructure.frameworks.add('Svelte');
    if (allDeps.solid) projectStructure.frameworks.add('SolidJS');
    
    // Backend frameworks
    if (allDeps.express) projectStructure.frameworks.add('Express');
    if (allDeps.fastify) projectStructure.frameworks.add('Fastify');
    if (allDeps.koa) projectStructure.frameworks.add('Koa');
    if (allDeps.nestjs || allDeps['@nestjs/core']) projectStructure.frameworks.add('NestJS');
    if (allDeps.hapi) projectStructure.frameworks.add('Hapi');
    
    // Web3/Blockchain
    if (allDeps.web3 || allDeps.ethers) {
      projectStructure.technologies.add('Web3/Blockchain');
      projectStructure.features.add('Smart contracts');
    }
    if (allDeps['@solana/web3.js']) {
      projectStructure.technologies.add('Solana');
      projectStructure.features.add('Solana blockchain');
    }
    if (allDeps.hardhat) projectStructure.features.add('Hardhat');
    if (allDeps.truffle) projectStructure.features.add('Truffle');
    
    // Mobile
    if (allDeps['react-native']) {
      projectStructure.frameworks.add('React Native');
      projectStructure.technologies.add('Mobile');
    }
    if (allDeps.expo) projectStructure.features.add('Expo');
    
    // Desktop
    if (allDeps.electron) {
      projectStructure.technologies.add('Desktop');
      projectStructure.features.add('Electron');
    }
    if (allDeps.tauri) {
      projectStructure.technologies.add('Desktop');
      projectStructure.features.add('Tauri');
    }
    
    // Testing
    if (allDeps.jest) projectStructure.features.add('Jest');
    if (allDeps.vitest) projectStructure.features.add('Vitest');
    if (allDeps.playwright || allDeps['@playwright/test']) projectStructure.features.add('Playwright');
    if (allDeps.cypress) projectStructure.features.add('Cypress');
    
    // Databases/ORMs
    if (allDeps.prisma || allDeps['@prisma/client']) projectStructure.features.add('Prisma');
    if (allDeps.typeorm) projectStructure.features.add('TypeORM');
    if (allDeps.mongoose) projectStructure.features.add('MongoDB/Mongoose');
    if (allDeps.sequelize) projectStructure.features.add('Sequelize');
    
    // Cloud/Infrastructure
    if (allDeps['aws-sdk'] || allDeps['@aws-sdk/client-s3']) {
      projectStructure.technologies.add('AWS');
    }
    if (allDeps.serverless) projectStructure.features.add('Serverless');
    if (allDeps.pulumi || allDeps['@pulumi/pulumi']) projectStructure.features.add('Pulumi');
    
    // GraphQL
    if (allDeps.graphql || allDeps['apollo-server']) projectStructure.features.add('GraphQL');
    
    // SDK indicators
    if (pkg.name?.includes('sdk') || pkg.name?.includes('-sdk')) {
      projectStructure.features.add('SDK/Library');
    }
    
    projectStructure.technologies.add('Node.js/JavaScript');
  }
  
  // Check for common monorepo directories
  const commonMonorepoDirs = ['packages', 'apps', 'services', 'libs'];
  commonMonorepoDirs.forEach(dir => {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        if (fs.existsSync(path.join(itemPath, 'package.json'))) {
          if (!projectStructure.packages.includes(itemPath)) {
            projectStructure.packages.push(itemPath);
          }
          projectStructure.monorepo = true;
        }
      });
    }
  });
  
  // Analyze each package in monorepo
  if (projectStructure.packages.length > 0) {
    projectStructure.packages.forEach(pkgPath => {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
        // Analyze package name for SDK indicators
        if (pkgJson.name?.includes('sdk') || pkgJson.name?.includes('-sdk')) {
          projectStructure.features.add('SDK/Library');
        }
        // Could analyze dependencies per package here if needed
      } catch (e) {
        // Package might not have valid package.json
      }
    });
  }
  
  // Check for other language indicators
  if (fs.existsSync('requirements.txt') || fs.existsSync('setup.py') || fs.existsSync('pyproject.toml')) {
    projectStructure.technologies.add('Python');
  }
  if (fs.existsSync('Cargo.toml')) {
    projectStructure.technologies.add('Rust');
  }
  if (fs.existsSync('go.mod')) {
    projectStructure.technologies.add('Go');
  }
  if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) {
    projectStructure.technologies.add('Java');
  }
  if (fs.existsSync('composer.json')) {
    projectStructure.technologies.add('PHP');
  }
  if (fs.existsSync('Gemfile')) {
    projectStructure.technologies.add('Ruby');
  }
  
  // Check for smart contract files
  if (fs.existsSync('contracts') || fs.existsSync('hardhat.config.js') || fs.existsSync('truffle-config.js')) {
    projectStructure.technologies.add('Smart Contracts');
    projectStructure.features.add('Blockchain development');
  }
  
  // Check for Docker
  if (fs.existsSync('Dockerfile') || fs.existsSync('docker-compose.yml')) {
    projectStructure.features.add('Docker');
  }
  
  // Check for Kubernetes
  if (fs.existsSync('k8s') || fs.existsSync('kubernetes') || fs.existsSync('helm')) {
    projectStructure.features.add('Kubernetes');
  }
  
  // Build comprehensive project type string
  let projectTypeStr = '';
  
  if (projectStructure.monorepo) {
    projectTypeStr = 'Monorepo: ';
    if (projectStructure.packages.length > 0) {
      projectTypeStr += `${projectStructure.packages.length} packages, `;
    }
  }
  
  if (projectStructure.frameworks.size > 0) {
    projectTypeStr += Array.from(projectStructure.frameworks).join('/');
  }
  
  if (projectStructure.technologies.size > 0) {
    const techs = Array.from(projectStructure.technologies);
    if (projectTypeStr) projectTypeStr += ' + ';
    projectTypeStr += techs.join(', ');
  }
  
  if (projectStructure.features.size > 0) {
    const features = Array.from(projectStructure.features).slice(0, 3); // Show top 3 features
    if (features.length > 0) {
      projectTypeStr += ` (${features.join(', ')})`;
    }
  }
  
  // Store the full analysis for later use
  global.projectStructureAnalysis = projectStructure;
  
  return projectTypeStr || 'Unknown';
}

// File creation functions removed - all intelligent creation now happens in init.js
// The framework uses its own agents (agent-factory, codex-configuration-expert, role-instruction-engineer)
// to create context-aware, project-specific agents and configurations

function setupEnvironment(variant, agents, mcpServers, ciOptions = {}, playwrightOptions = {}, visualDevOptions = {}, projectType = 'Unknown', projectAnalysis = null, customAgentsToCreate = [], codexRolesToCreate = [], agentsMdAction = 'skip') {
  
  // Only create .claude directory - all other directories created by init.js
  const claudeDir = '.claude';
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Save complete configuration for init to process
  const config = {
    variant,
    agents,
    mcpServers,
    ciOptions,
    playwrightOptions,
    visualDevOptions,
    projectType,
    projectAnalysis: projectAnalysis ? {
      monorepo: projectAnalysis.monorepo,
      packageCount: projectAnalysis.packages.length,
      packages: projectAnalysis.packages,
      technologies: Array.from(projectAnalysis.technologies),
      frameworks: Array.from(projectAnalysis.frameworks),
      features: Array.from(projectAnalysis.features)
    } : null,
    queuedForCreation: {
      customAgents: customAgentsToCreate || [],
      codexRoles: codexRolesToCreate || [],
      agentsMd: agentsMdAction || 'skip',
      needsProcessing: (customAgentsToCreate?.length > 0) || 
                       (codexRolesToCreate?.length > 0) ||
                       (agentsMdAction && agentsMdAction !== 'skip')
    },
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('.claude/config.json', JSON.stringify(config, null, 2));
  
  console.log(chalk.green('✓ Configuration saved to .claude/config.json'));
  
  // Display what will be created during init
  if (config.queuedForCreation.needsProcessing) {
    console.log(chalk.yellow('\n📋 Queued for intelligent creation during init:'));
    if (customAgentsToCreate.length > 0) {
      console.log(chalk.gray(`  • ${customAgentsToCreate.length} custom agents (using agent-factory patterns)`));
      customAgentsToCreate.forEach(agent => 
        console.log(chalk.gray(`    - ${agent}`))
      );
    }
    if (codexRolesToCreate.length > 0) {
      console.log(chalk.gray(`  • ${codexRolesToCreate.length} ChatGPT/Codex roles (using role-instruction-engineer)`));
    }
    if (agentsMdAction !== 'skip') {
      console.log(chalk.gray(`  • AGENTS.md (${agentsMdAction} using codex-configuration-expert)`));
    }
    console.log(chalk.blue('\nThese will be created intelligently by Claude during init'));
  }
  
  // CI/CD workflow creation moved to init.js for intelligent generation
  // The framework now uses its own patterns to create context-aware workflows
  
  // Playwright setup moved to init.js for intelligent generation
  // Directory creation and workflow files will be created by Claude during init
  // using context-aware patterns from the framework's own agents
  if (playwrightOptions.enabled) {
    // Only add the agent to the config, actual setup happens in init
    if (!agents.includes('playwright-test-engineer')) {
      agents.push('playwright-test-engineer');
      console.log(chalk.green('✓ playwright-test-engineer agent will be configured during init'));
    }
    console.log(chalk.yellow('📋 Playwright setup queued for intelligent creation during init'));
  }
}

module.exports = { execute };