#!/usr/bin/env node

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { SyncService } = require('./sync-service.js');
const { AgentValidator } = require('./validate-agents.js');

/**
 * Real-time Sync Monitoring Dashboard
 * Provides web-based monitoring and control interface for sync service
 */

class SyncDashboard {
  constructor(port = 8080) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.syncService = new SyncService({
      autoConvert: true,
      conflictStrategy: 'manual'
    });
    
    this.validator = new AgentValidator();
    this.clients = new Set();
    
    this.setupRoutes();
    this.setupWebSocket();
    this.setupSyncListeners();
  }

  /**
   * Setup Express routes
   */
  setupRoutes() {
    // Serve static dashboard
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });
    
    // API endpoints
    this.app.get('/api/status', async (req, res) => {
      await this.syncService.loadSyncState();
      const status = this.syncService.getStatus();
      const stats = await this.getStatistics();
      res.json({ ...status, ...stats });
    });
    
    this.app.post('/api/sync', async (req, res) => {
      const results = await this.syncService.performSync();
      res.json(results);
    });
    
    this.app.post('/api/start', async (req, res) => {
      await this.syncService.start();
      res.json({ success: true });
    });
    
    this.app.post('/api/stop', (req, res) => {
      this.syncService.stop();
      res.json({ success: true });
    });
    
    this.app.post('/api/resolve/:name/:choice', async (req, res) => {
      const { name, choice } = req.params;
      const success = await this.syncService.resolveConflictManual(name, choice);
      res.json({ success });
    });
    
    this.app.get('/api/conflicts', async (req, res) => {
      await this.syncService.loadSyncState();
      res.json(this.syncService.syncState.conflicts);
    });
    
    this.app.get('/api/errors', async (req, res) => {
      await this.syncService.loadSyncState();
      res.json(this.syncService.syncState.errors);
    });
    
    this.app.get('/api/metrics', async (req, res) => {
      const metrics = await this.getQualityMetrics();
      res.json(metrics);
    });
    
    // Serve client-side JavaScript
    this.app.get('/dashboard.js', (req, res) => {
      res.type('application/javascript');
      res.send(this.generateClientJS());
    });
  }

  /**
   * Setup WebSocket connections
   */
  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('Client connected to dashboard');
      
      // Send initial status
      this.sendStatusUpdate(ws);
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected from dashboard');
      });
      
      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        await this.handleWebSocketMessage(ws, data);
      });
    });
  }

  /**
   * Setup sync service listeners
   */
  setupSyncListeners() {
    this.syncService.on('file-changed', (data) => {
      this.broadcast({
        type: 'file-changed',
        data
      });
    });
    
    this.syncService.on('sync-complete', (results) => {
      this.broadcast({
        type: 'sync-complete',
        data: results
      });
      this.broadcastStatus();
    });
    
    this.syncService.on('started', () => {
      this.broadcast({
        type: 'service-started'
      });
      this.broadcastStatus();
    });
    
    this.syncService.on('stopped', () => {
      this.broadcast({
        type: 'service-stopped'
      });
      this.broadcastStatus();
    });
  }

  /**
   * Handle WebSocket messages
   */
  async handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'get-status':
        await this.sendStatusUpdate(ws);
        break;
      case 'start-service':
        await this.syncService.start();
        break;
      case 'stop-service':
        this.syncService.stop();
        break;
      case 'trigger-sync':
        const results = await this.syncService.performSync();
        ws.send(JSON.stringify({
          type: 'sync-results',
          data: results
        }));
        break;
      case 'resolve-conflict':
        const success = await this.syncService.resolveConflictManual(
          data.name,
          data.choice
        );
        ws.send(JSON.stringify({
          type: 'conflict-resolved',
          data: { name: data.name, success }
        }));
        await this.broadcastStatus();
        break;
    }
  }

  /**
   * Send status update to client
   */
  async sendStatusUpdate(ws) {
    await this.syncService.loadSyncState();
    const status = this.syncService.getStatus();
    const stats = await this.getStatistics();
    
    ws.send(JSON.stringify({
      type: 'status-update',
      data: { ...status, ...stats }
    }));
  }

  /**
   * Broadcast to all clients
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Broadcast status to all clients
   */
  async broadcastStatus() {
    await this.syncService.loadSyncState();
    const status = this.syncService.getStatus();
    const stats = await this.getStatistics();
    
    this.broadcast({
      type: 'status-update',
      data: { ...status, ...stats }
    });
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const claudeDir = path.join(process.cwd(), 'Examples', 'agents');
    const chatgptDir = path.join(process.cwd(), 'Examples', 'roles');
    
    const claudeFiles = await this.countFiles(claudeDir);
    const chatgptFiles = await this.countFiles(chatgptDir);
    
    const alignmentRate = this.calculateAlignment(claudeFiles, chatgptFiles);
    
    return {
      claudeAgents: claudeFiles.length,
      chatgptRoles: chatgptFiles.length,
      alignmentRate,
      totalFiles: claudeFiles.length + chatgptFiles.length
    };
  }

  /**
   * Count files in directory
   */
  async countFiles(directory) {
    if (!fs.existsSync(directory)) return [];
    
    const files = [];
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const subFiles = await this.countFiles(itemPath);
        files.push(...subFiles);
      } else if (item.endsWith('.md') && !item.includes('README') && !item.includes('TEMPLATE')) {
        files.push(item);
      }
    }
    
    return files;
  }

  /**
   * Calculate alignment rate
   */
  calculateAlignment(claudeFiles, chatgptFiles) {
    const claudeSet = new Set(claudeFiles);
    const chatgptSet = new Set(chatgptFiles);
    
    let matches = 0;
    claudeSet.forEach(file => {
      if (chatgptSet.has(file)) matches++;
    });
    
    const total = Math.max(claudeSet.size, chatgptSet.size);
    return total > 0 ? (matches / total * 100).toFixed(1) : 0;
  }

  /**
   * Get quality metrics
   */
  async getQualityMetrics() {
    const dirs = [
      path.join(process.cwd(), 'Examples', 'agents'),
      path.join(process.cwd(), 'Examples', 'agents', 'specialists'),
      path.join(process.cwd(), 'Examples', 'roles')
    ];
    
    const metrics = {
      totalValidated: 0,
      validAgents: 0,
      averageScore: 0,
      errors: 0,
      warnings: 0
    };
    
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const results = this.validator.validateDirectory(dir);
        metrics.totalValidated += results.length;
        metrics.validAgents += results.filter(r => r.valid).length;
        metrics.errors += results.reduce((sum, r) => sum + r.errors.length, 0);
        metrics.warnings += results.reduce((sum, r) => sum + r.warnings.length, 0);
        
        const scores = results.map(r => r.score);
        if (scores.length > 0) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          metrics.averageScore = (metrics.averageScore + avgScore) / 2;
        }
      }
    }
    
    return metrics;
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sync Service Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      background: white;
      border-radius: 10px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-left: 20px;
    }
    .status-running { background: #10b981; color: white; }
    .status-stopped { background: #ef4444; color: white; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #555;
      font-size: 18px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #777; }
    .metric-value {
      font-weight: bold;
      color: #333;
    }
    .controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover { background: #5a67d8; }
    .btn-success {
      background: #10b981;
      color: white;
    }
    .btn-success:hover { background: #059669; }
    .btn-danger {
      background: #ef4444;
      color: white;
    }
    .btn-danger:hover { background: #dc2626; }
    .conflict-item {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 10px;
    }
    .conflict-actions {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }
    .conflict-actions button {
      padding: 5px 10px;
      font-size: 12px;
    }
    .error-item {
      background: #fee2e2;
      border: 1px solid #ef4444;
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .progress-bar {
      width: 100%;
      height: 30px;
      background: #e5e7eb;
      border-radius: 15px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.5s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .activity-log {
      max-height: 200px;
      overflow-y: auto;
      background: #f9fafb;
      border-radius: 5px;
      padding: 10px;
    }
    .log-entry {
      padding: 5px;
      font-size: 14px;
      color: #555;
      border-bottom: 1px solid #e5e7eb;
    }
    .log-entry:last-child { border-bottom: none; }
    .emoji { font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>
        <span class="emoji">🔄</span>
        Sync Service Dashboard
        <span class="status-badge" id="service-status">Loading...</span>
      </h1>
    </header>

    <div class="dashboard-grid">
      <!-- Statistics Card -->
      <div class="card">
        <h2><span class="emoji">📊</span> Statistics</h2>
        <div class="metric">
          <span class="metric-label">Claude Agents</span>
          <span class="metric-value" id="claude-count">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">ChatGPT Roles</span>
          <span class="metric-value" id="chatgpt-count">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Alignment Rate</span>
          <span class="metric-value" id="alignment-rate">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Synced Files</span>
          <span class="metric-value" id="synced-count">-</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="alignment-progress" style="width: 0%">0%</div>
        </div>
      </div>

      <!-- Service Control -->
      <div class="card">
        <h2><span class="emoji">🎮</span> Service Control</h2>
        <div class="metric">
          <span class="metric-label">Last Sync</span>
          <span class="metric-value" id="last-sync">Never</span>
        </div>
        <div class="metric">
          <span class="metric-label">Pending Changes</span>
          <span class="metric-value" id="pending-count">0</span>
        </div>
        <div class="controls" style="margin-top: 20px;">
          <button class="btn-success" onclick="startService()">Start Service</button>
          <button class="btn-danger" onclick="stopService()">Stop Service</button>
          <button class="btn-primary" onclick="triggerSync()">Manual Sync</button>
        </div>
      </div>

      <!-- Quality Metrics -->
      <div class="card">
        <h2><span class="emoji">✨</span> Quality Metrics</h2>
        <div class="metric">
          <span class="metric-label">Valid Agents</span>
          <span class="metric-value" id="valid-agents">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Average Score</span>
          <span class="metric-value" id="avg-score">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Total Errors</span>
          <span class="metric-value" id="total-errors">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">Total Warnings</span>
          <span class="metric-value" id="total-warnings">-</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Conflicts -->
      <div class="card">
        <h2><span class="emoji">⚠️</span> Conflicts (<span id="conflict-count">0</span>)</h2>
        <div id="conflicts-list"></div>
      </div>

      <!-- Errors -->
      <div class="card">
        <h2><span class="emoji">❌</span> Errors (<span id="error-count">0</span>)</h2>
        <div id="errors-list"></div>
      </div>

      <!-- Activity Log -->
      <div class="card">
        <h2><span class="emoji">📝</span> Activity Log</h2>
        <div class="activity-log" id="activity-log"></div>
      </div>
    </div>
  </div>

  <script src="/dashboard.js"></script>
</body>
</html>`;
  }

  /**
   * Generate client-side JavaScript
   */
  generateClientJS() {
    return `
// WebSocket connection
let ws;
let reconnectTimer;

function connect() {
  ws = new WebSocket('ws://' + window.location.host);
  
  ws.onopen = () => {
    console.log('Connected to dashboard');
    clearTimeout(reconnectTimer);
    ws.send(JSON.stringify({ type: 'get-status' }));
    addLog('Connected to sync service');
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleMessage(message);
  };
  
  ws.onclose = () => {
    console.log('Disconnected from dashboard');
    document.getElementById('service-status').textContent = 'Disconnected';
    document.getElementById('service-status').className = 'status-badge status-stopped';
    addLog('Disconnected from sync service');
    
    // Reconnect after 3 seconds
    reconnectTimer = setTimeout(connect, 3000);
  };
}

function handleMessage(message) {
  switch (message.type) {
    case 'status-update':
      updateStatus(message.data);
      break;
    case 'file-changed':
      addLog(\`File \${message.data.event}: \${message.data.filepath.split('/').pop()}\`);
      break;
    case 'sync-complete':
      addLog(\`Sync complete: \${JSON.stringify(message.data)}\`);
      break;
    case 'service-started':
      addLog('Service started');
      document.getElementById('service-status').textContent = 'Running';
      document.getElementById('service-status').className = 'status-badge status-running';
      break;
    case 'service-stopped':
      addLog('Service stopped');
      document.getElementById('service-status').textContent = 'Stopped';
      document.getElementById('service-status').className = 'status-badge status-stopped';
      break;
    case 'conflict-resolved':
      addLog(\`Conflict resolved: \${message.data.name}\`);
      ws.send(JSON.stringify({ type: 'get-status' }));
      break;
  }
}

function updateStatus(data) {
  // Update service status
  const statusBadge = document.getElementById('service-status');
  statusBadge.textContent = data.running ? 'Running' : 'Stopped';
  statusBadge.className = 'status-badge ' + (data.running ? 'status-running' : 'status-stopped');
  
  // Update statistics
  document.getElementById('claude-count').textContent = data.claudeAgents || 0;
  document.getElementById('chatgpt-count').textContent = data.chatgptRoles || 0;
  document.getElementById('alignment-rate').textContent = (data.alignmentRate || 0) + '%';
  document.getElementById('synced-count').textContent = data.synced || 0;
  
  // Update progress bar
  const progress = parseFloat(data.alignmentRate) || 0;
  const progressBar = document.getElementById('alignment-progress');
  progressBar.style.width = progress + '%';
  progressBar.textContent = progress.toFixed(1) + '%';
  
  // Update service info
  document.getElementById('last-sync').textContent = data.lastSync ? 
    new Date(data.lastSync).toLocaleString() : 'Never';
  document.getElementById('pending-count').textContent = data.pending || 0;
  
  // Update conflicts
  document.getElementById('conflict-count').textContent = data.conflicts || 0;
  if (data.conflicts > 0) {
    loadConflicts();
  }
  
  // Update errors
  document.getElementById('error-count').textContent = data.errors || 0;
  if (data.errors > 0) {
    loadErrors();
  }
}

async function loadConflicts() {
  const response = await fetch('/api/conflicts');
  const conflicts = await response.json();
  
  const container = document.getElementById('conflicts-list');
  container.innerHTML = conflicts.map(conflict => \`
    <div class="conflict-item">
      <strong>\${conflict.name}</strong><br>
      Claude: \${new Date(conflict.claudeModified).toLocaleString()}<br>
      ChatGPT: \${new Date(conflict.chatgptModified).toLocaleString()}
      <div class="conflict-actions">
        <button class="btn-primary" onclick="resolveConflict('\${conflict.name}', 'claude')">Use Claude</button>
        <button class="btn-primary" onclick="resolveConflict('\${conflict.name}', 'chatgpt')">Use ChatGPT</button>
        <button onclick="resolveConflict('\${conflict.name}', 'skip')">Skip</button>
      </div>
    </div>
  \`).join('');
}

async function loadErrors() {
  const response = await fetch('/api/errors');
  const errors = await response.json();
  
  const container = document.getElementById('errors-list');
  container.innerHTML = errors.slice(0, 5).map(error => \`
    <div class="error-item">
      <strong>\${error.file}</strong><br>
      \${error.error}<br>
      <small>\${new Date(error.timestamp).toLocaleString()}</small>
    </div>
  \`).join('');
}

async function loadMetrics() {
  const response = await fetch('/api/metrics');
  const metrics = await response.json();
  
  document.getElementById('valid-agents').textContent = 
    \`\${metrics.validAgents}/\${metrics.totalValidated}\`;
  document.getElementById('avg-score').textContent = 
    metrics.averageScore.toFixed(1) + '/100';
  document.getElementById('total-errors').textContent = metrics.errors;
  document.getElementById('total-warnings').textContent = metrics.warnings;
}

function startService() {
  ws.send(JSON.stringify({ type: 'start-service' }));
  addLog('Starting service...');
}

function stopService() {
  ws.send(JSON.stringify({ type: 'stop-service' }));
  addLog('Stopping service...');
}

function triggerSync() {
  ws.send(JSON.stringify({ type: 'trigger-sync' }));
  addLog('Triggering manual sync...');
}

function resolveConflict(name, choice) {
  ws.send(JSON.stringify({ 
    type: 'resolve-conflict',
    name,
    choice
  }));
  addLog(\`Resolving conflict: \${name} -> \${choice}\`);
}

function addLog(message) {
  const log = document.getElementById('activity-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = new Date().toLocaleTimeString() + ' - ' + message;
  log.insertBefore(entry, log.firstChild);
  
  // Keep only last 20 entries
  while (log.children.length > 20) {
    log.removeChild(log.lastChild);
  }
}

// Initialize
connect();
loadMetrics();
setInterval(loadMetrics, 30000); // Refresh metrics every 30 seconds
`;
  }

  /**
   * Start the dashboard server
   */
  async start() {
    await this.syncService.loadSyncState();
    
    this.server.listen(this.port, () => {
      console.log(`
🎯 Sync Monitoring Dashboard
📍 URL: http://localhost:${this.port}
✨ Features:
  - Real-time sync status
  - Conflict resolution interface
  - Quality metrics display
  - Activity monitoring
  - Service control

Press Ctrl+C to stop the dashboard.
      `);
    });
  }

  /**
   * Stop the dashboard server
   */
  stop() {
    this.server.close();
    this.wss.close();
    this.syncService.stop();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const port = parseInt(args[0]) || 8080;
  
  const dashboard = new SyncDashboard(port);
  await dashboard.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down dashboard...');
    dashboard.stop();
    process.exit(0);
  });
}

// Export for testing
module.exports = { SyncDashboard };

// Run if called directly
if (require.main === module) {
  main();
}