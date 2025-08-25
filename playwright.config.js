// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [
    ['blob', { outputDir: 'blob-report' }],
    ['github']
  ] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
  },
  
  /* Snapshot configuration for platform-agnostic names */
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  expect: {
    // Use consistent snapshot names across platforms
    toHaveScreenshot: {
      // Maximum difference in pixels (allow up to 1000 for cross-platform)
      maxDiffPixels: 1000,
      // Threshold for pixel difference (2% tolerance for font rendering differences)
      threshold: 0.02,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'cli-tests',
      testMatch: /.*\.cli\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'integration-tests',
      testMatch: /.*\.integration\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'unit-tests',
      testMatch: /.*\.spec\.js/,
      testIgnore: /.*\.(cli|integration|visual)\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visual-tests',
      testMatch: /.*\.visual\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: null, // CLI testing doesn't need a web server
});