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
    case 'cli-testing':
      console.log(chalk.blue('Adding Playwright CLI testing...'));
      copyWorkflowTemplate('playwright-cli-tests.yml');
      copyTestTemplate('cli.cli.spec.js');
      console.log(chalk.green('✓ CLI testing framework added'));
      console.log(chalk.yellow('Run: npm install --save-dev @playwright/test playwright'));
      break;
      
    case 'web-testing':
      console.log(chalk.blue('Adding Playwright web application testing...'));
      copyWorkflowTemplate('playwright-web-tests.yml');
      console.log(chalk.green('✓ Web testing workflow added'));
      console.log(chalk.yellow('Run: npm install --save-dev @playwright/test playwright'));
      console.log(chalk.gray('Note: Configure your web tests in the tests/ directory'));
      break;
      
    case 'all-testing':
      execute('cli-testing');
      execute('web-testing');
      break;
      
    case 'both':
      execute('ci-cd');
      execute('cli-testing');
      break;
      
    case 'all':
      execute('ci-cd');
      execute('cli-testing');
      execute('web-testing');
      break;
      
    default:
      console.error(chalk.red(`Unknown feature: ${feature}`));
      console.log(chalk.gray('Available features:'));
      console.log(chalk.gray('  ci-cd        - GitHub Actions for memory system'));
      console.log(chalk.gray('  testing      - CLI testing with Playwright (alias: cli-testing)'));
      console.log(chalk.gray('  web-testing  - Web application testing with Playwright'));
      console.log(chalk.gray('  all-testing  - Both CLI and web testing'));
      console.log(chalk.gray('  both         - CI/CD + CLI testing'));
      console.log(chalk.gray('  all          - Everything (CI/CD + CLI + web testing)'));
  }
}

module.exports = { execute };