# Visual Development Configuration

This project is configured for pixel-perfect visual development using Playwright MCP for real-time browser control and iteration.

## 🎨 Visual Development Overview

The visual development system enables Claude Code to:
- Navigate to your components using Playwright MCP
- Capture screenshots and compare with design mocks
- Iteratively refine CSS/HTML until achieving < 5% visual difference
- Test responsive designs across multiple viewports
- Generate detailed comparison reports

## 📁 Directory Structure

```
.claude/
├── mocks/                      # Design mockups and references
│   ├── components/            # Component-level mocks
│   ├── pages/                 # Full page mocks
│   └── responsive/            # Viewport-specific mocks
├── visual-iterations/         # Screenshot history per session
├── visual-sessions/           # Session tracking data
├── visual-baselines/          # Approved baseline screenshots
├── visual-reports/            # Comparison reports
└── visual-config.json         # Configuration settings

.playwright/
├── baseline/                  # Playwright baseline screenshots
├── test-results/              # Test execution results
├── screenshots/               # Ad-hoc screenshots
└── reports/                   # HTML test reports
```

## 🛠️ Available MCP Tools

When Playwright MCP is active, Claude has access to:

### Navigation & Control
- `playwright_navigate(url)` - Navigate to pages/components
- `playwright_navigate_back()` - Go back in browser history
- `playwright_click(element, ref)` - Click elements
- `playwright_fill(element, ref, text)` - Fill form fields
- `playwright_press_key(key)` - Press keyboard keys

### Visual Capture
- `playwright_screenshot(element?, ref?, path?)` - Capture screenshots
- `playwright_set_viewport(width, height)` - Change viewport size
- `playwright_take_screenshot(options)` - Advanced screenshot options

### DOM Manipulation
- `playwright_evaluate(function)` - Execute JavaScript
- `playwright_hover(element, ref)` - Hover over elements
- `playwright_select_option(element, ref, values)` - Select dropdown options
- `playwright_drag(startElement, startRef, endElement, endRef)` - Drag and drop

### Testing & Validation
- `playwright_wait_for(text?, textGone?, time?)` - Wait for conditions
- `playwright_snapshot()` - Capture accessibility tree
- `playwright_console_messages()` - Get console logs
- `playwright_network_requests()` - View network activity

## 🎯 Visual Development Workflow

### 1. Setup Mock
Place your design mock in `.claude/mocks/[component-name].png`

### 2. Start Iteration
Tell Claude: `/visual-iterate [component-name]`

### 3. Claude's Process
```javascript
// Claude will automatically:
// 1. Navigate to your component
await playwright_navigate('http://localhost:3000/components/button');

// 2. Capture initial state
await playwright_screenshot(null, 'iteration-001.png');

// 3. Compare with mock and identify differences
// (Claude visually analyzes the differences)

// 4. Apply CSS/HTML fixes
await playwright_evaluate(`
  document.querySelector('.button').style.padding = '12px 24px';
  document.querySelector('.button').style.fontSize = '16px';
`);

// 5. Capture result
await playwright_screenshot(null, 'iteration-002.png');

// 6. Repeat until < 5% difference achieved
```

### 4. Responsive Testing
Claude tests across configured viewports:
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1920x1080
- Wide: 2560x1440 (optional)

### 5. Report Generation
Final report saved to `.claude/visual-reports/[component]-report.md`

## 📝 Visual Commands

### /visual-iterate Command
Primary command for visual development iteration:
```
/visual-iterate button
/visual-iterate dashboard .claude/mocks/custom/dashboard.png
/visual-iterate header --responsive
```

### CLI Commands
```bash
# Setup visual development environment
mac visual-setup

# Compare two images
mac visual-compare screenshot.png mock.png

# Generate session report
mac visual-report .claude/visual-sessions/12345

# Run visual tests
npm run visual:test
npm run visual:test:ui     # Interactive UI
npm run visual:update       # Update baselines
npm run visual:report       # View HTML report
```

## ⚙️ Configuration

Edit `.claude/visual-config.json` to customize:

