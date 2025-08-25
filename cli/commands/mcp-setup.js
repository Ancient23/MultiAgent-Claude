const inquirer = require('inquirer').default;
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupVisualDevelopment() {
  console.log(chalk.cyan('\n🎨 Visual Development Setup Wizard\n'));
  console.log(chalk.gray('This wizard will configure your project for pixel-perfect visual development.'));
  console.log(chalk.gray('Using Playwright MCP for real-time browser control and iteration.\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installPlaywright',
      message: 'Install Playwright MCP server for browser automation?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createMockDirectory',
      message: 'Create mock directory structure for design references?',
      default: true
    },
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project are you building?',
      choices: [
        { name: 'React Application', value: 'react' },
        { name: 'Vue.js Application', value: 'vue' },
        { name: 'Next.js Application', value: 'nextjs' },
        { name: 'Static HTML/CSS', value: 'static' },
        { name: 'Component Library', value: 'components' },
        { name: 'Electron Application', value: 'electron' },
        { name: 'Other/Custom', value: 'custom' }
      ],
      default: 'react'
    },
    {
      type: 'input',
      name: 'devServerUrl',
      message: 'Development server URL:',
      default: 'http://localhost:3000',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL (e.g., http://localhost:3000)';
        }
      }
    },
    {
      type: 'number',
      name: 'devServerPort',
      message: 'Development server port:',
      default: 3000,
      validate: (input) => {
        const port = parseInt(input);
        if (port >= 1 && port <= 65535) {
          return true;
        }
        return 'Please enter a valid port number (1-65535)';
      }
    },
    {
      type: 'checkbox',
      name: 'viewports',
      message: 'Select viewports to test:',
      choices: [
        { name: 'Mobile (375x667)', value: 'mobile', checked: true },
        { name: 'Mobile Large (428x926)', value: 'mobile-large', checked: false },
        { name: 'Tablet (768x1024)', value: 'tablet', checked: true },
        { name: 'Desktop (1920x1080)', value: 'desktop', checked: true },
        { name: 'Wide (2560x1440)', value: 'wide', checked: false },
        { name: 'Ultra-Wide (3440x1440)', value: 'ultrawide', checked: false }
      ]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select additional features:',
      choices: [
        { name: 'Visual Regression Testing', value: 'regression', checked: true },
        { name: 'Responsive Design Testing', value: 'responsive', checked: true },
        { name: 'Component State Testing', value: 'states', checked: true },
        { name: 'Accessibility Testing', value: 'a11y', checked: false },
        { name: 'Performance Metrics', value: 'performance', checked: false },
        { name: 'CI/CD Integration', value: 'ci', checked: false }
      ]
    },
    {
      type: 'number',
      name: 'threshold',
      message: 'Visual difference threshold (% of pixels):',
      default: 5,
      validate: (input) => {
        const threshold = parseFloat(input);
        if (threshold >= 0 && threshold <= 100) {
          return true;
        }
        return 'Please enter a percentage between 0 and 100';
      }
    },
    {
      type: 'number',
      name: 'maxIterations',
      message: 'Maximum iterations per component:',
      default: 10,
      validate: (input) => {
        const iterations = parseInt(input);
        if (iterations >= 1 && iterations <= 50) {
          return true;
        }
        return 'Please enter a number between 1 and 50';
      }
    }
  ]);
  
  // Install Playwright MCP if requested
  if (answers.installPlaywright) {
    await installPlaywrightMCP();
  }
  
  // Create directory structure
  if (answers.createMockDirectory) {
    await createVisualDirectoryStructure(answers.projectType);
  }
  
  // Generate configurations based on project type
  await generateConfigurations(answers);
  
  // Create test utilities
  await createTestUtilities(answers);
  
  // Create example tests
  await createExampleTests(answers);
  
  // Setup CI/CD if requested
  if (answers.features.includes('ci')) {
    await setupCICD(answers);
  }
  
  // Update package.json
  await updatePackageJson(answers);
  
  // Create visual command
  await createVisualIterateCommand(answers);
  
  // Generate final report
  console.log(chalk.green('\n✅ Visual development environment successfully configured!\n'));
  console.log(chalk.cyan('📋 Configuration Summary:'));
  console.log(chalk.gray(`  • Project Type: ${answers.projectType}`));
  console.log(chalk.gray(`  • Dev Server: ${answers.devServerUrl}`));
  console.log(chalk.gray(`  • Viewports: ${answers.viewports.join(', ')}`));
  console.log(chalk.gray(`  • Threshold: ${answers.threshold}%`));
  console.log(chalk.gray(`  • Max Iterations: ${answers.maxIterations}`));
  
  console.log(chalk.cyan('\n🚀 Quick Start:'));
  console.log(chalk.white('  1. Add design mocks to .claude/mocks/'));
  console.log(chalk.white('  2. Start dev server: npm run dev'));
  console.log(chalk.white('  3. Run visual setup: npm run visual:setup'));
  console.log(chalk.white('  4. Tell Claude: /visual-iterate [component-name]'));
  
  console.log(chalk.cyan('\n📚 Available Commands:'));
  console.log(chalk.gray('  • npm run visual:test - Run visual tests'));
  console.log(chalk.gray('  • npm run visual:test:ui - Interactive test UI'));
  console.log(chalk.gray('  • npm run visual:update - Update baselines'));
  console.log(chalk.gray('  • npm run visual:report - View test reports'));
  console.log(chalk.gray('  • npm run visual:compare - Compare images'));
  
  console.log(chalk.yellow('\n🎯 Goal: Achieve < ' + answers.threshold + '% visual difference'));
}

