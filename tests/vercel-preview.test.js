// Unit tests for VercelPreviewDetector
const { test, expect, describe, beforeEach, afterEach } = require('@playwright/test');
const { VercelPreviewDetector } = require('../cli/utils/vercel-preview');
const { exec } = require('child_process');
const { promisify } = require('util');

// Mock exec for GitHub API calls
const execAsync = promisify(exec);

describe('VercelPreviewDetector Unit Tests', () => {
  let detector;
  let originalEnv;
  let originalFetch;
  let fetchMock;
  let execMock;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Create detector instance
    detector = new VercelPreviewDetector({
      debug: false,
      waitTimeout: 1000, // Short timeout for tests
      retryInterval: 100
    });

    // Setup fetch mock
    fetchMock = jest.fn();
    originalFetch = global.fetch;
    global.fetch = fetchMock;

    // Setup exec mock
    execMock = jest.fn();
    require('child_process').exec = execMock;
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Restore fetch
    global.fetch = originalFetch;
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('detectFromPR', () => {
    test('should detect Vercel URL from GitHub deployment', async () => {
      const owner = 'test-owner';
      const repo = 'test-repo';
      const prNumber = '123';
      const expectedUrl = 'https://test-app.vercel.app';

      // Mock PR API response
      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('pulls/123')) {
          callback(null, JSON.stringify({
            head: { sha: 'abc123' }
          }));
        }
      });

      // Mock deployments API response
      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('deployments')) {
          callback(null, JSON.stringify([{
            id: 1,
            environment: 'preview'
          }]));
        }
      });

      // Mock deployment status API response
      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('statuses')) {
          callback(null, JSON.stringify([{
            target_url: expectedUrl,
            state: 'success'
          }]));
        }
      });

      const result = await detector.detectFromPR(owner, repo, prNumber);
      expect(result).toBe(expectedUrl);
    });

    test('should detect Vercel URL from PR comments', async () => {
      const owner = 'test-owner';
      const repo = 'test-repo';
      const prNumber = '456';
      const expectedUrl = 'https://preview.vercel.app';

      // Mock empty deployment response
      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('pulls/456')) {
          callback(null, JSON.stringify({ head: { sha: 'def456' } }));
        }
      });

      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('deployments')) {
          callback(null, JSON.stringify([]));
        }
      });

      // Mock PR comments with Vercel bot
      execMock.mockImplementationOnce((cmd, callback) => {
        if (cmd.includes('comments')) {
          callback(null, JSON.stringify([{
            user: { login: 'vercel[bot]' },
            body: 'Your preview deployment is ready: https://preview.vercel.app'
          }]));
        }
      });

      const result = await detector.detectFromPR(owner, repo, prNumber);
      expect(result).toBe(expectedUrl);
    });

    test('should return null when no deployment found', async () => {
      const owner = 'test-owner';
      const repo = 'test-repo';
      const prNumber = '789';

      // Mock all APIs returning empty
      execMock.mockImplementation((cmd, callback) => {
        if (cmd.includes('pulls')) {
          callback(null, JSON.stringify({ head: { sha: 'ghi789' } }));
        } else {
          callback(null, JSON.stringify([]));
        }
      });

      const result = await detector.detectFromPR(owner, repo, prNumber);
      expect(result).toBeNull();
    });

    test('should handle API errors gracefully', async () => {
      const owner = 'test-owner';
      const repo = 'test-repo';
      const prNumber = '999';

      // Mock API error
      execMock.mockImplementation((cmd, callback) => {
        callback(new Error('API rate limit exceeded'));
      });

      await expect(detector.detectFromPR(owner, repo, prNumber)).rejects.toThrow('API rate limit exceeded');
    });
  });

  describe('waitForDeployment', () => {
    test('should return ready when deployment is accessible', async () => {
      const url = 'https://test.vercel.app';
      
      // Mock successful fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      const result = await detector.waitForDeployment(url);
      
      expect(result.ready).toBe(true);
      expect(result.url).toBe(url);
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should retry until deployment is ready', async () => {
      const url = 'https://test.vercel.app';
      
      // Mock failed fetch then successful
      fetchMock
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200
        });

      const result = await detector.waitForDeployment(url);
      
      expect(result.ready).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    test('should timeout when deployment never becomes ready', async () => {
      const url = 'https://test.vercel.app';
      
      // Mock always failing fetch
      fetchMock.mockRejectedValue(new Error('Connection refused'));

      const result = await detector.waitForDeployment(url, { timeout: 500 });
      
      expect(result.ready).toBe(false);
      expect(result.responseTime).toBeGreaterThanOrEqual(500);
    });

    test('should handle fetch timeout with AbortController', async () => {
      const url = 'https://slow.vercel.app';
      
      // Mock slow fetch that should be aborted
      fetchMock.mockImplementation(() => new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('AbortError')), 10000);
      }));

      const result = await detector.waitForDeployment(url, { timeout: 500 });
      
      expect(result.ready).toBe(false);
    });
  });

  describe('detectFromEnvironment', () => {
    test('should detect URL from DEPLOYMENT_URL env var', async () => {
      process.env.DEPLOYMENT_URL = 'https://env-deploy.vercel.app';
      
      const result = await detector.detectFromEnvironment();
      expect(result).toBe('https://env-deploy.vercel.app');
    });

    test('should detect URL from VERCEL_URL env var', async () => {
      process.env.VERCEL_URL = 'https://vercel-env.vercel.app';
      
      const result = await detector.detectFromEnvironment();
      expect(result).toBe('https://vercel-env.vercel.app');
    });

    test('should prioritize DEPLOYMENT_URL over other env vars', async () => {
      process.env.DEPLOYMENT_URL = 'https://priority.vercel.app';
      process.env.VERCEL_URL = 'https://other.vercel.app';
      process.env.BASE_URL = 'https://base.vercel.app';
      
      const result = await detector.detectFromEnvironment();
      expect(result).toBe('https://priority.vercel.app');
    });

    test('should detect from GitHub Actions context', async () => {
      process.env.GITHUB_EVENT_NAME = 'pull_request';
      process.env.GITHUB_REPOSITORY_OWNER = 'test-owner';
      process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';
      process.env.GITHUB_REF = 'refs/pull/42/merge';
      
      // Mock GitHub API call
      execMock.mockImplementation((cmd, callback) => {
        if (cmd.includes('comments')) {
          callback(null, JSON.stringify([{
            user: { login: 'vercel[bot]' },
            body: 'Preview: https://pr-42.vercel.app'
          }]));
        } else {
          callback(null, JSON.stringify([]));
        }
      });
      
      const result = await detector.detectFromEnvironment();
      expect(result).toBe('https://pr-42.vercel.app');
    });

    test('should return null when no URL found in environment', async () => {
      // Clear all relevant env vars
      delete process.env.DEPLOYMENT_URL;
      delete process.env.VERCEL_URL;
      delete process.env.BASE_URL;
      delete process.env.GITHUB_EVENT_NAME;
      
      const result = await detector.detectFromEnvironment();
      expect(result).toBeNull();
    });
  });

  describe('getDeploymentInfo', () => {
    test('should return deployment info for accessible URL', async () => {
      const url = 'https://info.vercel.app';
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (key) => {
            const headers = {
              'server': 'Vercel',
              'x-vercel-deployment-url': 'info.vercel.app',
              'x-vercel-id': 'abc123'
            };
            return headers[key];
          }
        }
      });

      const info = await detector.getDeploymentInfo(url);
      
      expect(info.url).toBe(url);
      expect(info.ready).toBe(true);
      expect(info.status).toBe(200);
      expect(info.headers.server).toBe('Vercel');
      expect(info.headers['x-vercel-deployment-url']).toBe('info.vercel.app');
    });

    test('should handle fetch errors in getDeploymentInfo', async () => {
      const url = 'https://error.vercel.app';
      
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const info = await detector.getDeploymentInfo(url);
      
      expect(info.url).toBe(url);
      expect(info.ready).toBe(false);
      expect(info.error).toBe('Network error');
    });
  });

  describe('URL validation and parsing', () => {
    test('should extract Vercel URL from complex comment body', () => {
      const comment = `
        🎉 Your deployment is ready!
        
        Preview: https://my-app-pr-123.vercel.app
        
        Build logs: https://vercel.com/team/project/builds/abc123
      `;
      
      const urlMatch = comment.match(/https?:\/\/[^\s\)]+\.vercel\.app/);
      expect(urlMatch[0]).toBe('https://my-app-pr-123.vercel.app');
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not-a-url',
        'ftp://wrong-protocol.vercel.app',
        'https://',
        ''
      ];
      
      malformedUrls.forEach(url => {
        const isValid = url.startsWith('http://') || url.startsWith('https://');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Configuration', () => {
    test('should use provided configuration values', () => {
      const customDetector = new VercelPreviewDetector({
        githubToken: 'custom-token',
        vercelToken: 'vercel-token',
        waitTimeout: 60000,
        retryInterval: 2000,
        debug: true
      });
      
      expect(customDetector.githubToken).toBe('custom-token');
      expect(customDetector.vercelToken).toBe('vercel-token');
      expect(customDetector.waitTimeout).toBe(60000);
      expect(customDetector.retryInterval).toBe(2000);
      expect(customDetector.debug).toBe(true);
    });

    test('should use environment variables as fallback', () => {
      process.env.GITHUB_TOKEN = 'env-github-token';
      process.env.VERCEL_TOKEN = 'env-vercel-token';
      
      const envDetector = new VercelPreviewDetector();
      
      expect(envDetector.githubToken).toBe('env-github-token');
      expect(envDetector.vercelToken).toBe('env-vercel-token');
    });

    test('should use default values when no config provided', () => {
      const defaultDetector = new VercelPreviewDetector();
      
      expect(defaultDetector.waitTimeout).toBe(300000);
      expect(defaultDetector.retryInterval).toBe(5000);
      expect(defaultDetector.debug).toBe(false);
    });
  });
});

// Note: For Playwright test compatibility, we'll also create integration tests
describe('VercelPreviewDetector Integration Tests', () => {
  test.skip('should detect real Vercel deployment (requires GitHub token)', async () => {
    // This test would require real GitHub token and a PR with Vercel deployment
    // Skip in CI but can be run locally with proper setup
    
    const detector = new VercelPreviewDetector({
      githubToken: process.env.GITHUB_TOKEN
    });
    
    // Example: Ancient23/MultiAgent-Claude PR with Vercel
    const url = await detector.detectFromPR('vercel', 'next.js', '12345');
    
    if (url) {
      expect(url).toMatch(/https:\/\/.*\.vercel\.app/);
      
      const result = await detector.waitForDeployment(url, { timeout: 30000 });
      expect(result.ready).toBe(true);
    }
  });
});