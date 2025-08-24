# CI-Compatible Playwright Testing Implementation Plan

**Created**: 2025-08-24  
**Updated**: 2025-08-24  
**Status**: Ready for Implementation  
**Priority**: High  
**Focus**: CI/CD Pipeline Compatible Testing Only

## Summary

This plan focuses exclusively on CI-compatible Playwright testing that works reliably in GitHub Actions and other CI environments. All tests are designed to run headless and support parallel execution with proper artifact collection.

## 1. Core CLI Testing (Our Own Project)

### 1.1 CLI Command Tests
```javascript
// tests/cli-playwright.spec.js
const { test, expect } = require('@playwright/test');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

test.describe('MultiAgent-Claude CLI Tests', () => {
  let testDir;
  
  test.beforeEach(async () => {
    testDir = `/tmp/mac-test-${Date.now()}`;
    await fs.mkdir(testDir, { recursive: true });
  });
  
  test.afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
  
  test('setup command creates minimal structure', async () => {
    const cliPath = path.join(process.cwd(), 'cli', 'index.js');
    
    // Run setup command
    await execAsync(`cd ${testDir} && node ${cliPath} setup --variant base`, {
      timeout: 10000
    });
    
    // Verify only .claude directory created
    const dirs = await fs.readdir(testDir);
    expect(dirs).toContain('.claude');
    expect(dirs.length).toBe(1); // Only .claude, no other dirs
    
    // Verify config created
    const config = JSON.parse(
      await fs.readFile(path.join(testDir, '.claude/config.json'), 'utf8')
    );
    expect(config.variant).toBe('base');
  });
  
  test('init command creates full directory structure', async () => {
    const cliPath = path.join(process.cwd(), 'cli', 'index.js');
    
    // First setup
    await execAsync(`cd ${testDir} && node ${cliPath} setup --variant base`, {
      timeout: 10000
    });
    
    // Then init with minimal flag for CI
    await execAsync(`cd ${testDir} && node ${cliPath} init --minimal`, {
      timeout: 10000
    });
    
    // Verify all directories created
    const expectedDirs = [
      '.claude/agents',
      '.claude/commands',
      '.claude/tasks',
      '.claude/doc',
      '.ai/memory',
      '.ai/memory/patterns',
      '.ai/memory/decisions'
    ];
    
    for (const dir of expectedDirs) {
      const exists = await fs.access(path.join(testDir, dir))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    }
  });
  
  test('add testing command adds Playwright config', async () => {
    const cliPath = path.join(process.cwd(), 'cli', 'index.js');
    
    // Setup and init
    await execAsync(`cd ${testDir} && node ${cliPath} setup --variant base`, {
      timeout: 10000
    });
    await execAsync(`cd ${testDir} && node ${cliPath} init --minimal`, {
      timeout: 10000
    });
    
    // Add testing
    await execAsync(`cd ${testDir} && node ${cliPath} add testing`, {
      timeout: 10000
    });
    
    // Verify Playwright config created
    const configExists = await fs.access(
      path.join(testDir, 'playwright.config.js')
    ).then(() => true).catch(() => false);
    expect(configExists).toBe(true);
    
    // Verify test file created
    const testExists = await fs.access(
      path.join(testDir, 'tests/cli.spec.js')
    ).then(() => true).catch(() => false);
    expect(testExists).toBe(true);
  });
});
```

### 1.2 Visual Regression Tests (CI-Compatible)
```javascript
// tests/visual-regression.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  
  test('CLI help output visual consistency', async ({ page }) => {
    // Create a simple HTML representation of CLI output
    await page.setContent(`
      <pre style="font-family: monospace; padding: 20px; background: #1e1e1e; color: #fff;">
MultiAgent-Claude CLI v2.0.0

Commands:
  init          Initialize multi-agent environment
  setup         Interactive project setup
  add           Add features to project
  agent         Manage agents
  memory        Memory system operations
  orchestrate   Start orchestrated workflow
  parallel      Deploy parallel agents
      </pre>
    `);
    
    // Take screenshot for regression testing
    await expect(page).toHaveScreenshot('cli-help-output.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('detect visual changes in output', async ({ page }) => {
    // Test that visual regression catches changes
    await page.setContent(`
      <div id="content" style="padding: 20px; font-size: 16px;">
        Original Content
      </div>
    `);
    
    // Baseline
    const baseline = await page.screenshot();
    
    // Modify content
    await page.evaluate(() => {
      document.getElementById('content').textContent = 'Modified Content';
    });
    
    // Modified screenshot
    const modified = await page.screenshot();
    
    // Should be different
    expect(baseline).not.toEqual(modified);
  });
});
```

## 2. Template Testing for User Projects

### 2.1 Template Workflow Tests
```yaml
# templates/workflows/playwright-tests.yml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run Playwright tests
        run: npx playwright test --shard=${{ matrix.shard }}
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 30
          
      - name: Upload visual snapshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs-${{ matrix.shard }}
          path: test-results/
          retention-days: 7
```

