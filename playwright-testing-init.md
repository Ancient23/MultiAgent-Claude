# Playwright Testing Environment Initialization for CI/CD

## Master Prompt for Setting Up Automated Visual & E2E Testing

```markdown
Initialize a comprehensive Playwright testing environment for this project with CI/CD integration, visual regression testing, and memory system integration for test results.

## Phase 1: Project Analysis & Test Discovery

### 1.1 Analyze Frontend Structure
Detect frontend framework and testing needs:
- Framework: [React/Vue/Angular/Next.js/Nuxt/SvelteKit/etc.]
- Existing tests: [Check for test files]
- Test runners: [Jest/Vitest/Mocha/existing Playwright]
- UI Components: [Component library detection]
- Critical user paths: [Auth/Checkout/Dashboard/etc.]

### 1.2 Identify Testable Areas
Scan for:
- Public pages (landing, about, pricing)
- Authentication flows (login, signup, reset)
- Core features (dashboard, settings, profile)
- Critical transactions (checkout, payment, booking)
- Forms and validations
- Interactive components (modals, dropdowns, wizards)

## Phase 2: Create Playwright Test Infrastructure

### 2.1 Directory Structure
Create test organization:
```bash
mkdir -p .playwright/tests/e2e
mkdir -p .playwright/tests/visual
mkdir -p .playwright/tests/interaction
mkdir -p .playwright/tests/accessibility
mkdir -p .playwright/baseline
mkdir -p .playwright/fixtures
mkdir -p .playwright/page-objects
mkdir -p .playwright/config
```

### 2.2 Configuration Files

**CREATE: .playwright/config/playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**CREATE: .playwright/config/ci.config.ts**
```typescript
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  workers: 1,
  retries: 2,
  use: {
    ...baseConfig.use,
    video: 'on',
    trace: 'on',
  },
  reporter: [
    ['github'],
    ['json', { outputFile: '.claude/memory/test-results/ci-results.json' }],
    ['html', { open: 'never' }]
  ],
});
```

## Phase 3: Generate Initial Test Suite

### 3.1 Page Object Model Template

**CREATE: .playwright/page-objects/BasePage.ts**
```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/') {
    await this.page.goto(path);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `.playwright/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async checkAccessibility() {
    // Integrate with axe-playwright for a11y testing
  }
}
```

### 3.2 E2E Test Template

**CREATE: .playwright/tests/e2e/example.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Core User Journey', () => {
  test('should complete primary user flow', async ({ page }) => {
    await page.goto('/');
    
    // Visual regression checkpoint
    await expect(page).toHaveScreenshot('homepage.png');
    
    // Interaction testing
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*signup/);
    
    // Form testing
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    // Assertion
    await expect(page.locator('.welcome-message')).toBeVisible();
  });
});
```

### 3.3 Visual Regression Test Template

**CREATE: .playwright/tests/visual/visual-regression.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'pricing', path: '/pricing' },
];

test.describe('Visual Regression Tests', () => {
  for (const page of pages) {
    test(`${page.name} page visual consistency`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(page.path);
      await playwrightPage.waitForLoadState('networkidle');
      
      // Full page screenshot
      await expect(playwrightPage).toHaveScreenshot(`${page.name}-full.png`, {
        fullPage: true,
        animations: 'disabled',
      });
      
      // Mobile viewport
      await playwrightPage.setViewportSize({ width: 375, height: 667 });
      await expect(playwrightPage).toHaveScreenshot(`${page.name}-mobile.png`);
    });
  }
});
```

## Phase 4: CI/CD Integration

### 4.1 GitHub Actions Workflow

