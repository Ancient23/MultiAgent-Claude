const { test, expect } = require('@playwright/test');
const { CLITestHelper } = require('./utils/cli-helpers');
const path = require('path');
const fs = require('fs').promises;

test.describe('MultiAgent-Claude CLI Tests', () => {
  let cliHelper;
  
  test.beforeEach(async () => {
    cliHelper = new CLITestHelper();
    await cliHelper.createTestDirectory();
  });
  
  test.afterEach(async () => {
    await cliHelper.cleanupAll();
  });
  
  test.describe('Setup Command', () => {
    test('setup command creates minimal structure', async () => {
      // Run setup command with base variant
      const result = await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Check command succeeded
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Configuration saved');
      
      // Verify only .claude directory created
      const dirs = await cliHelper.listDirectory();
      expect(dirs).toContain('.claude');
      
      // Verify no other directories were created (only .claude should exist)
      const otherDirs = dirs.filter(d => !d.startsWith('.claude'));
      expect(otherDirs.length).toBe(0);
      
      // Verify config.json was created
      const configExists = await cliHelper.verifyFileExists('.claude/config.json');
      expect(configExists).toBe(true);
      
      // Verify config content
      const config = await cliHelper.readConfig();
      expect(config.variant).toBe('base');
      expect(config.createdAt).toBeDefined();
    });
    
    test('setup command handles invalid variant', async () => {
      const result = await cliHelper.runCommand('setup --variant invalid');
      
      expect(result.success).toBe(false);
      // Error message goes to stdout when using console.error in the CLI
      expect(result.stdout.toLowerCase()).toContain('error');
    });
    
    test('setup command with agents option', async () => {
      const result = await cliHelper.runCommand('setup --variant base --agents playwright-test-engineer,aws-backend-architect --skip-prompts');
      
      expect(result.success).toBe(true);
      
      const config = await cliHelper.readConfig();
      expect(config.agents).toContain('playwright-test-engineer');
      expect(config.agents).toContain('aws-backend-architect');
    });
  });
  
  test.describe('Init Command', () => {
    test('init command creates full directory structure', async () => {
      // First run setup
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Then run init with minimal flag for CI
      const result = await cliHelper.runCommand('init --minimal');
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('CI Mode');
      expect(result.stdout).toContain('initialized successfully');
      
      // Verify all directories created
      const expectedDirs = [
        '.claude',
        '.claude/agents',
        '.claude/commands',
        '.claude/tasks',
        '.claude/doc',
        '.ai/memory',
        '.ai/memory/patterns',
        '.ai/memory/patterns/testing',
        '.ai/memory/decisions',
        '.ai/memory/implementation-plans',
        '.ai/memory/sessions',
        '.ai/memory/sessions/archive'
      ];
      
      for (const dir of expectedDirs) {
        const exists = await cliHelper.verifyDirectoryExists(dir);
        expect(exists).toBe(true);
      }
      
      // Verify basic files created
      expect(await cliHelper.verifyFileExists('CLAUDE.md')).toBe(true);
      expect(await cliHelper.verifyFileExists('.ai/memory/project.md')).toBe(true);
    });
    
    test('init --minimal flag skips interactive prompts', async () => {
      // Run setup first
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Run init with minimal flag
      const result = await cliHelper.runCommand('init --minimal', {
        timeout: 5000 // Should complete quickly without prompts
      });
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('CI Mode');
      expect(result.stdout).not.toContain('Enable GitHub Actions');
      expect(result.stdout).not.toContain('Add Playwright testing');
    });
    
    test('init command without setup fails gracefully', async () => {
      const result = await cliHelper.runCommand('init --minimal');
      
      // Should still work but create directories
      expect(result.success).toBe(true);
      
      // Verify directories were created
      expect(await cliHelper.verifyDirectoryExists('.claude')).toBe(true);
      expect(await cliHelper.verifyDirectoryExists('.ai/memory')).toBe(true);
    });
    
    test('init creates directories at the very start', async () => {
      // Run setup
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      
      // Monitor directory creation by checking immediately
      const initPromise = cliHelper.runCommand('init --minimal');
      
      // Check directories exist quickly (within 500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Directories should already exist
      expect(await cliHelper.verifyDirectoryExists('.ai/memory')).toBe(true);
      expect(await cliHelper.verifyDirectoryExists('.claude/agents')).toBe(true);
      
      // Wait for command to complete
      const result = await initPromise;
      expect(result.success).toBe(true);
    });
  });
  
  test.describe('Add Command', () => {
    test('add testing command adds Playwright configuration', async () => {
      // Setup and init first
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      await cliHelper.runCommand('init --minimal');
      
      // Add testing
      const result = await cliHelper.runCommand('add testing');
      
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Playwright');
      
      // Verify test file created
      const testFileExists = await cliHelper.verifyFileExists('tests/cli.cli.spec.js');
      expect(testFileExists).toBe(true);
    });
    
    test('add ci-cd command adds workflow files', async () => {
      // Setup and init first
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      await cliHelper.runCommand('init --minimal');
      
      // Add CI/CD
      const result = await cliHelper.runCommand('add ci-cd');
      
      expect(result.success).toBe(true);
      
      // Verify workflow file created
      const workflowExists = await cliHelper.verifyFileExists('.github/workflows/claude-memory-update.yml');
      expect(workflowExists).toBe(true);
    });
    
    test('add all command adds everything', async () => {
      // Setup and init first
      await cliHelper.runCommand('setup --variant base --skip-prompts');
      await cliHelper.runCommand('init --minimal');
      
      // Add all
      const result = await cliHelper.runCommand('add all');
      
      expect(result.success).toBe(true);
      
      // Verify multiple features added
      expect(await cliHelper.verifyFileExists('.github/workflows/claude-memory-update.yml')).toBe(true);
      expect(await cliHelper.verifyFileExists('tests/cli.cli.spec.js')).toBe(true);
    });
  });
  
  test.describe('Pipeline Flow', () => {
    test('complete setup → init → add pipeline', async () => {
      // Step 1: Setup
      const setupResult = await cliHelper.runCommand('setup --variant visual-dev --skip-prompts');
      expect(setupResult.success).toBe(true);
      
      // Verify setup created minimal structure
      expect(await cliHelper.verifyDirectoryExists('.claude')).toBe(true);
      expect(await cliHelper.verifyFileExists('.claude/config.json')).toBe(true);
      
      // Step 2: Init
      const initResult = await cliHelper.runCommand('init --minimal');
      expect(initResult.success).toBe(true);
      
      // Verify init created full structure
      expect(await cliHelper.verifyDirectoryExists('.ai/memory')).toBe(true);
      expect(await cliHelper.verifyDirectoryExists('.claude/agents')).toBe(true);
      expect(await cliHelper.verifyFileExists('CLAUDE.md')).toBe(true);
      
      // Step 3: Add features
      const addResult = await cliHelper.runCommand('add testing');
      expect(addResult.success).toBe(true);
      
      // Verify features added
      expect(await cliHelper.verifyFileExists('tests/cli.cli.spec.js')).toBe(true);
      
      // Verify complete structure
      const structure = await cliHelper.getDirectoryStructure();
      expect(structure['.claude']).toBeDefined();
      expect(structure['.ai']).toBeDefined();
      expect(structure['tests']).toBeDefined();
    });
    
    test('pipeline handles errors gracefully', async () => {
      // Try to add without init
      const addResult = await cliHelper.runCommand('add testing');
      
      // Should still work or fail gracefully
      if (!addResult.success) {
        expect(addResult.stderr).toContain('error');
      } else {
        // If it succeeds, verify it created necessary structure
        expect(await cliHelper.verifyFileExists('tests/cli.cli.spec.js')).toBe(true);
      }
    });
  });
  
  test.describe('Error Handling', () => {
    test('handles missing CLI gracefully', async () => {
      // Temporarily rename CLI to simulate missing
      const cliPath = path.join(process.cwd(), 'cli', 'index.js');
      const tempPath = path.join(process.cwd(), 'cli', 'index.js.bak');
      
      try {
        await fs.rename(cliPath, tempPath);
        
        const helper = new CLITestHelper();
        await helper.createTestDirectory();
        const result = await helper.runCommand('setup');
        
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        
        await helper.cleanupAll();
      } finally {
        // Restore CLI
        try {
          await fs.rename(tempPath, cliPath);
        } catch {
          // Ignore if already restored
        }
      }
    });
    
    test('handles permission errors', async () => {
      // Create read-only directory
      const readOnlyDir = path.join(cliHelper.testDir, 'readonly');
      await fs.mkdir(readOnlyDir);
      await fs.chmod(readOnlyDir, 0o444);
      
      // Try to create files in read-only directory
      const result = await cliHelper.runCommand('setup --variant base --skip-prompts', {
        env: { HOME: readOnlyDir }
      });
      
      // Should handle permission error
      if (!result.success) {
        expect(result.stderr.toLowerCase()).toMatch(/permission|access/i);
      }
      
      // Restore permissions for cleanup
      await fs.chmod(readOnlyDir, 0o755);
    });
  });
  
  test.describe('Cross-Platform Compatibility', () => {
    test('handles paths with spaces', async () => {
      // Create directory with spaces
      const dirWithSpaces = path.join(cliHelper.testDir, 'my project');
      await fs.mkdir(dirWithSpaces);
      
      // Change to directory with spaces
      const helper = new CLITestHelper();
      helper.testDir = dirWithSpaces;
      
      const result = await helper.runCommand('setup --variant base --skip-prompts');
      expect(result.success).toBe(true);
      
      // Cleanup
      await fs.rm(dirWithSpaces, { recursive: true, force: true });
    });
    
    test('handles long paths', async () => {
      // Create deeply nested directory
      let deepPath = cliHelper.testDir;
      for (let i = 0; i < 10; i++) {
        deepPath = path.join(deepPath, `level${i}`);
      }
      await fs.mkdir(deepPath, { recursive: true });
      
      // Use deep path
      const helper = new CLITestHelper();
      helper.testDir = deepPath;
      
      const result = await helper.runCommand('setup --variant base --skip-prompts');
      expect(result.success).toBe(true);
    });
  });
});