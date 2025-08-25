const { test, expect } = require('@playwright/test');
const { VisualBaselineManager } = require('./utils/visual-helpers');
const { CLITestHelper } = require('./utils/cli-helpers');

test.describe('Visual Regression Tests', () => {
  let visualManager;
  let cliHelper;
  
  test.beforeAll(async () => {
    visualManager = new VisualBaselineManager();
    await visualManager.ensureBaselineDirectory();
  });
  
  test.beforeEach(async ({ page }) => {
    cliHelper = new CLITestHelper();
    await cliHelper.createTestDirectory();
  });
  
  test.afterEach(async () => {
    await cliHelper.cleanupAll();
  });
  
  test.describe('CLI Output Visual Tests', () => {
    test('CLI help output visual consistency', async ({ page }) => {
      // Run help command
      const result = await cliHelper.runCommand('--help');
      
      // Create HTML representation of CLI output
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #1e1e1e; 
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    pre {
      color: #d4d4d4;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .command { color: #569cd6; }
    .flag { color: #9cdcfe; }
    .description { color: #d4d4d4; }
    .header { color: #4ec9b0; font-weight: bold; }
  </style>
</head>
<body>
  <pre>${escapeHtml(result.stdout)}</pre>
</body>
</html>`;
      
      await page.setContent(htmlContent);
      
      // Take screenshot for regression testing
      await expect(page).toHaveScreenshot('cli-help-output.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('text=/v\\d+\\.\\d+\\.\\d+/')], // Mask version numbers
      });
    });
    
    test('setup command output visual test', async ({ page }) => {
      // Run setup command
      const result = await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Create styled HTML output
      const htmlContent = createStyledCliOutput(result.stdout, 'setup');
      await page.setContent(htmlContent);
      
      // Visual regression test
      await expect(page).toHaveScreenshot('cli-setup-output.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('text=/\\d{4}-\\d{2}-\\d{2}/'), // Mask dates
          page.locator('text=/\\d+ms/'), // Mask timing
        ],
      });
    });
    
    test('init command output visual test', async ({ page }) => {
      // Setup first
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Run init
      const result = await cliHelper.runCommand('init --minimal');
      
      // Create styled HTML output
      const htmlContent = createStyledCliOutput(result.stdout, 'init');
      await page.setContent(htmlContent);
      
      // Visual regression test
      await expect(page).toHaveScreenshot('cli-init-output.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('text=/\\d{4}-\\d{2}-\\d{2}/'), // Mask dates
        ],
      });
    });
    
    test('error message visual consistency', async ({ page }) => {
      // Trigger an error
      const result = await cliHelper.runCommand('invalid-command');
      
      // Create error output HTML
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #1e1e1e; 
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    .error {
      color: #f48771;
      font-size: 14px;
      line-height: 1.5;
      padding: 10px;
      border-left: 3px solid #f48771;
      background: rgba(244, 135, 113, 0.1);
    }
  </style>
</head>
<body>
  <div class="error">${escapeHtml(result.stderr || result.stdout)}</div>
</body>
</html>`;
      
      await page.setContent(htmlContent);
      
      // Visual regression test
      await expect(page).toHaveScreenshot('cli-error-output.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
  
  test.describe('Visual Change Detection', () => {
    test('detect visual changes in output', async ({ page }) => {
      // Test that visual regression catches changes
      await page.setContent(`
        <div id="content" style="padding: 20px; font-size: 16px; font-family: monospace;">
          MultiAgent-Claude CLI v2.0.0
        </div>
      `);
      
      // Take baseline screenshot
      const baseline = await page.screenshot();
      
      // Modify content
      await page.evaluate(() => {
        document.getElementById('content').textContent = 'MultiAgent-Claude CLI v2.0.1';
      });
      
      // Take modified screenshot
      const modified = await page.screenshot();
      
      // Screenshots should be different
      expect(baseline).not.toEqual(modified);
      
      // Test visual manager comparison
      const comparison = await visualManager.compareSnapshots(modified, baseline);
      expect(comparison.match).toBe(false);
    });
    
    test('visual baseline management', async ({ page }) => {
      const testName = 'test-baseline-management';
      
      // Create test content
      await page.setContent(`
        <div style="padding: 20px; background: #fff;">
          <h1>Test Content</h1>
          <p>This is test content for baseline management.</p>
        </div>
      `);
      
      // Take screenshot
      const screenshot = await page.screenshot();
      
      // Save as baseline
      await visualManager.saveBaseline(testName, screenshot);
      
      // Verify baseline was saved
      const savedBaseline = await visualManager.getBaseline(testName);
      expect(savedBaseline).toBeTruthy();
      
      // Verify metadata was saved
      const metadata = await visualManager.getBaselineMetadata(testName);
      expect(metadata).toBeTruthy();
      expect(metadata.name).toBe(testName);
      expect(metadata.timestamp).toBeTruthy();
      
      // Clean up
      await visualManager.removeBaseline(testName);
    });
  });
  
  test.describe('Cross-Platform Visual Consistency', () => {
    test('CLI output consistent across viewports', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 1366, height: 768, name: 'laptop' },
        { width: 768, height: 1024, name: 'tablet' },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Create responsive CLI output
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #1e1e1e; 
      font-family: monospace;
    }
    pre {
      color: #d4d4d4;
      font-size: clamp(12px, 1.5vw, 16px);
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-width: 100%;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <pre>MultiAgent-Claude CLI v2.0.0

Commands:
  init          Initialize multi-agent environment
  setup         Interactive project setup
  add           Add features to project
  agent         Manage agents
  memory        Memory system operations

Options:
  --help        Show help
  --version     Show version
  --minimal     Use minimal setup (CI mode)</pre>
</body>
</html>`;
        
        await page.setContent(htmlContent);
        
        // Visual test for each viewport
        await expect(page).toHaveScreenshot(`cli-output-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
    
    test('color scheme consistency', async ({ page }) => {
      // Test both light and dark themes
      const themes = [
        { name: 'dark', bg: '#1e1e1e', fg: '#d4d4d4' },
        { name: 'light', bg: '#ffffff', fg: '#333333' },
      ];
      
      for (const theme of themes) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: ${theme.bg}; 
      color: ${theme.fg};
      font-family: monospace;
    }
    .success { color: ${theme.name === 'dark' ? '#4ec9b0' : '#008000'}; }
    .error { color: ${theme.name === 'dark' ? '#f48771' : '#cc0000'}; }
    .warning { color: ${theme.name === 'dark' ? '#dcdcaa' : '#ff9900'}; }
  </style>
</head>
<body>
  <div class="success">✓ Success message</div>
  <div class="error">✗ Error message</div>
  <div class="warning">⚠ Warning message</div>
</body>
</html>`;
        
        await page.setContent(htmlContent);
        
        await expect(page).toHaveScreenshot(`cli-theme-${theme.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  });
  
  test.describe('Dynamic Content Handling', () => {
    test('mask dynamic timestamps in output', async ({ page }) => {
      // Create output with timestamps
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; padding: 20px; }
    .timestamp { color: #666; }
  </style>
</head>
<body>
  <div>Process started at <span class="timestamp">${new Date().toISOString()}</span></div>
  <div>Duration: <span class="timestamp">${Math.random() * 1000}ms</span></div>
  <div>Static content that should match</div>
</body>
</html>`;
      
      await page.setContent(htmlContent);
      
      // Take screenshot with masked dynamic content
      await expect(page).toHaveScreenshot('masked-dynamic-content.png', {
        fullPage: true,
        mask: [page.locator('.timestamp')],
      });
    });
    
    test('handle animated progress indicators', async ({ page }) => {
      // Create page with animated content
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }
    body { font-family: monospace; padding: 20px; }
  </style>
</head>
<body>
  <div>Processing <span class="spinner"></span></div>
  <div>Static content below spinner</div>
</body>
</html>`;
      
      await page.setContent(htmlContent);
      
      // Take screenshot with animations disabled
      await expect(page).toHaveScreenshot('no-animation-content.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper function to create styled CLI output
function createStyledCliOutput(text, command) {
  const styledText = text
    .replace(/✓/g, '<span style="color: #4ec9b0;">✓</span>')
    .replace(/✗/g, '<span style="color: #f48771;">✗</span>')
    .replace(/⚠/g, '<span style="color: #dcdcaa;">⚠</span>')
    .replace(/\[([^\]]+)\]/g, '<span style="color: #569cd6;">[$1]</span>')
    .replace(/--\w+/g, match => `<span style="color: #9cdcfe;">${match}</span>`);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #1e1e1e; 
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    pre {
      color: #d4d4d4;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .command-${command} {
      border-left: 3px solid #569cd6;
      padding-left: 15px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <pre class="command-${command}">${styledText}</pre>
</body>
</html>`;
}