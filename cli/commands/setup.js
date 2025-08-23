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

  setupEnvironment(variant, selectedAgents, mcpServers, ciOptions, playwrightOptions, projectType, global.projectStructureAnalysis, customAgentsToCreate, codexRolesToCreate, agentsMdAction);
  
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

function createCodexRole(agentName, projectAnalysis) {
  const rolePath = path.join('.chatgpt', 'roles', `${agentName}.md`);
  
  if (!fs.existsSync(path.dirname(rolePath))) {
    fs.mkdirSync(path.dirname(rolePath), { recursive: true });
  }
  
  // Parse agent name to extract domain and expertise
  const parts = agentName.split('-');
  const domain = parts.slice(0, -1).join(' ');
  const role = parts[parts.length - 1];
  
  // Create a compressed, Codex-optimized role definition
  let roleContent = `# ${agentName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

`;
  roleContent += `You are a ${domain} ${role} expert. `;
  
  // Add specific expertise based on agent type
  if (agentName.includes('frontend') || agentName.includes('ui')) {
    roleContent += `Expert in React, Vue, Angular, component architecture, state management, CSS-in-JS, accessibility, and modern UI patterns. `;
  }
  
  if (agentName.includes('backend') || agentName.includes('api')) {
    roleContent += `Expert in REST/GraphQL APIs, microservices, database design, authentication, caching, message queues, and scalability. `;
  }
  
  if (agentName.includes('aws')) {
    roleContent += `Expert in AWS services (EC2, Lambda, S3, RDS, DynamoDB, CloudFormation, CDK), serverless architecture, and cloud best practices. `;
  }
  
  if (agentName.includes('web3') || agentName.includes('blockchain')) {
    roleContent += `Expert in Web3, smart contracts, DeFi, NFTs, Ethereum, Solana, wallet integration, and blockchain security. `;
  }
  
  if (agentName.includes('playwright') || agentName.includes('test')) {
    roleContent += `Expert in E2E testing, visual regression, accessibility testing, test automation, CI/CD integration, and testing best practices. `;
  }
  
  if (agentName.includes('docker')) {
    roleContent += `Expert in Docker, container orchestration, multi-stage builds, security scanning, registry management, and container best practices. `;
  }
  
  if (agentName.includes('kubernetes') || agentName.includes('k8s')) {
    roleContent += `Expert in Kubernetes, Helm charts, operators, service mesh, GitOps, cluster management, and cloud-native patterns. `;
  }
  
  if (agentName.includes('graphql')) {
    roleContent += `Expert in GraphQL schema design, resolvers, subscriptions, federation, caching, error handling, and GraphQL best practices. `;
  }
  
  if (agentName.includes('python')) {
    roleContent += `Expert in Python, Django/FastAPI, async programming, data science libraries, type hints, testing, and Pythonic patterns. `;
  }
  
  if (agentName.includes('rust')) {
    roleContent += `Expert in Rust, memory safety, ownership, async/await, WebAssembly, embedded systems, and performance optimization. `;
  }
  
  // Add workflow instructions
  roleContent += `\n\n## Workflow\n`;
  roleContent += `1. Analyze requirements thoroughly\n`;
  roleContent += `2. Research latest best practices\n`;
  roleContent += `3. Create detailed implementation plan\n`;
  roleContent += `4. Consider edge cases and error handling\n`;
  roleContent += `5. Provide production-ready code\n`;
  
  // Add key principles
  roleContent += `\n## Principles\n`;
  roleContent += `- Use latest stable versions and patterns\n`;
  roleContent += `- Prioritize security and performance\n`;
  roleContent += `- Write maintainable, documented code\n`;
  roleContent += `- Follow framework conventions\n`;
  roleContent += `- Include error handling and validation\n`;
  
  // Add output format
  roleContent += `\n## Output Format\n`;
  roleContent += `- Provide complete, working code\n`;
  roleContent += `- Include setup instructions\n`;
  roleContent += `- Document key decisions\n`;
  roleContent += `- Explain complex parts\n`;
  roleContent += `- List dependencies needed\n`;
  
  fs.writeFileSync(rolePath, roleContent);
  return rolePath;
}

