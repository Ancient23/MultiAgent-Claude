const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function copyWorkflowTemplate(filename) {
  const source = path.join(__dirname, '..', '..', 'templates', 'workflows', filename);
  const dest = path.join(process.cwd(), '.github', 'workflows', filename);
  
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  fs.copyFileSync(source, dest);
  console.log(chalk.green(`✓ Added ${filename}`));
}

function copyTestTemplate(filename) {
  const source = path.join(__dirname, '..', '..', 'templates', 'tests', filename);
  const dest = path.join(process.cwd(), 'tests', filename);
  
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  fs.copyFileSync(source, dest);
  console.log(chalk.green(`✓ Added ${filename}`));
}

function execute(feature) {
  switch(feature) {
    case 'ci-cd':
      console.log(chalk.blue('Adding CI/CD workflows...'));
      copyWorkflowTemplate('claude-memory-update.yml');
      console.log(chalk.green('✓ CI/CD workflows added'));
      console.log(chalk.yellow('Note: You may need to grant write permissions in GitHub settings'));
      break;
      
    case 'testing':
      console.log(chalk.blue('Adding Playwright testing...'));
      copyWorkflowTemplate('playwright-cli-tests.yml');
      copyTestTemplate('cli.cli.spec.js');
      console.log(chalk.green('✓ Testing framework added'));
      console.log(chalk.yellow('Run: npm install --save-dev @playwright/test playwright'));
      break;
      
    case 'both':
      execute('ci-cd');
      execute('testing');
      break;
      
    default:
      console.error(chalk.red(`Unknown feature: ${feature}`));
      console.log(chalk.gray('Available features: ci-cd, testing, both'));
  }
}

module.exports = { execute };