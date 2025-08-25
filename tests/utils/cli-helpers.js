const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class CLITestHelper {
  constructor() {
    this.cliPath = path.join(process.cwd(), 'cli', 'index.js');
    this.testDir = null;
    this.cleanup = [];
  }
  
  async createTestDirectory() {
    // Use OS temp directory for cross-platform compatibility
    const tmpBase = os.tmpdir();
    this.testDir = path.join(tmpBase, `mac-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(this.testDir, { recursive: true });
    this.cleanup.push(this.testDir);
    return this.testDir;
  }
  
  async cleanupAll() {
    // Clean up all test directories created
    for (const dir of this.cleanup) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Failed to cleanup ${dir}:`, error.message);
      }
    }
    this.cleanup = [];
    this.testDir = null;
  }
  
  async runCommand(command, options = {}) {
    if (!this.testDir) {
      throw new Error('Test directory not created. Call createTestDirectory() first.');
    }
    
    const fullCommand = `cd "${this.testDir}" && node "${this.cliPath}" ${command}`;
    const execOptions = {
      timeout: options.timeout || 30000,  // Default 30s timeout
      env: { ...process.env, ...options.env },
      ...options
    };
    
    try {
      const { stdout, stderr } = await execAsync(fullCommand, execOptions);
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: true,
        exitCode: 0
      };
    } catch (error) {
      return {
        stdout: error.stdout ? error.stdout.trim() : '',
        stderr: error.stderr ? error.stderr.trim() : error.message,
        success: false,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }
  
  async verifyFileExists(relativePath) {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const fullPath = path.join(this.testDir, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
  
  async verifyDirectoryExists(relativePath) {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const fullPath = path.join(this.testDir, relativePath);
    try {
      const stats = await fs.stat(fullPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
  
  async readFile(relativePath) {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const fullPath = path.join(this.testDir, relativePath);
    return await fs.readFile(fullPath, 'utf8');
  }
  
  async readConfig() {
    const configPath = path.join(this.testDir, '.claude', 'config.json');
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  }
  
  async listDirectory(relativePath = '') {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const fullPath = path.join(this.testDir, relativePath);
    try {
      return await fs.readdir(fullPath);
    } catch {
      return [];
    }
  }
  
  async getDirectoryStructure(relativePath = '', maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return {};
    
    const fullPath = path.join(this.testDir, relativePath);
    const structure = {};
    
    try {
      const items = await fs.readdir(fullPath);
      
      for (const item of items) {
        const itemPath = path.join(relativePath, item);
        const fullItemPath = path.join(this.testDir, itemPath);
        const stats = await fs.stat(fullItemPath);
        
        if (stats.isDirectory()) {
          structure[item] = await this.getDirectoryStructure(itemPath, maxDepth, currentDepth + 1);
        } else {
          structure[item] = 'file';
        }
      }
    } catch {
      // Return empty structure on error
    }
    
    return structure;
  }
  
  async writeFile(relativePath, content) {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const fullPath = path.join(this.testDir, relativePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);
  }
  
  async copyFixture(fixturePath, targetPath) {
    const fixtureFullPath = path.join(process.cwd(), 'tests', 'fixtures', fixturePath);
    const targetFullPath = path.join(this.testDir, targetPath);
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
    
    // Copy file
    await fs.copyFile(fixtureFullPath, targetFullPath);
  }
  
  async waitForFile(relativePath, timeout = 5000) {
    const startTime = Date.now();
    const checkInterval = 100;
    
    while (Date.now() - startTime < timeout) {
      if (await this.verifyFileExists(relativePath)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return false;
  }
  
  // Helper to simulate user input for interactive commands
  async runInteractiveCommand(command, inputs = [], options = {}) {
    if (!this.testDir) {
      throw new Error('Test directory not created');
    }
    
    const spawn = require('child_process').spawn;
    const fullCommand = `node "${this.cliPath}" ${command}`;
    
    return new Promise((resolve, reject) => {
      const proc = spawn('sh', ['-c', fullCommand], {
        cwd: this.testDir,
        env: { ...process.env, ...options.env }
      });
      
      let stdout = '';
      let stderr = '';
      let inputIndex = 0;
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        
        // Send next input if available
        if (inputIndex < inputs.length) {
          setTimeout(() => {
            proc.stdin.write(inputs[inputIndex] + '\n');
            inputIndex++;
          }, 100);
        }
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          success: code === 0,
          exitCode: code
        });
      });
      
      proc.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        proc.kill();
        reject(new Error('Command timed out'));
      }, options.timeout || 30000);
    });
  }
}

module.exports = { CLITestHelper };