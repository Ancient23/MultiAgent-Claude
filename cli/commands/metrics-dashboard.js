#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');
const chalk = require('chalk');

/**
 * Quality Metrics Dashboard for Agent/Role Templates
 * Provides visual insights into agent quality, usage, and evolution
 */

class MetricsDashboard {
  constructor() {
    this.dataDir = path.join(process.cwd(), '.claude', 'evolution');
    this.metricsFile = path.join(this.dataDir, 'metrics.json');
    this.loadMetrics();
  }

  loadMetrics() {
    if (fs.existsSync(this.metricsFile)) {
      this.metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    } else {
      this.metrics = this.initializeMetrics();
    }
  }

  saveMetrics() {
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  initializeMetrics() {
    return {
      agents: {},
      global: {
        totalAgents: 0,
        averageQuality: 0,
        totalInvocations: 0,
        successRate: 0,
        lastUpdated: new Date().toISOString()
      },
      trends: [],
      maturityLevels: {
        emerging: [],    // Level 1: < 60% quality
        developing: [],  // Level 2: 60-70% quality
        stable: [],      // Level 3: 70-80% quality
        mature: [],      // Level 4: 80-90% quality
        optimized: []    // Level 5: > 90% quality
      }
    };
  }

  /**
   * Collect metrics from all agents
   */
  async collectMetrics() {
    const agentsDir = path.join(process.cwd(), 'Examples', 'agents');
    const specialistsDir = path.join(agentsDir, 'specialists');
    const rolesDir = path.join(process.cwd(), 'Examples', 'roles');
    
    const allAgents = [];
    
    // Collect from all directories
    const dirs = [agentsDir, specialistsDir, rolesDir];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(f => f.endsWith('.md') && !f.includes('README') && !f.includes('TEMPLATE'));
        
        for (const file of files) {
          const filepath = path.join(dir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const metrics = this.analyzeAgent(file.replace('.md', ''), content);
          allAgents.push(metrics);
        }
      }
    }
    
    // Update global metrics
    this.updateGlobalMetrics(allAgents);
    
    // Classify by maturity
    this.classifyMaturity(allAgents);
    
    // Track trends
    this.trackTrends();
    
    this.saveMetrics();
    return this.metrics;
  }

  /**
   * Analyze an individual agent
   */
  analyzeAgent(name, content) {
    const metrics = {
      name,
      quality: this.assessQuality(content),
      complexity: this.assessComplexity(content),
      coverage: this.assessCoverage(content),
      maintainability: this.assessMaintainability(content),
      triggers: this.extractTriggers(content),
      lastModified: new Date().toISOString(),
      size: content.length,
      lineCount: content.split('\n').length
    };
    
    // Calculate overall score
    metrics.overall = (
      metrics.quality * 0.3 +
      metrics.coverage * 0.25 +
      metrics.maintainability * 0.25 +
      (100 - metrics.complexity) * 0.2
    );
    
    // Store in metrics
    this.metrics.agents[name] = metrics;
    
    return metrics;
  }

