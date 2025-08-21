# Orchestration Patterns v2.0

## Pattern: Multi-Mode Orchestration

### Context
Tasks vary in complexity and require different execution strategies.

### Solution
Implement orchestration modes:
```javascript
const modes = {
  auto: 'Master orchestrator analyzes and decides',
  plan: 'All agents create plans only',
  parallel: 'Deploy multiple agents simultaneously',
  sequential: 'Step-by-step execution',
  meta: 'Complex architectural changes'
};
```

### Implementation
```bash
mac orchestrate
# Interactive selection of mode and task configuration
```

## Pattern: Parallel Agent Deployment

### Context
Independent tasks can be executed simultaneously to save time.

### Solution
1. Select multiple agents from .claude/agents/
2. Create parallel-execution.json configuration
3. Track execution status to prevent conflicts

### File Locking Strategy
```javascript
{
  "agents": {
    "frontend-developer": {
      "files": ["src/components/*", "styles/*"],
      "status": "running"
    },
    "backend-developer": {
      "files": ["api/*", "server/*"],
      "status": "running"
    }
  }
}
```

## Pattern: Visual Development Iteration

### Context
UI implementation requires iterative refinement to match designs.

### Solution
1. Capture baseline with playwright_screenshot
2. Compare with mock in .claude/mocks/
3. Iterate 2-3 times for best results
4. Target < 5% visual difference

### Workflow
```javascript
// Iteration cycle
playwright_navigate(url);
playwright_screenshot('baseline.png');
// Make improvements
playwright_navigate(url); // refresh
playwright_screenshot('iteration-1.png');
// Compare and repeat
```

## Pattern: Git Worktree Parallel Development

### Context
Multiple features need simultaneous development without branch conflicts.

### Solution
```bash
mac worktree feature1 feature2 feature3
# Creates separate worktrees for each feature
```

### Benefits
- True parallel development
- Isolated environments
- No branch switching overhead
- Claude configuration copied to each worktree

## Pattern: Verification Agent

### Context
Need to ensure implementations match plans and requirements.

### Solution
Create specialized verification agent that:
1. Locates recent plans in .claude/doc/
2. Reviews implementation against plan
3. Runs tests
4. Performs visual verification if needed
5. Creates detailed report

### Usage
```bash
mac verify
# Creates implementation-verifier agent
```

## Pattern: MCP Server Configuration

### Context
Different MCP servers provide specialized capabilities.

### Solution
Automated MCP setup with configuration management:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Installation
```bash
mac mcp playwright
# Installs and configures Playwright MCP
```

## Success Metrics
- Parallel execution reduces time by 40-60%
- Visual iterations achieve < 5% difference in 2-3 cycles
- Verification catches 95% of plan deviations
- Git worktrees eliminate branch conflicts