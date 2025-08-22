# ADR-005: MultiAgent-Claude v2.0 Orchestration Upgrade

## Date
2025-08-21

## Status
Implemented

## Context
The framework needed significant upgrades to align with Anthropic's Claude Code best practices, including:
- Visual development support with Playwright MCP
- Parallel agent execution capabilities
- Intelligent orchestration patterns
- Git worktree support for parallel development

## Decision
Implemented a comprehensive v2.0 upgrade with:

### New Commands
1. **mcp** - MCP server setup and configuration
2. **orchestrate** - Multi-mode orchestration workflow
3. **parallel** - Parallel agent deployment
4. **verify** - Verification agent creation
5. **worktree** - Git worktree management

### Orchestration Modes
- **Auto**: Master orchestrator decides strategy
- **Plan**: All agents create plans only
- **Parallel**: Deploy multiple agents simultaneously
- **Sequential**: Step-by-step execution
- **Meta**: Complex architectural changes

### Visual Development
- Playwright MCP integration (@playwright/mcp)
- Iterative UI refinement workflow
- Mock comparison with < 5% difference target
- Responsive testing at multiple viewports

## Consequences

### Positive
- Significantly improved orchestration capabilities
- Native Playwright MCP support for visual development
- Parallel execution reduces development time
- Git worktrees enable true parallel development
- Verification agents ensure quality

### Negative
- Increased complexity in CLI commands
- Requires Playwright MCP installation
- Additional directories needed (.claude/mocks, visual-iterations, etc.)

### Technical Changes
- Updated to inquirer v9 with proper imports
- Using CommonJS-compatible dependencies (chalk 4.x, ora 5.x)
- Corrected Playwright MCP package from fictional to actual (@playwright/mcp)

## Implementation Details
- Version bumped to 2.0.0
- All 7 phases from implementation plan completed
- 19 tests passing
- Full backward compatibility maintained

## Lessons Learned
1. Always verify package existence before implementation
2. Check library compatibility (ESM vs CommonJS)
3. Test commands interactively, not just programmatically
4. Document major upgrades as ADRs immediately