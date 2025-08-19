const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function initPlaywright() {
  console.log(chalk.blue('\n🎭 Initializing Playwright Testing Environment\n'));

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error(chalk.red('No package.json found. Please run npm init first.'));
    process.exit(1);
  }

  console.log(chalk.yellow('Configuring Playwright testing options...\n'));

  // Test types selection
  console.log(chalk.cyan('Select test types to enable:'));
  const testTypes = {
    e2e: (await question('E2E Testing (user journeys)? (y/n): ')).toLowerCase() === 'y',
    visual: (await question('Visual Regression Testing? (y/n): ')).toLowerCase() === 'y',
    interaction: (await question('Interaction Testing (forms, clicks)? (y/n): ')).toLowerCase() === 'y',
    accessibility: (await question('Accessibility Testing (WCAG)? (y/n): ')).toLowerCase() === 'y',
    performance: (await question('Performance Testing (Core Web Vitals)? (y/n): ')).toLowerCase() === 'y'
  };

  // Browser selection
  console.log(chalk.cyan('\nSelect browsers to test:'));
  const browsers = {
    chromium: (await question('Chrome/Chromium? (y/n): ')).toLowerCase() === 'y',
    firefox: (await question('Firefox? (y/n): ')).toLowerCase() === 'y',
    webkit: (await question('Safari/WebKit? (y/n): ')).toLowerCase() === 'y',
    mobile: (await question('Mobile browsers? (y/n): ')).toLowerCase() === 'y'
  };

  // CI configuration
  console.log(chalk.cyan('\nCI/CD Configuration:'));
  const ci = {
    enabled: (await question('Enable GitHub Actions workflow? (y/n): ')).toLowerCase() === 'y',
    parallelShards: parseInt(await question('Number of parallel shards (1-10): ') || '4'),
    retries: parseInt(await question('Retry attempts for flaky tests (0-3): ') || '2'),
    schedule: (await question('Run daily regression tests? (y/n): ')).toLowerCase() === 'y'
  };

  rl.close();

  // Create directory structure
  console.log(chalk.yellow('\n📁 Creating directory structure...'));
  
  const dirs = [
    '.playwright/tests/e2e',
    '.playwright/tests/visual',
    '.playwright/tests/interaction',
    '.playwright/tests/accessibility',
    '.playwright/baseline',
    '.playwright/fixtures',
    '.playwright/page-objects',
    '.playwright/config',
    '.claude/memory/test-results'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(chalk.green(`  ✓ Created ${dir}`));
    }
  });

  // Create Playwright config
  console.log(chalk.yellow('\n📝 Creating Playwright configuration...'));
  
  const playwrightConfig = generatePlaywrightConfig(testTypes, browsers, ci);
  fs.writeFileSync('playwright.config.ts', playwrightConfig);
  console.log(chalk.green('  ✓ Created playwright.config.ts'));

  // Create CI workflow if enabled
  if (ci.enabled) {
    console.log(chalk.yellow('\n🚀 Creating GitHub Actions workflow...'));
    
    if (!fs.existsSync('.github/workflows')) {
      fs.mkdirSync('.github/workflows', { recursive: true });
    }
    
    const workflow = generateGitHubWorkflow(ci);
    fs.writeFileSync('.github/workflows/playwright-tests.yml', workflow);
    console.log(chalk.green('  ✓ Created .github/workflows/playwright-tests.yml'));
  }

  // Install Playwright
  console.log(chalk.yellow('\n📦 Installing Playwright...'));
  
  try {
    execSync('npm install --save-dev @playwright/test', { stdio: 'inherit' });
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log(chalk.green('  ✓ Playwright installed successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to install Playwright:'), error.message);
  }

  // Update package.json scripts
  updatePackageJsonScripts();

  console.log(chalk.green('\n✅ Playwright testing environment initialized!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.gray('1. Generate tests: ') + chalk.cyan('multiagent-claude playwright generate-tests'));
  console.log(chalk.gray('2. Run tests: ') + chalk.cyan('npm run test:e2e'));
  console.log(chalk.gray('3. View UI: ') + chalk.cyan('npm run test:e2e:ui'));
}

function generatePlaywrightConfig(testTypes, browsers, ci) {
  const projects = [];
  
  if (browsers.chromium) {
    projects.push(`{
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }`);
  }
  
  if (browsers.firefox) {
    projects.push(`{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }`);
  }
  
  if (browsers.webkit) {
    projects.push(`{
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }`);
  }
  
  if (browsers.mobile) {
    projects.push(`{
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }`,
    `{
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }`);
  }

  return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './.playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? ${ci.retries} : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: '.claude/memory/test-results/latest.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    ${projects.join(',\n    ')}
  ],
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`;
}

function generateGitHubWorkflow(ci) {
  const schedule = ci.schedule ? `
  schedule:
    - cron: '0 0 * * *'  # Daily regression test` : '';

  return `name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]${schedule}

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [${Array.from({length: ci.parallelShards}, (_, i) => i + 1).join(', ')}]
        shardTotal: [${ci.parallelShards}]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
        env:
          BASE_URL: \${{ secrets.BASE_URL || 'http://localhost:3000' }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-\${{ matrix.shardIndex }}
          path: playwright-report/
          retention-days: 30`;
}

