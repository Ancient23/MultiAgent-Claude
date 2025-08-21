# Claude Code Configuration

## 🎭 Playwright MCP Tools
- playwright_navigate(url) - Navigate to URLs
- playwright_screenshot(selector?, path?) - Capture screenshots
- playwright_set_viewport(width, height) - Set viewport
- playwright_evaluate(script) - Execute JavaScript
- playwright_click(selector) - Click elements
- playwright_fill(selector, value) - Fill forms

## 🚀 Orchestration Modes
- **Auto**: Use master-orchestrator for strategy selection
- **Plan**: All agents create plans only
- **Parallel**: Deploy multiple agents simultaneously
- **Sequential**: Step-by-step execution
- **Meta**: Complex architectural changes

## 📸 Visual Development
IMPORTANT: Iterate 2-3 times for best results!
1. Screenshot current state
2. Compare with mock
3. Improve implementation
4. Repeat until < 5% difference

## 🧪 Testing Commands
- npm test - Run all tests
- npm run visual:test - Visual regression tests
- npm run visual:update - Update baselines
- npm run visual:ui - Playwright UI mode

## 📁 Project Structure
.claude/
├── agents/           # Agent definitions
├── commands/         # Slash commands
├── doc/             # Agent plans
├── memory/          # Patterns & decisions
├── mocks/           # Visual mocks
├── orchestration/   # Execution configs
├── verification/    # Verification reports
└── visual-iterations/ # Screenshot history

## ⚡ Quick Commands
- mac orchestrate - Start orchestrated workflow
- mac parallel - Deploy parallel agents
- mac verify - Create verification agent
- mac mcp - Setup MCP servers
- mac worktree <features> - Create git worktrees

## 🎯 Best Practices
1. Always plan before implementing
2. Use parallel agents for independent tasks
3. Verify after each phase
4. Keep context focused with /clear
5. Document patterns in memory system