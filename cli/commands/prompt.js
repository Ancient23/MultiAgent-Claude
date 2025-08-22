const chalk = require('chalk');
const path = require('path');
const fs = require('fs').promises;
const PromptComposer = require('../lib/prompt-composer');
const Table = require('cli-table3');

/**
 * List all available workflows
 */
async function list() {
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  try {
    const workflows = await composer.listWorkflows();
    
    if (workflows.length === 0) {
      console.log(chalk.yellow('No workflows found'));
      return;
    }
    
    const table = new Table({
      head: ['Workflow', 'Version', 'Description'],
      colWidths: [20, 10, 50]
    });
    
    workflows.forEach(workflow => {
      table.push([
        chalk.cyan(workflow.name),
        workflow.version,
        workflow.description
      ]);
    });
    
    console.log(chalk.blue('\n📋 Available Workflows:\n'));
    console.log(table.toString());
  } catch (error) {
    console.error(chalk.red('Error listing workflows:'), error.message);
  }
}

/**
 * Show details of a specific workflow
 */
async function show(workflowName) {
  if (!workflowName) {
    console.error(chalk.red('Please specify a workflow name'));
    console.log(chalk.gray('Usage: mac prompt show <workflow-name>'));
    return;
  }
  
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  try {
    const workflowPath = path.join(__dirname, '..', '..', 'prompts', 'workflows', `${workflowName}.yml`);
    const content = await fs.readFile(workflowPath, 'utf8');
    
    console.log(chalk.blue(`\n📄 Workflow: ${workflowName}\n`));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(content);
    console.log(chalk.gray('─'.repeat(60)));
  } catch (error) {
    console.error(chalk.red(`Error showing workflow '${workflowName}':`), error.message);
  }
}

/**
 * Validate all workflows and components
 */
async function validate() {
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  console.log(chalk.blue('\n🔍 Validating all workflows...\n'));
  
  try {
    const workflows = await composer.listWorkflows();
    let hasErrors = false;
    
    for (const workflow of workflows) {
      const result = await composer.validateWorkflow(workflow.name);
      
      if (result.valid) {
        console.log(chalk.green(`✓ ${workflow.name}`));
      } else {
        hasErrors = true;
        console.log(chalk.red(`✗ ${workflow.name}`));
        result.errors.forEach(error => {
          console.log(chalk.red(`  - ${error}`));
        });
      }
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
      }
    }
    
    if (!hasErrors) {
      console.log(chalk.green('\n✅ All workflows are valid!'));
    } else {
      console.log(chalk.red('\n❌ Some workflows have errors'));
    }
  } catch (error) {
    console.error(chalk.red('Error validating workflows:'), error.message);
  }
}

/**
 * Test composition of a workflow
 */
async function test(workflowName, options = {}) {
  if (!workflowName) {
    console.error(chalk.red('Please specify a workflow name'));
    console.log(chalk.gray('Usage: mac prompt test <workflow-name>'));
    return;
  }
  
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  console.log(chalk.blue(`\n🧪 Testing workflow: ${workflowName}\n`));
  
  try {
    const context = {
      options: {
        cicd: options.cicd || false,
        testing: options.testing || false,
        docs: options.docs || false
      },
      project: {
        name: 'TestProject',
        path: process.cwd()
      }
    };
    
    const startTime = Date.now();
    const result = await composer.compose(workflowName, context);
    const duration = Date.now() - startTime;
    
    console.log(chalk.green(`✓ Composition successful (${duration}ms)`));
    console.log(chalk.gray(`  Length: ${result.length} characters`));
    console.log(chalk.gray(`  Lines: ${result.split('\n').length}`));
    
    if (options.output) {
      const outputPath = path.join(process.cwd(), options.output);
      await fs.writeFile(outputPath, result, 'utf8');
      console.log(chalk.green(`✓ Output saved to: ${outputPath}`));
    }
    
    if (options.preview) {
      console.log(chalk.blue('\n📝 Preview (first 500 chars):\n'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(result.substring(0, 500) + '...');
      console.log(chalk.gray('─'.repeat(60)));
    }
  } catch (error) {
    console.error(chalk.red(`Error testing workflow '${workflowName}':`), error.message);
  }
}

/**
 * Export a workflow with all dependencies
 */
async function exportWorkflow(workflowName, outputPath) {
  if (!workflowName) {
    console.error(chalk.red('Please specify a workflow name'));
    console.log(chalk.gray('Usage: mac prompt export <workflow-name> [output-path]'));
    return;
  }
  
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  console.log(chalk.blue(`\n📦 Exporting workflow: ${workflowName}\n`));
  
  try {
    const loader = composer.workflowLoader;
    const exported = await loader.exportWorkflow(workflowName);
    
    const output = outputPath || `${workflowName}-export.json`;
    await fs.writeFile(output, JSON.stringify(exported, null, 2), 'utf8');
    
    console.log(chalk.green(`✓ Exported to: ${output}`));
    console.log(chalk.gray(`  Components: ${Object.keys(exported.components).length}`));
  } catch (error) {
    console.error(chalk.red(`Error exporting workflow '${workflowName}':`), error.message);
  }
}

/**
 * Show cache statistics
 */
async function cacheStats() {
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  console.log(chalk.blue('\n📊 Cache Statistics:\n'));
  
  const stats = composer.cache.getStats();
  const size = await composer.cache.getSize();
  
  const table = new Table();
  table.push(
    ['Hit Rate', chalk.green(stats.hitRate)],
    ['Hits', stats.hits],
    ['Misses', stats.misses],
    ['Writes', stats.writes],
    ['Evictions', stats.evictions],
    ['Memory Items', size.memoryItems],
    ['Memory Size', size.memorySize],
    ['Disk Files', size.diskFiles],
    ['Disk Size', size.diskSize],
    ['Total Size', chalk.cyan(size.totalSize)]
  );
  
  console.log(table.toString());
}

/**
 * Clear the cache
 */
async function cacheClear() {
  const composer = new PromptComposer({
    baseDir: path.join(__dirname, '..', '..', 'prompts')
  });
  
  console.log(chalk.blue('\n🗑️  Clearing cache...\n'));
  
  try {
    await composer.cache.clear();
    console.log(chalk.green('✓ Cache cleared successfully'));
  } catch (error) {
    console.error(chalk.red('Error clearing cache:'), error.message);
  }
}

module.exports = {
  list,
  show,
  validate,
  test,
  export: exportWorkflow,
  cacheStats,
  cacheClear
};