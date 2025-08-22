const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;
const PromptComposer = require('../cli/lib/prompt-composer');

test.describe('PromptComposer', () => {
  let composer;
  const testBaseDir = path.join(__dirname, '..', 'prompts');

  test.beforeEach(() => {
    composer = new PromptComposer({
      baseDir: testBaseDir,
      skipCache: true // Disable cache for testing
    });
  });

  test.describe('compose()', () => {
    test('should compose a simple workflow', async () => {
      const context = {
        options: {
          cicd: false,
          testing: false
        },
        project: {
          name: 'TestProject',
          path: '/test/path'
        }
      };

      const result = await composer.compose('init-memory', context);
      
      expect(result).toBeTruthy();
      expect(result).toContain('Initialize Session Context');
      expect(result).toContain('Create Memory System');
      expect(result).toContain('TestProject');
    });

    test('should handle conditional components', async () => {
      const contextWithCICD = {
        options: {
          cicd: true,
          testing: true
        },
        project: {
          name: 'TestProject'
        }
      };

      const contextWithoutCICD = {
        options: {
          cicd: false,
          testing: false
        },
        project: {
          name: 'TestProject'
        }
      };

      const withCICD = await composer.compose('init-full', contextWithCICD);
      const withoutCICD = await composer.compose('init-full', contextWithoutCICD);

      // Full workflow should be longer when CICD is enabled
      expect(withCICD.length).toBeGreaterThan(withoutCICD.length);
    });

    test('should resolve variables correctly', async () => {
      const context = {
        project: {
          name: 'MyAwesomeProject',
          path: '/custom/project/path'
        }
      };

      const result = await composer.compose('init-memory', context);
      
      expect(result).toContain('MyAwesomeProject');
      expect(result).toContain('/custom/project/path');
    });

    test('should handle missing workflow gracefully', async () => {
      await expect(composer.compose('non-existent-workflow', {}))
        .rejects
        .toThrow(/Failed to compose prompt/);
    });

    test('should apply post-processing', async () => {
      const context = {
        project: { name: 'TestProject' }
      };

      const result = await composer.compose('init-memory', context);
      
      // Check markdown validation (no unclosed code blocks)
      const codeBlockCount = (result.match(/```/g) || []).length;
      expect(codeBlockCount % 2).toBe(0);
      
      // Check no excessive blank lines
      expect(result).not.toMatch(/\n{4,}/);
    });
  });

  test.describe('listWorkflows()', () => {
    test('should list all available workflows', async () => {
      const workflows = await composer.listWorkflows();
      
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
      
      // Check for expected workflows
      const workflowNames = workflows.map(w => w.name);
      expect(workflowNames).toContain('init-full');
      expect(workflowNames).toContain('init-memory');
      expect(workflowNames).toContain('add-memory');
      
      // Check workflow structure
      workflows.forEach(workflow => {
        expect(workflow).toHaveProperty('name');
        expect(workflow).toHaveProperty('description');
        expect(workflow).toHaveProperty('version');
      });
    });
  });

  test.describe('validateWorkflow()', () => {
    test('should validate a correct workflow', async () => {
      const result = await composer.validateWorkflow('init-memory');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should report errors for invalid workflow', async () => {
      const result = await composer.validateWorkflow('non-existent');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  test.describe('buildComponentList()', () => {
    test('should build correct component list from workflow', async () => {
      const workflow = {
        required: ['core/session-context', 'core/memory-structure'],
        conditional: [
          {
            if: 'options.cicd',
            then: 'templates/cicd-setup'
          }
        ]
      };

      const contextWithCICD = { options: { cicd: true } };
      const contextWithoutCICD = { options: { cicd: false } };

      const withCICD = await composer.buildComponentList(workflow, contextWithCICD);
      const withoutCICD = await composer.buildComponentList(workflow, contextWithoutCICD);

      expect(withCICD).toContain('core/session-context');
      expect(withCICD).toContain('core/memory-structure');
      expect(withCICD).toContain('templates/cicd-setup');
      
      expect(withoutCICD).toContain('core/session-context');
      expect(withoutCICD).toContain('core/memory-structure');
      expect(withoutCICD).not.toContain('templates/cicd-setup');
    });
  });

  test.describe('evaluateCondition()', () => {
    test('should evaluate simple conditions', async () => {
      const context = {
        enabled: true,
        disabled: false,
        count: 5,
        name: 'test'
      };

      expect(await composer.evaluateCondition('enabled', context)).toBe(true);
      expect(await composer.evaluateCondition('!enabled', context)).toBe(false);
      expect(await composer.evaluateCondition('disabled', context)).toBe(false);
      expect(await composer.evaluateCondition('!disabled', context)).toBe(true);
    });

    test('should evaluate comparison conditions', async () => {
      const context = {
        count: 5,
        limit: 10,
        name: 'test'
      };

      expect(await composer.evaluateCondition('count > 3', context)).toBe(true);
      expect(await composer.evaluateCondition('count < 10', context)).toBe(true);
      expect(await composer.evaluateCondition('count == 5', context)).toBe(true);
      expect(await composer.evaluateCondition('count != 10', context)).toBe(true);
      expect(await composer.evaluateCondition('limit >= 10', context)).toBe(true);
      expect(await composer.evaluateCondition('count <= 5', context)).toBe(true);
    });

    test('should handle nested properties', async () => {
      const context = {
        project: {
          hasAgents: true,
          config: {
            enabled: false
          }
        }
      };

      expect(await composer.evaluateCondition('project.hasAgents', context)).toBe(true);
      expect(await composer.evaluateCondition('!project.config.enabled', context)).toBe(true);
    });
  });

  test.describe('Post-processing', () => {
    test('should validate markdown correctly', () => {
      const input = '# Title\n```\ncode\nMore text';
      const result = composer.validateMarkdown(input);
      
      expect(result).toContain('```'); // Should close code block
      expect((result.match(/```/g) || []).length % 2).toBe(0);
    });

    test('should optimize length', () => {
      const longContent = 'a'.repeat(60000);
      const context = { maxLength: 50000 };
      
      const result = composer.optimizeLength(longContent, context);
      
      expect(result.length).toBeLessThanOrEqual(50000 + 20); // Allow for truncation message
      expect(result).toContain('[... truncated ...]');
    });

    test('should remove duplicates', () => {
      const content = '## Section 1\nContent\n## Section 1\nContent\n## Section 2\nDifferent';
      const result = composer.removeDuplicates(content);
      
      // Should have only one instance of Section 1
      const section1Count = (result.match(/Section 1/g) || []).length;
      expect(section1Count).toBe(1);
    });

    test('should format code blocks', () => {
      const content = '```\ncode\n```\n```javascript\nmore code\n```';
      const result = composer.formatCodeBlocks(content);
      
      expect(result).toContain('```\n');
      expect(result).toContain('```javascript\n');
    });
  });

  test.describe('Caching', () => {
    test('should generate consistent cache keys', () => {
      const context1 = { option: 'value', number: 42 };
      const context2 = { number: 42, option: 'value' }; // Different order
      const context3 = { option: 'different', number: 42 };

      const key1 = composer.getCacheKey('workflow', context1);
      const key2 = composer.getCacheKey('workflow', context2);
      const key3 = composer.getCacheKey('workflow', context3);

      expect(key1).toBe(key2); // Same content, different order
      expect(key1).not.toBe(key3); // Different content
    });
  });

  test.describe('Error handling', () => {
    test('should handle circular dependencies', async () => {
      // This would require a specially crafted component with circular deps
      // For now, test max depth protection
      composer.compositionDepth = composer.maxDepth + 1;
      
      await expect(composer.loadComponent('core/session-context', {}))
        .rejects
        .toThrow(/Maximum composition depth exceeded/);
    });

    test('should handle missing component files gracefully', async () => {
      await expect(composer.loadComponent('non/existent/component', {}))
        .rejects
        .toThrow();
    });
  });
});

test.describe('PromptComposer Performance', () => {
  test('should compose within acceptable time', async () => {
    const composer = new PromptComposer({
      baseDir: path.join(__dirname, '..', 'prompts')
    });

    const context = {
      options: { cicd: true, testing: true },
      project: { name: 'PerfTest' }
    };

    const startTime = Date.now();
    await composer.compose('init-full', context);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should use cache effectively', async () => {
    const composer = new PromptComposer({
      baseDir: path.join(__dirname, '..', 'prompts')
    });

    const context = {
      project: { name: 'CacheTest' }
    };

    // First call - no cache
    const start1 = Date.now();
    const result1 = await composer.compose('init-memory', context);
    const duration1 = Date.now() - start1;

    // Second call - should use cache
    const start2 = Date.now();
    const result2 = await composer.compose('init-memory', context);
    const duration2 = Date.now() - start2;

    expect(result1).toBe(result2); // Same result
    expect(duration2).toBeLessThan(duration1 / 2); // Much faster with cache
  });
});