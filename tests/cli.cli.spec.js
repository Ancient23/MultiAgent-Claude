const { test, expect } = require('@playwright/test');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Test helper to run CLI commands
async function runCLI(command) {
  try {
    const { stdout, stderr } = await execAsync(`node cli/index.js ${command}`);
    return { stdout, stderr, success: true };
  } catch (error) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || error.message, 
      success: false,
      error 
    };
  }
}

// Test helper to clean up test artifacts
async function cleanupTestDir(testDir) {
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors if directory doesn't exist
  }
}

test.describe('MultiAgent-Claude CLI Tests', () => {
  
  test.describe('Basic Commands', () => {
    
    test('should display help information', async () => {
      const result = await runCLI('--help');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Usage: multiagent-claude');
      expect(result.stdout).toContain('Commands:');
      expect(result.stdout).toContain('init');
      expect(result.stdout).toContain('memory');
      expect(result.stdout).toContain('agent');
    });
    
    test('should display version', async () => {
      const result = await runCLI('--version');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  test.describe('Memory System', () => {
    
    test('should show memory status', async () => {
      const result = await runCLI('memory status');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Memory System Status');
      expect(result.stdout).toContain('Memory system active');
    });
    
    test('should validate memory system', async () => {
      const result = await runCLI('memory validate');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Validating memory system');
    });
    
    test('should generate memory report', async () => {
      const reportPath = path.join(process.cwd(), '.claude', 'memory', 'reports', 'test-report.md');
      const result = await runCLI(`memory report --output ${reportPath}`);
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Report generated');
      
      // Verify report file was created
      const reportExists = await fs.access(reportPath).then(() => true).catch(() => false);
      expect(reportExists).toBeTruthy();
      
      // Clean up
      await fs.unlink(reportPath).catch(() => {});
    });
    
    test('should search memory patterns', async () => {
      const result = await runCLI('memory search "pattern"');
      expect(result.success).toBeTruthy();
      // Should not fail even if no results
    });
  });

  test.describe('Agent Management', () => {
    
    test('should list available agents', async () => {
      const result = await runCLI('agent list');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Available Agent Templates');
    });
    
    test('should show agent details', async () => {
      const result = await runCLI('agent inspect ai-agent-architect');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Agent Template: ai-agent-architect');
    });
  });

  test.describe('Command Management', () => {
    
    test('should list available commands', async () => {
      const result = await runCLI('command list');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Available Command Templates');
    });
  });

  test.describe('Initialization Tests', () => {
    const testDir = path.join(process.cwd(), 'test-init-dir');
    
    test.beforeEach(async () => {
      await cleanupTestDir(testDir);
      await fs.mkdir(testDir, { recursive: true });
    });
    
    test.afterEach(async () => {
      await cleanupTestDir(testDir);
    });
    
    test('should detect project not initialized', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = await runCLI('memory status');
        expect(result.success).toBeFalsy();
        expect(result.stderr).toContain('Memory system not found');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle invalid commands gracefully', async () => {
      const result = await runCLI('invalid-command');
      expect(result.success).toBeFalsy();
      expect(result.stderr).toContain('Unknown command');
    });
    
    test('should handle invalid memory actions', async () => {
      const result = await runCLI('memory invalid-action');
      expect(result.success).toBeTruthy(); // CLI doesn't exit with error
      expect(result.stdout).toContain('Unknown action');
    });
    
    test('should handle missing agent name', async () => {
      const result = await runCLI('agent inspect');
      expect(result.stdout).toContain('No agent specified');
    });
  });

  test.describe('Integration Tests', () => {
    
    test('should handle memory learn from commit', async () => {
      const result = await runCLI('memory update-from-commit --commit HEAD');
      expect(result.success).toBeTruthy();
      expect(result.stdout).toContain('Learning from commit');
    });
    
    test('should export memory', async () => {
      const exportPath = path.join(process.cwd(), 'test-export.json');
      const result = await runCLI(`memory export --file ${exportPath}`);
      expect(result.success).toBeTruthy();
      
      // Clean up
      await fs.unlink(exportPath).catch(() => {});
    });
  });
});

test.describe('CLI Performance Tests', () => {
  
  test('should execute commands within reasonable time', async () => {
    const startTime = Date.now();
    await runCLI('memory status');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
  
  test('should handle concurrent commands', async () => {
    const commands = [
      runCLI('memory status'),
      runCLI('agent list'),
      runCLI('command list'),
    ];
    
    const results = await Promise.all(commands);
    results.forEach(result => {
      expect(result.success).toBeTruthy();
    });
  });
});