async function installPlaywrightMCP() {
  console.log(chalk.blue('\n📦 Installing Playwright MCP server...'));
  
  try {
    // Check if already installed
    try {
      execSync('npm list @playwright/test', { stdio: 'ignore' });
      console.log(chalk.gray('  ✓ Playwright already installed'));
    } catch {
      // Install Playwright
      console.log(chalk.gray('  Installing @playwright/test...'));
      execSync('npm install --save-dev @playwright/test', { stdio: 'inherit' });
    }
    
    // Install browsers
    console.log(chalk.gray('  Installing Playwright browsers...'));
    execSync('npx playwright install', { stdio: 'inherit' });
    
    // Setup MCP configuration
    const { setupMCP } = require('./mcp');
    await setupMCP('playwright');
    
    console.log(chalk.green('  ✅ Playwright MCP installed successfully'));
  } catch (error) {
    console.error(chalk.red(`  ❌ Failed to install Playwright: ${error.message}`));
    process.exit(1);
  }
}

async function createVisualDirectoryStructure(projectType) {
  console.log(chalk.blue('\n📁 Creating visual development directories...'));
  
  const directories = {
    base: [
      '.claude/mocks',
      '.claude/mocks/components',
      '.claude/mocks/pages',
      '.claude/mocks/responsive',
      '.claude/visual-iterations',
      '.claude/visual-reports',
      '.claude/visual-sessions',
      '.claude/visual-baselines',
      '.playwright/baseline',
      '.playwright/test-results',
      '.playwright/screenshots',
      '.playwright/reports',
      'tests/visual',
      'tests/visual/components',
      'tests/visual/pages',
      'tests/visual/responsive',
      'tests/fixtures/visual',
      'tests/utils'
    ],
    react: [
      '.claude/mocks/hooks',
      '.claude/mocks/context',
      'tests/visual/hooks'
    ],
    vue: [
      '.claude/mocks/composables',
      '.claude/mocks/stores',
      'tests/visual/composables'
    ],
    nextjs: [
      '.claude/mocks/api',
      '.claude/mocks/app',
      'tests/visual/api',
      'tests/visual/app'
    ],
    components: [
      '.claude/mocks/atoms',
      '.claude/mocks/molecules',
      '.claude/mocks/organisms',
      'tests/visual/atoms',
      'tests/visual/molecules',
      'tests/visual/organisms'
    ],
    electron: [
      '.claude/mocks/main',
      '.claude/mocks/renderer',
      'tests/visual/main',
      'tests/visual/renderer'
    ]
  };
  
  // Create base directories
  for (const dir of directories.base) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.gray(`  ✅ Created ${dir}`));
  }
  
  // Create project-specific directories
  if (directories[projectType]) {
    for (const dir of directories[projectType]) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(chalk.gray(`  ✅ Created ${dir}`));
    }
  }
}

async function generateConfigurations(answers) {
  console.log(chalk.blue('\n⚙️  Generating configuration files...'));
  
  // Visual configuration
  const visualConfig = {
    projectType: answers.projectType,
    devServerUrl: answers.devServerUrl,
    devServerPort: answers.devServerPort,
    iterationGoal: answers.threshold / 100,
    maxIterations: answers.maxIterations,
    viewports: generateViewportConfig(answers.viewports),
    features: answers.features,
    comparisonSettings: {
      threshold: answers.threshold / 100,
      includeAA: true,
      diffMask: true,
      alpha: 0.1,
      aaThreshold: 5,
      diffColor: [255, 0, 0],
      ignoreColors: false,
      ignoreRectangles: []
    },
    sessionSettings: {
      saveAllIterations: true,
      generateReports: true,
      trackHistory: true,
      maxSessionAge: 7,
      autoCleanup: true
    },
    browsers: ['chromium', 'firefox', 'webkit'],
    retries: 2,
    outputFormats: ['png', 'json', 'html'],
    ci: answers.features.includes('ci') ? {
      enabled: true,
      failOnDifference: true,
      updateBaselines: false,
      parallelWorkers: 2
    } : { enabled: false }
  };
  
  fs.writeFileSync(
    '.claude/visual-config.json',
    JSON.stringify(visualConfig, null, 2)
  );
  console.log(chalk.gray('  ✅ Created visual-config.json'));
  
  // Playwright configuration
  await generatePlaywrightConfig(answers);
}