function createCustomAgent(agentName, projectAnalysis) {
  const templatePath = path.join(__dirname, '..', '..', 'Examples', 'agents', 'specialists', 'TEMPLATE-agent.md');
  const outputPath = path.join('.claude', 'agents', `${agentName}.md`);
  
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  
  // Read template
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Parse agent name to extract domain and role
  const parts = agentName.split('-');
  const domain = parts.slice(0, -1).join(' ');
  const role = parts[parts.length - 1];
  
  // Determine relevant technologies and tools
  const mcpTools = [];
  const frameworks = [];
  
  if (agentName.includes('web3') || agentName.includes('blockchain')) {
    mcpTools.push('WebSearch for latest blockchain updates');
    frameworks.push('web3.js or ethers.js', 'Smart contract ABIs', 'Blockchain best practices');
  }
  
  if (agentName.includes('graphql')) {
    mcpTools.push('Context7 for GraphQL documentation');
    frameworks.push('GraphQL', 'Apollo Server', 'GraphQL schema design');
  }
  
  if (agentName.includes('docker')) {
    mcpTools.push('Context7 for Docker documentation');
    frameworks.push('Docker', 'Docker Compose', 'Container best practices');
  }
  
  if (agentName.includes('kubernetes') || agentName.includes('k8s')) {
    mcpTools.push('Context7 for Kubernetes documentation');
    frameworks.push('Kubernetes', 'Helm', 'K8s deployment strategies');
  }
  
  if (agentName.includes('python')) {
    mcpTools.push('Context7 for Python documentation');
    frameworks.push('Python', 'pip/poetry', 'Python best practices');
  }
  
  if (agentName.includes('rust')) {
    mcpTools.push('Context7 for Rust documentation');
    frameworks.push('Rust', 'Cargo', 'Rust patterns');
  }
  
  if (agentName.includes('solana')) {
    mcpTools.push('WebSearch for Solana updates', 'Context7 for Solana documentation');
    frameworks.push('Solana Web3.js', 'Anchor framework', 'Solana programs');
  }
  
  // Replace placeholders
  template = template.replace(/template-agent-name/g, agentName);
  template = template.replace(/\[agent-name\]/g, agentName);
  template = template.replace(/\[domain\]/g, domain);
  template = template.replace(/\[specific areas\]/g, `${domain} development and architecture`);
  template = template.replace(/\[breadth of expertise\]/g, `${domain} ecosystem, best practices, and modern patterns`);
  template = template.replace(/\[agent-type\]/g, agentName);
  template = template.replace(/\[type\]/g, domain);
  
  // Update trigger keywords
  const keywords = agentName.split('-').join(', ');
  template = template.replace(/\[keywords, technologies, or concepts\]/g, keywords);
  template = template.replace(/\[core competency\]/g, `${domain} development`);
  template = template.replace(/\[specific domains\]/g, `${domain} architecture and implementation`);
  
  // Update workflow section with relevant tools
  if (frameworks.length > 0) {
    template = template.replace(/- \[Relevant framework\/library 1\]/g, `- ${frameworks[0]}`);
    template = template.replace(/- \[Relevant framework\/library 2\]/g, frameworks[1] ? `- ${frameworks[1]}` : '');
    template = template.replace(/- \[Best practices documentation\]/g, frameworks[2] ? `- ${frameworks[2]}` : '- Industry best practices');
  }
  
  // Add specific MCP tools
  if (mcpTools.length > 0) {
    template = template.replace(
      /4\. \[Additional MCP tools as needed - Sequential, Magic, Playwright, AWS\]/g,
      `4. ${mcpTools.join('\n   ')}`
    );
  }
  
  // Write the custom agent
  fs.writeFileSync(outputPath, template);
  
  return outputPath;
}

