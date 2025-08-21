const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function setupWorktrees(features) {
  console.log(chalk.blue('\n🌳 Setting up git worktrees...\n'));
  
  const basePath = process.cwd();
  const baseName = path.basename(basePath);
  
  for (const feature of features) {
    const branchName = `feature/${feature}`;
    const worktreePath = path.join(path.dirname(basePath), `${baseName}-${feature}`);
    
    try {
      // Create branch if needed
      try {
        execSync(`git branch ${branchName}`, { stdio: 'ignore' });
      } catch {
        // Branch might already exist
      }
      
      // Add worktree
      execSync(`git worktree add ${worktreePath} ${branchName}`);
      
      // Copy Claude configuration
      if (fs.existsSync('.claude')) {
        execSync(`cp -r .claude ${worktreePath}/`);
      }
      if (fs.existsSync('.mcp.json')) {
        execSync(`cp .mcp.json ${worktreePath}/`);
      }
      
      console.log(chalk.green(`✅ Worktree ready: ${worktreePath}`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to create worktree for ${feature}`));
    }
  }
  
  console.log(chalk.yellow('\n💡 Start Claude in each worktree:'));
  features.forEach(feature => {
    console.log(chalk.cyan(`   cd ../${baseName}-${feature} && claude`));
  });
}

module.exports = { setupWorktrees };