#!/usr/bin/env node
/**
 * Wave 6: Quality Gates Script
 * Validates agent quality before commits and prevents regression
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

class QualityGateValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.minScores = {
      overall: 70,
      yamlCompliance: 80,
      patternCompliance: 65,
      mcpWorkflow: 60
    };
  }

  async validateChangedAgents() {
    console.log('🔍 Running quality gates validation...');
    
    // Get staged agent files
    const stagedFiles = this.getStagedAgentFiles();
    
    if (stagedFiles.length === 0) {
      console.log('ℹ️  No agent files staged, skipping validation.');
      return true;
    }

    console.log(`📋 Validating ${stagedFiles.length} staged agent files...`);
    
    for (const file of stagedFiles) {
      await this.validateSingleAgent(file);
    }
    
    return this.reportResults();
  }

  getStagedAgentFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output
        .split('\n')
        .filter(line => line.match(/Examples\/agents\/.*\.md$/))
        .filter(file => fs.existsSync(file));
    } catch (error) {
      console.error('Failed to get staged files:', error.message);
      return [];
    }
  }

  async validateSingleAgent(filePath) {
    console.log(`  Validating: ${path.basename(filePath)}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Critical validations that must pass
      this.validateYamlSyntax(filePath, content);
      this.validateRequiredSections(filePath, content);
      this.validateResearchOnlyPattern(filePath, content);
      this.validateSessionContextIntegration(filePath, content);
      this.validateOutputSpecification(filePath, content);
      
      // Quality score validation
      const score = this.calculateQuickScore(content);
      this.validateQualityScores(filePath, score);
      
    } catch (error) {
      this.errors.push(`${filePath}: Failed to validate - ${error.message}`);
    }
  }

  validateYamlSyntax(filePath, content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    
    if (!frontmatterMatch) {
      this.errors.push(`${filePath}: Missing YAML frontmatter`);
      return;
    }
    
    try {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      
      // Required fields
      const requiredFields = ['name', 'description', 'model', 'Examples'];
      for (const field of requiredFields) {
        if (!frontmatter[field]) {
          this.errors.push(`${filePath}: Missing required YAML field: ${field}`);
        }
      }
      
      // Examples must be an array with at least 2 entries
      if (!Array.isArray(frontmatter.Examples) || frontmatter.Examples.length < 2) {
        this.errors.push(`${filePath}: Examples must be an array with at least 2 entries`);
      }
      
    } catch (yamlError) {
      this.errors.push(`${filePath}: Invalid YAML syntax - ${yamlError.message}`);
    }
  }

  validateRequiredSections(filePath, content) {
    const requiredSections = [
      'Goal',
      'Core Workflow',
      'Output Format',
      'Rules',
      'Core Competencies',
      'Planning Approach',
      'Quality Standards'
    ];
    
    const contentAfterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    for (const section of requiredSections) {
      const sectionPattern = new RegExp(`## ${section}`, 'i');
      if (!sectionPattern.test(contentAfterFrontmatter)) {
        this.errors.push(`${filePath}: Missing required section: ${section}`);
      }
    }
  }

  validateResearchOnlyPattern(filePath, content) {
    const isOrchestrator = filePath.includes('/orchestrators/');
    
    if (!isOrchestrator) {
      // Specialists must have research-only directive
      if (!content.includes('NEVER do the actual implementation') && 
          !content.includes('ONLY creates plans')) {
        this.errors.push(`${filePath}: Missing research-only directive for specialist agent`);
      }
    }
    
    // Check for prohibited implementation keywords
    const implementationKeywords = [
      'edit the file',
      'create the file', 
      'write the code',
      'run the command',
      'execute directly'
    ];
    
    const lowercaseContent = content.toLowerCase();
    const foundKeywords = implementationKeywords.filter(keyword => 
      lowercaseContent.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      this.errors.push(`${filePath}: Contains implementation instructions: ${foundKeywords.join(', ')}`);
    }
  }

  validateSessionContextIntegration(filePath, content) {
    if (!content.includes('.claude/tasks/') && !content.includes('context_session_')) {
      this.errors.push(`${filePath}: Missing session context integration`);
    }
  }

  validateOutputSpecification(filePath, content) {
    if (!content.includes('.claude/doc/')) {
      this.errors.push(`${filePath}: Missing output to .claude/doc/ specification`);
    }
    
    if (!content.includes('[timestamp]')) {
      this.warnings.push(`${filePath}: Should include [timestamp] in output filename`);
    }
  }

  calculateQuickScore(content) {
    let score = {
      yamlCompliance: 0,
      patternCompliance: 0,
      mcpWorkflow: 0,
      overall: 0
    };
    
    // YAML compliance (0-100)
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
        score.yamlCompliance = 0;
      }
    }
    
    // Pattern compliance (0-100)
    const contentAfterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    const requiredSections = ['Goal', 'Core Workflow', 'Output Format', 'Rules', 'Core Competencies', 'Planning Approach', 'Quality Standards'];
    const foundSections = requiredSections.filter(section => {
      const pattern = new RegExp(`## ${section}`, 'i');
      return pattern.test(contentAfterFrontmatter);
    });
    
    score.patternCompliance = (foundSections.length / requiredSections.length) * 100;
    
    // MCP workflow (0-100)
    let mcpScore = 0;
    if (content.includes('Context7 MCP') || content.includes('mcp__context7')) mcpScore += 30;
    if (content.includes('Sequential MCP') || content.includes('mcp__sequential')) mcpScore += 25;
    if (content.includes('mcp-catalog')) mcpScore += 20;
    if (content.includes('.claude/doc/')) mcpScore += 25;
    
    score.mcpWorkflow = Math.min(mcpScore, 100);
    
    // Overall score
    score.overall = (score.yamlCompliance + score.patternCompliance + score.mcpWorkflow) / 3;
    
    return score;
  }

  validateQualityScores(filePath, scores) {
    if (scores.overall < this.minScores.overall) {
      this.errors.push(`${filePath}: Overall quality score ${scores.overall.toFixed(1)} below minimum ${this.minScores.overall}`);
    }
    
    if (scores.yamlCompliance < this.minScores.yamlCompliance) {
      this.errors.push(`${filePath}: YAML compliance ${scores.yamlCompliance.toFixed(1)} below minimum ${this.minScores.yamlCompliance}`);
    }
    
    if (scores.patternCompliance < this.minScores.patternCompliance) {
      this.errors.push(`${filePath}: Pattern compliance ${scores.patternCompliance.toFixed(1)} below minimum ${this.minScores.patternCompliance}`);
    }
    
    if (scores.mcpWorkflow < this.minScores.mcpWorkflow) {
      this.warnings.push(`${filePath}: MCP workflow score ${scores.mcpWorkflow.toFixed(1)} below recommended ${this.minScores.mcpWorkflow}`);
    }
  }

  reportResults() {
    console.log('\n📊 Quality Gates Results:');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All quality gates passed!');
      return true;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ${this.errors.length} Critical Issues:`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} Warnings:`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n💡 To fix issues:');
      console.log('  1. Review agent template requirements');
      console.log('  2. Use "npm run test:agent-validation" for detailed analysis');
      console.log('  3. Check Examples/agents/TEMPLATE-agent.md for proper structure');
      return false;
    }
    
    console.log('\n✅ Quality gates passed with warnings (commit allowed)');
    return true;
  }
}

// Main execution
if (require.main === module) {
  const validator = new QualityGateValidator();
  
  validator.validateChangedAgents()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Quality gate validation failed:', error);
      process.exit(1);
    });
}

module.exports = QualityGateValidator;