const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

/**
 * Enhanced Agent Template Validation Test Suite
 * Comprehensive quality metrics and pattern compliance checking
 * Wave 6: Quality Automation Framework
 */

// Quality scoring system
class AgentQualityScorer {
  constructor() {
    this.scores = new Map();
    this.reports = [];
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
    
    this.evaluateYamlCompliance(score, content);
    this.evaluatePatternCompliance(score, content);
    this.evaluateMcpWorkflow(score, content);
    this.evaluateQualityStandards(score, content);
    this.evaluateDocumentation(score, content);
    
    score.total = (score.yamlCompliance + score.patternCompliance + score.mcpWorkflow + score.qualityStandards + score.documentation) / 5;
    
    this.scores.set(file, score);
    return score;
  }
  
  evaluateYamlCompliance(score, content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    
    if (!frontmatterMatch) {
      score.issues.push('Missing YAML frontmatter');
      return;
    }
    
    try {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      let points = 0;
      
      if (frontmatter.name) points += 20;
      else score.issues.push('Missing name field');
      
      if (frontmatter.description) points += 20;
      else score.issues.push('Missing description field');
      
      if (frontmatter.model) points += 15;
      else score.issues.push('Missing model field');
      
      if (frontmatter.color) points += 10;
      else score.issues.push('Missing color field');
      
      if (frontmatter.Examples && Array.isArray(frontmatter.Examples)) {
        points += 25;
        if (frontmatter.Examples.length >= 3) points += 10;
        else score.issues.push('Examples array should have 3+ entries');
      } else {
        score.issues.push('Missing or invalid Examples array');
      }
      
      score.yamlCompliance = points;
      if (points >= 85) score.strengths.push('Excellent YAML compliance');
      
    } catch (error) {
      score.issues.push(`Invalid YAML syntax: ${error.message}`);
    }
  }
  
  evaluatePatternCompliance(score, content) {
    const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    if (!contentMatch) return;
    
    const agentContent = contentMatch[1];
    let points = 0;
    
    // Required 9 sections (70 points)
    const requiredSections = [
      'Goal',
      'Core Workflow',
      'Output Format', 
      'Rules',
      'Core Competencies for Creating Implementation Plans',
      'Planning Approach',
      'Quality Standards',
      'Expertise Areas',
      'Implementation Categories'
    ];
    
    const foundSections = [];
    for (const section of requiredSections) {
      const sectionPattern = new RegExp(`## ${section}`, 'i');
      if (sectionPattern.test(agentContent)) {
        points += 7.8; // 70/9 points per section
        foundSections.push(section);
      } else {
        score.issues.push(`Missing section: ${section}`);
      }
    }
    
    // Research-only directive (15 points)
    const isOrchestrator = score.file.includes('/orchestrators/');
    if (isOrchestrator) {
      // Orchestrators can coordinate but shouldn't implement
      if (agentContent.includes('coordinates') || agentContent.includes('manages')) {
        points += 15;
        score.strengths.push('Proper orchestrator role definition');
      }
    } else {
      if (agentContent.includes('NEVER do the actual implementation') || agentContent.includes('ONLY creates plans')) {
        points += 15;
        score.strengths.push('Clear research-only directive');
      } else {
        score.issues.push('Missing research-only directive');
      }
    }
    
    // Session context integration (15 points)
    if (agentContent.includes('Check .claude/tasks/') || agentContent.includes('context_session_')) {
      points += 15;
      score.strengths.push('Proper session context integration');
    } else {
      score.issues.push('Missing session context check');
    }
    
    score.patternCompliance = Math.min(points, 100);
  }
  
