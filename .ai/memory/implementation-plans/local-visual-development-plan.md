# Local Visual Development with Playwright MCP Implementation Plan

**Created**: 2025-08-24  
**Status**: Ready for Implementation  
**Priority**: Medium  
**Focus**: Local-Only Playwright MCP Visual Development

## Summary

This plan focuses on enabling local visual development using Playwright MCP server for real-time UI iteration and pixel-perfect refinement. This is designed for interactive development sessions where Claude Code can directly control a browser to iterate on visual designs.

## 1. MCP Playwright Integration

### 1.1 Enhance MCP Command
The existing `cli/commands/mcp.js` already supports Playwright MCP installation. We need to enhance it with better visual development support:

```javascript
// cli/commands/mcp.js - Enhanced Playwright setup
function setupPlaywrightDirectories() {
  const dirs = [
    '.claude/mocks',           // Design mockups to match
    '.claude/visual-iterations', // Iteration history
    '.claude/visual-reports',   // Comparison reports
    '.playwright/baseline',    // Visual regression baselines
    '.claude/visual-sessions'   // Session-specific iterations
  ];
  
  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
  
  // Create visual development config
  const visualConfig = {
    iterationGoal: 0.05, // 5% difference threshold
    defaultViewports: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 }
    },
    comparisonSettings: {
      threshold: 0.05,
      includeAA: true,
      diffMask: true
    }
  };
  
  fs.writeFileSync(
    '.claude/visual-config.json',
    JSON.stringify(visualConfig, null, 2)
  );
  
  console.log(chalk.green('✅ Created visual development directories'));
  console.log(chalk.cyan('📁 Add your design mocks to .claude/mocks/'));
  console.log(chalk.yellow('🎯 Goal: Iterate until < 5% difference from mock'));
}
```

### 1.2 Add Visual Development to Setup/Init

```javascript
// cli/commands/setup.js - Add visual development option
async function interactiveSetup() {
  // ... existing code ...
  
  const enableVisualDev = await question(
    chalk.cyan('Enable Playwright MCP visual development? (y/n): ')
  );
  
  if (enableVisualDev.toLowerCase() === 'y') {
    visualDevOptions = {
      enabled: true,
      mcpPlaywright: true,
      iterativeRefinement: true,
      mockComparison: true
    };
    
    // Auto-select playwright-visual-developer agent
    if (!selectedAgents.includes('playwright-visual-developer')) {
      selectedAgents.push('playwright-visual-developer');
    }
  }
  
  // Save to config
  config.visualDevelopment = visualDevOptions;
}
```

### 1.3 Init Command Enhancement

```javascript
// cli/commands/init.js - Add visual development setup
async function execute(options) {
  const config = loadConfig();
  
  if (config.visualDevelopment?.enabled) {
    // Copy playwright-visual-developer agent
    await copyAgentTemplate('playwright-visual-developer');
    
    // Create visual development command
    await createVisualCommand();
    
    // Setup MCP Playwright if not already installed
    if (!fs.existsSync('.mcp.json')) {
      const { setupMCP } = require('./mcp');
      await setupMCP('playwright');
    }
    
    console.log(chalk.green('✅ Visual development environment ready'));
    console.log(chalk.cyan('📸 Use /visual-iterate command to start'));
  }
}

async function createVisualCommand() {
  const commandContent = `# Visual Iteration Command

Trigger: /visual-iterate [component-name]

You are implementing pixel-perfect UI using Playwright MCP tools.

## Workflow

1. **Load Mock**: Check .claude/mocks/[component-name].png
2. **Navigate**: Use playwright_navigate to load implementation
3. **Iterate**: 
   - Capture with playwright_screenshot
   - Compare with mock
   - Update CSS/HTML
   - Repeat until < 5% difference
4. **Test Responsive**: Check all viewports
5. **Document**: Save iteration history

## Tools Required
- playwright_navigate
- playwright_screenshot
- playwright_set_viewport
- playwright_evaluate

## Output
Save iterations to .claude/visual-iterations/[timestamp]/
`;
  
  fs.writeFileSync(
    '.claude/commands/visual-iterate.md',
    commandContent
  );
}
```

## 2. Visual Development Workflow

### 2.1 Playwright MCP Tool Usage Pattern