function generateViewportConfig(selectedViewports) {
  const viewportDefinitions = {
    'mobile': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true },
    'mobile-large': { width: 428, height: 926, deviceScaleFactor: 3, isMobile: true },
    'tablet': { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: false },
    'desktop': { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false },
    'wide': { width: 2560, height: 1440, deviceScaleFactor: 1, isMobile: false },
    'ultrawide': { width: 3440, height: 1440, deviceScaleFactor: 1, isMobile: false }
  };
  
  const config = {};
  for (const viewport of selectedViewports) {
    config[viewport] = viewportDefinitions[viewport];
  }
  return config;
}

async function generatePlaywrightConfig(answers) {
  const config = `// playwright-visual.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  outputDir: '.playwright/test-results',
  fullyParallel: ${answers.features.includes('ci') ? 'false' : 'true'},
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? ${answers.features.includes('ci') ? 2 : 1} : undefined,
  
  reporter: [
    ['html', { outputFolder: '.playwright/reports', open: 'never' }],
    ['json', { outputFile: '.playwright/reports/results.json' }],
    ['list'],
    ${answers.features.includes('ci') ? "['github']," : ''}
  ],
  
  use: {
    baseURL: '${answers.devServerUrl}',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: process.env.CI ? 'retain-on-failure' : 'off',
    ${answers.features.includes('a11y') ? 'testIdAttribute: "data-testid",' : ''}
  },

  projects: [
    ${generateProjectConfigs(answers.viewports)}
  ],

  webServer: {
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run dev',
    url: '${answers.devServerUrl}',
    port: ${answers.devServerPort},
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

function generateProjectConfigs(viewports) {
  const configs = [];
  
  if (viewports.includes('desktop')) {
    configs.push(`{
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    }`);
  }
  
  if (viewports.includes('mobile')) {
    configs.push(`{
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    }`);
  }
  
  if (viewports.includes('tablet')) {
    configs.push(`{
      name: 'tablet-safari',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      },
    }`);
  }
  
  return configs.join(',\n    ');
}`;
  
  fs.writeFileSync('playwright-visual.config.js', config);
  console.log(chalk.gray('  ✅ Created playwright-visual.config.js'));
}