```json
{
  "iterationGoal": 0.05,          // 5% difference threshold
  "maxIterations": 10,             // Max iteration attempts
  "defaultViewports": {
    "mobile": { "width": 375, "height": 667 },
    "tablet": { "width": 768, "height": 1024 },
    "desktop": { "width": 1920, "height": 1080 }
  },
  "comparisonSettings": {
    "threshold": 0.05,             // Pixel difference threshold
    "includeAA": true,             // Include anti-aliasing
    "diffMask": true               // Generate diff masks
  },
  "devServerUrl": "http://localhost:3000"
}
```

## 💡 Best Practices

### Mock Preparation
- Export mocks at exact viewport dimensions
- Use PNG format for pixel-perfect comparison
- Include all component states (hover, active, disabled)
- Name files to match component names

### Iteration Strategy
1. **Start broad**: Fix major layout issues first
2. **Refine details**: Adjust colors, typography, spacing
3. **Test interactions**: Verify hover/active states
4. **Check responsive**: Test all breakpoints

### CSS Injection Examples
```javascript
// Global style injection
await playwright_evaluate(`
  const style = document.createElement('style');
  style.textContent = \`
    .component {
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  \`;
  document.head.appendChild(style);
`);

// Direct element modification
await playwright_evaluate(`
  const element = document.querySelector('.target');
  if (element) {
    element.style.padding = '24px';
    element.style.backgroundColor = '#f5f5f5';
  }
`);

// Responsive adjustments
await playwright_evaluate(`
  const style = document.createElement('style');
  style.textContent = \`
    @media (max-width: 768px) {
      .component { padding: 12px; }
    }
  \`;
  document.head.appendChild(style);
`);
```

## 🎯 Success Criteria

Visual development is successful when:
- ✅ Visual difference < 5% from mock
- ✅ All configured viewports tested
- ✅ Iteration history documented
- ✅ Comparison report generated
- ✅ No visual regressions introduced

## 🔍 Troubleshooting

### Common Issues

**Mock not found**
- Ensure mock is in `.claude/mocks/` directory
- Check filename matches component name
- Verify PNG format

**High difference percentage**
- Check viewport dimensions match mock
- Verify colors using exact hex values
- Ensure fonts are loaded before screenshot

**Iterations not improving**
- Try different CSS approach
- Check for conflicting styles
- Verify element selectors are correct

**Playwright MCP not working**
- Run `mac mcp playwright` to reinstall
- Check dev server is running
- Verify URL in visual-config.json

## 📊 Analyzing Results

### Visual Reports Include
- Iteration count and progression
- Pixel difference percentages
- Diff images highlighting changes
- Responsive test results
- Improvement recommendations

### Understanding Diff Images
- **Red pixels**: Differences from expected
- **Yellow pixels**: Anti-aliasing differences
- **Green pixels**: Alternative differences
- **Unchanged**: Matching pixels

## 🚀 Advanced Features

### Visual Regression Testing
```javascript
// Run baseline capture
npm run visual:baseline

// Run regression tests
npm run visual:test

// Update baselines when intentional changes made
npm run visual:update
```

### CI/CD Integration
Visual tests can run in CI pipelines:
```yaml
- name: Visual Regression Tests
  run: |
    npm run visual:test
    npm run visual:report
```

### Custom Viewports
Add custom viewports to test:
```javascript
await playwright_set_viewport(1366, 768); // Laptop
await playwright_set_viewport(414, 896);  // iPhone 11
await playwright_set_viewport(820, 1180); // iPad Air
```

## 📚 Examples

### Button Component Iteration
```
/visual-iterate button

Iteration 1: Adjust padding from 8px to 12px
Iteration 2: Update font-size to 16px
Iteration 3: Fix border-radius to 6px
Result: 3.2% difference (PASSED)
```

### Dashboard Layout
```
/visual-iterate dashboard

Iteration 1: Fix grid layout spacing
Iteration 2: Adjust card shadows
Iteration 3: Update header height
Iteration 4: Fix sidebar width
Result: 4.8% difference (PASSED)
```

### Responsive Header
```
/visual-iterate header --responsive

Desktop: 2.1% difference
Tablet: 3.5% difference  
Mobile: 4.9% difference
All viewports PASSED
```

## 🔗 Related Documentation

- [Playwright MCP Documentation](https://github.com/playwright/mcp)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots)
- [CSS Injection Techniques](https://playwright.dev/docs/api/class-page#page-evaluate)

---

*Visual Development System - Part of MultiAgent-Claude Framework*