```javascript
// Example workflow for Claude Code to follow
async function visualIterationWorkflow(componentName) {
  // Step 1: Load the mock
  const mockPath = `.claude/mocks/${componentName}.png`;
  const mockImage = await fs.readFile(mockPath);
  
  // Step 2: Navigate to component
  await playwright_navigate(`http://localhost:3000/components/${componentName}`);
  
  // Step 3: Iteration loop
  let iteration = 0;
  let difference = 1.0;
  
  while (difference > 0.05 && iteration < 10) {
    iteration++;
    
    // Capture current state
    const screenshotPath = `.claude/visual-iterations/session-${Date.now()}/iteration-${iteration}.png`;
    await playwright_screenshot(null, screenshotPath);
    
    // Compare with mock (Claude analyzes visually)
    // Claude provides feedback on what to change
    
    // Update implementation
    await updateCSS(componentName, changes);
    
    // Refresh
    await playwright_navigate(`http://localhost:3000/components/${componentName}`);
    
    // Calculate difference (Claude estimates)
    difference = await estimateDifference(screenshotPath, mockPath);
  }
  
  // Step 4: Responsive testing
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    await playwright_set_viewport(viewport.width, viewport.height);
    await playwright_screenshot(null, `.claude/visual-iterations/responsive-${viewport.name}.png`);
  }
}
```

### 2.2 Visual Comparison Utilities

```javascript
// cli/utils/visual-compare.js
const sharp = require('sharp');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

class VisualComparer {
  async compareImages(actualPath, expectedPath) {
    const actual = PNG.sync.read(await fs.readFile(actualPath));
    const expected = PNG.sync.read(await fs.readFile(expectedPath));
    
    const { width, height } = actual;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      actual.data,
      expected.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const percentage = (numDiffPixels / (width * height)) * 100;
    
    // Save diff image
    const diffPath = actualPath.replace('.png', '-diff.png');
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    
    return {
      percentage,
      diffPath,
      passed: percentage < 5
    };
  }
  
  async generateReport(sessionPath) {
    const iterations = await fs.readdir(sessionPath);
    const report = {
      session: path.basename(sessionPath),
      iterations: iterations.length,
      finalDifference: null,
      improvements: []
    };
    
    // Analyze each iteration
    for (let i = 0; i < iterations.length - 1; i++) {
      const current = iterations[i];
      const next = iterations[i + 1];
      
      const improvement = await this.compareImages(
        path.join(sessionPath, current),
        path.join(sessionPath, next)
      );
      
      report.improvements.push(improvement);
    }
    
    // Compare final with mock
    if (iterations.length > 0) {
      const final = iterations[iterations.length - 1];
      const mockPath = '.claude/mocks/target.png';
      
      report.finalDifference = await this.compareImages(
        path.join(sessionPath, final),
        mockPath
      );
    }
    
    return report;
  }
}

module.exports = { VisualComparer };
```

## 3. Agent and Command Templates

### 3.1 Enhanced Visual Iterate Command

```markdown
# /visual-iterate Command Template

Trigger: /visual-iterate [component] [mock-path?]

You are performing visual iteration to match a design mock.

## Phase 1: Setup
- Locate mock at .claude/mocks/[component].png or [mock-path]
- Create session directory at .claude/visual-iterations/session-[timestamp]/
- Load visual config from .claude/visual-config.json

## Phase 2: Initial Capture
```javascript
// Navigate to component
await playwright_navigate('http://localhost:3000/[component]');

// Capture baseline
await playwright_screenshot(null, 'session/iteration-0.png');
```

## Phase 3: Iterative Refinement (2-3 iterations recommended)
For each iteration:
1. Visually compare screenshot with mock
2. Identify differences:
   - Layout issues
   - Color mismatches
   - Typography differences
   - Spacing problems
3. Update implementation
4. Capture new screenshot
5. Document changes made

## Phase 4: Responsive Validation
Test at required viewports:
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1920x1080

## Phase 5: Report
Create .claude/visual-reports/[component]-[timestamp].md with:
- Number of iterations
- Final difference percentage
- Changes made per iteration
- Responsive screenshots
- Recommendations
```

### 3.2 Visual Development Agent Enhancement

```markdown
# playwright-visual-developer.md (Enhanced)

## Local Development Workflow

### With Playwright MCP Tools
When Playwright MCP is available, use these tools directly:

