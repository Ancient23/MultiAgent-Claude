#!/usr/bin/env node
/**
 * Wave 6: Quality Dashboard Generator
 * Creates comprehensive HTML dashboard with scoring, trends, and regression detection
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

class QualityDashboard {
  constructor() {
    this.reportsDir = path.join(__dirname, '..', '.claude', 'reports');
    this.qualityMetricsPath = path.join(this.reportsDir, 'quality-metrics.json');
    this.historyDir = path.join(__dirname, '..', '.ai', 'memory', 'quality', 'history');
    this.outputPath = path.join(this.reportsDir, 'quality-dashboard.html');
  }

  async generateDashboard() {
    console.log('📊 Generating quality dashboard...');

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Load current quality metrics
    let currentMetrics = null;
    if (fs.existsSync(this.qualityMetricsPath)) {
      currentMetrics = JSON.parse(fs.readFileSync(this.qualityMetricsPath, 'utf8'));
    } else {
      // Generate metrics if they don't exist
      console.log('📋 No existing metrics found, generating...');
      currentMetrics = await this.generateQualityMetrics();
    }

    // Load historical data for trends
    const historicalData = this.loadHistoricalData();

    // Generate HTML dashboard
    const html = this.generateHTML(currentMetrics, historicalData);
    
    // Write dashboard file
    fs.writeFileSync(this.outputPath, html);
    
    console.log(`✅ Quality dashboard generated: ${this.outputPath}`);
    console.log(`📈 Analyzed ${currentMetrics ? currentMetrics.summary.totalAgents : 0} agents`);
    console.log(`📊 Historical data points: ${historicalData.length}`);
    
    return this.outputPath;
  }

  async generateQualityMetrics() {
    // Import the scorer from the test file logic
    const agentFiles = glob.sync('Examples/agents/**/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });

    const scores = [];
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const score = this.scoreAgent(file, content);
      scores.push(score);
    }

    const summary = this.calculateSummary(scores);
    const metrics = { summary, details: scores };
    
    // Save metrics
    fs.writeFileSync(this.qualityMetricsPath, JSON.stringify(metrics, null, 2));
    
    return metrics;
  }

  scoreAgent(file, content) {
    const score = {
      file,
      yamlCompliance: 0,
      patternCompliance: 0,
      mcpWorkflow: 0,
      qualityStandards: 0,
      documentation: 0,
      total: 0,
      issues: [],
      strengths: []
    };

    // YAML compliance scoring
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        let yamlScore = 0;
        
        if (frontmatter.name) yamlScore += 25;
        if (frontmatter.description) yamlScore += 25;
        if (frontmatter.model) yamlScore += 20;
        if (frontmatter.Examples && Array.isArray(frontmatter.Examples)) {
          yamlScore += 20;
          if (frontmatter.Examples.length >= 3) yamlScore += 10;
        }
        
        score.yamlCompliance = yamlScore;
      } catch (error) {
        score.issues.push(`YAML parsing error: ${error.message}`);
      }
    } else {
      score.issues.push('Missing YAML frontmatter');
    }

    // Pattern compliance scoring
    const contentAfterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    const requiredSections = [
      'Goal', 'Core Workflow', 'Output Format', 'Rules', 
      'Core Competencies', 'Planning Approach', 'Quality Standards'
    ];
    
    let foundSections = 0;
    for (const section of requiredSections) {
      const pattern = new RegExp(`## ${section}`, 'i');
      if (pattern.test(contentAfterFrontmatter)) {
        foundSections++;
      } else {
        score.issues.push(`Missing section: ${section}`);
      }
    }
    score.patternCompliance = (foundSections / requiredSections.length) * 100;

    // MCP workflow scoring
    let mcpScore = 0;
    if (content.includes('Context7 MCP') || content.includes('mcp__context7')) mcpScore += 30;
    if (content.includes('Sequential MCP') || content.includes('mcp__sequential')) mcpScore += 25;
    if (content.includes('mcp-catalog')) mcpScore += 20;
    if (content.includes('.claude/doc/')) mcpScore += 25;
    score.mcpWorkflow = Math.min(mcpScore, 100);

    // Quality standards scoring
    let qualityScore = 0;
    if (content.includes('## Quality Standards')) qualityScore += 50;
    if (content.includes('must include:')) qualityScore += 25;
    if (content.includes('When creating implementation plans')) qualityScore += 25;
    score.qualityStandards = Math.min(qualityScore, 100);

    // Documentation scoring
    let docScore = 0;
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 800) docScore += 40;
    else if (wordCount >= 400) docScore += 20;
    
    if (content.includes('Use this agent PROACTIVELY')) docScore += 30;
    if (contentAfterFrontmatter.split('##').length >= 7) docScore += 30;
    score.documentation = Math.min(docScore, 100);

    // Calculate overall score
    score.total = (score.yamlCompliance + score.patternCompliance + score.mcpWorkflow + score.qualityStandards + score.documentation) / 5;

    // Add strengths
    if (score.yamlCompliance >= 90) score.strengths.push('Excellent YAML compliance');
    if (score.patternCompliance >= 90) score.strengths.push('Complete pattern implementation');
    if (score.mcpWorkflow >= 80) score.strengths.push('Strong MCP integration');
    if (score.total >= 85) score.strengths.push('High overall quality');

    return score;
  }

  calculateSummary(scores) {
    const totalAgents = scores.length;
    const averageScore = scores.reduce((sum, s) => sum + s.total, 0) / totalAgents;
    
    const summary = {
      totalAgents,
      averageScore,
      yamlCompliance: scores.reduce((sum, s) => sum + s.yamlCompliance, 0) / totalAgents,
      patternCompliance: scores.reduce((sum, s) => sum + s.patternCompliance, 0) / totalAgents,
      mcpWorkflow: scores.reduce((sum, s) => sum + s.mcpWorkflow, 0) / totalAgents,
      qualityStandards: scores.reduce((sum, s) => sum + s.qualityStandards, 0) / totalAgents,
      documentation: scores.reduce((sum, s) => sum + s.documentation, 0) / totalAgents,
      highQualityAgents: scores.filter(s => s.total >= 80).length,
      mediumQualityAgents: scores.filter(s => s.total >= 60 && s.total < 80).length,
      lowQualityAgents: scores.filter(s => s.total < 60).length,
      topIssues: this.getTopIssues(scores),
      topStrengths: this.getTopStrengths(scores)
    };

    return summary;
  }

  getTopIssues(scores) {
    const issueCount = new Map();
    scores.forEach(score => {
      score.issues.forEach(issue => {
        issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
      });
    });
    
    return Array.from(issueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([issue, count]) => ({ issue, count }));
  }

  getTopStrengths(scores) {
    const strengthCount = new Map();
    scores.forEach(score => {
      score.strengths.forEach(strength => {
        strengthCount.set(strength, (strengthCount.get(strength) || 0) + 1);
      });
    });
    
    return Array.from(strengthCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength, count]) => ({ strength, count }));
  }

  loadHistoricalData() {
    const historicalData = [];
    
    if (!fs.existsSync(this.historyDir)) {
      return historicalData;
    }

    const trendFiles = glob.sync(path.join(this.historyDir, '**', 'trend-*.json'));
    
    for (const file of trendFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        historicalData.push(data);
      } catch (error) {
        console.warn(`Failed to load historical data from ${file}:`, error.message);
      }
    }

    // Sort by timestamp
    return historicalData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  generateHTML(metrics, historicalData) {
    const timestamp = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Quality Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header .timestamp {
            color: #7f8c8d;
            font-size: 1.1rem;
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .card:hover { transform: translateY(-5px); }
        .card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .metric {
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            background: #f8f9fa;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9rem;
        }
        .excellent { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; }
        .good { background: linear-gradient(135deg, #2196F3, #1976D2); color: white; }
        .fair { background: linear-gradient(135deg, #FF9800, #F57C00); color: white; }
        .poor { background: linear-gradient(135deg, #f44336, #d32f2f); color: white; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .agents-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .agents-table th,
        .agents-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .agents-table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .agents-table tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin: 20px 0;
        }
        .issues-list, .strengths-list {
            list-style: none;
        }
        .issues-list li, .strengths-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        .trend-indicator {
            display: inline-block;
            font-size: 1.2rem;
            margin-left: 10px;
        }
        .trend-up { color: #4CAF50; }
        .trend-down { color: #f44336; }
        .trend-stable { color: #FF9800; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Agent Quality Dashboard</h1>
            <div class="timestamp">Generated: ${timestamp}</div>
            <div class="timestamp">Total Agents Analyzed: ${metrics ? metrics.summary.totalAgents : 0}</div>
        </div>

        ${metrics ? this.generateOverviewCards(metrics) : '<p>No metrics available</p>'}
        ${metrics ? this.generateDetailedAnalysis(metrics) : ''}
        ${historicalData.length > 0 ? this.generateTrendAnalysis(historicalData) : ''}
    </div>

    <script>
        // Initialize charts if we have historical data
        ${historicalData.length > 0 ? this.generateChartScript(historicalData) : ''}
    </script>
</body>
</html>`;
  }

  generateOverviewCards(metrics) {
    const { summary } = metrics;
    
    return `
        <div class="cards">
            <div class="card">
                <h3>📈 Overall Quality Score</h3>
                <div class="metric ${this.getScoreClass(summary.averageScore)}">
                    <div class="metric-value">${summary.averageScore.toFixed(1)}/100</div>
                    <div class="metric-label">Average Quality Score</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(summary.averageScore)}" 
                         style="width: ${summary.averageScore}%"></div>
                </div>
            </div>

            <div class="card">
                <h3>🏆 Quality Distribution</h3>
                <div class="metric-grid">
                    <div class="metric excellent">
                        <div class="metric-value">${summary.highQualityAgents}</div>
                        <div class="metric-label">High Quality (80+)</div>
                    </div>
                    <div class="metric good">
                        <div class="metric-value">${summary.mediumQualityAgents}</div>
                        <div class="metric-label">Medium Quality (60-79)</div>
                    </div>
                    <div class="metric poor">
                        <div class="metric-value">${summary.lowQualityAgents}</div>
                        <div class="metric-label">Low Quality (<60)</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>📋 Component Scores</h3>
                <div class="metric-grid">
                    <div class="metric">
                        <div class="metric-value">${summary.yamlCompliance.toFixed(0)}</div>
                        <div class="metric-label">YAML Compliance</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${summary.patternCompliance.toFixed(0)}</div>
                        <div class="metric-label">Pattern Compliance</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${summary.mcpWorkflow.toFixed(0)}</div>
                        <div class="metric-label">MCP Integration</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${summary.documentation.toFixed(0)}</div>
                        <div class="metric-label">Documentation</div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  generateDetailedAnalysis(metrics) {
    const { summary, details } = metrics;
    
    return `
        <div class="cards">
            <div class="card">
                <h3>⚠️ Top Issues (${summary.topIssues.length})</h3>
                <ul class="issues-list">
                    ${summary.topIssues.map(issue => `
                        <li>
                            <span>${issue.issue}</span>
                            <span class="status-badge poor">${issue.count} agents</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="card">
                <h3>✨ Top Strengths (${summary.topStrengths.length})</h3>
                <ul class="strengths-list">
                    ${summary.topStrengths.map(strength => `
                        <li>
                            <span>${strength.strength}</span>
                            <span class="status-badge excellent">${strength.count} agents</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <div class="card">
            <h3>📊 Agent Details</h3>
            <table class="agents-table">
                <thead>
                    <tr>
                        <th>Agent</th>
                        <th>Overall</th>
                        <th>YAML</th>
                        <th>Pattern</th>
                        <th>MCP</th>
                        <th>Quality</th>
                        <th>Docs</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${details
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 20) // Show top 20 agents
                      .map(agent => `
                        <tr>
                            <td title="${agent.file}">${path.basename(agent.file, '.md')}</td>
                            <td><strong>${agent.total.toFixed(0)}</strong></td>
                            <td>${agent.yamlCompliance.toFixed(0)}</td>
                            <td>${agent.patternCompliance.toFixed(0)}</td>
                            <td>${agent.mcpWorkflow.toFixed(0)}</td>
                            <td>${agent.qualityStandards.toFixed(0)}</td>
                            <td>${agent.documentation.toFixed(0)}</td>
                            <td><span class="status-badge ${this.getScoreClass(agent.total)}">${this.getScoreLabel(agent.total)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
  }

  generateTrendAnalysis(historicalData) {
    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];
    
    let trendIndicator = '';
    let trendClass = 'trend-stable';
    
    if (previous) {
      const diff = latest.summary.averageScore - previous.summary.averageScore;
      if (diff > 1) {
        trendIndicator = '📈';
        trendClass = 'trend-up';
      } else if (diff < -1) {
        trendIndicator = '📉';
        trendClass = 'trend-down';
      } else {
        trendIndicator = '➡️';
      }
    }
    
    return `
        <div class="card">
            <h3>📊 Quality Trends <span class="${trendClass} trend-indicator">${trendIndicator}</span></h3>
            <div class="chart-container">
                <canvas id="trendChart"></canvas>
            </div>
            <p><strong>Data Points:</strong> ${historicalData.length} | <strong>Latest Score:</strong> ${latest.summary.averageScore.toFixed(1)}/100</p>
        </div>`;
  }

  generateChartScript(historicalData) {
    const labels = historicalData.map(d => new Date(d.timestamp).toLocaleDateString());
    const overallScores = historicalData.map(d => d.summary.averageScore);
    const yamlScores = historicalData.map(d => d.summary.yamlCompliance);
    const patternScores = historicalData.map(d => d.summary.patternCompliance);
    const mcpScores = historicalData.map(d => d.summary.mcpWorkflow);
    
    return `
        const ctx = document.getElementById('trendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [
                    {
                        label: 'Overall Quality',
                        data: ${JSON.stringify(overallScores)},
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'YAML Compliance',
                        data: ${JSON.stringify(yamlScores)},
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Pattern Compliance',
                        data: ${JSON.stringify(patternScores)},
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'MCP Integration',
                        data: ${JSON.stringify(mcpScores)},
                        borderColor: '#9C27B0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f0f0f0' }
                    },
                    x: { grid: { color: '#f0f0f0' } }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });`;
  }

  getScoreClass(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  getScoreLabel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  }
}

// Main execution
if (require.main === module) {
  const dashboard = new QualityDashboard();
  
  dashboard.generateDashboard()
    .then(outputPath => {
      console.log('✅ Dashboard generation complete!');
      console.log(`📊 Dashboard available at: ${outputPath}`);
    })
    .catch(error => {
      console.error('❌ Dashboard generation failed:', error);
      process.exit(1);
    });
}

module.exports = QualityDashboard;