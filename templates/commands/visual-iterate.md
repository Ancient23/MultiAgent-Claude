---
name: visual-iterate
description: Iterate on UI implementation using Playwright MCP
---

Visual development workflow using Playwright MCP:

## Available Tools
- playwright_navigate(url) - Navigate to URL
- playwright_screenshot(selector?, path?) - Take screenshots
- playwright_set_viewport(width, height) - Set viewport size
- playwright_evaluate(script) - Execute JavaScript

## Iteration Process

1. **Capture Baseline**
   Use playwright_navigate to go to http://localhost:3000
   Use playwright_screenshot to save to .claude/visual-iterations/baseline.png

2. **Compare with Mock**
   Mock location: .claude/mocks/$ARGUMENTS
   Identify specific differences

3. **Iterate (2-3 times)**
   - Make improvements
   - playwright_navigate to refresh
   - playwright_screenshot for new capture
   - Compare and repeat

4. **Test Responsive**
   Use playwright_set_viewport for each breakpoint
   Screenshot at 375x667, 768x1024, 1920x1080

## Success: < 5% visual difference