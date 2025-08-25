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
  console.log(chalk.blue('🎨 Setting up comprehensive visual development environment...'));
  
  // Complete visual development directories
  const dirs = [
    '.claude/mocks',                    // Design mockups and references
    '.claude/visual-iterations',        // Screenshot iterations during development
    '.claude/visual-reports',            // Visual comparison reports
    '.claude/visual-sessions',           // Session-specific iterations
    '.claude/visual-baselines',          // Approved baseline screenshots
    '.playwright/baseline',             // Playwright baseline screenshots
    '.playwright/test-results',          // Test execution results
    '.playwright/screenshots',           // Ad-hoc screenshots
    '.playwright/reports',               // HTML reports
    'tests/visual',                      // Visual regression test files
    'tests/fixtures/visual',             // Visual test fixtures and data
    'tests/utils'                        // Test utilities
  ];
  
  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.gray(`  ✅ Created ${dir}`));
  });
  
  // Create comprehensive visual configuration
  const visualConfig = {
    iterationGoal: 0.05,  // 5% difference threshold
    maxIterations: 10,    // Maximum iterations before stopping
    defaultViewports: {
      mobile: { width: 375, height: 667, deviceScaleFactor: 2 },
      tablet: { width: 768, height: 1024, deviceScaleFactor: 2 },
      desktop: { width: 1920, height: 1080, deviceScaleFactor: 1 },
      wide: { width: 2560, height: 1440, deviceScaleFactor: 1 }
    },
    comparisonSettings: {
      threshold: 0.05,      // 5% pixel difference threshold
      includeAA: true,      // Include anti-aliasing in comparison
      diffMask: true,       // Generate diff masks
      alpha: 0.1,           // Alpha channel sensitivity
      aaThreshold: 5,       // Anti-aliasing threshold
      diffColor: [255, 0, 0] // Red for differences
    },
    sessionSettings: {
      saveAllIterations: true,
      generateReports: true,
      trackHistory: true,
      maxSessionAge: 7  // Days to keep session data
    },
    devServerUrl: 'http://localhost:3000',
    browsers: ['chromium', 'firefox', 'webkit'],
    retries: 2,
    outputFormats: ['png', 'json', 'html']
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), '.claude', 'visual-config.json'),
    JSON.stringify(visualConfig, null, 2)
  );
  console.log(chalk.gray('  ✅ Created visual-config.json'));
  
  // Create mock directory README
  const mockReadme = `# Visual Mock Directory

Place your design mockups here with descriptive names:
- homepage.png
- dashboard.png
- login-form.png
- header-component.png
- button-states.png

## Naming Convention
Use kebab-case for mock files matching your component names.

## Recommended Formats
- PNG for pixel-perfect comparisons (preferred)
- JPG for general layout comparisons
- Same dimensions as target viewport
- Include mobile, tablet, and desktop versions when needed

## Directory Structure
\`\`\`
.claude/mocks/
├── components/
│   ├── button-default.png
│   ├── button-hover.png
│   └── button-disabled.png
├── pages/
│   ├── homepage-desktop.png
│   ├── homepage-mobile.png
│   └── dashboard.png
└── responsive/
    ├── header-375w.png
    ├── header-768w.png
    └── header-1920w.png
\`\`\`

## Usage
Tell Claude: "/visual-iterate homepage" to start matching homepage.png

## Tips
- Use high-quality exports from design tools (Figma, Sketch, XD)
- Ensure mocks match expected viewport dimensions
- Include all component states (hover, active, disabled)
- Name files to match component/page names in code
`;
  
  fs.writeFileSync(
    path.join(process.cwd(), '.claude', 'mocks', 'README.md'),
    mockReadme
  );
  console.log(chalk.gray('  ✅ Created mocks/README.md'));
  
  // Create example Playwright visual test configuration
  const playwrightVisualConfig = `// playwright-visual.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  outputDir: '.playwright/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: '.playwright/reports' }],
    ['json', { outputFile: '.playwright/reports/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: process.env.CI ? 'retain-on-failure' : 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      },
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
`;
  
  const configPath = path.join(process.cwd(), 'playwright-visual.config.js');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, playwrightVisualConfig);
    console.log(chalk.gray('  ✅ Created playwright-visual.config.js'));
  }
  
  // Create visual iteration tracking template
  const iterationTemplate = {
    sessionId: null,
    componentName: null,
    startTime: null,
    iterations: [],
    finalDifference: null,
    status: 'in-progress',
    viewport: null,
    mockPath: null
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), '.claude', 'visual-sessions', 'template.json'),
    JSON.stringify(iterationTemplate, null, 2)
  );
  
  // Update package.json scripts
  updatePackageJsonScripts();
  
  console.log(chalk.green('\n✅ Visual development environment fully configured!'));
  console.log(chalk.cyan('\n📝 Next steps:'));
  console.log(chalk.gray('  1. Add design mocks to .claude/mocks/'));
  console.log(chalk.gray('  2. Run: npm run visual:setup'));
  console.log(chalk.gray('  3. Start dev server: npm run dev'));
  console.log(chalk.gray('  4. Tell Claude: /visual-iterate [component-name]'));
  console.log(chalk.yellow('\n🎯 Goal: Iterate until < 5% difference from mock'));
}

function updatePackageJsonScripts() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add visual development scripts
    const visualScripts = {
      'visual:test': 'playwright test --config=playwright-visual.config.js',
      'visual:test:ui': 'playwright test --config=playwright-visual.config.js --ui',
      'visual:test:debug': 'playwright test --config=playwright-visual.config.js --debug',
      'visual:update': 'playwright test --config=playwright-visual.config.js --update-snapshots',
      'visual:report': 'playwright show-report .playwright/reports',
      'visual:setup': 'npx playwright install chromium',
      'visual:compare': 'node -e "require(\'./cli/utils/visual-compare.js\').runComparison()"',
      'visual:clean': 'rm -rf .playwright/test-results .playwright/reports .claude/visual-iterations/*'
    };
    
    Object.assign(packageJson.scripts, visualScripts);
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.gray('  ✅ Updated package.json scripts'));
  }
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

module.exports = { setupMCP, serveMCP, addFromClaudeDesktop, getClaudeDesktopConfigPath, setupPlaywrightDirectories };