**CREATE: .github/workflows/playwright-tests.yml**
```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily regression test

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    
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
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
        env:
          BASE_URL: ${{ secrets.BASE_URL || 'http://localhost:3000' }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.shardIndex }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-screenshots-${{ matrix.shardIndex }}
          path: .playwright/screenshots/
      
      - name: Update Memory System
        if: always()
        run: |
          node -e "
          const fs = require('fs');
          const results = require('./.claude/memory/test-results/latest.json');
          const date = new Date().toISOString();
          
          // Create test result memory
          const memory = {
            date: date,
            passed: results.stats.expected,
            failed: results.stats.unexpected,
            flaky: results.stats.flaky,
            skipped: results.stats.skipped
          };
          
          // Save to memory system
          fs.writeFileSync(
            '.claude/memory/test-results/ci-run-${date}.json',
            JSON.stringify(memory, null, 2)
          );
          "

  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Download all reports
        uses: actions/download-artifact@v3
        with:
          path: all-reports/
      
      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-reports
      
      - name: Upload merged report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-complete
          path: playwright-report/
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(
              fs.readFileSync('./.claude/memory/test-results/latest.json', 'utf8')
            );
            
            const comment = `## 🎭 Playwright Test Results
            
            - ✅ Passed: ${results.stats.expected}
            - ❌ Failed: ${results.stats.unexpected}  
            - ⚠️ Flaky: ${results.stats.flaky}
            - ⏭️ Skipped: ${results.stats.skipped}
            
            [View Full Report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

## Phase 5: Memory System Integration

### 5.1 Test Results Memory

**CREATE: .claude/memory/test-results/README.md**
```markdown
# Test Results Memory

This directory stores test execution results for pattern recognition and improvement tracking.

## Structure
- `latest.json` - Most recent test run
- `ci-run-*.json` - CI test runs with timestamps
- `failures/` - Failed test patterns for analysis
- `regressions/` - Visual regression history
- `coverage.json` - Test coverage metrics

## Patterns Tracked
- Flaky tests (intermittent failures)
- Consistent failures (broken features)
- Performance degradation
- Visual regression patterns
- Coverage trends
```

### 5.2 Test Pattern Documentation

**CREATE: .claude/memory/patterns/testing-patterns.md**
```markdown
---
source: playwright-init
created_by: system
created_at: [timestamp]
category: testing
---

# Testing Patterns

## Page Object Pattern
Use page objects for maintainable tests:
- Encapsulate page interactions
- Reusable across tests
- Single source of truth for selectors

## Visual Regression Strategy
- Baseline on main branch
- Compare on PRs
- Auto-update after merge
- Ignore dynamic content

## Test Data Management
- Use fixtures for consistent data
- Clean up after tests
- Isolate test environments

## CI/CD Optimization
- Parallel execution with sharding
- Retry flaky tests
- Cache browser binaries
- Upload artifacts on failure
```

## Phase 6: Setup Options

Ask user for configuration preferences:

1. **Test Types to Enable**:
   - [ ] E2E Testing (user journeys)
   - [ ] Visual Regression (screenshot comparison)
   - [ ] Interaction Testing (clicks, forms)
   - [ ] Accessibility Testing (WCAG compliance)
   - [ ] Performance Testing (Core Web Vitals)

2. **Browsers to Test**:
   - [ ] Chrome/Chromium
   - [ ] Firefox
   - [ ] Safari/WebKit
   - [ ] Mobile Chrome
   - [ ] Mobile Safari

3. **CI Configuration**:
   - Run on: [push/pull_request/schedule]
   - Parallel shards: [1-10]
   - Retry attempts: [0-3]
   - Failure behavior: [block/warn/continue]

4. **Memory Integration**:
   - [ ] Auto-document test failures
   - [ ] Track coverage over time
   - [ ] Create ADRs from consistent failures
   - [ ] Generate weekly test reports

## Phase 7: Package.json Scripts

Add to package.json:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:visual": "playwright test tests/visual",
    "test:a11y": "playwright test tests/accessibility",
    "test:update-snapshots": "playwright test --update-snapshots",
    "test:report": "playwright show-report",
    "playwright:install": "playwright install --with-deps",
    "playwright:codegen": "playwright codegen"
  }
}
```

## Phase 8: Integration Verification

### Test the Setup
1. Run local tests: `npm run test:e2e`
2. Check visual baselines created
3. Verify CI workflow triggers on push
4. Confirm memory system updates

### Success Indicators
- [ ] Tests run locally
- [ ] CI workflow executes
- [ ] Screenshots/videos upload
- [ ] Memory system updates with results
- [ ] PR comments show test status

## Quick Start Commands

```bash
# Install Playwright
npm init playwright@latest

# Generate tests from UI interactions
npx playwright codegen http://localhost:3000

# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Update visual baselines
npm run test:update-snapshots

# View test report
npm run test:report
```

This setup provides a production-ready Playwright testing environment with full CI/CD integration and memory system tracking for continuous improvement.
```