async function createTestUtilities(answers) {
  console.log(chalk.blue('\n🛠️  Creating test utilities...'));
  
  const visualCompareUtils = `// Visual Comparison Utilities
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

export class VisualComparer {
  constructor(config = {}) {
    this.threshold = config.threshold || ${answers.threshold / 100};
    this.config = config;
  }

  async compareImages(actualPath, expectedPath, options = {}) {
    const actual = PNG.sync.read(await fs.promises.readFile(actualPath));
    const expected = PNG.sync.read(await fs.promises.readFile(expectedPath));
    
    const { width, height } = actual;
    
    // Check dimensions match
    if (width !== expected.width || height !== expected.height) {
      throw new Error(\`Image dimensions don't match: \${width}x\${height} vs \${expected.width}x\${expected.height}\`);
    }
    
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      actual.data,
      expected.data,
      diff.data,
      width,
      height,
      {
        threshold: options.threshold || this.threshold,
        includeAA: options.includeAA !== false,
        alpha: options.alpha || 0.1,
        aaColor: [255, 255, 0],
        diffColor: options.diffColor || [255, 0, 0],
        diffColorAlt: [0, 255, 0],
        diffMask: options.diffMask !== false
      }
    );
    
    const percentage = (numDiffPixels / (width * height)) * 100;
    
    // Save diff image
    const diffPath = actualPath.replace('.png', '-diff.png');
    await fs.promises.writeFile(diffPath, PNG.sync.write(diff));
    
    return {
      percentage: percentage.toFixed(2),
      pixelsDiff: numDiffPixels,
      totalPixels: width * height,
      diffPath,
      passed: percentage <= (this.threshold * 100),
      dimensions: { width, height }
    };
  }
  
  async generateReport(sessionPath) {
    const sessionData = JSON.parse(
      await fs.promises.readFile(path.join(sessionPath, 'session.json'), 'utf8')
    );
    
    const iterations = await fs.promises.readdir(sessionPath);
    const imageIterations = iterations.filter(f => f.endsWith('.png'));
    
    const report = {
      session: sessionData,
      iterations: imageIterations.length,
      comparisons: [],
      finalResult: null,
      improvements: []
    };
    
    // Compare each iteration with the previous
    for (let i = 1; i < imageIterations.length; i++) {
      const prev = path.join(sessionPath, imageIterations[i - 1]);
      const curr = path.join(sessionPath, imageIterations[i]);
      
      try {
        const comparison = await this.compareImages(prev, curr);
        report.comparisons.push({
          from: imageIterations[i - 1],
          to: imageIterations[i],
          ...comparison
        });
        
        if (comparison.percentage < report.comparisons[i - 2]?.percentage || 0) {
          report.improvements.push({
            iteration: i,
            improvement: (report.comparisons[i - 2]?.percentage - comparison.percentage).toFixed(2)
          });
        }
      } catch (error) {
        console.error(\`Failed to compare iteration \${i}: \${error.message}\`);
      }
    }
    
    // Compare final with mock
    if (imageIterations.length > 0 && sessionData.mockPath) {
      const final = path.join(sessionPath, imageIterations[imageIterations.length - 1]);
      try {
        report.finalResult = await this.compareImages(final, sessionData.mockPath);
      } catch (error) {
        console.error(\`Failed to compare with mock: \${error.message}\`);
      }
    }
    
    // Generate markdown report
    const reportMd = this.generateMarkdownReport(report);
    const reportPath = path.join('.claude/visual-reports', \`\${sessionData.sessionId}-report.md\`);
    await fs.promises.writeFile(reportPath, reportMd);
    
    return {
      ...report,
      reportPath
    };
  }
  
  generateMarkdownReport(report) {
    const timestamp = new Date().toISOString();
    const status = report.finalResult?.passed ? '✅ PASSED' : '❌ FAILED';
    
    return \`# Visual Iteration Report
    
**Session ID**: \${report.session.sessionId}
**Component**: \${report.session.componentName}
**Generated**: \${timestamp}
**Status**: \${status}

## Summary
- Total Iterations: \${report.iterations}
- Final Difference: \${report.finalResult?.percentage || 'N/A'}%
- Threshold: \${(this.threshold * 100).toFixed(1)}%
- Improvements: \${report.improvements.length}

## Iteration Details
\${report.comparisons.map((comp, i) => \`
### Iteration \${i + 1}
- Difference: \${comp.percentage}%
- Pixels Changed: \${comp.pixelsDiff.toLocaleString()} / \${comp.totalPixels.toLocaleString()}
- Status: \${comp.passed ? '✅ Within threshold' : '❌ Exceeds threshold'}
- [View Diff](\${comp.diffPath})
\`).join('\\n')}

## Final Comparison with Mock
\${report.finalResult ? \`
- Difference: \${report.finalResult.percentage}%
- Status: \${report.finalResult.passed ? '✅ PASSED' : '❌ FAILED'}
- Pixels Different: \${report.finalResult.pixelsDiff.toLocaleString()}
- [View Final Diff](\${report.finalResult.diffPath})
\` : 'No mock comparison available'}

## Recommendations
\${this.generateRecommendations(report)}
\`;
  }
  
  generateRecommendations(report) {
    const recommendations = [];
    
    if (!report.finalResult?.passed) {
      const diff = parseFloat(report.finalResult?.percentage || 100);
      
      if (diff > 50) {
        recommendations.push('- Major layout differences detected. Review component structure.');
      } else if (diff > 20) {
        recommendations.push('- Significant styling differences. Check colors, fonts, and spacing.');
      } else if (diff > 10) {
        recommendations.push('- Moderate differences. Fine-tune padding, margins, and borders.');
      } else {
        recommendations.push('- Minor differences. Adjust anti-aliasing or small positioning.');
      }
    }
    
    if (report.iterations > ${answers.maxIterations}) {
      recommendations.push('- Consider breaking down the component into smaller pieces.');
    }
    
    if (report.improvements.length === 0 && report.iterations > 3) {
      recommendations.push('- No improvements detected. Try a different approach.');
    }
    
    return recommendations.length > 0 ? recommendations.join('\\n') : '✅ Visual match achieved successfully!';
  }
  
  async runComparison() {
    // CLI entry point for npm run visual:compare
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error('Usage: visual:compare <actual> <expected>');
      process.exit(1);
    }
    
    try {
      const result = await this.compareImages(args[0], args[1]);
      console.log('Comparison Result:');
      console.log(\`  Difference: \${result.percentage}%\`);
      console.log(\`  Status: \${result.passed ? '✅ PASSED' : '❌ FAILED'}\`);
      console.log(\`  Diff saved to: \${result.diffPath}\`);
      process.exit(result.passed ? 0 : 1);
    } catch (error) {
      console.error(\`Comparison failed: \${error.message}\`);
      process.exit(1);
    }
  }
}

// Export for CLI usage
if (require.main === module) {
  const comparer = new VisualComparer();
  comparer.runComparison();
}

module.exports = { VisualComparer };
`;
  
  fs.writeFileSync('cli/utils/visual-compare.js', visualCompareUtils);
  console.log(chalk.gray('  ✅ Created visual-compare.js'));
  
  // Create Playwright utilities
  const playwrightUtils = `// Playwright Visual Testing Utilities
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class VisualTestUtils {
  constructor(page, config = {}) {
    this.page = page;
    this.config = config;
    this.sessionId = Date.now().toString();
    this.iterationCount = 0;
  }

  async startSession(componentName, mockPath) {
    this.componentName = componentName;
    this.mockPath = mockPath;
    this.sessionPath = path.join('.claude/visual-sessions', this.sessionId);
    
    fs.mkdirSync(this.sessionPath, { recursive: true });
    
    const sessionData = {
      sessionId: this.sessionId,
      componentName,
      mockPath,
      startTime: new Date().toISOString(),
      iterations: [],
      status: 'in-progress'
    };
    
    fs.writeFileSync(
      path.join(this.sessionPath, 'session.json'),
      JSON.stringify(sessionData, null, 2)
    );
    
    return this.sessionPath;
  }

  async captureIteration(label = null) {
    this.iterationCount++;
    const filename = \`iteration-\${String(this.iterationCount).padStart(3, '0')}.png\`;
    const filepath = path.join(this.sessionPath, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: true,
      animations: 'disabled'
    });
    
    // Update session data
    const sessionFile = path.join(this.sessionPath, 'session.json');
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    sessionData.iterations.push({
      number: this.iterationCount,
      label: label || \`Iteration \${this.iterationCount}\`,
      timestamp: new Date().toISOString(),
      screenshot: filename
    });
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    
    console.log(\`📸 Captured iteration \${this.iterationCount}: \${filepath}\`);
    return filepath;
  }

  async compareWithMock(threshold = ${answers.threshold / 100}) {
    if (!this.mockPath) {
      throw new Error('No mock path specified');
    }
    
    await expect(this.page).toHaveScreenshot(path.basename(this.mockPath), {
      threshold,
      maxDiffPixels: 100,
      fullPage: true,
      animations: 'disabled'
    });
  }

  async testResponsiveBreakpoints(breakpoints = null) {
    const defaultBreakpoints = ${JSON.stringify(generateViewportConfig(answers.viewports))};
    const testBreakpoints = breakpoints || defaultBreakpoints;
    
    for (const [name, viewport] of Object.entries(testBreakpoints)) {
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      
      // Wait for responsive changes to apply
      await this.page.waitForTimeout(500);
      
      await this.captureIteration(\`Responsive: \${name}\`);
      
      // Run visual comparison for this viewport
      const mockName = \`\${this.componentName}-\${name}.png\`;
      const mockPath = path.join('.claude/mocks/responsive', mockName);
      
      if (fs.existsSync(mockPath)) {
        await expect(this.page).toHaveScreenshot(mockName, {
          threshold: ${answers.threshold / 100},
          fullPage: true
        });
      }
    }
  }

  async injectCSS(css) {
    await this.page.addStyleTag({ content: css });
    await this.page.waitForTimeout(100); // Wait for styles to apply
  }

  async modifyElement(selector, styles) {
    await this.page.evaluate((args) => {
      const element = document.querySelector(args.selector);
      if (element) {
        Object.assign(element.style, args.styles);
      }
    }, { selector, styles });
    
    await this.page.waitForTimeout(100);
  }

  async waitForStableLayout(timeout = 5000) {
    // Wait for network idle
    await this.page.waitForLoadState('networkidle', { timeout });
    
    // Wait for fonts to load
    await this.page.evaluate(() => document.fonts.ready);
    
    // Wait for images to load
    await this.page.evaluate(() => {
      const images = Array.from(document.images);
      return Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
    });
    
    // Additional wait for animations
    await this.page.waitForTimeout(500);
  }

  async endSession(status = 'completed') {
    const sessionFile = path.join(this.sessionPath, 'session.json');
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    
    sessionData.status = status;
    sessionData.endTime = new Date().toISOString();
    sessionData.totalIterations = this.iterationCount;
    
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    
    // Generate comparison report
    const { VisualComparer } = require('../../cli/utils/visual-compare');
    const comparer = new VisualComparer({ threshold: ${answers.threshold / 100} });
    const report = await comparer.generateReport(this.sessionPath);
    
    console.log(\`\\n📊 Session Report: \${report.reportPath}\`);
    console.log(\`   Final Difference: \${report.finalResult?.percentage || 'N/A'}%\`);
    console.log(\`   Status: \${report.finalResult?.passed ? '✅ PASSED' : '❌ FAILED'}\`);
    
    return report;
  }
}

export default VisualTestUtils;
`;
  
  fs.writeFileSync('tests/utils/visual.js', playwrightUtils);
  console.log(chalk.gray('  ✅ Created visual testing utilities'));
}