1. **playwright_navigate(url)** - Load the component
2. **playwright_screenshot(selector?, path?)** - Capture states
3. **playwright_set_viewport(width, height)** - Test responsive
4. **playwright_evaluate(script)** - Inject CSS changes
5. **playwright_click(selector)** - Test interactions
6. **playwright_fill(selector, value)** - Test forms

### Iteration Strategy
```javascript
// Example iteration loop
let attempts = 0;
const maxAttempts = 5;

while (attempts < maxAttempts) {
  // Capture current state
  await playwright_screenshot(null, `iteration-${attempts}.png`);
  
  // Analyze differences (visual comparison)
  // Make improvements based on analysis
  
  // Inject CSS updates
  await playwright_evaluate(`
    document.querySelector('.component').style.padding = '20px';
    document.querySelector('.title').style.fontSize = '24px';
  `);
  
  // Capture result
  await playwright_screenshot(null, `iteration-${attempts + 1}.png`);
  
  attempts++;
  
  // Check if close enough (< 5% difference)
  if (visuallyMatches(mock, screenshot, 0.05)) break;
}
```

### Visual Analysis Prompts
When comparing screenshots with mocks:
1. "The header spacing is 10px too large"
2. "Button color should be #007bff not #0056b3"
3. "Font weight needs to be 600 not 400"
4. "Border radius should be 8px not 4px"
5. "Shadow needs more blur (try 10px)"
```

## 4. Setup Script Enhancement

### 4.1 Interactive MCP Setup

```javascript
// cli/commands/mcp-setup.js (new command)
const inquirer = require('inquirer').default;
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

async function setupVisualDevelopment() {
  console.log(chalk.cyan('\n🎨 Visual Development Setup\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installPlaywright',
      message: 'Install Playwright MCP server?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createMockDirectory',
      message: 'Create mock directory structure?',
      default: true
    },
    {
      type: 'input',
      name: 'devServerUrl',
      message: 'Development server URL:',
      default: 'http://localhost:3000'
    },
    {
      type: 'checkbox',
      name: 'viewports',
      message: 'Select viewports to test:',
      choices: [
        { name: 'Mobile (375x667)', value: 'mobile', checked: true },
        { name: 'Tablet (768x1024)', value: 'tablet', checked: true },
        { name: 'Desktop (1920x1080)', value: 'desktop', checked: true },
        { name: 'Wide (2560x1440)', value: 'wide' }
      ]
    }
  ]);
  
  if (answers.installPlaywright) {
    const { setupMCP } = require('./mcp');
    await setupMCP('playwright');
  }
  
  if (answers.createMockDirectory) {
    setupPlaywrightDirectories();
    
    // Create example mock instruction
    fs.writeFileSync('.claude/mocks/README.md', `
# Visual Mock Directory

Place your design mockups here with descriptive names:
- homepage.png
- dashboard.png
- login-form.png
- header-component.png

## Naming Convention
Use kebab-case for mock files matching your component names.

## Recommended Formats
- PNG for pixel-perfect comparisons
- Same dimensions as target viewport
- Include mobile, tablet, and desktop versions when needed

## Usage
Tell Claude: "/visual-iterate homepage" to start matching homepage.png
    `);
  }
  
  // Save configuration
  const visualConfig = {
    devServerUrl: answers.devServerUrl,
    viewports: answers.viewports,
    threshold: 0.05,
    maxIterations: 5
  };
  
  fs.writeFileSync(
    '.claude/visual-config.json',
    JSON.stringify(visualConfig, null, 2)
  );
  
  console.log(chalk.green('\n✅ Visual development environment configured!'));
  console.log(chalk.cyan('\nNext steps:'));
  console.log('1. Add design mocks to .claude/mocks/');
  console.log('2. Start your dev server');
  console.log('3. Tell Claude: "/visual-iterate [component-name]"');
  console.log('4. Claude will iterate until matching your mock (< 5% difference)');
}

module.exports = { setupVisualDevelopment };
```

## 5. Integration with Existing Commands

### 5.1 Update CLI Index

```javascript
// cli/index.js - Add visual commands
program
  .command('visual-setup')
  .description('Setup visual development environment')
  .action(async () => {
    const { setupVisualDevelopment } = require('./commands/mcp-setup');
    await setupVisualDevelopment();
  });