  evaluateMcpWorkflow(score, content) {
    const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    if (!contentMatch) return;
    
    const agentContent = contentMatch[1];
    let points = 0;
    
    // MCP tool mentions (60 points total)
    if (agentContent.includes('Context7 MCP') || agentContent.includes('mcp__context7')) {
      points += 25;
      score.strengths.push('Context7 MCP integration');
    } else {
      score.issues.push('Missing Context7 MCP usage');
    }
    
    if (agentContent.includes('Sequential MCP') || agentContent.includes('mcp__sequential')) {
      points += 20;
      score.strengths.push('Sequential MCP for complex reasoning');
    } else {
      score.issues.push('Missing Sequential MCP usage');
    }
    
    if (agentContent.includes('mcp-catalog') || agentContent.includes('Use Context7 MCP')) {
      points += 15;
      score.strengths.push('MCP catalog awareness');
    } else {
      score.issues.push('Missing mcp-catalog reference');
    }
    
    // Workflow integration (40 points)
    const workflowPattern = /## Core Workflow([\s\S]*?)(?=\n##|$)/;
    const workflowMatch = agentContent.match(workflowPattern);
    
    if (workflowMatch) {
      const workflow = workflowMatch[1];
      
      if (workflow.includes('.ai/memory/patterns/')) {
        points += 20;
        score.strengths.push('Memory pattern integration');
      }
      
      if (workflow.includes('.claude/doc/') && workflow.includes('[timestamp]')) {
        points += 20;
        score.strengths.push('Proper output specification');
      } else {
        score.issues.push('Missing timestamped output path');
      }
    } else {
      score.issues.push('Missing Core Workflow section');
    }
    
    score.mcpWorkflow = Math.min(points, 100);
  }
  
  evaluateQualityStandards(score, content) {
    const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    if (!contentMatch) return;
    
    const agentContent = contentMatch[1];
    let points = 0;
    
    // Quality Standards section (40 points)
    if (agentContent.includes('## Quality Standards')) {
      points += 20;
      
      if (agentContent.includes('must include:') && agentContent.includes('- [ ]')) {
        points += 20;
        score.strengths.push('Detailed quality checklists');
      } else {
        score.issues.push('Missing quality requirement checklists');
      }
    } else {
      score.issues.push('Missing Quality Standards section');
    }
    
    // Planning Approach (30 points)
    if (agentContent.includes('When creating implementation plans, you will:')) {
      points += 15;
      
      if (agentContent.match(/\d+\./g) && agentContent.match(/\d+\./g).length >= 4) {
        points += 15;
        score.strengths.push('Comprehensive planning steps');
      } else {
        score.issues.push('Insufficient planning detail');
      }
    } else {
      score.issues.push('Missing planning approach');
    }
    
    // Success criteria and anti-patterns (30 points)
    if (agentContent.includes('Success Criteria') || agentContent.includes('Anti-patterns')) {
      points += 30;
      score.strengths.push('Clear success criteria');
    } else {
      score.issues.push('Missing success criteria or anti-patterns');
    }
    
    score.qualityStandards = Math.min(points, 100);
  }
  
  evaluateDocumentation(score, content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch || !contentMatch) return;
    
    let points = 0;
    
    try {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      const agentContent = contentMatch[1];
      
      // Description quality (25 points)
      if (frontmatter.description) {
        const desc = frontmatter.description;
        if (desc.includes('Use this agent PROACTIVELY') || desc.includes('Analyzes tasks')) {
          points += 15;
          score.strengths.push('Clear proactive usage instructions');
        }
        
        if (desc.length >= 100) {
          points += 10;
        } else {
          score.issues.push('Description should be more detailed (100+ chars)');
        }
      }
      
      // Examples quality (35 points)
      if (frontmatter.Examples && Array.isArray(frontmatter.Examples)) {
        const examples = frontmatter.Examples;
        
        if (examples.length >= 3) {
          points += 15;
          
          // Check for proper example structure
          const hasContextUserAssistant = examples.some(ex => 
            typeof ex === 'object' && ex.context && ex.user && ex.assistant
          );
          
          if (hasContextUserAssistant) {
            points += 20;
            score.strengths.push('Well-structured usage examples');
          } else {
            score.issues.push('Examples should have context/user/assistant structure');
          }
        } else {
          score.issues.push('Should have 3+ usage examples');
        }
      }
      
      // Content comprehensiveness (40 points)
      const sections = agentContent.split('##').length - 1;
      if (sections >= 8) {
        points += 20;
      } else {
        score.issues.push(`Only ${sections} sections found, should have 8+`);
      }
      
      const wordCount = agentContent.split(/\s+/).length;
      if (wordCount >= 800) {
        points += 20;
        if (wordCount >= 1200) score.strengths.push('Comprehensive documentation');
      } else {
        score.issues.push('Content should be more comprehensive (800+ words)');
      }
      
    } catch (error) {
      score.issues.push(`Documentation analysis error: ${error.message}`);
    }
    