  /**
   * Assess quality based on content structure
   */
  assessQuality(content) {
    let score = 0;
    const checks = [
      { pattern: /\*\*Type\*\*:/i, weight: 10 },
      { pattern: /\*\*Purpose\*\*:/i, weight: 10 },
      { pattern: /## Description/i, weight: 10 },
      { pattern: /## Trigger/i, weight: 15 },
      { pattern: /## Capabilities/i, weight: 15 },
      { pattern: /## Workflow/i, weight: 15 },
      { pattern: /## Requirements/i, weight: 5 },
      { pattern: /## Output Format/i, weight: 10 },
      { pattern: /## Quality Standards/i, weight: 10 }
    ];
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        score += check.weight;
      }
    });
    
    return score;
  }

  /**
   * Assess complexity based on content
   */
  assessComplexity(content) {
    const lines = content.split('\n').length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const sections = (content.match(/^##\s/gm) || []).length;
    
    // Normalize to 0-100 scale (higher = more complex)
    const complexity = Math.min(100, 
      (lines / 10) + 
      (codeBlocks * 5) + 
      (sections * 3)
    );
    
    return complexity;
  }

  /**
   * Assess coverage of required elements
   */
  assessCoverage(content) {
    const required = [
      'Description',
      'Trigger',
      'Capabilities',
      'Workflow',
      'MCP Tools',
      'Memory Integration',
      'Output Format',
      'Quality Standards',
      'Example Usage'
    ];
    
    const found = required.filter(section => 
      content.includes(`## ${section}`)
    );
    
    return (found.length / required.length) * 100;
  }

  /**
   * Assess maintainability
   */
  assessMaintainability(content) {
    let score = 100;
    
    // Deduct for issues
    if (content.length > 10000) score -= 10; // Too long
    if (!content.includes('Version:')) score -= 10; // No version
    if (!content.includes('Created:')) score -= 10; // No creation date
    if ((content.match(/TODO|FIXME|XXX/gi) || []).length > 0) score -= 15; // Has TODOs
    if (!content.includes('```')) score -= 10; // No examples
    
    return Math.max(0, score);
  }

  /**
   * Extract trigger keywords
   */
  extractTriggers(content) {
    const triggerSection = content.match(/## Trigger[\s\S]*?(?=\n##|$)/);
    if (!triggerSection) return [];
    
    const keywords = triggerSection[0].match(/`([^`]+)`/g) || [];
    return keywords.map(k => k.replace(/`/g, ''));
  }

  /**
   * Update global metrics
   */
  updateGlobalMetrics(agents) {
    const qualities = agents.map(a => a.overall);
    
    this.metrics.global.totalAgents = agents.length;
    this.metrics.global.averageQuality = 
      qualities.reduce((a, b) => a + b, 0) / qualities.length;
    this.metrics.global.lastUpdated = new Date().toISOString();
  }

  /**
   * Classify agents by maturity level
   */
  classifyMaturity(agents) {
    this.metrics.maturityLevels = {
      emerging: [],
      developing: [],
      stable: [],
      mature: [],
      optimized: []
    };
    
    agents.forEach(agent => {
      const score = agent.overall;
      if (score < 60) {
        this.metrics.maturityLevels.emerging.push(agent.name);
      } else if (score < 70) {
        this.metrics.maturityLevels.developing.push(agent.name);
      } else if (score < 80) {
        this.metrics.maturityLevels.stable.push(agent.name);
      } else if (score < 90) {
        this.metrics.maturityLevels.mature.push(agent.name);
      } else {
        this.metrics.maturityLevels.optimized.push(agent.name);
      }
    });
  }

  /**
   * Track quality trends over time
   */
  trackTrends() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      averageQuality: this.metrics.global.averageQuality,
      totalAgents: this.metrics.global.totalAgents,
      maturityDistribution: {
        emerging: this.metrics.maturityLevels.emerging.length,
        developing: this.metrics.maturityLevels.developing.length,
        stable: this.metrics.maturityLevels.stable.length,
        mature: this.metrics.maturityLevels.mature.length,
        optimized: this.metrics.maturityLevels.optimized.length
      }
    };
    
    this.metrics.trends.push(snapshot);
    
    // Keep only last 30 snapshots
    if (this.metrics.trends.length > 30) {
      this.metrics.trends = this.metrics.trends.slice(-30);
    }
  }

  /**
   * Display dashboard
   */
  displayDashboard() {
    console.clear();
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║     Agent Quality Metrics Dashboard    ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));
    
    // Global summary
    this.displayGlobalSummary();
    
    // Maturity distribution
    this.displayMaturityDistribution();
    
    // Top performers
    this.displayTopPerformers();
    
    // Needs attention
    this.displayNeedsAttention();
    
    // Trigger coverage
    this.displayTriggerCoverage();
  }

  displayGlobalSummary() {
    const table = new Table({
      head: ['Metric', 'Value'],
      colWidths: [25, 15]
    });
    
    table.push(
      ['Total Agents', this.metrics.global.totalAgents],
      ['Average Quality', `${this.metrics.global.averageQuality.toFixed(1)}%`],
      ['Last Updated', new Date(this.metrics.global.lastUpdated).toLocaleString()]
    );
    
    console.log(chalk.bold('📊 Global Summary'));
    console.log(table.toString());
  }

  displayMaturityDistribution() {
    const table = new Table({
      head: ['Level', 'Count', 'Agents'],
      colWidths: [15, 10, 50]
    });
    
    const levels = [
      { name: 'Optimized', key: 'optimized', color: 'green' },
      { name: 'Mature', key: 'mature', color: 'blue' },
      { name: 'Stable', key: 'stable', color: 'cyan' },
      { name: 'Developing', key: 'developing', color: 'yellow' },
      { name: 'Emerging', key: 'emerging', color: 'red' }
    ];
    
    levels.forEach(level => {
      const agents = this.metrics.maturityLevels[level.key];
      const preview = agents.slice(0, 3).join(', ') + 
                      (agents.length > 3 ? '...' : '');
      table.push([
        chalk[level.color](level.name),
        agents.length,
        preview
      ]);
    });
    
    console.log(chalk.bold('\n📈 Maturity Distribution'));
    console.log(table.toString());
  }

  displayTopPerformers() {
    const sorted = Object.values(this.metrics.agents)
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 5);
    
    const table = new Table({
      head: ['Rank', 'Agent', 'Score', 'Quality', 'Coverage'],
      colWidths: [8, 30, 10, 10, 10]
    });
    
    sorted.forEach((agent, i) => {
      table.push([
        `#${i + 1}`,
        agent.name,
        chalk.green(`${agent.overall.toFixed(1)}%`),
        `${agent.quality}%`,
        `${agent.coverage.toFixed(0)}%`
      ]);
    });
    
