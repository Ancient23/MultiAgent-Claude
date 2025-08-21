# Changelog

All notable changes to MultiAgent-Claude will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-08-21

### Added
- **Orchestration System**: Five execution modes (Auto, Plan-Only, Parallel, Sequential, Meta)
- **Parallel Agent Deployment**: Run multiple agents simultaneously with conflict prevention
- **Visual Development**: Playwright MCP integration for iterative UI refinement
- **Git Worktrees**: Support for true parallel development in isolated environments
- **Verification System**: Automated validation of implementations against plans
- **New CLI Commands**:
  - `mac orchestrate` - Start orchestrated workflow with mode selection
  - `mac parallel` - Deploy multiple agents in parallel
  - `mac verify` - Create verification agent
  - `mac mcp [server]` - Setup MCP servers (playwright/filesystem/github)
  - `mac worktree <features...>` - Create git worktrees
- **New Agent Templates**:
  - `master-orchestrator` - Task complexity analysis and strategy selection
  - `playwright-visual-developer` - Iterative UI refinement
  - `parallel-controller` - Parallel execution management
  - `implementation-verifier` - Plan validation
- **Visual Development Directories**:
  - `.claude/mocks/` - Design mockups
  - `.claude/visual-iterations/` - Screenshot history
  - `.claude/visual-reports/` - Implementation reports
- **MCP Configuration**: Automatic `.mcp.json` generation

### Changed
- Updated to inquirer v9 with proper ESM imports
- Switched to CommonJS-compatible dependencies (chalk 4.x, ora 5.x)
- Enhanced package.json with new scripts for visual testing
- Expanded CLI capabilities with interactive prompts
- Improved memory system documentation

### Fixed
- Corrected Playwright MCP package reference to `@playwright/mcp`
- Fixed inquirer import issues for v9 compatibility
- Resolved dependency version conflicts

### Technical Details
- **Breaking Changes**: None - full backward compatibility maintained
- **Dependencies Updated**:
  - inquirer: ^9.2.0
  - chalk: ^4.1.2 (CommonJS compatible)
  - ora: ^5.4.1 (CommonJS compatible)
  - fs-extra: ^11.0.0
  - @playwright/mcp: ^0.0.34
- **Test Status**: 19 tests passing, 3 skipped

## [1.0.0] - 2025-08-19

### Initial Release
- Multi-agent orchestration framework
- Memory system with patterns and ADRs
- Agent template library
- Command workflow templates
- CLI tool with basic commands
- Playwright testing framework
- GitHub Actions CI/CD support
- Documentation import capabilities

### Core Features
- Research-Plan-Execute pattern
- Persistent memory system
- Agent specialization framework
- Session context management
- Template-based agent creation
- Command workflow automation

### Available Agents
- ai-agent-architect
- frontend-ui-expert
- aws-backend-architect
- fullstack-feature-orchestrator
- documentation-architect
- multimodal-ai-specialist
- infrastructure-migration-architect
- codebase-truth-analyzer
- ui-design-auditor
- playwright-test-engineer

### CLI Commands
- `mac init` - Initialize multi-agent environment
- `mac agent create/list/add/deploy` - Agent management
- `mac memory status/inspect/search` - Memory operations
- `mac command create/list/add` - Command management
- `mac add <feature>` - Add CI/CD or testing features