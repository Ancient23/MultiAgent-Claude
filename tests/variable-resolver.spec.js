const { test, expect } = require('@playwright/test');
const VariableResolver = require('../cli/lib/variable-resolver');

test.describe('VariableResolver', () => {
  let resolver;

  test.beforeEach(() => {
    resolver = new VariableResolver();
  });

  test.describe('Variable substitution patterns', () => {
    test('should resolve ${var} pattern', async () => {
      const template = 'Hello ${name}, you are ${age} years old';
      const context = { name: 'Alice', age: 30 };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Hello Alice, you are 30 years old');
    });

    test('should resolve {{var}} pattern', async () => {
      const template = 'Hello {{name}}, you are {{age}} years old';
      const context = { name: 'Bob', age: 25 };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Hello Bob, you are 25 years old');
    });

    test('should resolve <%= var %> pattern', async () => {
      const template = 'Hello <%= name %>, you are <%= age %> years old';
      const context = { name: 'Charlie', age: 35 };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Hello Charlie, you are 35 years old');
    });

    test('should handle mixed patterns', async () => {
      const template = '${greeting} {{name}}, <%= message %>';
      const context = { greeting: 'Hi', name: 'Dave', message: 'welcome!' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Hi Dave, welcome!');
    });
  });

  test.describe('Nested property access', () => {
    test('should access nested properties', async () => {
      const template = '${user.name} lives in ${user.address.city}';
      const context = {
        user: {
          name: 'Eve',
          address: {
            city: 'New York'
          }
        }
      };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Eve lives in New York');
    });

    test('should handle array access', async () => {
      const template = '${items[0]} and ${items[1]}';
      const context = {
        items: ['apple', 'banana', 'cherry']
      };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('apple and banana');
    });

    test('should handle array in nested path', async () => {
      const template = '${users[0].name} is ${users[0].age}';
      const context = {
        users: [
          { name: 'Frank', age: 40 },
          { name: 'Grace', age: 45 }
        ]
      };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Frank is 40');
    });
  });

  test.describe('Built-in resolvers', () => {
    test('should resolve date variables', async () => {
      const template = 'Today is ${date}';
      const result = await resolver.resolve(template);
      
      expect(result).toMatch(/Today is \d{4}-\d{2}-\d{2}/);
    });

    test('should resolve time variables', async () => {
      const template = 'Time: ${time}';
      const result = await resolver.resolve(template);
      
      expect(result).toMatch(/Time: \d{6}/); // HHMMSS format
    });

    test('should resolve random and uuid', async () => {
      const template = 'Random: ${random}, UUID: ${uuid}';
      const result = await resolver.resolve(template);
      
      expect(result).toMatch(/Random: \w+/);
      expect(result).toMatch(/UUID: [0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/);
    });

    test('should resolve system variables', async () => {
      const template = 'User: ${user}, Platform: ${platform}';
      const result = await resolver.resolve(template);
      
      expect(result).toContain('User:');
      expect(result).toContain('Platform:');
      expect(result.toLowerCase()).toMatch(/(darwin|linux|win32)/);
    });
  });

  test.describe('Transformations', () => {
    test('should apply uppercase transformation', async () => {
      const template = '${name | upper}';
      const context = { name: 'hello' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('HELLO');
    });

    test('should apply lowercase transformation', async () => {
      const template = '${name | lower}';
      const context = { name: 'WORLD' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('world');
    });

    test('should apply capitalize transformation', async () => {
      const template = '${title | capitalize}';
      const context = { title: 'hello world' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Hello World');
    });

    test('should apply camelCase transformation', async () => {
      const template = '${name | camelCase}';
      const context = { name: 'hello-world-test' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('helloWorldTest');
    });

    test('should apply snakeCase transformation', async () => {
      const template = '${name | snakeCase}';
      const context = { name: 'helloWorldTest' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('hello_world_test');
    });

    test('should apply kebabCase transformation', async () => {
      const template = '${name | kebabCase}';
      const context = { name: 'helloWorldTest' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('hello-world-test');
    });

    test('should apply truncate transformation', async () => {
      const template = '${text | truncate(10)}';
      const context = { text: 'This is a very long text that should be truncated' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('This is a ...');
    });

    test('should apply multiple transformations', async () => {
      const template = '${name | trim | upper}';
      const context = { name: '  hello world  ' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('HELLO WORLD');
    });
  });

  test.describe('Functions', () => {
    test('should handle upper function', async () => {
      const template = '${upper(name)}';
      const context = { name: 'test' };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('TEST');
    });

    test('should handle length function', async () => {
      const template = 'Length: ${length(items)}';
      const context = { items: ['a', 'b', 'c'] };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Length: 3');
    });

    test('should handle join function', async () => {
      const template = '${join(items, ", ")}';
      const context = { items: ['apple', 'banana', 'cherry'] };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('apple, banana, cherry');
    });

    test('should handle default function', async () => {
      const template1 = '${default(missing, "fallback")}';
      const template2 = '${default(present, "fallback")}';
      const context = { present: 'value' };
      
      const result1 = await resolver.resolve(template1, context);
      const result2 = await resolver.resolve(template2, context);
      
      expect(result1).toBe('fallback');
      expect(result2).toBe('value');
    });

    test('should handle if function', async () => {
      const template = '${if(enabled, "yes", "no")}';
      const context1 = { enabled: true };
      const context2 = { enabled: false };
      
      const result1 = await resolver.resolve(template, context1);
      const result2 = await resolver.resolve(template, context2);
      
      expect(result1).toBe('yes');
      expect(result2).toBe('no');
    });
  });

  test.describe('Environment variables', () => {
    test('should access environment variables', async () => {
      process.env.TEST_VAR = 'test_value';
      const template = 'Env: ${env.TEST_VAR}';
      
      const result = await resolver.resolve(template);
      expect(result).toBe('Env: test_value');
      
      delete process.env.TEST_VAR;
    });
  });

  test.describe('Process properties', () => {
    test('should access process properties', async () => {
      const template = 'PID: ${process.pid}, Platform: ${process.platform}';
      const result = await resolver.resolve(template);
      
      expect(result).toContain('PID:');
      expect(result).toContain('Platform:');
      expect(result).toContain(process.platform);
    });
  });

  test.describe('Custom resolvers', () => {
    test('should use custom resolvers', async () => {
      const customResolver = new VariableResolver({
        customResolvers: {
          greeting: () => 'Hello, World!',
          double: (context) => context.value * 2
        }
      });
      
      const template = '${greeting} - ${double}';
      const context = { value: 21 };
      
      const result = await customResolver.resolve(template, context);
      expect(result).toBe('Hello, World! - 42');
    });
  });

  test.describe('Custom transformations', () => {
    test('should use custom transformations', async () => {
      const customResolver = new VariableResolver({
        customTransformations: {
          reverse: (value) => value.split('').reverse().join(''),
          repeat: (value, args) => value.repeat(parseInt(args))
        }
      });
      
      const template1 = '${text | reverse}';
      const template2 = '${text | repeat(3)}';
      const context = { text: 'abc' };
      
      const result1 = await customResolver.resolve(template1, context);
      const result2 = await customResolver.resolve(template2, context);
      
      expect(result1).toBe('cba');
      expect(result2).toBe('abcabcabc');
    });
  });

  test.describe('Error handling', () => {
    test('should handle undefined variables gracefully', async () => {
      const template = 'Value: ${missing}';
      const result = await resolver.resolve(template);
      
      expect(result).toBe('Value: ');
    });

    test('should handle nested undefined gracefully', async () => {
      const template = 'Value: ${user.address.street}';
      const context = { user: { name: 'Test' } };
      
      const result = await resolver.resolve(template, context);
      expect(result).toBe('Value: ');
    });

    test('should prevent infinite loops', async () => {
      const template = '${a}';
      const context = { a: '${b}', b: '${a}' };
      
      // Should stop after max iterations
      const result = await resolver.resolve(template, context);
      expect(result).toBeTruthy(); // Should not hang
    });
  });

  test.describe('Complex scenarios', () => {
    test('should handle complex nested resolution', async () => {
      const template = `
        Project: \${project.name | upper}
        Version: \${project.version | default("1.0.0")}
        Path: \${project.path | truncate(20)}
        Date: \${date}
        Items: \${join(project.items, ", ")}
      `;
      
      const context = {
        project: {
          name: 'test-project',
          path: '/very/long/path/to/project/directory',
          items: ['item1', 'item2', 'item3']
        }
      };
      
      const result = await resolver.resolve(template, context);
      
      expect(result).toContain('TEST-PROJECT');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('/very/long/path/to/p...');
      expect(result).toContain('item1, item2, item3');
    });
  });
});