    console.log(chalk.bold('\n🏆 Top Performers'));
    console.log(table.toString());
  }

  displayNeedsAttention() {
    const needsWork = Object.values(this.metrics.agents)
      .filter(a => a.overall < 70)
      .sort((a, b) => a.overall - b.overall)
      .slice(0, 5);
    
    if (needsWork.length === 0) {
      console.log(chalk.bold('\n⚠️  Needs Attention'));
      console.log(chalk.green('All agents meet quality standards!'));
      return;
    }
    
    const table = new Table({
      head: ['Agent', 'Score', 'Issues'],
      colWidths: [30, 10, 35]
    });
    
    needsWork.forEach(agent => {
      const issues = [];
      if (agent.quality < 70) issues.push('Low quality');
      if (agent.coverage < 70) issues.push('Missing sections');
      if (agent.maintainability < 70) issues.push('Maintainability');
      
      table.push([
        agent.name,
        chalk.red(`${agent.overall.toFixed(1)}%`),
        issues.join(', ')
      ]);
    });
    
    console.log(chalk.bold('\n⚠️  Needs Attention'));
    console.log(table.toString());
  }

  displayTriggerCoverage() {
    const allTriggers = {};
    
    Object.values(this.metrics.agents).forEach(agent => {
      (agent.triggers || []).forEach(trigger => {
        allTriggers[trigger] = (allTriggers[trigger] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(allTriggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const table = new Table({
      head: ['Trigger', 'Coverage'],
      colWidths: [30, 15]
    });
    
    sorted.forEach(([trigger, count]) => {
      table.push([trigger, `${count} agents`]);
    });
    
    console.log(chalk.bold('\n🔑 Top Trigger Keywords'));
    console.log(table.toString());
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Agent Quality Metrics Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2c3e50; }
    .metric-card { 
      display: inline-block; 
      padding: 20px; 
      margin: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      min-width: 200px;
    }
    .metric-value { font-size: 2em; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f4f4f4; }
    .quality-high { color: green; }
    .quality-medium { color: orange; }
    .quality-low { color: red; }
  </style>
</head>
<body>
  <h1>Agent Quality Metrics Dashboard</h1>
  
  <div class="metrics-summary">
    <div class="metric-card">
      <div>Total Agents</div>
      <div class="metric-value">${this.metrics.global.totalAgents}</div>
    </div>
    <div class="metric-card">
      <div>Average Quality</div>
      <div class="metric-value">${this.metrics.global.averageQuality.toFixed(1)}%</div>
    </div>
  </div>
  
  <h2>Agent Details</h2>
  <table>
    <thead>
      <tr>
        <th>Agent</th>
        <th>Overall Score</th>
        <th>Quality</th>
        <th>Coverage</th>
        <th>Maintainability</th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(this.metrics.agents)
        .sort((a, b) => b.overall - a.overall)
        .map(agent => `
          <tr>
            <td>${agent.name}</td>
            <td class="${agent.overall >= 80 ? 'quality-high' : agent.overall >= 60 ? 'quality-medium' : 'quality-low'}">
              ${agent.overall.toFixed(1)}%
            </td>
            <td>${agent.quality}%</td>
            <td>${agent.coverage.toFixed(0)}%</td>
            <td>${agent.maintainability}%</td>
          </tr>
        `).join('')}
    </tbody>
  </table>
  
  <p>Generated: ${new Date().toLocaleString()}</p>
</body>
</html>
    `;
    
    const reportPath = path.join(this.dataDir, 'dashboard.html');
    fs.writeFileSync(reportPath, html);
    return reportPath;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const dashboard = new MetricsDashboard();
  
  switch (command) {
    case 'collect':
      console.log('📊 Collecting metrics...');
      await dashboard.collectMetrics();
      console.log('✅ Metrics collected');
      break;
      
    case 'show':
      await dashboard.collectMetrics();
      dashboard.displayDashboard();
      break;
      
    case 'html':
      await dashboard.collectMetrics();
      const reportPath = dashboard.generateHTMLReport();
      console.log(`✅ HTML report generated: ${reportPath}`);
      break;
      
    case 'watch':
      // Continuous monitoring
      const update = async () => {
        await dashboard.collectMetrics();
        dashboard.displayDashboard();
      };
      await update();
      setInterval(update, 60000); // Update every minute
      break;
      
    default:
      console.log(`
Quality Metrics Dashboard

Commands:
  collect    Collect metrics from all agents
  show       Display dashboard in terminal
  html       Generate HTML report
  watch      Continuous monitoring mode

Examples:
  mac metrics show
  mac metrics html
  mac metrics watch
      `);
  }
}

// Export for testing
module.exports = { MetricsDashboard };

// Run if called directly
if (require.main === module) {
  main();
}