    score.documentation = Math.min(points, 100);
  }
  
  generateReport() {
    const allScores = Array.from(this.scores.values());
    const totalAgents = allScores.length;
    
    const summary = {
      totalAgents,
      averageScore: allScores.reduce((sum, s) => sum + s.total, 0) / totalAgents,
      yamlCompliance: allScores.reduce((sum, s) => sum + s.yamlCompliance, 0) / totalAgents,
      patternCompliance: allScores.reduce((sum, s) => sum + s.patternCompliance, 0) / totalAgents,
      mcpWorkflow: allScores.reduce((sum, s) => sum + s.mcpWorkflow, 0) / totalAgents,
      qualityStandards: allScores.reduce((sum, s) => sum + s.qualityStandards, 0) / totalAgents,
      documentation: allScores.reduce((sum, s) => sum + s.documentation, 0) / totalAgents,
      highQualityAgents: allScores.filter(s => s.total >= 80).length,
      mediumQualityAgents: allScores.filter(s => s.total >= 60 && s.total < 80).length,
      lowQualityAgents: allScores.filter(s => s.total < 60).length,
      topIssues: this.getTopIssues(allScores),
      topStrengths: this.getTopStrengths(allScores)
    };
    
    return { summary, details: allScores };
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
      .slice(0, 10)
      .map(([strength, count]) => ({ strength, count }));
  }
}

const qualityScorer = new AgentQualityScorer();

