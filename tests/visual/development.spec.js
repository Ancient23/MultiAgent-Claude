import { test, expect } from '@playwright/test';

test.describe('Visual Development', () => {
  test('compare with mock', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
      fullPage: true
    });
  });
  
  test('responsive breakpoints', async ({ page }) => {
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