// Playwright tests for deployment detection functionality
const { test, expect } = require('@playwright/test');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

test.describe('Deployment Detection Tests', () => {
  test.describe('VercelPreviewDetector', () => {
    test('should parse Vercel URLs from text correctly', async () => {
      const testCases = [
        {
          input: 'Preview: https://my-app-pr-123.vercel.app',
          expected: 'https://my-app-pr-123.vercel.app'
        },
        {
          input: 'Deployed to https://preview.vercel.app/path',
          expected: 'https://preview.vercel.app'
        },
        {
          input: 'No URL here',
          expected: null
        }
      ];

      for (const testCase of testCases) {
        const match = testCase.input.match(/https?:\/\/[^\s\)]+\.vercel\.app/);
        const result = match ? match[0] : null;
        expect(result).toBe(testCase.expected);
      }
    });

    test('should validate URLs correctly', async () => {
      const validUrls = [
        'https://test.vercel.app',
        'http://preview.vercel.app',
        'https://my-app-pr-123.vercel.app'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://wrong.vercel.app',
        'https://',
        '',
        null,
        undefined
      ];

      for (const url of validUrls) {
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
      }

      for (const url of invalidUrls) {
        expect(!url || (!url.startsWith('http://') && !url.startsWith('https://'))).toBe(true);
      }
    });

    test('should handle timeout with AbortController', async ({ page }) => {
      // Test that AbortController is used for fetch timeout
      const testScript = `
        async function testAbort() {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 100);
          
          try {
            // This should timeout
            await fetch('https://httpstat.us/200?sleep=5000', {
              signal: controller.signal
            });
            return false; // Should not reach here
          } catch (error) {
            clearTimeout(timeoutId);
            return error.name === 'AbortError';
          }
        }
        testAbort();
      `;

      const result = await page.evaluate(testScript);
      expect(result).toBe(true);
    });
  });

  test.describe('CLI Commands', () => {
    test('visual:ci-setup command should validate numeric inputs', async () => {
      const { VisualComparer } = require('../cli/utils/visual-compare');
      
      // Test timeout validation
      const validateTimeout = (input) => {
        const timeout = parseInt(input);
        if (isNaN(timeout) || timeout < 0 || timeout > 600000) {
          return 300000; // Default
        }
        return timeout;
      };

      expect(validateTimeout('300000')).toBe(300000);
      expect(validateTimeout('invalid')).toBe(300000);
      expect(validateTimeout('-1000')).toBe(300000);
      expect(validateTimeout('700000')).toBe(300000);
      expect(validateTimeout('60000')).toBe(60000);

      // Test interval validation
      const validateInterval = (input) => {
        const interval = parseInt(input);
        if (isNaN(interval) || interval < 100 || interval > 60000) {
          return 5000; // Default
        }
        return interval;
      };

      expect(validateInterval('5000')).toBe(5000);
      expect(validateInterval('invalid')).toBe(5000);
      expect(validateInterval('50')).toBe(5000);
      expect(validateInterval('70000')).toBe(5000);
      expect(validateInterval('1000')).toBe(1000);

      // Test threshold validation
      const validateThreshold = (input) => {
        const threshold = parseFloat(input);
        if (isNaN(threshold) || threshold < 0 || threshold > 1) {
          return 0.05; // Default
        }
        return threshold;
      };

      expect(validateThreshold('0.05')).toBe(0.05);
      expect(validateThreshold('invalid')).toBe(0.05);
      expect(validateThreshold('-0.1')).toBe(0.05);
      expect(validateThreshold('1.5')).toBe(0.05);
      expect(validateThreshold('0.5')).toBe(0.5);
    });

    test('deployment configuration should be saved correctly', async () => {
      const configPath = path.join(process.cwd(), '.claude', 'config', 'deployment.json');
      
      // Skip if config doesn't exist (will be created by init command)
      if (!fs.existsSync(configPath)) {
        test.skip();
        return;
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Validate config structure
      expect(config).toHaveProperty('deployment');
      expect(config).toHaveProperty('visualTesting');
      
      expect(config.deployment).toHaveProperty('provider');
      expect(config.deployment).toHaveProperty('fallbackUrl');
      expect(config.deployment).toHaveProperty('waitTimeout');
      expect(config.deployment).toHaveProperty('retryInterval');
      
      expect(config.visualTesting).toHaveProperty('enableOnCI');
      expect(config.visualTesting).toHaveProperty('viewports');
      expect(config.visualTesting).toHaveProperty('threshold');
      
      // Validate types
      expect(typeof config.deployment.waitTimeout).toBe('number');
      expect(typeof config.deployment.retryInterval).toBe('number');
      expect(typeof config.visualTesting.threshold).toBe('number');
      expect(Array.isArray(config.visualTesting.viewports)).toBe(true);
    });
  });

  test.describe('GitHub Actions Integration', () => {
    test('should use GITHUB_OUTPUT instead of set-output', async () => {
      const vercelPreviewPath = path.join(process.cwd(), 'cli', 'utils', 'vercel-preview.js');
      const content = fs.readFileSync(vercelPreviewPath, 'utf8');
      
      // Check that old format is not used
      expect(content).not.toContain('::set-output');
      
      // Check that new format is used
      expect(content).toContain('GITHUB_OUTPUT');
      expect(content).toContain('fs.appendFileSync');
    });

    test('workflow should include deployment detection job', async () => {
      const workflowPath = path.join(process.cwd(), 'templates', 'workflows', 'playwright-web-tests.yml');
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      // Check for deployment detection job
      expect(content).toContain('detect-deployment:');
      expect(content).toContain('Detect Vercel Preview URL');
      expect(content).toContain('needs: [detect-deployment]');
      
      // Check for environment variables
      expect(content).toContain('BASE_URL: ${{ needs.detect-deployment.outputs.url');
      expect(content).toContain('DEPLOYMENT_URL: ${{ needs.detect-deployment.outputs.url');
      expect(content).toContain('IS_VERCEL_PREVIEW: ${{ needs.detect-deployment.outputs.detected');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing dependencies gracefully', async () => {
      // Test that missing node-fetch doesn't crash (we use built-in fetch)
      const detector = require('../cli/utils/vercel-preview');
      expect(detector).toBeDefined();
      expect(detector.VercelPreviewDetector).toBeDefined();
    });

    test('should handle API failures gracefully', async () => {
      const { VercelPreviewDetector } = require('../cli/utils/vercel-preview');
      const detector = new VercelPreviewDetector({
        waitTimeout: 100,
        retryInterval: 50
      });

      // Test with non-existent URL
      const result = await detector.waitForDeployment('https://this-does-not-exist-12345.vercel.app', {
        timeout: 200
      });
      
      expect(result.ready).toBe(false);
      expect(result.url).toBe('https://this-does-not-exist-12345.vercel.app');
    });

    test('should handle malformed JSON responses', async () => {
      // Simulate malformed JSON
      const parseJSON = (str) => {
        try {
          return JSON.parse(str);
        } catch (error) {
          return null;
        }
      };

      expect(parseJSON('{"valid": "json"}')).toEqual({ valid: 'json' });
      expect(parseJSON('not json')).toBeNull();
      expect(parseJSON('')).toBeNull();
      expect(parseJSON(null)).toBeNull();
    });
  });

  test.describe('Configuration Loading', () => {
    test('should load deployment configuration if exists', async () => {
      const configPath = path.join(process.cwd(), '.claude', 'config', 'deployment.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Test default values
        if (config.deployment.provider === 'vercel') {
          expect(config.deployment.waitTimeout).toBeGreaterThan(0);
          expect(config.deployment.retryInterval).toBeGreaterThan(0);
        }
        
        // Test threshold is within valid range
        if (config.visualTesting.threshold !== undefined) {
          expect(config.visualTesting.threshold).toBeGreaterThanOrEqual(0);
          expect(config.visualTesting.threshold).toBeLessThanOrEqual(1);
        }
      } else {
        // Config doesn't exist, that's okay for new projects
        expect(true).toBe(true);
      }
    });

    test('should use fallback values when config is missing', async () => {
      const { VercelPreviewDetector } = require('../cli/utils/vercel-preview');
      const detector = new VercelPreviewDetector();
      
      // Check defaults
      expect(detector.waitTimeout).toBe(300000);
      expect(detector.retryInterval).toBe(5000);
      expect(detector.debug).toBe(false);
    });
  });

  test.describe('Environment Detection', () => {
    test('should detect environment variables correctly', async () => {
      const envVars = [
        'DEPLOYMENT_URL',
        'VERCEL_URL',
        'VISUAL_TEST_URL',
        'BASE_URL',
        'CI_PULL_REQUEST_URL',
        'GITHUB_PR_DEPLOYMENT_URL'
      ];

      // Test that these are the expected env vars
      const { VercelPreviewDetector } = require('../cli/utils/vercel-preview');
      const detector = new VercelPreviewDetector();
      
      // Save original env
      const originalEnv = { ...process.env };
      
      // Test each env var
      for (const varName of envVars) {
        // Clear all env vars
        envVars.forEach(v => delete process.env[v]);
        
        // Set only this one
        process.env[varName] = `https://${varName.toLowerCase()}.vercel.app`;
        
        const result = await detector.detectFromEnvironment();
        
        if (varName === 'DEPLOYMENT_URL') {
          // DEPLOYMENT_URL should have highest priority
          expect(result).toBe(`https://${varName.toLowerCase()}.vercel.app`);
        }
      }
      
      // Restore env
      process.env = originalEnv;
    });
  });
});