test.describe('Agent Template Compliance', () => {
  let agentFiles = [];
  
  test.beforeAll(async () => {
    // Find all agent files
    agentFiles = glob.sync('Examples/agents/**/*.md', {
      ignore: ['**/README.md', '**/templates/**']
    });
    
    expect(agentFiles.length).toBeGreaterThan(0);
  });

  test('All agents should have YAML frontmatter', async () => {
    const errors = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for YAML frontmatter
      const hasFrontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
      
      if (!hasFrontmatter) {
        errors.push(`${file}: Missing YAML frontmatter`);
        continue;
      }
      
      try {
        const [, yamlContent] = hasFrontmatter;
        const frontmatter = yaml.load(yamlContent);
        
        // Validate required frontmatter fields
        if (!frontmatter.name) {
          errors.push(`${file}: Missing 'name' in frontmatter`);
        }
        
        if (!frontmatter.description) {
          errors.push(`${file}: Missing 'description' in frontmatter`);
        }
        
        if (!frontmatter.model) {
          errors.push(`${file}: Missing 'model' in frontmatter`);
        }
        
        if (!frontmatter.Examples || !Array.isArray(frontmatter.Examples)) {
          errors.push(`${file}: Missing or invalid 'Examples' array in frontmatter`);
        }
        
      } catch (yamlError) {
        errors.push(`${file}: Invalid YAML frontmatter - ${yamlError.message}`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Agent template validation errors:\n${errors.join('\n')}`);
    }
  });

  test('All agents should follow research-plan-execute pattern', async () => {
    const errors = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract content after frontmatter
      const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      if (!contentMatch) continue;
      
      const agentContent = contentMatch[1];
      
      // Check for required sections
      const requiredSections = [
        'Goal',
        'Core Workflow',
        'Output Format',
        'Rules',
        'Core Competencies for Creating Implementation Plans',
        'Planning Approach',
        'Quality Standards'
      ];
      
      for (const section of requiredSections) {
        const sectionPattern = new RegExp(`## ${section}`, 'i');
        if (!sectionPattern.test(agentContent)) {
          errors.push(`${file}: Missing required section '${section}'`);
        }
      }
      
      // Check for research-only directive (flexible for orchestrators)
      const isOrchestrator = file.includes('/orchestrators/');
      if (!isOrchestrator && !agentContent.includes('NEVER do the actual implementation') && !agentContent.includes('ONLY creates plans')) {
        errors.push(`${file}: Missing 'NEVER do the actual implementation' or 'ONLY creates plans' directive`);
      }
      
      // Check for session context check
      if (!agentContent.includes('Check .claude/tasks/')) {
        errors.push(`${file}: Missing session context check directive`);
      }
      
      // Check for output to .claude/doc/
      if (!agentContent.includes('.claude/doc/')) {
        errors.push(`${file}: Missing output to .claude/doc/ directive`);
      }
      
      // Check for MCP tool usage (flexible - any MCP reference counts)
      if (!agentContent.includes('MCP') && !agentContent.includes('Context7') && !file.includes('snippet')) {
        errors.push(`${file}: Missing MCP tool usage specification`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Research-plan-execute pattern violations:\n${errors.join('\n')}`);
    }
  });

  test('Agent descriptions should have proper trigger patterns', async () => {
    const errors = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      
      if (!frontmatterMatch) continue;
      
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        const description = frontmatter.description || '';
        
        // Check for proactive usage patterns (only for agents with YAML frontmatter)
        if (frontmatter.name && frontmatter.name !== 'template-agent-name') {
          if (!description.includes('Use this agent PROACTIVELY') && !description.includes('Analyzes tasks')) {
            errors.push(`${file}: Missing 'Use this agent PROACTIVELY' pattern or task analysis description`);
          }
          
          // Check for specialization description (flexible for orchestrators)
          const isOrchestrator = file.includes('/orchestrators/');
          if (!isOrchestrator && !description.includes('specializes in') && !description.includes('excels at')) {
            errors.push(`${file}: Missing specialization description`);
          }
        }
        
        // Check for examples
        if (!frontmatter.Examples || frontmatter.Examples.length < 1) {
          errors.push(`${file}: Missing usage examples`);
        }
        
      } catch (yamlError) {
        errors.push(`${file}: Cannot parse frontmatter - ${yamlError.message}`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Trigger pattern validation errors:\n${errors.join('\n')}`);
    }
  });

  test('No duplicate agents should exist', async () => {
    const agentNames = new Map();
    const duplicates = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      
      if (!frontmatterMatch) continue;
      
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        const name = frontmatter.name;
        
        if (agentNames.has(name)) {
          duplicates.push(`Duplicate agent '${name}': ${agentNames.get(name)} and ${file}`);
        } else {
          agentNames.set(name, file);
        }
        
      } catch (yamlError) {
        // Skip invalid YAML (will be caught by other tests)
      }
    }
    
    if (duplicates.length > 0) {
      throw new Error(`Duplicate agents found:\n${duplicates.join('\n')}`);
    }
  });

  test('Agent directory structure should be properly organized', async () => {
    const rootAgents = glob.sync('Examples/agents/*.md', {
      ignore: ['**/README.md']
    });
    
    const specialistAgents = glob.sync('Examples/agents/specialists/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const orchestratorAgents = glob.sync('Examples/agents/orchestrators/*.md', {
      ignore: ['**/README.md']
    });
    
    // Should have no actual agents in root (allow documentation/snippets)
    const actualAgents = rootAgents.filter(f => !f.includes('snippet') && !f.includes('README'));
    expect(actualAgents).toHaveLength(0);
    
    // Should have specialists and orchestrators
    expect(specialistAgents.length).toBeGreaterThan(0);
    expect(orchestratorAgents.length).toBeGreaterThan(0);
  });

  test('Conversion tool should produce quality output', async () => {
    // Skip this test until YAML parsing is fixed in Wave 2
    test.skip('Conversion tool test deferred until YAML fixes complete');
  });
});