program
  .command('visual-compare <actual> <expected>')
  .description('Compare two images and generate diff')
  .action(async (actual, expected) => {
    const { VisualComparer } = require('./utils/visual-compare');
    const comparer = new VisualComparer();
    const result = await comparer.compareImages(actual, expected);
    console.log(`Difference: ${result.percentage.toFixed(2)}%`);
    console.log(`Diff saved to: ${result.diffPath}`);
  });
```

### 5.2 Add to Templates

```javascript
// templates/CLAUDE.visual.md
# Visual Development Configuration

This project is configured for visual development with Playwright MCP.

## Available Tools
- playwright_navigate(url) - Navigate to pages
- playwright_screenshot(selector?, path?) - Capture screenshots
- playwright_set_viewport(width, height) - Change viewport
- playwright_evaluate(script) - Execute JavaScript
- playwright_click(selector) - Click elements
- playwright_fill(selector, value) - Fill forms

## Visual Development Workflow

1. **Add Mock**: Place design mock in `.claude/mocks/[component].png`
2. **Start Iteration**: Tell Claude `/visual-iterate [component]`
3. **Review Progress**: Check `.claude/visual-iterations/` for history
4. **View Reports**: See `.claude/visual-reports/` for comparisons

## Configuration
Edit `.claude/visual-config.json` to adjust:
- Difference threshold (default: 5%)
- Viewports to test
- Maximum iterations
- Development server URL

## Best Practices
- Iterate 2-3 times for best results
- Test all viewports after matching desktop
- Use specific selectors for component isolation
- Save successful patterns for reuse
```

## 6. Implementation Steps

### Phase 1: MCP Enhancement (MEDIUM Priority)
1. Enhance `cli/commands/mcp.js` with visual directories
2. Create `cli/commands/mcp-setup.js` for interactive setup
3. Add visual configuration to setup/init flow
4. Create visual comparison utilities

### Phase 2: Command Creation (MEDIUM Priority)
1. Add `visual-setup` command to CLI
2. Create `/visual-iterate` command template
3. Add `visual-compare` utility command
4. Update command discovery in init

### Phase 3: Agent Integration (LOW Priority)
1. Enhance playwright-visual-developer agent
2. Add MCP tool examples to agent
3. Create iteration patterns
4. Document visual analysis prompts

### Phase 4: Templates (LOW Priority)
1. Create `templates/CLAUDE.visual.md`
2. Add visual config to project templates
3. Create example mock directory structure
4. Add to documentation

## Success Criteria

- ✅ Playwright MCP server easily installed via CLI
- ✅ Visual directories created automatically
- ✅ Mock comparison workflow documented
- ✅ Iteration history tracked
- ✅ Responsive testing included
- ✅ Visual reports generated
- ✅ < 5% difference achievable in 2-3 iterations

## Key Differences from CI Plan

1. **Local Only**: Requires local browser, not for CI
2. **Interactive**: Real-time iteration with Claude
3. **MCP Dependent**: Requires Playwright MCP server
4. **Visual Focus**: Pixel-perfect matching priority
5. **Mock-Driven**: Design mocks guide development
6. **Session-Based**: Tracks iteration history per session

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/mcp": "latest",
    "sharp": "^0.33.0",
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0"
  }
}
```

## Usage Examples

### For Users Setting Up
```bash
# Initial setup
mac setup
# Select "Enable Playwright MCP visual development"

# Or dedicated visual setup
mac visual-setup

# Add design mock
cp ~/designs/homepage.png .claude/mocks/

# In Claude Code
"/visual-iterate homepage"
# Claude will iterate until matching the mock
```

### For Claude During Iteration
```javascript
// Iteration 1
await playwright_navigate('http://localhost:3000');
await playwright_screenshot(null, 'iteration-1.png');
// "Header needs 20px more padding"

// Iteration 2
await playwright_evaluate(`
  document.querySelector('.header').style.padding = '40px';
`);
await playwright_screenshot(null, 'iteration-2.png');
// "Color needs adjustment, too much padding on mobile"

// Iteration 3
await playwright_set_viewport(375, 667);
await playwright_evaluate(`
  @media (max-width: 768px) {
    .header { padding: 20px; }
  }
`);
await playwright_screenshot(null, 'iteration-3.png');
// "Now matches mock at 97% (< 5% difference)"
```

## Notes

- Requires Playwright MCP server running locally
- Not suitable for CI/CD pipelines
- Best for component-level visual development
- Works alongside CI testing plan
- Complements visual regression testing