async function createExampleTests(answers) {
  console.log(chalk.blue('\n📝 Creating example tests...'));
  
  const exampleTest = `import { test, expect } from '@playwright/test';
import VisualTestUtils from '../utils/visual.js';

test.describe('Visual Development Tests', () => {
  let visualUtils;

  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualTestUtils(page);
    await page.goto('/');
    await visualUtils.waitForStableLayout();
  });

  test('homepage visual iteration', async ({ page }) => {
    // Start visual iteration session
    await visualUtils.startSession('homepage', '.claude/mocks/pages/homepage.png');
    
    // Capture initial state
    await visualUtils.captureIteration('Initial');
    
    // Example: Iterate on header styling
    await visualUtils.modifyElement('header', {
      padding: '20px',
      backgroundColor: '#f5f5f5'
    });
    await visualUtils.captureIteration('Header padding adjusted');
    
    // Example: Adjust typography
    await visualUtils.injectCSS(\`
      h1 { font-size: 2.5rem; font-weight: 600; }
      p { line-height: 1.6; color: #333; }
    \`);
    await visualUtils.captureIteration('Typography refined');
    
    // Test responsive breakpoints
    await visualUtils.testResponsiveBreakpoints();
    
    // End session and generate report
    const report = await visualUtils.endSession();
    
    // Assert visual match
    expect(report.finalResult?.passed).toBeTruthy();
  });

  test('component state variations', async ({ page }) => {
    await page.goto('/components/button');
    
    const states = ['default', 'hover', 'active', 'disabled'];
    
    for (const state of states) {
      await visualUtils.startSession(\`button-\${state}\`, \`.claude/mocks/components/button-\${state}.png\`);
      
      // Trigger state
      const button = page.locator('button.example');
      
      switch(state) {
        case 'hover':
          await button.hover();
          break;
        case 'active':
          await button.click({ delay: 100 });
          break;
        case 'disabled':
          await page.evaluate(() => {
            document.querySelector('button.example').disabled = true;
          });
          break;
      }
      
      await visualUtils.captureIteration(state);
      await visualUtils.compareWithMock();
      await visualUtils.endSession();
    }
  });

  test('visual regression baseline', async ({ page }) => {
    const pages = ['/', '/about', '/contact', '/components'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await visualUtils.waitForStableLayout();
      
      const name = pagePath === '/' ? 'home' : pagePath.slice(1);
      
      await expect(page).toHaveScreenshot(\`\${name}-baseline.png\`, {
        fullPage: true,
        threshold: ${answers.threshold / 100},
        maxDiffPixels: 100
      });
    }
  });
});`;
  
  fs.writeFileSync('tests/visual/example.spec.js', exampleTest);
  console.log(chalk.gray('  ✅ Created example visual tests'));
  
  // Create project-specific examples
  if (answers.projectType === 'react') {
    await createReactExamples();
  } else if (answers.projectType === 'vue') {
    await createVueExamples();
  } else if (answers.projectType === 'components') {
    await createComponentLibraryExamples();
  }
}

