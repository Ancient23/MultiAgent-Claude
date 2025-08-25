// Visual CI Commands for MultiAgent-Claude
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { VercelPreviewDetector } = require('../utils/vercel-preview');
const readline = require('readline');

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function setupCommand() {
  console.log(chalk.blue('\n🚀 Visual CI Testing Setup\n'));
  
  const config = {
    deployment: {},
    visualTesting: {}
  };
  
  // Deployment provider
  console.log(chalk.cyan('Select deployment provider:'));
  console.log('  1. Vercel (automatic preview URL detection)');
  console.log('  2. Custom (provide your own detection script)');
  console.log('  3. Manual (specify URL in GitHub secrets)');
  console.log('  4. None (use localhost for testing)');
  
  const providerChoice = await question('Choice (1-4): ');
  const providers = ['vercel', 'custom', 'manual', 'none'];
  config.deployment.provider = providers[parseInt(providerChoice) - 1] || 'none';
  
  // Provider-specific configuration
  if (config.deployment.provider === 'vercel') {
    config.deployment.autoDetect = (await question('Enable automatic preview URL detection? (y/n): ')).toLowerCase() === 'y';
    
    if (!config.deployment.autoDetect) {
      config.deployment.vercel = {
        projectName: await question('Vercel project name (optional): ') || null,
        teamId: await question('Vercel team ID (optional): ') || null
      };
    }
  } else if (config.deployment.provider === 'manual') {
    const manualUrl = await question('Default deployment URL (can be overridden in GitHub secrets): ');
    if (manualUrl) {
      config.deployment.fallbackUrl = manualUrl;
    }
  } else if (config.deployment.provider === 'custom') {
    config.deployment.customScript = await question('Path to custom detection script: ') || null;
  }
  
  // Fallback configuration
  config.deployment.fallbackUrl = config.deployment.fallbackUrl || 
    await question('Fallback URL if detection fails (default: http://localhost:3000): ') || 
    'http://localhost:3000';
  
  // Timeout settings
  const waitTimeout = await question('Max wait time for deployment (ms, default: 300000): ');
  config.deployment.waitTimeout = waitTimeout ? parseInt(waitTimeout) : 300000;
  
  const retryInterval = await question('Retry interval (ms, default: 5000): ');
  config.deployment.retryInterval = retryInterval ? parseInt(retryInterval) : 5000;
  
  // Visual testing configuration
  console.log(chalk.cyan('\nVisual Testing Configuration:'));
  
  config.visualTesting.enableOnCI = (await question('Enable visual regression testing on CI? (y/n): ')).toLowerCase() === 'y';
  
  if (config.visualTesting.enableOnCI) {
    // Viewports
    console.log('\nSelect viewports to test (comma-separated):');
    console.log('  Available: mobile, tablet, desktop, wide');
    const viewports = await question('Viewports (default: mobile,desktop): ') || 'mobile,desktop';
    config.visualTesting.viewports = viewports.split(',').map(v => v.trim());
    
    // Threshold
    const threshold = await question('Visual diff threshold (0-1, default: 0.05): ');
    config.visualTesting.threshold = threshold ? parseFloat(threshold) : 0.05;
    
    // Baseline strategy
    console.log('\nBaseline update strategy:');
    console.log('  1. Update on main branch only');
    console.log('  2. Update on specific branches');
    console.log('  3. Never auto-update (manual only)');
    const baselineChoice = await question('Choice (1-3): ');
    
    if (baselineChoice === '1') {
      config.visualTesting.baselineStrategy = 'main-only';
    } else if (baselineChoice === '2') {
      const branches = await question('Branches to update baselines (comma-separated): ');
      config.visualTesting.baselineStrategy = 'branches';
      config.visualTesting.baselineBranches = branches.split(',').map(b => b.trim());
    } else {
      config.visualTesting.baselineStrategy = 'manual';
    }
  }
  
  // Save configuration
  const configPath = path.join('.claude', 'config', 'deployment.json');
  
  if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(chalk.green('\n✅ Visual CI configuration saved to .claude/config/deployment.json'));
  
  // Show GitHub secrets needed
  console.log(chalk.blue('\n📝 GitHub Secrets to Configure:'));
  
  if (config.deployment.provider === 'vercel') {
    console.log(chalk.yellow('  VERCEL_TOKEN - Optional, for enhanced API access'));
  }
  
  if (config.deployment.provider === 'manual') {
    console.log(chalk.yellow('  DEPLOYMENT_URL - The deployment URL for testing'));
  }
  
  console.log(chalk.yellow('  BASE_URL - Fallback URL if no deployment detected'));
  
  console.log(chalk.cyan('\n💡 Next Steps:'));
  console.log('  1. Add the required secrets to your GitHub repository');
  console.log('  2. Ensure your workflow includes the deployment detection job');
  console.log('  3. Run "mac visual:detect-url" to test detection locally');
}