function updatePackageJsonScripts() {
  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'test:e2e': 'playwright test',
    'test:e2e:ui': 'playwright test --ui',
    'test:e2e:debug': 'playwright test --debug',
    'test:visual': 'playwright test .playwright/tests/visual',
    'test:update-snapshots': 'playwright test --update-snapshots',
    'test:report': 'playwright show-report',
    'playwright:codegen': 'playwright codegen'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green('  ✓ Updated package.json scripts'));
}

async function generateTests() {
  console.log(chalk.blue('\n🧪 Generating Playwright Tests\n'));

  const url = await question(chalk.cyan('Enter the URL to generate tests from: '));
  const testName = await question(chalk.cyan('Enter test name (e.g., login-flow): '));
  
  rl.close();

  const outputPath = `.playwright/tests/e2e/${testName}.spec.ts`;
  
  console.log(chalk.yellow('\n🎬 Opening Playwright Test Generator...'));
  console.log(chalk.gray('  - Interact with your application'));
  console.log(chalk.gray('  - Playwright will record your actions'));
  console.log(chalk.gray('  - Close the browser when done'));
  
  try {
    execSync(`npx playwright codegen ${url} -o ${outputPath}`, { stdio: 'inherit' });
    console.log(chalk.green(`\n✅ Test generated at ${outputPath}`));
  } catch (error) {
    console.error(chalk.red('Failed to generate test:'), error.message);
  }
}

async function addVisualTests() {
  console.log(chalk.blue('\n📸 Adding Visual Regression Tests\n'));

  const pages = await question(chalk.cyan('Enter pages to test (comma-separated, e.g., home,about,pricing): '));
  
  rl.close();

  const pageList = pages.split(',').map(p => p.trim());
  
  const visualTest = `import { test, expect } from '@playwright/test';

const pages = ${JSON.stringify(pageList.map(name => ({ name, path: `/${name === 'home' ? '' : name}` })), null, 2)};

test.describe('Visual Regression Tests', () => {
  for (const page of pages) {
    test(\`\${page.name} page visual consistency\`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(page.path);
      await playwrightPage.waitForLoadState('networkidle');
      
      // Full page screenshot
      await expect(playwrightPage).toHaveScreenshot(\`\${page.name}-full.png\`, {
        fullPage: true,
        animations: 'disabled',
      });
      
      // Mobile viewport
      await playwrightPage.setViewportSize({ width: 375, height: 667 });
      await expect(playwrightPage).toHaveScreenshot(\`\${page.name}-mobile.png\`);
    });
  }
});`;

  const outputPath = '.playwright/tests/visual/visual-regression.spec.ts';
  fs.writeFileSync(outputPath, visualTest);
  
  console.log(chalk.green(`✅ Visual tests created at ${outputPath}`));
  console.log(chalk.yellow('\nTo create baselines, run:'));
  console.log(chalk.cyan('  npm run test:update-snapshots'));
}

async function setupCI() {
  console.log(chalk.blue('\n⚙️ Setting up CI/CD for Playwright\n'));

  if (!fs.existsSync('.github/workflows')) {
    fs.mkdirSync('.github/workflows', { recursive: true });
  }

  const browsers = await question(chalk.cyan('Browsers to test in CI (comma-separated, e.g., chrome,firefox): '));
  const parallel = await question(chalk.cyan('Number of parallel jobs (1-10): ')) || '4';
  
  rl.close();

  const workflow = generateGitHubWorkflow({ 
    parallelShards: parseInt(parallel), 
    retries: 2,
    schedule: false 
  });
  
  fs.writeFileSync('.github/workflows/playwright-tests.yml', workflow);
  
  console.log(chalk.green('✅ CI/CD workflow created at .github/workflows/playwright-tests.yml'));
  console.log(chalk.yellow('\nWorkflow will run on:'));
  console.log(chalk.gray('  - Push to main/develop branches'));
  console.log(chalk.gray('  - Pull requests to main branch'));
}

function execute(action, options) {
  switch(action) {
    case 'init':
      initPlaywright();
      break;
    case 'generate-tests':
      generateTests();
      break;
    case 'add-visual-tests':
      addVisualTests();
      break;
    case 'setup-ci':
      setupCI();
      break;
    default:
      console.error(chalk.red(`Unknown action: ${action}`));
      console.log(chalk.gray('Available actions: init, generate-tests, add-visual-tests, setup-ci'));
  }
}

module.exports = { execute };