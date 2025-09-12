#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Bidirectional Sync Service for Agent/Role Templates
 * Synchronizes changes between Claude and ChatGPT platforms automatically
 */

class SyncService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      claudeDir: config.claudeDir || path.join(process.cwd(), 'Examples/agents'),
      chatgptDir: config.chatgptDir || path.join(process.cwd(), 'Examples/roles'),
      syncInterval: config.syncInterval || 30000, // 30 seconds
      autoConvert: config.autoConvert !== false,
      conflictStrategy: config.conflictStrategy || 'manual', // manual, newest, claude, chatgpt
      ...config
    };
    
    this.syncState = {
      lastSync: null,
      pending: [],
      conflicts: [],
      synced: new Map(),
      errors: []
    };
    
    this.converter = null;
    this.validator = null;
    this.watchers = [];
    
    this.initializeServices();
  }

  /**
   * Initialize required services
   */
  async initializeServices() {
    // Load converter
    try {
      const ConverterClass = require('./convert-agent.js').AgentRoleConverter;
      this.converter = new ConverterClass();
    } catch (error) {
      console.error('Failed to load converter:', error.message);
    }
    
    // Load validator
    try {
      const ValidatorClass = require('./validate-agents.js').AgentValidator;
      this.validator = new ValidatorClass();
    } catch (error) {
      console.error('Failed to load validator:', error.message);
    }
    
    // Initialize sync state
    await this.loadSyncState();
  }

  /**
   * Start the sync service
   */
  async start() {
    console.log('🔄 Starting Sync Service...');
    
    // Initial sync
    await this.performSync();
    
    // Set up file watchers
    this.setupWatchers();
    
    // Set up periodic sync
    this.syncTimer = setInterval(() => {
      this.performSync();
    }, this.config.syncInterval);
    
    // Set up conflict resolution monitor
    this.monitorConflicts();
    
    this.emit('started');
    console.log('✅ Sync Service started');
  }

  /**
   * Stop the sync service
   */
  stop() {
    console.log('🛑 Stopping Sync Service...');
    
    // Stop watchers
    this.watchers.forEach(watcher => watcher.close());
    this.watchers = [];
    
    // Stop sync timer
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    // Save state
    this.saveSyncState();
    
    this.emit('stopped');
    console.log('✅ Sync Service stopped');
  }

  /**
   * Set up file watchers
   */
  setupWatchers() {
    // Watch Claude agents directory
    const claudeWatcher = chokidar.watch(this.config.claudeDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 2
    });
    
    claudeWatcher
      .on('add', filepath => this.handleFileChange('claude', filepath, 'added'))
      .on('change', filepath => this.handleFileChange('claude', filepath, 'modified'))
      .on('unlink', filepath => this.handleFileChange('claude', filepath, 'deleted'));
    
    this.watchers.push(claudeWatcher);
    
    // Watch ChatGPT roles directory
    const chatgptWatcher = chokidar.watch(this.config.chatgptDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 2
    });
    
    chatgptWatcher
      .on('add', filepath => this.handleFileChange('chatgpt', filepath, 'added'))
      .on('change', filepath => this.handleFileChange('chatgpt', filepath, 'modified'))
      .on('unlink', filepath => this.handleFileChange('chatgpt', filepath, 'deleted'));
    
    this.watchers.push(chatgptWatcher);
  }

  /**
   * Handle file change events
   */
  async handleFileChange(platform, filepath, event) {
    if (!filepath.endsWith('.md')) return;
    
    const filename = path.basename(filepath);
    console.log(`📝 ${event}: ${filename} (${platform})`);
    
    // Add to pending queue
    this.syncState.pending.push({
      platform,
      filepath,
      event,
      timestamp: new Date().toISOString()
    });
    
    // Trigger sync if auto-convert is enabled
    if (this.config.autoConvert) {
      await this.syncFile(filepath, platform);
    }
    
    this.emit('file-changed', { platform, filepath, event });
  }

  /**
   * Perform full synchronization
   */
  async performSync() {
    console.log('🔄 Performing sync...');
    const startTime = Date.now();
    
    const results = {
      synced: 0,
      conflicts: 0,
      errors: 0,
      skipped: 0
    };
    
    try {
      // Get all files from both directories
      const claudeFiles = await this.getFiles(this.config.claudeDir);
      const chatgptFiles = await this.getFiles(this.config.chatgptDir);
      
      // Create mapping
      const fileMap = new Map();
      
      claudeFiles.forEach(file => {
        const name = path.basename(file, '.md');
        if (!fileMap.has(name)) {
          fileMap.set(name, {});
        }
        fileMap.get(name).claude = file;
      });
      
      chatgptFiles.forEach(file => {
        const name = path.basename(file, '.md');
        if (!fileMap.has(name)) {
          fileMap.set(name, {});
        }
        fileMap.get(name).chatgpt = file;
      });
      
      // Sync each file pair
      for (const [name, files] of fileMap.entries()) {
        const result = await this.syncPair(name, files);
        results[result]++;
      }
      
      // Process pending changes
      while (this.syncState.pending.length > 0) {
        const change = this.syncState.pending.shift();
        await this.processChange(change);
      }
      
    } catch (error) {
      console.error('Sync error:', error.message);
      results.errors++;
    }
    
    // Update sync state
    this.syncState.lastSync = new Date().toISOString();
    await this.saveSyncState();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Sync complete in ${duration}ms:`, results);
    
    this.emit('sync-complete', results);
    return results;
  }

  /**
   * Sync a single file pair
   */
  async syncPair(name, files) {
    // Both files exist - check for conflicts
    if (files.claude && files.chatgpt) {
      return await this.resolveConflict(name, files);
    }
    
    // Only Claude file exists - convert to ChatGPT
    if (files.claude && !files.chatgpt) {
      if (this.config.autoConvert) {
        return await this.convertToRole(files.claude);
      }
      return 'skipped';
    }
    
    // Only ChatGPT file exists - convert to Claude
    if (!files.claude && files.chatgpt) {
      if (this.config.autoConvert) {
        return await this.convertToAgent(files.chatgpt);
      }
      return 'skipped';
    }
    
    return 'skipped';
  }

  /**
   * Resolve conflicts between files
   */
  async resolveConflict(name, files) {
    const claudeContent = fs.readFileSync(files.claude, 'utf8');
    const chatgptContent = fs.readFileSync(files.chatgpt, 'utf8');
    
    // Calculate hashes
    const claudeHash = crypto.createHash('md5').update(claudeContent).digest('hex');
    const chatgptHash = crypto.createHash('md5').update(chatgptContent).digest('hex');
    
    // Check if already synced
    const syncedHash = this.syncState.synced.get(name);
    if (syncedHash && syncedHash.claude === claudeHash && syncedHash.chatgpt === chatgptHash) {
      return 'skipped'; // Already in sync
    }
    
    // Check modification times
    const claudeStats = fs.statSync(files.claude);
    const chatgptStats = fs.statSync(files.chatgpt);
    
    // Determine which is newer
    const claudeNewer = claudeStats.mtime > chatgptStats.mtime;
    
    // Apply conflict resolution strategy
    switch (this.config.conflictStrategy) {
      case 'newest':
        if (claudeNewer) {
          await this.convertToRole(files.claude);
        } else {
          await this.convertToAgent(files.chatgpt);
        }
        break;
        
      case 'claude':
        await this.convertToRole(files.claude);
        break;
        
      case 'chatgpt':
        await this.convertToAgent(files.chatgpt);
        break;
        
      case 'manual':
      default:
        // Add to conflicts list
        this.syncState.conflicts.push({
          name,
          files,
          claudeModified: claudeStats.mtime,
          chatgptModified: chatgptStats.mtime,
          timestamp: new Date().toISOString()
        });
        return 'conflicts';
    }
    
    // Update synced state
    this.syncState.synced.set(name, {
      claude: claudeHash,
      chatgpt: chatgptHash,
      lastSync: new Date().toISOString()
    });
    
    return 'synced';
  }

  /**
   * Convert Claude agent to ChatGPT role
   */
  async convertToRole(agentPath) {
    if (!this.converter) {
      console.error('Converter not available');
      return 'errors';
    }
    
    try {
      const content = fs.readFileSync(agentPath, 'utf8');
      const agent = { content, name: path.basename(agentPath) };
      
      const role = this.converter.claudeToChatGPT(agent);
      
      const rolePath = path.join(
        this.config.chatgptDir,
        path.basename(agentPath)
      );
      
      fs.writeFileSync(rolePath, role.content);
      console.log(`✅ Converted to role: ${path.basename(agentPath)}`);
      
      return 'synced';
    } catch (error) {
      console.error(`Failed to convert ${agentPath}:`, error.message);
      this.syncState.errors.push({
        file: agentPath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return 'errors';
    }
  }

  /**
   * Convert ChatGPT role to Claude agent
   */
  async convertToAgent(rolePath) {
    if (!this.converter) {
      console.error('Converter not available');
      return 'errors';
    }
    
    try {
      const content = fs.readFileSync(rolePath, 'utf8');
      const role = { content, name: path.basename(rolePath) };
      
      const agent = this.converter.chatGPTToClaude(role);
      
      const agentPath = path.join(
        this.config.claudeDir,
        path.basename(rolePath)
      );
      
      fs.writeFileSync(agentPath, agent.content);
      console.log(`✅ Converted to agent: ${path.basename(rolePath)}`);
      
      return 'synced';
    } catch (error) {
      console.error(`Failed to convert ${rolePath}:`, error.message);
      this.syncState.errors.push({
        file: rolePath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return 'errors';
    }
  }

  /**
   * Sync a single file
   */
  async syncFile(filepath, platform) {
    const name = path.basename(filepath, '.md');
    
    if (platform === 'claude') {
      const rolePath = path.join(this.config.chatgptDir, path.basename(filepath));
      if (!fs.existsSync(rolePath)) {
        return await this.convertToRole(filepath);
      }
    } else {
      const agentPath = path.join(this.config.claudeDir, path.basename(filepath));
      if (!fs.existsSync(agentPath)) {
        return await this.convertToAgent(filepath);
      }
    }
    
    // Files exist on both sides - check for conflict
    const files = {};
    if (platform === 'claude') {
      files.claude = filepath;
      files.chatgpt = path.join(this.config.chatgptDir, path.basename(filepath));
    } else {
      files.claude = path.join(this.config.claudeDir, path.basename(filepath));
      files.chatgpt = filepath;
    }
    
    return await this.syncPair(name, files);
  }

  /**
   * Process a pending change
   */
  async processChange(change) {
    switch (change.event) {
      case 'added':
      case 'modified':
        await this.syncFile(change.filepath, change.platform);
        break;
        
      case 'deleted':
        // Handle deletion based on strategy
        if (this.config.deleteSync) {
          await this.handleDeletion(change);
        }
        break;
    }
  }

  /**
   * Handle file deletion
   */
  async handleDeletion(change) {
    const filename = path.basename(change.filepath);
    const targetPath = change.platform === 'claude'
      ? path.join(this.config.chatgptDir, filename)
      : path.join(this.config.claudeDir, filename);
    
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      console.log(`🗑️ Deleted synced file: ${filename}`);
    }
  }

  /**
   * Monitor and resolve conflicts
   */
  monitorConflicts() {
    if (this.syncState.conflicts.length > 0) {
      console.log(`\n⚠️  ${this.syncState.conflicts.length} conflicts need resolution:`);
      this.syncState.conflicts.forEach(conflict => {
        console.log(`  - ${conflict.name}`);
        console.log(`    Claude: ${new Date(conflict.claudeModified).toLocaleString()}`);
        console.log(`    ChatGPT: ${new Date(conflict.chatgptModified).toLocaleString()}`);
      });
    }
  }

  /**
   * Manually resolve a conflict
   */
  async resolveConflictManual(name, choice) {
    const conflictIndex = this.syncState.conflicts.findIndex(c => c.name === name);
    if (conflictIndex === -1) {
      console.error(`No conflict found for ${name}`);
      return false;
    }
    
    const conflict = this.syncState.conflicts[conflictIndex];
    
    switch (choice) {
      case 'claude':
        await this.convertToRole(conflict.files.claude);
        break;
      case 'chatgpt':
        await this.convertToAgent(conflict.files.chatgpt);
        break;
      case 'skip':
        // Do nothing
        break;
      default:
        console.error('Invalid choice. Use: claude, chatgpt, or skip');
        return false;
    }
    
    // Remove from conflicts
    this.syncState.conflicts.splice(conflictIndex, 1);
    console.log(`✅ Conflict resolved for ${name}`);
    
    return true;
  }

  /**
   * Get all files in a directory
   */
  async getFiles(directory) {
    if (!fs.existsSync(directory)) {
      return [];
    }
    
    const files = [];
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recurse into subdirectories
        const subFiles = await this.getFiles(itemPath);
        files.push(...subFiles);
      } else if (item.endsWith('.md') && !item.includes('README') && !item.includes('TEMPLATE')) {
        files.push(itemPath);
      }
    }
    
    return files;
  }

  /**
   * Load sync state
   */
  async loadSyncState() {
    const stateFile = path.join(process.cwd(), '.claude', 'sync-state.json');
    if (fs.existsSync(stateFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        this.syncState = {
          ...this.syncState,
          ...data,
          synced: new Map(data.synced || [])
        };
      } catch (error) {
        console.error('Failed to load sync state:', error.message);
      }
    }
  }

  /**
   * Save sync state
   */
  async saveSyncState() {
    const stateFile = path.join(process.cwd(), '.claude', 'sync-state.json');
    const stateDir = path.dirname(stateFile);
    
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    
    const data = {
      ...this.syncState,
      synced: Array.from(this.syncState.synced.entries())
    };
    
    fs.writeFileSync(stateFile, JSON.stringify(data, null, 2));
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      running: !!this.syncTimer,
      lastSync: this.syncState.lastSync,
      pending: this.syncState.pending.length,
      conflicts: this.syncState.conflicts.length,
      errors: this.syncState.errors.length,
      synced: this.syncState.synced.size
    };
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.syncState.errors = [];
    console.log('✅ Errors cleared');
  }

  /**
   * Clear conflicts
   */
  clearConflicts() {
    this.syncState.conflicts = [];
    console.log('✅ Conflicts cleared');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Load or create service instance
  let service;
  
  switch (command) {
    case 'start':
      service = new SyncService({
        autoConvert: true,
        conflictStrategy: args[1] || 'manual'
      });
      
      await service.start();
      
      // Keep running
      process.on('SIGINT', () => {
        service.stop();
        process.exit(0);
      });
      break;
      
    case 'sync':
      service = new SyncService();
      const results = await service.performSync();
      console.log('Sync results:', results);
      break;
      
    case 'status':
      service = new SyncService();
      await service.loadSyncState();
      const status = service.getStatus();
      console.log('\n📊 Sync Service Status');
      console.log(`Last Sync: ${status.lastSync || 'Never'}`);
      console.log(`Pending: ${status.pending}`);
      console.log(`Conflicts: ${status.conflicts}`);
      console.log(`Errors: ${status.errors}`);
      console.log(`Synced Files: ${status.synced}`);
      break;
      
    case 'resolve':
      const name = args[1];
      const choice = args[2];
      if (!name || !choice) {
        console.error('Usage: mac sync resolve <name> <claude|chatgpt|skip>');
        process.exit(1);
      }
      service = new SyncService();
      await service.loadSyncState();
      await service.resolveConflictManual(name, choice);
      await service.saveSyncState();
      break;
      
    case 'clear':
      service = new SyncService();
      await service.loadSyncState();
      if (args[1] === 'errors') {
        service.clearErrors();
      } else if (args[1] === 'conflicts') {
        service.clearConflicts();
      } else {
        service.clearErrors();
        service.clearConflicts();
      }
      await service.saveSyncState();
      break;
      
    default:
      console.log(`
Bidirectional Sync Service

Commands:
  start [strategy]    Start sync service (strategies: manual, newest, claude, chatgpt)
  sync                Perform one-time sync
  status              Show sync status
  resolve <name> <choice>  Resolve conflict (choices: claude, chatgpt, skip)
  clear [errors|conflicts]  Clear errors or conflicts

Examples:
  mac sync start newest     # Auto-sync with newest file wins
  mac sync status          # Check current status
  mac sync resolve my-agent claude  # Use Claude version
  mac sync clear errors   # Clear error log

The service will:
- Watch both Claude and ChatGPT directories
- Auto-convert new files between platforms
- Track conflicts and allow resolution
- Maintain sync state persistently
      `);
  }
}

// Export for testing
module.exports = { SyncService };

// Run if called directly
if (require.main === module) {
  main();
}