async function detectUrlCommand() {
  console.log(chalk.blue('\n🔍 Testing Deployment URL Detection\n'));
  
  // Load configuration
  const configPath = path.join('.claude', 'config', 'deployment.json');
  let config = {};
  
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(chalk.gray('Loaded configuration from .claude/config/deployment.json'));
  } else {
    console.log(chalk.yellow('No configuration found. Using defaults.'));
  }
  
  const detector = new VercelPreviewDetector({
    debug: true,
    waitTimeout: config.deployment?.waitTimeout || 300000,
    retryInterval: config.deployment?.retryInterval || 5000
  });
  
  // Check environment first
  console.log(chalk.cyan('Checking environment variables...'));
  const envUrl = await detector.detectFromEnvironment();
  
  if (envUrl) {
    console.log(chalk.green(`✅ Found URL from environment: ${envUrl}`));
    
    // Test if it's accessible
    console.log(chalk.cyan('\nTesting URL accessibility...'));
    const result = await detector.waitForDeployment(envUrl, { timeout: 30000 });
    
    if (result.ready) {
      console.log(chalk.green(`✅ URL is accessible! Response time: ${result.responseTime}ms`));
    } else {
      console.log(chalk.yellow('⚠️ URL not accessible within timeout'));
    }
    
    return;
  }
  
  // Manual PR detection
  const owner = await question('GitHub repository owner: ');
  const repo = await question('Repository name: ');
  const prNumber = await question('Pull request number: ');
  
  if (owner && repo && prNumber) {
    console.log(chalk.cyan('\nDetecting deployment URL...'));
    
    try {
      const url = await detector.detectFromPR(owner, repo, prNumber);
      
      if (url) {
        console.log(chalk.green(`✅ Found deployment URL: ${url}`));
        
        // Test accessibility
        console.log(chalk.cyan('\nTesting URL accessibility...'));
        const result = await detector.waitForDeployment(url, { timeout: 30000 });
        
        if (result.ready) {
          console.log(chalk.green(`✅ URL is accessible! Response time: ${result.responseTime}ms`));
        } else {
          console.log(chalk.yellow('⚠️ URL not accessible within timeout'));
        }
      } else {
        console.log(chalk.yellow('⚠️ No deployment URL found for this PR'));
        console.log(chalk.gray('\nPossible reasons:'));
        console.log(chalk.gray('  - PR has no Vercel deployment'));
        console.log(chalk.gray('  - Vercel bot has not commented yet'));
        console.log(chalk.gray('  - Different deployment provider is used'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  }
}

async function statusCommand() {
  console.log(chalk.blue('\n📊 Visual CI Configuration Status\n'));
  
  const configPath = path.join('.claude', 'config', 'deployment.json');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.yellow('⚠️ No deployment configuration found'));
    console.log(chalk.gray('Run "mac visual:ci-setup" to configure'));
    return;
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log(chalk.cyan('Deployment Configuration:'));
  console.log(`  Provider: ${chalk.green(config.deployment.provider)}`);
  
  if (config.deployment.provider === 'vercel') {
    console.log(`  Auto-detect: ${config.deployment.autoDetect ? chalk.green('Enabled') : chalk.yellow('Disabled')}`);
    if (config.deployment.vercel?.projectName) {
      console.log(`  Project: ${config.deployment.vercel.projectName}`);
    }
  }
  
  console.log(`  Fallback URL: ${config.deployment.fallbackUrl}`);
  console.log(`  Wait timeout: ${config.deployment.waitTimeout}ms`);
  console.log(`  Retry interval: ${config.deployment.retryInterval}ms`);
  
  console.log(chalk.cyan('\nVisual Testing Configuration:'));
  console.log(`  Enabled on CI: ${config.visualTesting.enableOnCI ? chalk.green('Yes') : chalk.yellow('No')}`);
  
  if (config.visualTesting.enableOnCI) {
    console.log(`  Viewports: ${config.visualTesting.viewports.join(', ')}`);
    console.log(`  Threshold: ${(config.visualTesting.threshold * 100).toFixed(1)}%`);
    console.log(`  Baseline strategy: ${config.visualTesting.baselineStrategy}`);
    
    if (config.visualTesting.baselineBranches) {
      console.log(`  Baseline branches: ${config.visualTesting.baselineBranches.join(', ')}`);
    }
  }
  
  // Check workflow files
  console.log(chalk.cyan('\nWorkflow Files:'));
  
  const workflowPath = path.join('.github', 'workflows', 'playwright-web-tests.yml');
  if (fs.existsSync(workflowPath)) {
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    const hasDetection = workflow.includes('detect-deployment');
    console.log(`  playwright-web-tests.yml: ${chalk.green('✓')} ${hasDetection ? '(with deployment detection)' : '(no deployment detection)'}`);
  } else {
    console.log(`  playwright-web-tests.yml: ${chalk.red('✗')} Not found`);
  }
}

module.exports = {
  setupCommand,
  detectUrlCommand,
  statusCommand
};