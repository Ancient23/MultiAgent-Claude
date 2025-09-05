const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

/**
 * Agent Template Validation Test Suite
 * Ensures all agents follow the proper research-plan-execute pattern
 */

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
      
      // Check for research-only directive
      if (!agentContent.includes('NEVER do the actual implementation')) {
        errors.push(`${file}: Missing 'NEVER do the actual implementation' directive`);
      }
      
      // Check for session context check
      if (!agentContent.includes('Check .claude/tasks/')) {
        errors.push(`${file}: Missing session context check directive`);
      }
      
      // Check for output to .claude/doc/
      if (!agentContent.includes('.claude/doc/')) {
        errors.push(`${file}: Missing output to .claude/doc/ directive`);
      }
      
      // Check for MCP tool usage
      if (!agentContent.includes('Use Context7 MCP')) {
        errors.push(`${file}: Missing Context7 MCP usage`);
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
        
        // Check for proactive usage patterns
        if (!description.includes('Use this agent PROACTIVELY')) {
          errors.push(`${file}: Missing 'Use this agent PROACTIVELY' pattern`);
        }
        
        // Check for specialization description
        if (!description.includes('specializes in')) {
          errors.push(`${file}: Missing specialization description`);
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
    
    // Should have no agents in root (except README)
    expect(rootAgents).toHaveLength(0);
    
    // Should have specialists and orchestrators
    expect(specialistAgents.length).toBeGreaterThan(0);
    expect(orchestratorAgents.length).toBeGreaterThan(0);
  });

  test('Conversion tool should produce quality output', async () => {
    const AgentRoleConverter = require('../cli/commands/convert-agent.js');
    const converter = new AgentRoleConverter();
    
    // Test with a properly formatted agent
    const testAgentFile = 'Examples/agents/specialists/bundler-optimization-specialist.md';
    
    if (!fs.existsSync(testAgentFile)) {
      test.skip('Test agent file not found');
      return;
    }
    
    const agentContent = fs.readFileSync(testAgentFile, 'utf8');
    
    try {
      const chatgptRole = converter.claudeToChatGPT(agentContent);
      
      // Validate conversion quality
      expect(chatgptRole.name).toBeTruthy();
      expect(chatgptRole.content).toBeTruthy();
      expect(chatgptRole.content.length).toBeGreaterThan(100);
      expect(chatgptRole.content).toContain('specialist');
      expect(chatgptRole.content).toContain('## Role');
      expect(chatgptRole.content).toContain('## Approach');
      
      // Should not be boilerplate
      expect(chatgptRole.content).not.toContain('*Converted from legacy format*');
      
    } catch (conversionError) {
      throw new Error(`Conversion failed: ${conversionError.message}`);
    }
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