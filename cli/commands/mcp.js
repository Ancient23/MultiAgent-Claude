const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

const MCP_SERVERS = {
  playwright: {
    package: '@modelcontextprotocol/server-playwright',
    config: {
      command: "npx",
      args: ["@modelcontextprotocol/server-playwright"],
      env: {
        PLAYWRIGHT_BROWSER: "chromium",
        PLAYWRIGHT_HEADLESS: "false"
      }
    }
  },
  filesystem: {
    package: '@modelcontextprotocol/server-filesystem',
    config: {
      command: "npx",
      args: ["@modelcontextprotocol/server-filesystem", "/tmp"],
      env: {}
    }
  },
  github: {
    package: '@modelcontextprotocol/server-github',
    config: {
      command: "npx",
      args: ["@modelcontextprotocol/server-github"],
      env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || ""
      }
    }
  }
};

async function setupMCP(serverName) {
  // If no server specified, show interactive menu
  if (!serverName) {
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'servers',
        message: 'Select MCP servers to install:',
        choices: [
          { name: 'Playwright - Browser automation & visual development', value: 'playwright', checked: true },
          { name: 'Filesystem - Enhanced file operations', value: 'filesystem' },
          { name: 'GitHub - GitHub API integration', value: 'github' }
        ]
      }
    ]);
    
    for (const server of answers.servers) {
      await installMCPServer(server);
    }
  } else {
    await installMCPServer(serverName);
  }
  
  console.log(chalk.green('\n✅ MCP setup complete!'));
  console.log(chalk.yellow('📝 Restart Claude Code to load the new MCP servers'));
}

async function installMCPServer(serverName) {
  const server = MCP_SERVERS[serverName];
  if (!server) {
    console.error(chalk.red(`Unknown server: ${serverName}`));
    return;
  }
  
  console.log(chalk.blue(`\n📦 Installing ${serverName} MCP server...`));
  
  // Install package
  try {
    execSync(`npm install -D ${server.package}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Failed to install ${serverName}: ${error.message}`));
    return;
  }
  
  // Update .mcp.json
  const mcpPath = path.join(process.cwd(), '.mcp.json');
  let config = {};
  
  if (fs.existsSync(mcpPath)) {
    config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  }
  
  config.mcpServers = config.mcpServers || {};
  config.mcpServers[serverName] = server.config;
  
  fs.writeFileSync(mcpPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✅ ${serverName} MCP server configured`));
  
  // Special setup for Playwright
  if (serverName === 'playwright') {
    setupPlaywrightDirectories();
  }
}

function setupPlaywrightDirectories() {
  const dirs = [
    '.claude/mocks',
    '.claude/visual-iterations',
    '.claude/visual-reports',
    '.playwright/baseline'
  ];
  
  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
  
  console.log(chalk.green('✅ Created visual development directories'));
}

module.exports = { setupMCP };