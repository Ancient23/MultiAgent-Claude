#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

/**
 * Evolution Tracking System for Agent/Role Templates
 * Tracks changes, measures quality, and learns from usage patterns
 */

class EvolutionTracker {
  constructor() {
    this.dataDir = path.join(process.cwd(), '.claude', 'evolution');
    this.versionsDir = path.join(this.dataDir, 'versions');
    this.metricsDir = path.join(this.dataDir, 'metrics');
    this.patternsDir = path.join(this.dataDir, 'patterns');
    
    this.ensureDirectories();
    this.loadHistory();
  }

  ensureDirectories() {
    [this.dataDir, this.versionsDir, this.metricsDir, this.patternsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadHistory() {
    const historyFile = path.join(this.dataDir, 'history.json');
    this.history = fs.existsSync(historyFile) 
      ? JSON.parse(fs.readFileSync(historyFile, 'utf8'))
      : { versions: [], changes: [], metrics: {} };
  }

  saveHistory() {
    const historyFile = path.join(this.dataDir, 'history.json');
    fs.writeFileSync(historyFile, JSON.stringify(this.history, null, 2));
  }

  /**
   * Track a new version of an agent/role
   */
  trackVersion(agentPath, metadata = {}) {
    const content = fs.readFileSync(agentPath, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const agentName = path.basename(agentPath, path.extname(agentPath));
    
    // Check if content has changed
    const lastVersion = this.getLatestVersion(agentName);
    if (lastVersion && lastVersion.hash === hash) {
      return { status: 'unchanged', version: lastVersion.version };
    }
    
    // Calculate semantic version
    const version = this.calculateVersion(agentName, content, lastVersion);
    
    // Store version
    const versionData = {
      name: agentName,
      version,
      hash,
      timestamp: new Date().toISOString(),
      path: agentPath,
      size: content.length,
      metadata,
      changes: this.detectChanges(content, lastVersion?.content),
      quality: this.assessQuality(content)
    };
    
    // Save version file
    const versionFile = path.join(
      this.versionsDir, 
      `${agentName}_v${version}_${Date.now()}.json`
    );
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
    
    // Update history
    this.history.versions.push(versionData);
    this.saveHistory();
    
    return { status: 'tracked', version, changes: versionData.changes };
  }

  /**
   * Calculate semantic version based on changes
   */
  calculateVersion(agentName, content, lastVersion) {
    if (!lastVersion) return '1.0.0';
    
    const [major, minor, patch] = lastVersion.version.split('.').map(Number);
    const changeType = this.classifyChangeType(content, lastVersion.content);
    
    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Classify the type of change (major, minor, patch)
   */
  classifyChangeType(newContent, oldContent) {
    if (!oldContent) return 'major';
    
    const newLines = newContent.split('\n');
    const oldLines = oldContent.split('\n');
    
    // Major: Structural changes, removed capabilities
    if (this.hasStructuralChanges(newLines, oldLines)) return 'major';
    
    // Minor: New features, capabilities
    if (this.hasNewFeatures(newLines, oldLines)) return 'minor';
    
    // Patch: Bug fixes, documentation updates
    return 'patch';
  }

  /**
   * Detect specific changes between versions
   */
  detectChanges(newContent, oldContent) {
    if (!oldContent) {
      return [{ type: 'created', description: 'Initial version' }];
    }
    
    const changes = [];
    const newLines = newContent.split('\n');
    const oldLines = oldContent.split('\n');
    
    // Detect additions
    const additions = newLines.filter(line => !oldLines.includes(line));
    if (additions.length > 0) {
      changes.push({
        type: 'additions',
        count: additions.length,
        samples: additions.slice(0, 3)
      });
    }
    
    // Detect removals
    const removals = oldLines.filter(line => !newLines.includes(line));
    if (removals.length > 0) {
      changes.push({
        type: 'removals',
        count: removals.length,
        samples: removals.slice(0, 3)
      });
    }
    
    return changes;
  }

  /**
   * Assess quality of agent/role template
   */
  assessQuality(content) {
    const metrics = {
      completeness: 0,
      clarity: 0,
      consistency: 0,
      documentation: 0,
      overall: 0
    };
    
    // Completeness: Check for required sections
    const requiredSections = ['Description', 'Trigger', 'Capabilities', 'Workflow'];
    const foundSections = requiredSections.filter(section => 
      content.includes(`## ${section}`)
    );
    metrics.completeness = (foundSections.length / requiredSections.length) * 100;
    
    // Clarity: Check for examples and clear explanations
    metrics.clarity = 0;
    if (content.includes('Example')) metrics.clarity += 25;
    if (content.includes('```')) metrics.clarity += 25;  // Code blocks
    if (content.match(/\d+\./g)?.length > 3) metrics.clarity += 25;  // Numbered lists
    if (content.includes('Keywords:')) metrics.clarity += 25;
    
    // Consistency: Check formatting
    metrics.consistency = 100;
    if (!content.includes('**Type**:')) metrics.consistency -= 25;
    if (!content.includes('**Purpose**:')) metrics.consistency -= 25;
    if (!content.includes('### ')) metrics.consistency -= 25;
    
    // Documentation: Word count and detail level
    const wordCount = content.split(/\s+/).length;
    metrics.documentation = Math.min(100, (wordCount / 500) * 100);
    
    // Overall score
    metrics.overall = (
      metrics.completeness * 0.3 +
      metrics.clarity * 0.25 +
      metrics.consistency * 0.25 +
      metrics.documentation * 0.2
    );
    
    return metrics;
  }

  /**
   * Track usage metrics for an agent
   */
  trackUsage(agentName, event) {
    if (!this.history.metrics[agentName]) {
      this.history.metrics[agentName] = {
        invocations: 0,
        successes: 0,
        failures: 0,
        lastUsed: null,
        patterns: []
      };
    }
    
    const metrics = this.history.metrics[agentName];
    metrics.invocations++;
    metrics.lastUsed = new Date().toISOString();
    
    if (event.success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
    
    // Track patterns
    if (event.pattern) {
      metrics.patterns.push({
        pattern: event.pattern,
        timestamp: new Date().toISOString(),
        success: event.success
      });
    }
    
    this.saveHistory();
    return metrics;
  }

  /**
   * Learn patterns from usage
   */
  learnPatterns() {
    const patterns = {};
    
    Object.entries(this.history.metrics).forEach(([agent, metrics]) => {
      if (metrics.patterns.length > 0) {
        // Analyze successful patterns
        const successfulPatterns = metrics.patterns
          .filter(p => p.success)
          .map(p => p.pattern);
        
        // Find common patterns
        patterns[agent] = this.findCommonPatterns(successfulPatterns);
      }
    });
    
    // Save learned patterns
    const patternsFile = path.join(this.patternsDir, `learned_${Date.now()}.json`);
    fs.writeFileSync(patternsFile, JSON.stringify(patterns, null, 2));
    
    return patterns;
  }

  /**
   * Find common patterns in usage
   */
  findCommonPatterns(patterns) {
    const frequency = {};
    
    patterns.forEach(pattern => {
      const words = pattern.toLowerCase().split(/\s+/);
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
    });
    
    // Return top patterns
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, frequency: count }));
  }

  /**
   * Generate quality report
   */
  generateReport() {
    const report = {
      summary: {
        totalAgents: new Set(this.history.versions.map(v => v.name)).size,
        totalVersions: this.history.versions.length,
        averageQuality: 0,
        lastUpdate: null
      },
      agents: {},
      trends: [],
      recommendations: []
    };
    
    // Calculate per-agent metrics
    const agentGroups = {};
    this.history.versions.forEach(version => {
      if (!agentGroups[version.name]) {
        agentGroups[version.name] = [];
      }
      agentGroups[version.name].push(version);
    });
    
    Object.entries(agentGroups).forEach(([agent, versions]) => {
      const latest = versions[versions.length - 1];
      report.agents[agent] = {
        currentVersion: latest.version,
        quality: latest.quality,
        versionCount: versions.length,
        lastUpdated: latest.timestamp,
        usage: this.history.metrics[agent] || { invocations: 0 }
      };
    });
    
    // Calculate average quality
    const qualities = Object.values(report.agents).map(a => a.quality.overall);
    report.summary.averageQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
    
    // Find last update
    report.summary.lastUpdate = this.history.versions
      .map(v => v.timestamp)
      .sort()
      .pop();
    
    // Generate recommendations
    Object.entries(report.agents).forEach(([agent, data]) => {
      if (data.quality.overall < 70) {
        report.recommendations.push({
          agent,
          issue: 'Low quality score',
          suggestion: 'Review and improve documentation, add examples'
        });
      }
      
      if (data.usage.invocations > 0 && data.usage.failures > data.usage.successes * 0.2) {
        report.recommendations.push({
          agent,
          issue: 'High failure rate',
          suggestion: 'Review trigger patterns and capabilities'
        });
      }
    });
    
    return report;
  }

  /**
   * Get latest version of an agent
   */
  getLatestVersion(agentName) {
    const versions = this.history.versions
      .filter(v => v.name === agentName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (versions.length > 0) {
      const versionFile = versions[0].path;
      if (fs.existsSync(versionFile)) {
        versions[0].content = fs.readFileSync(versionFile, 'utf8');
      }
    }
    
    return versions[0] || null;
  }

  /**
   * Check for structural changes
   */
  hasStructuralChanges(newLines, oldLines) {
    const newSections = newLines.filter(l => l.startsWith('##')).sort();
    const oldSections = oldLines.filter(l => l.startsWith('##')).sort();
    
    return JSON.stringify(newSections) !== JSON.stringify(oldSections);
  }

  /**
   * Check for new features
   */
  hasNewFeatures(newLines, oldLines) {
    const newCapabilities = newLines.filter(l => l.includes('- ') && !oldLines.includes(l));
    return newCapabilities.length > 3;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const tracker = new EvolutionTracker();
  
  switch (command) {
    case 'track':
      const agentPath = args[1];
      if (!agentPath) {
        console.error('Usage: mac evolution track <agent-path>');
        process.exit(1);
      }
      const result = tracker.trackVersion(agentPath);
      console.log(`✅ Tracked: ${result.status}, Version: ${result.version}`);
      break;
      
    case 'report':
      const report = tracker.generateReport();
      console.log('\n📊 Evolution Report\n');
      console.log(`Total Agents: ${report.summary.totalAgents}`);
      console.log(`Total Versions: ${report.summary.totalVersions}`);
      console.log(`Average Quality: ${report.summary.averageQuality.toFixed(1)}%`);
      console.log('\n📈 Agent Details:');
      Object.entries(report.agents).forEach(([agent, data]) => {
        console.log(`\n${agent}:`);
        console.log(`  Version: ${data.currentVersion}`);
        console.log(`  Quality: ${data.quality.overall.toFixed(1)}%`);
        console.log(`  Usage: ${data.usage.invocations} invocations`);
      });
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => {
          console.log(`- ${rec.agent}: ${rec.suggestion}`);
        });
      }
      break;
      
    case 'learn':
      const patterns = tracker.learnPatterns();
      console.log('📚 Learned Patterns:', JSON.stringify(patterns, null, 2));
      break;
      
    case 'usage':
      const agent = args[1];
      const success = args[2] === 'success';
      const pattern = args[3];
      if (!agent) {
        console.error('Usage: mac evolution usage <agent> <success|failure> [pattern]');
        process.exit(1);
      }
      tracker.trackUsage(agent, { success, pattern });
      console.log(`✅ Usage tracked for ${agent}`);
      break;
      
    default:
      console.log(`
Evolution Tracker - Track and optimize agent/role templates

Commands:
  track <path>     Track a new version of an agent/role
  report           Generate quality and usage report
  learn            Learn patterns from usage data
  usage <agent> <success|failure> [pattern]  Track usage event

Examples:
  mac evolution track ./agents/my-agent.md
  mac evolution report
  mac evolution usage my-agent success "deploy to AWS"
  mac evolution learn
      `);
  }
}

// Export for testing
module.exports = { EvolutionTracker };

// Run if called directly
if (require.main === module) {
  main();
}