async function createReactExamples() {
  const reactTest = `import { test, expect } from '@playwright/test';
import VisualTestUtils from '../utils/visual.js';

test.describe('React Component Visual Tests', () => {
  let visualUtils;

  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualTestUtils(page);
  });

  test('React hooks visual behavior', async ({ page }) => {
    await page.goto('/examples/use-state');
    await visualUtils.startSession('use-state-hook', '.claude/mocks/hooks/use-state.png');
    
    // Capture initial state
    await visualUtils.captureIteration('Initial state');
    
    // Trigger state change
    await page.click('button[data-testid="increment"]');
    await visualUtils.captureIteration('After increment');
    
    // Test loading states
    await page.click('button[data-testid="async-action"]');
    await visualUtils.captureIteration('Loading state');
    
    await page.waitForSelector('[data-state="loaded"]');
    await visualUtils.captureIteration('Loaded state');
    
    const report = await visualUtils.endSession();
    expect(report.finalResult?.passed).toBeTruthy();
  });
});`;
  
  fs.writeFileSync('tests/visual/react-examples.spec.js', reactTest);
  console.log(chalk.gray('  ✅ Created React-specific tests'));
}

async function createVueExamples() {
  const vueTest = `import { test, expect } from '@playwright/test';
import VisualTestUtils from '../utils/visual.js';

test.describe('Vue Component Visual Tests', () => {
  let visualUtils;

  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualTestUtils(page);
  });

  test('Vue composable visual behavior', async ({ page }) => {
    await page.goto('/examples/counter-composable');
    await visualUtils.startSession('counter-composable', '.claude/mocks/composables/counter.png');
    
    // Test reactive updates
    await visualUtils.captureIteration('Initial render');
    
    await page.click('[data-action="increment"]');
    await visualUtils.captureIteration('After increment');
    
    await page.click('[data-action="reset"]');
    await visualUtils.captureIteration('After reset');
    
    const report = await visualUtils.endSession();
    expect(report.finalResult?.passed).toBeTruthy();
  });
});`;
  
  fs.writeFileSync('tests/visual/vue-examples.spec.js', vueTest);
  console.log(chalk.gray('  ✅ Created Vue-specific tests'));
}

