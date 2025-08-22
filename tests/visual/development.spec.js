import { test, expect } from '@playwright/test';

// Helper function to check if dev server is running
async function isServerRunning(page) {
  try {
    await page.goto('http://localhost:3000', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

test.describe('Visual Development', () => {
  test('compare with mock', async ({ page }) => {
    test.skip(!process.env.DEV_SERVER_RUNNING, 'Dev server not running');
    
    const serverRunning = await isServerRunning(page);
    test.skip(!serverRunning, 'Cannot connect to localhost:3000');
    
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
      fullPage: true
    });
  });
  
  test('responsive breakpoints', async ({ page }) => {
    test.skip(!process.env.DEV_SERVER_RUNNING, 'Dev server not running');
    
    const serverRunning = await isServerRunning(page);
    test.skip(!serverRunning, 'Cannot connect to localhost:3000');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3000');
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`);
    }
  });
});