test.describe('Template Pattern Quality', () => {
  
  test('All agents should have consistent quality standards', async () => {
    const agentFiles = glob.sync('Examples/agents/specialists/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const errors = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      
      if (!contentMatch) continue;
      
      const agentContent = contentMatch[1];
      
      // Check for quality standards section
      if (!agentContent.includes('## Quality Standards')) {
        errors.push(`${file}: Missing Quality Standards section`);
      }
      
      // Check for success criteria
      if (!agentContent.includes('must include:')) {
        errors.push(`${file}: Missing quality requirements list`);
      }
      
      // Check for planning approach
      if (!agentContent.includes('When creating implementation plans, you will:')) {
        errors.push(`${file}: Missing planning approach description`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Quality standards validation errors:\n${errors.join('\n')}`);
    }
  });

  test('Agents should have proper MCP tool specifications', async () => {
    const agentFiles = glob.sync('Examples/agents/specialists/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const errors = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const contentMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      
      if (!contentMatch) continue;
      
      const agentContent = contentMatch[1];
      
      // Check for MCP tool workflow
      const workflowPattern = /## Core Workflow([\s\S]*?)(?=\n##|$)/;
      const workflowMatch = agentContent.match(workflowPattern);
      
      if (workflowMatch) {
        const workflow = workflowMatch[1];
        
        // Should mention mcp-catalog
        if (!workflow.includes('mcp-catalog')) {
          errors.push(`${file}: Missing mcp-catalog usage in workflow`);
        }
        
        // Should mention Context7
        if (!workflow.includes('Context7 MCP')) {
          errors.push(`${file}: Missing Context7 MCP usage in workflow`);
        }
        
        // Should mention Sequential for complex tasks
        if (!workflow.includes('Sequential MCP')) {
          errors.push(`${file}: Missing Sequential MCP usage in workflow`);
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`MCP tool specification errors:\n${errors.join('\n')}`);
    }
  });
});

// Wave 6: Enhanced Quality Metrics Tests
test.describe('Quality Scoring and Metrics', () => {
  let qualityReport;
  
  test.beforeAll(async () => {
    // Generate comprehensive quality report
    const agentFiles = glob.sync('Examples/agents/**/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      qualityScorer.scoreAgent(file, content);
    }
    
    qualityReport = qualityScorer.generateReport();
    
    // Save quality report for dashboard
    const reportPath = path.join(__dirname, '..', '.claude', 'reports', 'quality-metrics.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));
    
    // Also create human-readable report
    const humanReport = generateHumanReadableReport(qualityReport);
    fs.writeFileSync(reportPath.replace('.json', '.md'), humanReport);
  });
  
  test('Overall quality score should meet minimum threshold', async () => {
    expect(qualityReport.summary.averageScore).toBeGreaterThanOrEqual(70);
    
    console.log(`Average Quality Score: ${qualityReport.summary.averageScore.toFixed(1)}/100`);
    console.log(`High Quality Agents (80+): ${qualityReport.summary.highQualityAgents}`);
    console.log(`Medium Quality Agents (60-79): ${qualityReport.summary.mediumQualityAgents}`);
    console.log(`Low Quality Agents (<60): ${qualityReport.summary.lowQualityAgents}`);
  });
  
  test('YAML compliance should be consistently high', async () => {
    expect(qualityReport.summary.yamlCompliance).toBeGreaterThanOrEqual(75);
    
    const lowYamlAgents = qualityReport.details
      .filter(agent => agent.yamlCompliance < 60)
      .map(agent => agent.file);
    
    if (lowYamlAgents.length > 0) {
      console.warn('Agents with low YAML compliance:', lowYamlAgents);
    }
  });
  
  test('Pattern compliance should show systematic improvement', async () => {
    expect(qualityReport.summary.patternCompliance).toBeGreaterThanOrEqual(70);
    
    const patternIssues = qualityReport.summary.topIssues
      .filter(issue => issue.issue.includes('section') || issue.issue.includes('pattern'))
      .slice(0, 5);
    
    if (patternIssues.length > 0) {
      console.log('Top pattern compliance issues:', patternIssues);
    }
  });
  
  test('MCP workflow integration should be comprehensive', async () => {
    expect(qualityReport.summary.mcpWorkflow).toBeGreaterThanOrEqual(60);
    
    const mcpIssues = qualityReport.summary.topIssues
      .filter(issue => issue.issue.includes('MCP') || issue.issue.includes('Context7'))
      .slice(0, 5);
    
    if (mcpIssues.length > 0) {
      console.log('Top MCP workflow issues:', mcpIssues);
    }
  });
  
  test('Quality regression detection', async () => {
    // Load previous quality report if exists
    const previousReportPath = path.join(__dirname, '..', '.claude', 'reports', 'quality-metrics-previous.json');
    
    if (fs.existsSync(previousReportPath)) {
      const previousReport = JSON.parse(fs.readFileSync(previousReportPath, 'utf8'));
      
      // Check for regression
      const scoreDifference = qualityReport.summary.averageScore - previousReport.summary.averageScore;
      
      if (scoreDifference < -5) {
        console.warn(`Quality regression detected: ${scoreDifference.toFixed(1)} points`);
        console.warn('Agents with score decreases:', 
          qualityReport.details
            .filter(current => {
              const previous = previousReport.details.find(p => p.file === current.file);
              return previous && current.total < previous.total - 10;
            })
            .map(agent => ({ file: agent.file, currentScore: agent.total }))
        );
      } else {
        console.log(`Quality improvement: +${scoreDifference.toFixed(1)} points`);
      }
    }
    
    // Archive current as previous for next run
    fs.writeFileSync(previousReportPath, JSON.stringify(qualityReport, null, 2));
  });
  
  test('Identify agents needing immediate attention', async () => {
    const criticalAgents = qualityReport.details
      .filter(agent => agent.total < 50)
      .sort((a, b) => a.total - b.total);
    
    if (criticalAgents.length > 0) {
      console.log('Agents needing immediate attention:');
      criticalAgents.forEach(agent => {
        console.log(`- ${agent.file}: ${agent.total.toFixed(1)}/100`);
        console.log(`  Top issues: ${agent.issues.slice(0, 3).join(', ')}`);
      });
    }
    
    // Should have no more than 5 critical agents
    expect(criticalAgents.length).toBeLessThanOrEqual(5);
  });
  
  test('Track quality trends and improvements', async () => {
    const excellentAgents = qualityReport.details
      .filter(agent => agent.total >= 90)
      .sort((a, b) => b.total - a.total);
    
    if (excellentAgents.length > 0) {
      console.log('Excellent quality agents (90+):');
      excellentAgents.forEach(agent => {
        console.log(`- ${agent.file}: ${agent.total.toFixed(1)}/100`);
      });
    }
    
    // Should have at least 10% excellent agents
    const excellentPercentage = (excellentAgents.length / qualityReport.summary.totalAgents) * 100;
    expect(excellentPercentage).toBeGreaterThanOrEqual(10);
  });
});

// Generate human-readable quality report
function generateHumanReadableReport(report) {
  const timestamp = new Date().toISOString();
  
  let markdown = `# Agent Quality Metrics Report\n\n`;
  markdown += `**Generated**: ${timestamp}\n`;
  markdown += `**Total Agents Analyzed**: ${report.summary.totalAgents}\n\n`;
  
  markdown += `## Summary Scores\n\n`;
  markdown += `| Metric | Score | Status |\n`;
  markdown += `|--------|-------|--------|\n`;
  markdown += `| Overall Quality | ${report.summary.averageScore.toFixed(1)}/100 | ${getScoreStatus(report.summary.averageScore)} |\n`;
  markdown += `| YAML Compliance | ${report.summary.yamlCompliance.toFixed(1)}/100 | ${getScoreStatus(report.summary.yamlCompliance)} |\n`;
  markdown += `| Pattern Compliance | ${report.summary.patternCompliance.toFixed(1)}/100 | ${getScoreStatus(report.summary.patternCompliance)} |\n`;
  markdown += `| MCP Workflow | ${report.summary.mcpWorkflow.toFixed(1)}/100 | ${getScoreStatus(report.summary.mcpWorkflow)} |\n`;
  markdown += `| Quality Standards | ${report.summary.qualityStandards.toFixed(1)}/100 | ${getScoreStatus(report.summary.qualityStandards)} |\n`;
  markdown += `| Documentation | ${report.summary.documentation.toFixed(1)}/100 | ${getScoreStatus(report.summary.documentation)} |\n\n`;
  
  markdown += `## Quality Distribution\n\n`;
  markdown += `- **High Quality (80+)**: ${report.summary.highQualityAgents} agents\n`;
  markdown += `- **Medium Quality (60-79)**: ${report.summary.mediumQualityAgents} agents\n`;
  markdown += `- **Low Quality (<60)**: ${report.summary.lowQualityAgents} agents\n\n`;
  
  markdown += `## Top Issues (Most Common)\n\n`;
  report.summary.topIssues.slice(0, 10).forEach((issue, index) => {
    markdown += `${index + 1}. **${issue.issue}** (${issue.count} agents)\n`;
  });
  
  markdown += `\n## Top Strengths\n\n`;
  report.summary.topStrengths.slice(0, 5).forEach((strength, index) => {
    markdown += `${index + 1}. **${strength.strength}** (${strength.count} agents)\n`;
  });
  
  markdown += `\n## Detailed Agent Scores\n\n`;
  markdown += `| Agent | Overall | YAML | Pattern | MCP | Quality | Docs | Status |\n`;
  markdown += `|-------|---------|------|---------|-----|---------|------|--------|\n`;
  
  report.details
    .sort((a, b) => b.total - a.total)
    .forEach(agent => {
      const name = path.basename(agent.file, '.md');
      markdown += `| ${name} | ${agent.total.toFixed(0)} | ${agent.yamlCompliance.toFixed(0)} | ${agent.patternCompliance.toFixed(0)} | ${agent.mcpWorkflow.toFixed(0)} | ${agent.qualityStandards.toFixed(0)} | ${agent.documentation.toFixed(0)} | ${getScoreStatus(agent.total)} |\n`;
    });
  
  return markdown;
}

function getScoreStatus(score) {
  if (score >= 90) return '🟢 Excellent';
  if (score >= 80) return '🟡 Good';
  if (score >= 60) return '🟠 Fair';
  return '🔴 Needs Work';
}

// Wave 6: Pattern Compliance Deep Analysis
test.describe('Advanced Pattern Analysis', () => {
  
  test('Research-plan-execute pattern boundary validation', async () => {
    const agentFiles = glob.sync('Examples/agents/specialists/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const violations = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for implementation keywords in specialist agents
      const implementationKeywords = [
        'edit the file',
        'create the file',
        'implement this',
        'write the code',
        'execute the plan',
        'run the command',
        'deploy the',
        'install the'
      ];
      
      const lowercaseContent = content.toLowerCase();
      const foundKeywords = implementationKeywords.filter(keyword => 
        lowercaseContent.includes(keyword)
      );
      
      if (foundKeywords.length > 0) {
        violations.push({
          file,
          keywords: foundKeywords,
          violation: 'Contains implementation instructions instead of planning only'
        });
      }
      
      // Check for proper output specification
      if (!content.includes('.claude/doc/') || !content.includes('[timestamp]')) {
        violations.push({
          file,
          violation: 'Missing proper output path specification with timestamp'
        });
      }
      
      // Check for session context integration
      if (!content.includes('context_session_') && !content.includes('.claude/tasks/')) {
        violations.push({
          file,
          violation: 'Missing session context integration'
        });
      }
    }
    
    if (violations.length > 0) {
      console.log('Pattern boundary violations:', violations);
      // Allow up to 3 violations during transition period
      expect(violations.length).toBeLessThanOrEqual(3);
    }
  });
  
  test('Examples array semantic structure validation', async () => {
    const agentFiles = glob.sync('Examples/agents/**/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const structureIssues = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      
      if (!frontmatterMatch) continue;
      
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        
        if (frontmatter.Examples && Array.isArray(frontmatter.Examples)) {
          for (let i = 0; i < frontmatter.Examples.length; i++) {
            const example = frontmatter.Examples[i];
            
            if (typeof example === 'object') {
              // Check for required semantic structure
              if (!example.context) {
                structureIssues.push({
                  file,
                  example: i + 1,
                  issue: 'Missing context field'
                });
              }
              
              if (!example.user) {
                structureIssues.push({
                  file,
                  example: i + 1,
                  issue: 'Missing user field'
                });
              }
              
              if (!example.assistant) {
                structureIssues.push({
                  file,
                  example: i + 1,
                  issue: 'Missing assistant field'
                });
              }
              
              // Check for reasoning/commentary
              if (!example.reasoning && !example.commentary) {
                structureIssues.push({
                  file,
                  example: i + 1,
                  issue: 'Missing reasoning or commentary field'
                });
              }
            } else if (typeof example === 'string') {
              // Simple string examples should be detailed
              if (example.length < 50) {
                structureIssues.push({
                  file,
                  example: i + 1,
                  issue: 'Example too brief, should be more detailed'
                });
              }
            }
          }
        }
      } catch (error) {
        // Skip YAML parsing errors (caught by other tests)
      }
    }
    
    if (structureIssues.length > 0) {
      console.log('Examples structure issues:', structureIssues.slice(0, 20));
      // Allow up to 15 structure issues during improvement period
      expect(structureIssues.length).toBeLessThanOrEqual(15);
    }
  });
  
  test('MCP workflow standardization validation', async () => {
    const agentFiles = glob.sync('Examples/agents/specialists/*.md', {
      ignore: ['**/README.md', '**/TEMPLATE-*.md']
    });
    
    const workflowIssues = [];
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const workflowMatch = content.match(/## Core Workflow([\s\S]*?)(?=\n##|$)/);
      
      if (workflowMatch) {
        const workflow = workflowMatch[1];
        
        // Standard workflow should include these elements
        const requiredElements = [
          { pattern: /check.*context.*session/i, name: 'session context check' },
          { pattern: /memory.*patterns/i, name: 'memory system usage' },
          { pattern: /Context7.*MCP/i, name: 'Context7 MCP usage' },
          { pattern: /Sequential.*MCP/i, name: 'Sequential MCP usage' },
          { pattern: /\.claude\/doc\//i, name: 'output specification' }
        ];
        
        const agentType = file.includes('/orchestrators/') ? 'orchestrator' : 'specialist';
        
        for (const element of requiredElements) {
          if (!element.pattern.test(workflow)) {
            // Orchestrators have slightly different requirements
            if (agentType === 'orchestrator' && element.name === 'Sequential MCP usage') {
              continue; // Orchestrators may use different MCP patterns
            }
            
            workflowIssues.push({
              file,
              missing: element.name,
              type: agentType
            });
          }
        }
        
        // Workflow should be numbered steps
        const numberedSteps = workflow.match(/\n\d+\./g);
        if (!numberedSteps || numberedSteps.length < 5) {
          workflowIssues.push({
            file,
            issue: `Workflow should have 5+ numbered steps, found ${numberedSteps ? numberedSteps.length : 0}`,
            type: agentType
          });
        }
      } else {
        workflowIssues.push({
          file,
          issue: 'Missing Core Workflow section',
          type: file.includes('/orchestrators/') ? 'orchestrator' : 'specialist'
        });
      }
    }
    
    if (workflowIssues.length > 0) {
      console.log('MCP workflow issues:', workflowIssues.slice(0, 15));
      // Allow up to 10 workflow issues during standardization
      expect(workflowIssues.length).toBeLessThanOrEqual(10);
    }
  });
});