async function createComponentLibraryExamples() {
  const componentTest = `import { test, expect } from '@playwright/test';
import VisualTestUtils from '../utils/visual.js';

test.describe('Component Library Visual Tests', () => {
  let visualUtils;

  test.beforeEach(async ({ page }) => {
    visualUtils = new VisualTestUtils(page);
    await page.goto('/storybook');
  });

  test('atomic design components', async ({ page }) => {
    const components = [
      { type: 'atoms', name: 'button' },
      { type: 'atoms', name: 'input' },
      { type: 'molecules', name: 'search-bar' },
      { type: 'molecules', name: 'card' },
      { type: 'organisms', name: 'header' },
      { type: 'organisms', name: 'footer' }
    ];
    
    for (const component of components) {
      await page.goto(\`/storybook/\${component.type}/\${component.name}\`);
      await visualUtils.startSession(
        \`\${component.type}-\${component.name}\`,
        \`.claude/mocks/\${component.type}/\${component.name}.png\`
      );
      
      await visualUtils.captureIteration('Default state');
      await visualUtils.testResponsiveBreakpoints();
      
      const report = await visualUtils.endSession();
      expect(report.finalResult?.passed).toBeTruthy();
    }
  });
});`;
  
  fs.writeFileSync('tests/visual/component-library.spec.js', componentTest);
  console.log(chalk.gray('  ✅ Created component library tests'));
}

async function setupCICD(answers) {
  console.log(chalk.blue('\n🚀 Setting up CI/CD integration...'));
  
  const githubWorkflow = `name: Visual Regression Tests

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main, develop]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Build application
        run: npm run build
      
      - name: Run visual tests
        run: npm run visual:test
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-test-results
          path: |
            .playwright/reports/
            .playwright/test-results/
            .claude/visual-reports/
      
      - name: Update baselines (main branch only)
        if: github.ref == 'refs/heads/main' && failure()
        run: |
          npm run visual:update
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .playwright/baseline/
          git diff --staged --quiet || git commit -m "Update visual baselines"
          git push
`;
  
  fs.mkdirSync('.github/workflows', { recursive: true });
  fs.writeFileSync('.github/workflows/visual-tests.yml', githubWorkflow);
  console.log(chalk.gray('  ✅ Created GitHub Actions workflow'));
}

async function updatePackageJson(answers) {
  console.log(chalk.blue('\n📦 Updating package.json...'));
  
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  Object.assign(packageJson.scripts, {
    'visual:test': 'playwright test --config=playwright-visual.config.js',
    'visual:test:ui': 'playwright test --config=playwright-visual.config.js --ui',
    'visual:test:debug': 'playwright test --config=playwright-visual.config.js --debug',
    'visual:test:headed': 'playwright test --config=playwright-visual.config.js --headed',
    'visual:update': 'playwright test --config=playwright-visual.config.js --update-snapshots',
    'visual:report': 'playwright show-report .playwright/reports',
    'visual:setup': 'node cli/commands/mcp-setup.js',
    'visual:compare': 'node cli/utils/visual-compare.js',
    'visual:clean': 'rm -rf .playwright/test-results .playwright/reports .claude/visual-iterations/*',
    'visual:baseline': 'playwright test --config=playwright-visual.config.js --update-snapshots --grep baseline'
  });
  
  // Add dev dependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  const requiredDeps = {
    '@playwright/test': '^1.48.2',
    'sharp': '^0.33.5',
    'pixelmatch': '^6.0.0',
    'pngjs': '^7.0.0'
  };
  
  Object.assign(packageJson.devDependencies, requiredDeps);
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.gray('  ✅ Updated package.json'));
}