### 2.2 Template Test Configuration
```javascript
// templates/playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 3. Enhanced CI Workflow for Our Project

### 3.1 Update Main CI Workflow
```yaml
# .github/workflows/playwright-cli-tests.yml
name: Playwright CLI & Visual Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Create test directories
        run: |
          mkdir -p .playwright/baseline
          mkdir -p test-results
      
      - name: Run CLI tests
        run: npx playwright test tests/cli-playwright.spec.js --shard=${{ matrix.shard }}
      
      - name: Run Visual Regression tests
        run: npx playwright test tests/visual-regression.spec.js --shard=${{ matrix.shard }}
        
      - name: Upload blob report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/
          retention-days: 7
          
      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs-${{ strategy.job-index }}
          path: test-results/
          retention-days: 7
          
  merge-reports:
    if: always()
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          pattern: blob-report-*
          merge-multiple: true
          path: all-blob-reports/
          
      - name: Merge reports
        run: npx playwright merge-reports all-blob-reports
        
      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 4. Test Utilities and Helpers

### 4.1 CLI Test Utilities
```javascript
// tests/utils/cli-helpers.js
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class CLITestHelper {
  constructor() {
    this.cliPath = path.join(process.cwd(), 'cli', 'index.js');
    this.testDir = null;
  }
  
  async createTestDirectory() {
    this.testDir = `/tmp/mac-test-${Date.now()}`;
    await fs.mkdir(this.testDir, { recursive: true });
    return this.testDir;
  }
  
  async cleanup() {
    if (this.testDir) {
      await fs.rm(this.testDir, { recursive: true, force: true });
    }
  }
  
  async runCommand(command, options = {}) {
    const fullCommand = `cd ${this.testDir} && node ${this.cliPath} ${command}`;
    return execAsync(fullCommand, {
      timeout: options.timeout || 10000,
      ...options
    });
  }
  
  async verifyFileExists(relativePath) {
    const fullPath = path.join(this.testDir, relativePath);
    return fs.access(fullPath)
      .then(() => true)
      .catch(() => false);
  }
  
  async readConfig() {
    const configPath = path.join(this.testDir, '.claude/config.json');
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  }
}

module.exports = { CLITestHelper };
```

### 4.2 Visual Baseline Management
```javascript
// tests/utils/visual-helpers.js
const fs = require('fs').promises;
const path = require('path');

class VisualBaselineManager {
  constructor() {
    this.baselineDir = '.playwright/baseline';
    this.updateMode = process.env.UPDATE_SNAPSHOTS === 'true';
  }
  
  async getBaseline(name) {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    
    if (this.updateMode) {
      return null; // Force new baseline
    }
    
    try {
      return await fs.readFile(baselinePath);
    } catch {
      return null; // No baseline exists
    }
  }
  
  async saveBaseline(name, buffer) {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.writeFile(baselinePath, buffer);
  }
  
  async compareSnapshots(actual, baseline, threshold = 0.01) {
    // Simple byte comparison for CI
    // In real implementation, use pixelmatch or similar
    if (!baseline) return false;
    return actual.equals(baseline);
  }
}

module.exports = { VisualBaselineManager };
```

## 5. Package.json Scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:cli": "playwright test tests/cli-playwright.spec.js",
    "test:visual": "playwright test tests/visual-regression.spec.js",
    "test:update-snapshots": "UPDATE_SNAPSHOTS=true playwright test",
    "test:ci": "playwright test --reporter=blob",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui"
  }
}
```

## 6. Implementation Steps

### Phase 1: Core Setup (HIGH Priority)
1. Update `cli/commands/init.js` to create all directories first
2. Add `--minimal` flag for CI compatibility
3. Update `cli/commands/setup.js` to only create `.claude` directory
4. Create test utilities in `tests/utils/`

### Phase 2: Test Implementation (HIGH Priority)
1. Create `tests/cli-playwright.spec.js` with CLI tests
2. Create `tests/visual-regression.spec.js` for visual testing
3. Update `playwright.config.js` with proper projects
4. Add baseline management utilities

### Phase 3: CI Integration (MEDIUM Priority)
1. Update `.github/workflows/playwright-cli-tests.yml`
2. Add blob reporter configuration
3. Implement report merging
4. Configure artifact uploads

### Phase 4: Templates (MEDIUM Priority)
1. Create `templates/workflows/playwright-tests.yml`
2. Add template `playwright.config.js`
3. Update `cli/commands/add.js` to include new templates
4. Test template generation

### Phase 5: Documentation (LOW Priority)
1. Update README with testing instructions
2. Add CI badge to repository
3. Document visual regression workflow
4. Create troubleshooting guide

## Success Criteria

- ✅ All tests run successfully in GitHub Actions
- ✅ Visual regression baselines are properly managed
- ✅ Parallel execution reduces CI time by 50%
- ✅ No flaky tests in CI environment
- ✅ Test reports are easily accessible
- ✅ Templates work for new projects
- ✅ CLI commands are fully tested

## Key Differences from Previous Plan

1. **No Browser Automation**: Removed browser navigation tests
2. **CI Focus**: All tests designed for headless execution
3. **Template Testing**: Added comprehensive template validation
4. **Baseline Management**: Proper visual regression baseline handling
5. **Parallel Execution**: Sharding strategy for faster CI
6. **Artifact Collection**: Proper report merging and storage

## Notes

- All tests must work in `ubuntu-latest` GitHub Actions runner
- Use Chromium only for consistency in CI
- Keep test execution under 5 minutes total
- Visual baselines stored in repository for consistency
- Use blob reporter for efficient parallel reporting