function parseAGENTSmd(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let sectionContent = [];
  let inCodeBlock = false;
  
  for (const line of lines) {
    // Track code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    // Detect section headers (##)
    if (!inCodeBlock && line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = line.replace(/^##\s+/, '').trim();
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    sections[currentSection] = sectionContent.join('\n').trim();
  }
  
  return sections;
}

function mergeAGENTSmdSections(existing, newContent) {
  const merged = { ...existing };
  
  // Sections to always update/merge
  const alwaysUpdate = ['Project Overview', 'Directory Structure', 'Available Resources'];
  
  // Sections to append to if they exist
  const appendSections = ['Role Guidelines', 'Anti-Patterns to Avoid', 'Tips for Success'];
  
  // Critical section that must be added if missing
  const criticalSections = ['Memory System Navigation'];
  
  for (const [section, content] of Object.entries(newContent)) {
    if (alwaysUpdate.includes(section)) {
      // Intelligently merge these sections
      if (merged[section]) {
        // Preserve custom content but add our critical parts
        if (section === 'Project Overview') {
          // Add technology info if not present
          if (!merged[section].includes('Key Technologies:') && content.includes('Key Technologies:')) {
            merged[section] += '\n\n' + content.split('\n').filter(line => 
              line.includes('Technologies:') || 
              line.includes('Frameworks:') || 
              line.includes('Features:')
            ).join('\n');
          }
        } else if (section === 'Directory Structure') {
          // Ensure .ai/memory is documented
          if (!merged[section].includes('.ai/memory')) {
            merged[section] += '\n' + content.split('\n').filter(line => 
              line.includes('.ai/') || 
              line.includes('memory')
            ).join('\n');
          }
        }
      } else {
        merged[section] = content;
      }
    } else if (criticalSections.includes(section)) {
      // Always ensure critical sections exist
      if (!merged[section]) {
        merged[section] = content;
      } else {
        // Enhance existing with our memory navigation if not present
        if (!merged[section].includes('.ai/memory')) {
          merged[section] = content + '\n\n' + merged[section];
        }
      }
    } else if (appendSections.includes(section)) {
      // Append new content to existing
      if (merged[section]) {
        // Check if content is not already there
        const newItems = content.split('\n').filter(line => 
          !merged[section].includes(line.replace(/^[#\-*\s]+/, '').trim())
        );
        if (newItems.length > 0) {
          merged[section] += '\n\n' + newItems.join('\n');
        }
      } else {
        merged[section] = content;
      }
    } else if (!merged[section]) {
      // Add new sections that don't exist
      merged[section] = content;
    }
  }
  
  return merged;
}

function rebuildAGENTSmd(sections) {
  // Preferred section order
  const sectionOrder = [
    'Project Overview',
    'Directory Structure',
    'Memory System Navigation',
    'Role Guidelines',
    'Workflow Patterns',
    'Testing Procedures',
    'Available Resources',
    'Cross-Platform Considerations',
    'Anti-Patterns to Avoid',
    'Tips for Success'
  ];
  
  let content = '# AGENTS.md - Repository Guidelines\n\n';
  
  // Add sections in preferred order
  for (const sectionName of sectionOrder) {
    if (sections[sectionName]) {
      content += `## ${sectionName}\n\n`;
      content += sections[sectionName];
      content += '\n\n';
    }
  }
  
  // Add any remaining sections not in our order
  for (const [sectionName, sectionContent] of Object.entries(sections)) {
    if (!sectionOrder.includes(sectionName)) {
      content += `## ${sectionName}\n\n`;
      content += sectionContent;
      content += '\n\n';
    }
  }
  
  return content.trim() + '\n';
}

function createAGENTSmd(projectType, projectAnalysis, agents, mcpServers) {
  const agentsPath = 'AGENTS.md';
  
  // Build AGENTS.md content
  let content = `# AGENTS.md - Repository Guidelines\n\n`;
  content += `## Project Overview\n\n`;
  content += `${projectType || 'Unknown project type'}\n\n`;
  
  // Add key technologies and frameworks
  if (projectAnalysis) {
    if (projectAnalysis.technologies.length > 0) {
      content += `**Key Technologies**: ${projectAnalysis.technologies.join(', ')}\n`;
    }
    if (projectAnalysis.frameworks.length > 0) {
      content += `**Frameworks**: ${projectAnalysis.frameworks.join(', ')}\n`;
    }
    if (projectAnalysis.features.length > 0) {
      content += `**Features**: ${projectAnalysis.features.slice(0, 5).join(', ')}\n`;
    }
    if (projectAnalysis.monorepo) {
      content += `**Architecture**: Monorepo with ${projectAnalysis.packageCount} packages\n`;
    }
    content += `\n`;
  }
  
  // Directory structure
  content += `## Directory Structure\n\n`;
  content += `\`\`\`\n`;
  content += `.claude/              # Claude-specific configuration\n`;
  content += `├── agents/          # Project agents\n`;
  content += `├── tasks/           # Session contexts\n`;
  content += `└── doc/             # Agent plans\n`;
  content += `.chatgpt/            # OpenAI-specific configuration\n`;
  content += `├── roles/           # Agent role instructions\n`;
  content += `└── bundles/         # Optimized file bundles\n`;
  content += `.ai/\n`;
  content += `└── memory/          # Unified persistent knowledge base\n`;
  content += `    ├── project.md   # Project-wide context\n`;
  content += `    ├── patterns/    # Successful implementation patterns\n`;
  content += `    └── decisions/   # Architectural Decision Records\n`;
  content += `\`\`\`\n\n`;
  
  // Memory System Navigation
  content += `## Memory System Navigation\n\n`;
  content += `**IMPORTANT**: Always check the memory system before implementing new features:\n\n`;
  content += `1. **Project Context**: Review \`.ai/memory/project.md\` for conventions\n`;
  content += `2. **Patterns**: Check \`.ai/memory/patterns/\` for existing solutions\n`;
  content += `3. **Decisions**: Reference \`.ai/memory/decisions/\` for architectural choices\n`;
  content += `4. **Session Context**: Check \`.claude/tasks/context_session_*.md\` for current work\n\n`;
  
  // Role Guidelines based on agents
  content += `## Role Guidelines\n\n`;
  
  if (agents && agents.length > 0) {
    agents.forEach(agent => {
      const roleName = agent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const triggers = agent.split('-').join(', ');
      
      content += `### ${roleName}\n`;
      content += `**Triggers**: ${triggers}\n\n`;
      content += `**Approach**:\n`;
      content += `1. Check memory system for patterns\n`;
      content += `2. Review existing implementations\n`;
      content += `3. Plan implementation approach\n`;
      content += `4. Validate with tests\n`;
      content += `5. Document successful patterns\n\n`;
    });
  }
  
  // Workflow Patterns
  content += `## Workflow Patterns\n\n`;
  content += `### Research-Plan-Execute\n`;
  content += `1. **Research**: Analyze codebase, check memory, review patterns\n`;
  content += `2. **Plan**: Create detailed implementation plan\n`;
  content += `3. **Execute**: Implement with validation\n`;
  content += `4. **Document**: Update memory with successful patterns\n\n`;
  
  // Testing Procedures
  content += `## Testing Procedures\n\n`;
  content += `Always run before commits:\n`;
  content += `\`\`\`bash\n`;
  content += `npm test        # Run all tests\n`;
  content += `npm run lint    # Check code style\n`;
  content += `npm run typecheck # Type validation\n`;
  content += `\`\`\`\n\n`;
  
  // MCP Server Integration
  if (mcpServers && mcpServers.length > 0) {
    content += `## Available Resources\n\n`;
    content += `The following resources are available:\n`;
    mcpServers.forEach(server => {
      content += `- **${server}**: `;;
      if (server === 'Context7') content += 'Latest documentation lookup\n';
      else if (server === 'Sequential') content += 'Complex reasoning and analysis\n';
      else if (server === 'Magic') content += 'UI component generation\n';
      else if (server === 'Playwright') content += 'Browser automation and testing\n';
      else if (server === 'AWS') content += 'AWS service integration\n';
      else if (server === 'WebSearch') content += 'Web search capabilities\n';
      else content += 'Specialized capabilities\n';
    });
    content += `\n`;
  }
  
  // Cross-Platform Considerations
  content += `## Cross-Platform Considerations\n\n`;
  content += `- Ensure compatibility between Claude and ChatGPT\n`;
  content += `- Keep memory system platform-agnostic\n`;
  content += `- Document patterns that work across platforms\n`;
  content += `- Use \`.chatgpt/roles/\` for ChatGPT-specific instructions\n\n`;
  
  // Anti-Patterns
  content += `## Anti-Patterns to Avoid\n\n`;
  content += `- ❌ Implementing without checking memory first\n`;
  content += `- ❌ Creating platform-specific silos\n`;
  content += `- ❌ Skipping test validation\n`;
  content += `- ❌ Forgetting to document patterns\n`;
  content += `- ❌ Ignoring session context\n\n`;
  
  // Tips for Success
  content += `## Tips for Success\n\n`;
  content += `- ✅ Memory first: Always check existing patterns\n`;
  content += `- ✅ Test everything: Validate before committing\n`;
  content += `- ✅ Document wins: Save successful patterns\n`;
  content += `- ✅ Stay synchronized: Keep configs in sync\n`;
  content += `- ✅ Think cross-platform: Solutions should work everywhere\n`;
  
  fs.writeFileSync(agentsPath, content);
  return agentsPath;
}

function setupEnvironment(variant, agents, mcpServers, ciOptions = {}, playwrightOptions = {}, projectType = 'Unknown', projectAnalysis = null, customAgentsToCreate = [], codexRolesToCreate = [], agentsMdAction = 'skip') {
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
    projectType,
    projectAnalysis: projectAnalysis ? {
      monorepo: projectAnalysis.monorepo,
      packageCount: projectAnalysis.packages.length,
      packages: projectAnalysis.packages,
      technologies: Array.from(projectAnalysis.technologies),
      frameworks: Array.from(projectAnalysis.frameworks),
      features: Array.from(projectAnalysis.features)
    } : null,
    // Queue items for Claude to handle during init
    queuedForCreation: {
      customAgents: customAgentsToCreate || [],
      codexRoles: codexRolesToCreate || [],
      agentsMd: agentsMdAction || 'skip',
      needsProcessing: (customAgentsToCreate && customAgentsToCreate.length > 0) || 
                       (codexRolesToCreate && codexRolesToCreate.length > 0) ||
                       (agentsMdAction && agentsMdAction !== 'skip')
    },
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(chalk.green('✓ Configuration saved to .claude/config.json'));
  
  // Display AGENTS.md queue status
  if (config.queuedForCreation.agentsMd && config.queuedForCreation.agentsMd !== 'skip') {
    console.log(chalk.yellow('\n📄 AGENTS.md Handling:'));
    if (config.queuedForCreation.agentsMd === 'update') {
      console.log(chalk.gray('  Claude will intelligently update existing AGENTS.md during init'));
      console.log(chalk.gray('  - Preserve custom sections'));
      console.log(chalk.gray('  - Add memory system navigation'));
      console.log(chalk.gray('  - Update with detected technologies'));
    } else if (config.queuedForCreation.agentsMd === 'create') {
      console.log(chalk.gray('  Claude will create AGENTS.md during init'));
      console.log(chalk.gray('  - Include memory system instructions'));
      console.log(chalk.gray('  - Add role guidelines'));
      console.log(chalk.gray('  - Configure for ChatGPT/Codex'));
    }
  }
  
  // Create custom agents if requested
  if (customAgentsToCreate && customAgentsToCreate.length > 0) {
    console.log(chalk.yellow('\n🤖 Creating custom agents...'));
    customAgentsToCreate.forEach(agentName => {
      const agentPath = createCustomAgent(agentName, projectAnalysis);
      console.log(chalk.green(`✓ Created custom agent: ${agentPath}`));
      agents.push(agentName); // Add to agents list
    });
    
    // Update config with new agents
    config.agents = agents;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  
  // Create Codex roles if requested
  if (codexRolesToCreate && codexRolesToCreate.length > 0) {
    console.log(chalk.yellow('\n📄 Creating ChatGPT/Codex roles...'));
    
    // Create manifest for Codex roles
    const manifestPath = path.join('.chatgpt', 'roles', 'manifest.json');
    const manifest = {
      version: '1.0.0',
      description: 'Codex-optimized roles matching Claude agents',
      roles: [],
      created: new Date().toISOString()
    };
    
    codexRolesToCreate.forEach(agentName => {
      const rolePath = createCodexRole(agentName, projectAnalysis);
      console.log(chalk.green(`✓ Created Codex role: ${rolePath}`));
      manifest.roles.push({
        name: agentName,
        file: `${agentName}.md`,
        description: `${agentName.replace(/-/g, ' ')} specialist role`
      });
    });
    
    // Write manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(chalk.green(`✓ Created roles manifest: ${manifestPath}`));
    
    // Create a combined AGENTS.md file for Codex
    const agentsmdPath = path.join('.chatgpt', 'AGENTS.md');
    let agentsContent = '# Agent Roles for ChatGPT/Codex\n\n';
    agentsContent += 'This file contains all agent role definitions for use with ChatGPT and Codex.\n\n';
    agentsContent += '## Usage\n';
    agentsContent += '1. Copy the role definition you need\n';
    agentsContent += '2. Use as custom instructions in ChatGPT\n';
    agentsContent += '3. Or include in your Codex configuration\n\n';
    agentsContent += '---\n\n';
    
    codexRolesToCreate.forEach(agentName => {
      const roleContent = fs.readFileSync(path.join('.chatgpt', 'roles', `${agentName}.md`), 'utf8');
      agentsContent += roleContent;
      agentsContent += '\n---\n\n';
    });
    
    fs.writeFileSync(agentsmdPath, agentsContent);
    console.log(chalk.green(`✓ Created combined AGENTS.md: ${agentsmdPath}`));
  }
  
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