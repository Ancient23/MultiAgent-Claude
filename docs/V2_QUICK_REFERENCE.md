# MultiAgent-Claude v2.0 Quick Reference

## 🚀 New Commands

### Orchestration
```bash
mac orchestrate        # Interactive mode selection
mac parallel           # Deploy multiple agents
mac verify             # Create verification agent
mac mcp [server]       # Setup MCP servers
mac worktree <names>   # Create git worktrees
```

## 🎯 Orchestration Modes

| Mode | Use Case | Command in Claude |
|------|----------|-------------------|
| **Auto** | Let AI decide strategy | "Use master-orchestrator to analyze task" |
| **Plan** | Planning without execution | "Execute in plan-mode" |
| **Parallel** | Multiple independent tasks | "Execute parallel agents" |
| **Sequential** | Dependent tasks | "Execute sequentially" |
| **Meta** | Complex architectural changes | "Use meta-agent pattern" |

## 📸 Visual Development

### Setup
```bash
mac mcp playwright
```

### Workflow in Claude
```javascript
// 1. Capture baseline
playwright_navigate("http://localhost:3000")
playwright_screenshot("baseline.png")

// 2. Compare with mock
// Mock at: .claude/mocks/component.png

// 3. Iterate (2-3 times)
// Make improvements
playwright_navigate("http://localhost:3000")  // refresh
playwright_screenshot("iteration-1.png")

// 4. Target: < 5% difference
```

## 🌳 Git Worktrees

### Create Feature Branches
```bash
mac worktree auth payment ui-redesign
```

### Work in Parallel
```bash
cd ../MultiAgent-Claude-auth
claude  # Start Claude in auth worktree

cd ../MultiAgent-Claude-payment
claude  # Start Claude in payment worktree
```

## ✅ Verification

### Create Verifier
```bash
mac verify
```

### Verification Process
1. Locates recent plans in `.claude/doc/`
2. Reviews implementation
3. Runs tests (`npm test`)
4. Visual verification if UI changes
5. Creates report in `.claude/verification/`

## 📊 Parallel Execution

### File Locking Strategy
```json
{
  "agents": {
    "frontend-developer": {
      "files": ["src/components/*"],
      "status": "running"
    },
    "backend-developer": {
      "files": ["api/*"],
      "status": "running"
    }
  }
}
```

### Status Tracking
- Location: `.claude/parallel-status.json`
- Updates: Real-time during execution
- Conflicts: Automatically prevented

## 🔧 MCP Servers

### Available Servers
- **playwright**: Browser automation & visual development
- **filesystem**: Enhanced file operations
- **github**: GitHub API integration

### Installation
```bash
mac mcp                    # Interactive selection
mac mcp playwright         # Install specific server
```

### Configuration
- File: `.mcp.json`
- Restart Claude Code after installation

## 📁 New Directories

```
.claude/
├── orchestration/         # Execution configs
├── mocks/                 # Visual design mockups
├── visual-iterations/     # Screenshot history
├── visual-reports/        # Implementation reports
├── verification/          # Verification reports
└── parallel-execution.json # Parallel config
```

## 🎭 New Agent Templates

- **master-orchestrator**: Task analysis & strategy
- **playwright-visual-developer**: UI iteration
- **parallel-controller**: Conflict prevention
- **implementation-verifier**: Plan validation

## 💡 Pro Tips

1. **Always plan before implementing**: Use orchestrate to select mode
2. **Iterate visually 2-3 times**: Best results for UI work
3. **Use parallel for independent tasks**: 40-60% time savings
4. **Verify after major changes**: Catch deviations early
5. **Worktrees for feature branches**: True parallel development

## 📝 Example Workflows

### Complex Feature
```bash
mac orchestrate
# Select: Auto
# Task: "Implement user authentication with OAuth"
# Options: ✓ Verify, ✓ Visual
```

### UI Component
```bash
mac mcp playwright
# In Claude:
"Use playwright-visual-developer to match the dashboard mock"
```

### Parallel Features
```bash
mac worktree backend-api frontend-ui tests
mac parallel
# Select: backend-developer, frontend-developer, test-engineer
```

## 🔗 Quick Links

- [Full Documentation](../README.md)
- [Agent Templates](../Examples/agents/)
- [Command Templates](../Examples/commands/)
- [Memory System](../.claude/memory/)
- [Changelog](../CHANGELOG.md)