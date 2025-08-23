const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const inquirer = require('inquirer').default;
const chalk = require('chalk');

const MCP_SERVERS = {
  playwright: {
    package: '@playwright/mcp',
    config: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
      env: {}
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
  },
  catalog: {
    package: 'mcp-catalog',
    config: {
      command: "npx",
      args: ["mcp-catalog"],
      env: {}
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
          { name: 'GitHub - GitHub API integration', value: 'github' },
          { name: 'Catalog - Discover available MCP tools', value: 'catalog' }
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
    console.log(chalk.yellow('Available servers:'));
    Object.keys(MCP_SERVERS).forEach(name => {
      console.log(chalk.gray(`  - ${name}`));
    });
    return;
  }
  
  console.log(chalk.blue(`\n📦 Installing ${serverName} MCP server...`));
  
  // Validate environment variables if needed
  if (server.config.env) {
    const missingEnvVars = [];
    Object.keys(server.config.env).forEach(key => {
      if (!server.config.env[key] && key.includes('TOKEN')) {
        missingEnvVars.push(key);
      }
    });
    
    if (missingEnvVars.length > 0) {
      console.log(chalk.yellow(`⚠️  Warning: The following environment variables may be needed:`));
      missingEnvVars.forEach(key => {
        console.log(chalk.gray(`  - ${key}`));
      });
    }
  }
  
  // Install package
  try {
    execSync(`npm install -D ${server.package}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Failed to install ${serverName}: ${error.message}`));
    return;
  }
  
  // Update MCP configuration
  // First try project-scoped .mcp.json for compatibility
  const projectMcpPath = path.join(process.cwd(), '.mcp.json');
  let config = {};
  
  try {
    if (fs.existsSync(projectMcpPath)) {
      const fileContent = fs.readFileSync(projectMcpPath, 'utf8');
      config = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error(chalk.red('Error reading existing .mcp.json:'), error.message);
    console.log(chalk.yellow('Creating new configuration...'));
    config = {};
  }
  
  config.mcpServers = config.mcpServers || {};
  
  // Check for duplicate configuration
  if (config.mcpServers[serverName]) {
    console.log(chalk.yellow(`⚠️  ${serverName} is already configured. Updating configuration...`));
  }
  
  config.mcpServers[serverName] = server.config;
  
  // Write to project .mcp.json
  fs.writeFileSync(projectMcpPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✅ ${serverName} MCP server configured in project`));
  
  // Also suggest Claude desktop config for global access
  const claudeConfigPath = getClaudeDesktopConfigPath();
  if (claudeConfigPath) {
    console.log(chalk.yellow(`💡 To use globally, you can also configure in Claude desktop:`));
    console.log(chalk.gray(`   ${claudeConfigPath}`));
    console.log(chalk.gray(`   Run: claude mcp add ${serverName} --scope user`));
  }
  
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

function getClaudeDesktopConfigPath() {
  const platform = os.platform();
  if (platform === 'darwin') {
    // macOS
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    // Windows
    return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux
    return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

async function serveMCP() {
  console.log(chalk.blue('🚀 Starting Claude Code as MCP server...'));
  
  try {
    // Start Claude Code as an MCP server
    execSync('claude mcp serve', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Failed to start MCP server: ${error.message}`));
    console.log(chalk.yellow('ℹ️  Make sure Claude Code CLI is installed and available'));
  }
}

async function addFromClaudeDesktop() {
  console.log(chalk.blue('📥 Importing MCP servers from Claude Desktop...'));
  
  const claudeConfigPath = getClaudeDesktopConfigPath();
  
  if (!fs.existsSync(claudeConfigPath)) {
    console.error(chalk.red(`Claude Desktop configuration not found at: ${claudeConfigPath}`));
    return;
  }
  
  try {
    const claudeConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
    const projectMcpPath = path.join(process.cwd(), '.mcp.json');
    let projectConfig = {};
    
    if (fs.existsSync(projectMcpPath)) {
      projectConfig = JSON.parse(fs.readFileSync(projectMcpPath, 'utf8'));
    }
    
    projectConfig.mcpServers = { ...projectConfig.mcpServers, ...claudeConfig.mcpServers };
    
    fs.writeFileSync(projectMcpPath, JSON.stringify(projectConfig, null, 2));
    console.log(chalk.green('✅ Successfully imported MCP servers from Claude Desktop'));
    
    // List imported servers
    const servers = Object.keys(claudeConfig.mcpServers || {});
    if (servers.length > 0) {
      console.log(chalk.cyan('\nImported servers:'));
      servers.forEach(server => {
        console.log(chalk.gray(`  - ${server}`));
      });
    }
  } catch (error) {
    console.error(chalk.red(`Failed to import from Claude Desktop: ${error.message}`));
  }
}

module.exports = { setupMCP, serveMCP, addFromClaudeDesktop, getClaudeDesktopConfigPath };