async function createVisualIterateCommand(answers) {
  console.log(chalk.blue('\n📝 Creating /visual-iterate command...'));
  
  const commandContent = `# Visual Iteration Command

Trigger: /visual-iterate [component-name] [mock-path?]

You are implementing pixel-perfect UI using Playwright MCP tools to achieve < ${answers.threshold}% visual difference.

## Configuration
- Dev Server: ${answers.devServerUrl}
- Max Iterations: ${answers.maxIterations}
- Threshold: ${answers.threshold}%
- Viewports: ${answers.viewports.join(', ')}

## Required MCP Tools
- playwright_navigate(url) - Navigate to component
- playwright_screenshot(selector?, path?) - Capture screenshots
- playwright_set_viewport(width, height) - Change viewport
- playwright_evaluate(script) - Inject CSS/JS changes
- playwright_click(selector) - Interact with elements
- playwright_fill(selector, value) - Fill form fields

## Workflow

### Phase 1: Setup (1 minute)
1. Check for mock at .claude/mocks/[component-name].png or use provided path
2. Create session directory: .claude/visual-iterations/session-[timestamp]/
3. Navigate to component: playwright_navigate('${answers.devServerUrl}/[component]')
4. Capture initial state: playwright_screenshot(null, 'iteration-000.png')

### Phase 2: Visual Analysis (2 minutes)
1. Compare screenshot with mock visually
2. Identify differences:
   - Layout issues (spacing, alignment, positioning)
   - Color mismatches (background, text, borders)
   - Typography differences (size, weight, line-height)
   - Component sizing (width, height, padding)
   - Missing elements or incorrect states

### Phase 3: Iterative Refinement (${answers.maxIterations} iterations max, 5-10 minutes)
For each iteration (target 2-3 iterations for success):

1. **Apply targeted fixes** based on analysis:
   \`\`\`javascript
   await playwright_evaluate(\`
     // Example fixes
     document.querySelector('.header').style.padding = '24px';
     document.querySelector('.title').style.fontSize = '32px';
     document.querySelector('.button').style.backgroundColor = '#007bff';
   \`);
   \`\`\`

2. **Capture result**: 
   \`\`\`javascript
   await playwright_screenshot(null, \`iteration-\${String(iteration).padStart(3, '0')}.png\`);
   \`\`\`

3. **Assess progress**:
   - Visually compare with mock
   - Estimate difference percentage
   - Document what improved
   - If < ${answers.threshold}% difference, proceed to Phase 4
   - If > ${answers.threshold}% after ${Math.floor(answers.maxIterations * 0.7)} iterations, try different approach

### Phase 4: Responsive Validation (3 minutes)
Test all configured viewports:
${answers.viewports.map(vp => {
  const vpConfig = {
    'mobile': '375x667',
    'mobile-large': '428x926',
    'tablet': '768x1024',
    'desktop': '1920x1080',
    'wide': '2560x1440',
    'ultrawide': '3440x1440'
  };
  return `
- **${vp}** (${vpConfig[vp]}):
  \`\`\`javascript
  await playwright_set_viewport(${vpConfig[vp].split('x')[0]}, ${vpConfig[vp].split('x')[1]});
  await playwright_screenshot(null, 'responsive-${vp}.png');
  \`\`\``;
}).join('\n')}

### Phase 5: Documentation (2 minutes)
Create iteration report at .claude/visual-reports/[component]-[timestamp].md:

\`\`\`markdown
# Visual Iteration Report: [Component Name]

## Summary
- Iterations: [count]
- Final Difference: [%]
- Status: [PASSED/FAILED]

## Iteration Details
### Iteration 1
- Changes: Adjusted header padding from 20px to 24px
- Improvement: Better alignment with mock

### Iteration 2
- Changes: Updated button color to #007bff
- Improvement: Exact color match achieved

## Responsive Testing
- Mobile: ✅ Passed
- Tablet: ✅ Passed
- Desktop: ✅ Passed

## Recommendations
[Any additional improvements or notes]
\`\`\`

## Best Practices

### CSS Injection Examples
\`\`\`javascript
// Global styles
await playwright_evaluate(\`
  const style = document.createElement('style');
  style.textContent = \\\`
    .component {
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  \\\`;
  document.head.appendChild(style);
\`);

// Specific element updates
await playwright_evaluate(\`
  const element = document.querySelector('.target');
  if (element) {
    element.style.cssText = \\\`
      margin: 16px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    \\\`;
  }
\`);
\`\`\`

### Common Adjustments
1. **Spacing**: padding, margin, gap
2. **Typography**: font-size, font-weight, line-height, letter-spacing
3. **Colors**: color, background-color, border-color
4. **Layout**: display, flex properties, grid properties
5. **Borders**: border-width, border-radius, border-style
6. **Shadows**: box-shadow, text-shadow
7. **Sizing**: width, height, min/max dimensions

## Success Criteria
✅ Visual difference < ${answers.threshold}%
✅ All viewports tested
✅ Iteration history saved
✅ Report generated
✅ Changes documented

## Error Handling
- If component not found: Check URL and selectors
- If mock missing: Request user to provide mock
- If > ${answers.maxIterations} iterations: Suggest breaking into smaller components
- If dramatic differences: Review mock dimensions and base styles

## Output Files
- Iterations: .claude/visual-iterations/session-*/iteration-*.png
- Responsive: .claude/visual-iterations/session-*/responsive-*.png
- Report: .claude/visual-reports/[component]-report.md
- Session data: .claude/visual-sessions/session-*/session.json
`;
  
  fs.mkdirSync('.claude/commands', { recursive: true });
  fs.writeFileSync('.claude/commands/visual-iterate.md', commandContent);
  console.log(chalk.gray('  ✅ Created /visual-iterate command'));
}

// Export functions
module.exports = {
  setupVisualDevelopment,
  installPlaywrightMCP,
  createVisualDirectoryStructure,
  generateConfigurations,
  createTestUtilities,
  createExampleTests,
  setupCICD,
  updatePackageJson,
  createVisualIterateCommand
};

// Allow direct CLI execution
if (require.main === module) {
  setupVisualDevelopment().catch(console.error);
}