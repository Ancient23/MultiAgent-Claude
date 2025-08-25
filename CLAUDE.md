# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-agent development environment framework for Claude Code v2.0, providing orchestration capabilities, visual development support, and intelligent task delegation through specialized agents, commands, and a memory system. The repository contains both prompt engineering resources and a functional CLI orchestration system.

## 🚀 META-IMPLEMENTATION ACTIVE

This project is running MultiAgent-Claude on itself! The framework manages its own development through specialized agents and commands.

## Project Structure

```
MultiAgent-Claude/
├── Examples/                          # Templates for user projects
│   ├── agents/                        # Agent template library (see Examples/agents/README.md)
│   │   ├── orchestrators/             # Opus-model coordination agents
│   │   ├── specialists/               # Sonnet-model domain experts
│   │   ├── TEMPLATE-agent.md         # Base template
│   │   ├── [agent templates].md
│   │   └── manifest.json              # Template registry
│   └── commands/                      # Command template library (see Examples/commands/README.md)
│       ├── README.md                  # Command catalog and selection guide
│       └── [command templates].md
├── cli/                 # CLI implementation
│   ├── index.js         # Main CLI entry point
│   └── commands/        # CLI command implementations
│       ├── init.js      # Project initialization
│       ├── add.js       # Add features to projects
│       ├── memory.js    # Memory system management
│       ├── agent.js     # Agent management
│       └── ...          # Other commands
├── templates/           # Templates for project setup
│   ├── workflows/       # GitHub Actions workflows
│   │   ├── claude-memory-update.yml
│   │   ├── playwright-cli-tests.yml
│   │   └── playwright-web-tests.yml
│   ├── tests/           # Test templates
│   │   └── cli.cli.spec.js
│   ├── prompts/         # HOP/LOP templates
│   │   ├── hop/         # Higher Order Prompts
│   │   └── lop/         # Lower Order Prompts
│   └── commands/        # Command templates
├── tests/               # Project tests
│   └── cli.cli.spec.js  # CLI tests (19 passing)
├── claude-code-init-prompts.md       # Master initialization prompt
├── claude-code-init-memory-prompt.md # Focused memory system prompt  
├── memory-system-addon-prompt.md     # Memory system add-on for existing setups
└── README.md
```

## Core Architecture

### 1. Multi-Agent Orchestration Pattern
- **Research-Only Agents**: Specialized agents that create implementation plans but never execute
- **Main System Execution**: Parent Claude Code instance reads plans and performs actual implementation
- **Memory Hierarchy**: Session context → Agent plans → Persistent project memory

### 2. Standard File Paths
```
.claude/
├── tasks/context_session_[session_id].md    # Session working memory (uses Claude session ID)
├── doc/[agent]-[task]-*.md       # Agent output plans
├── agents/                        # Project-specific agents
│   ├── prompt-engineer-specialist.md
│   ├── template-evolution-tracker.md
│   ├── cli-test-engineer.md
│   ├── documentation-sync-guardian.md
│   └── agent-factory.md
├── commands/                      # Project-specific commands
│   ├── implement.md               # Direct implementation execution
│   ├── validate-templates.md
│   ├── generate-agent.md
│   ├── test-cli.md
│   └── sync-docs.md
└── prompts/                       # HOP/LOP system
    ├── hop/                       # Higher Order Prompt templates
    │   └── implementation-master.md
    ├── lop/                       # Lower Order Prompt configs
    │   ├── ci-visual-testing.yaml
    │   ├── visual-feature-development.yaml
    │   └── schema/lop-base-schema.json
    └── generated/                 # Generated prompts output

.ai/
└── memory/                        # Unified persistent knowledge base (all platforms)
    ├── project.md                 # Project-wide context
    ├── patterns/                  # Successful implementation patterns
    ├── decisions/                 # Architectural Decision Records (ADRs)
    └── index.json                 # Quick lookup index
```

### 3. Agent Workflow
1. Read session context from `.claude/tasks/context_session_[session_id].md` (uses Claude session ID)
2. Master agent loads memory from `.ai/memory/` and includes in context session
3. Research using MCP tools (Context7, Sequential, etc.)
4. Create detailed plan at `.claude/doc/[agent]-[task]-[timestamp].md`
5. Return path to parent: "Plan created at .claude/doc/..."

#### MCP Tool Naming Convention
All MCP tools follow the pattern `mcp__<server>__<tool>` where:
- `server` is the MCP server name (e.g., memory, filesystem, github)
- `tool` is the specific tool name (e.g., create_entities, read_file)

Examples:
- `mcp__memory__create_entities`
- `mcp__filesystem__read_file`
- `mcp__github__search_repositories`

### 4. Context Session Management

#### Master Agent Responsibilities
1. **Session Start**: Create `.claude/tasks/context_session_[session_id].md` before any work
2. **During Work**: Update context after each significant action
3. **Agent Deployment**: Ensure context file exists before invoking agents
4. **Session End**: Archive to `.ai/memory/sessions/archive/` if needed

#### Wave Execution Context Management
When using `mac wave-execute`, the CLI automatically:
1. Creates properly structured context session file
2. Initializes with Wave 0 (session setup)
3. Documents objectives and wave progression
4. Assigns agents to each wave (user-selected or defaults)
5. Provides clear execution instructions

Claude will:
1. Read context before each wave
2. Update context during wave execution
3. Mark waves as complete
4. Document discoveries and blockers

#### Context File Structure
```markdown
# Session Context: [Task Description]

**Session ID**: [claude_session_id]_[tasktype]
**Date**: [ISO Date]
**Type**: [orchestration mode]
**Status**: [Active|Completed|Failed]

## Objectives
[Initial task/goals]

## Current State
[What has been done, discovered, decided]

## Files Modified
[List of changed files]

## Next Steps
[Planned actions]
```

#### Update Triggers
- After reading/analyzing files
- After making architectural decisions
- Before deploying subagents
- After subagents complete
- After implementing changes
- When discovering issues/blockers

#### Orchestration-Specific Patterns

**Sequential Mode:**
- Single context_session file shared across all agents
- Each agent reads before starting work
- Master updates after each agent completes

**Parallel Mode:**
- Master creates initial context_session
- Each parallel agent reads from same file
- Master consolidates results after all complete

**Worktree Mode:**
- Each worktree gets own `context_session_[session_id]_[branch].md`
- Master maintains merge strategy document
- Context reconciliation after feature completion

## Agent Orchestration Hierarchy

### Two-Tier Architecture
The framework uses a two-tier hierarchy of orchestrators and specialists:

#### **Orchestrators (Opus Model)**
High-level coordinators that manage complex workflows and other agents:
- **master-orchestrator** - Top-level task analysis and strategy
- **fullstack-feature-orchestrator** - End-to-end feature coordination
- **infrastructure-migration-architect** - Infrastructure transformation
- **parallel-controller** - Concurrent agent management
- **wave-execution-orchestrator** - 7-phase systematic execution
- **issue-triage-orchestrator** - Issue analysis and resolution
- **code-review-orchestrator** - Comprehensive code reviews

#### **Specialists (Sonnet Model)**
Domain experts that create plans and perform focused tasks:
- All development specialists (frontend, backend, AI, etc.)
- All deployment specialists (AWS, Vercel, etc.)
- All testing specialists (Playwright, CLI, etc.)
- All documentation specialists
- All framework meta-specialists

### Orchestration Patterns

#### Complex Task Flow
```
User Request → Master Orchestrator (Opus)
                ↓
        Domain Orchestrator (Opus)
                ↓
    [Parallel Specialist Agents (Sonnet)]
                ↓
        Results Consolidation
                ↓
           User Response
```

#### Simple Task Flow
```
User Request → Specialist Agent (Sonnet) → User Response
```

### When to Use Orchestrators
- Task requires 2+ specialist domains
- Complex phased execution needed
- Parallel coordination required
- Architectural decisions involved
- Pass/fail decisions needed

### When to Use Specialists
- Single domain expertise required
- Focused analysis or planning
- Research and documentation
- Specific technical implementation
- Independent execution possible

## Available Agent Templates

### Core Agents
- `ai-agent-architect.md` - AI agentic systems and workflows
- `frontend-ui-expert.md` - Frontend UI design and development
- `aws-backend-architect.md` - AWS backend architecture
- `fullstack-feature-orchestrator.md` - End-to-end feature implementation
- `documentation-architect.md` - Comprehensive documentation
- `multimodal-ai-specialist.md` - Multimodal AI systems and VLMs
- `infrastructure-migration-architect.md` - Infrastructure re-architecture
- `codebase-truth-analyzer.md` - Code-documentation alignment verification

### Orchestrator Agents (Opus Model)
- `master-orchestrator.md` - Top-level task analysis and strategy
- `parallel-controller.md` - Concurrent agent management
- `wave-execution-orchestrator.md` - 7-phase systematic execution
- `issue-triage-orchestrator.md` - Issue analysis and resolution
- `code-review-orchestrator.md` - Comprehensive code reviews
- `fullstack-feature-orchestrator.md` - End-to-end feature coordination
- `infrastructure-migration-architect.md` - Infrastructure transformation

### Specialized Agents
- `aws-deployment-specialist.md` - AWS deployment and troubleshooting
- `backend-api-frontend-integrator.md` - API-frontend integration
- `cpp-plugin-api-expert.md` - Cross-platform C++ libraries
- `ui-design-auditor.md` - UI/UX design analysis
- `vercel-deployment-troubleshooter.md` - Vercel deployment issues
- `playwright-test-engineer.md` - E2E testing with Playwright
- `playwright-visual-developer.md` - Visual regression testing

## MultiAgent-Claude Project-Specific Agents (Meta-Implementation)
Located in `.claude/agents/` - these are project-specific agents for framework development:
- `meta-development-orchestrator.md` - Framework self-improvement orchestration
- `prompt-engineer-specialist.md` - Expert in creating effective agent prompts
- `template-evolution-tracker.md` - Track and improve template changes
- `cli-test-engineer.md` - Create comprehensive tests for CLI
- `documentation-sync-guardian.md` - Keep documentation synchronized
- `agent-factory.md` - Specialize in creating new agents
- `implementation-verifier.md` - Verify implementation matches requirements

## Visual Menu Project Agents (New Specialists)
- `electron-app-specialist.md` - Electron desktop app architecture and packaging
- `react-ui-architect.md` - React component architecture and state management
- `websocket-realtime-engineer.md` - Real-time WebSocket communication systems
- `visual-regression-specialist.md` - Visual testing and screenshot comparison
- `cli-web-bridge-architect.md` - CLI-Web integration and IPC patterns
- `vue-hybrid-specialist.md` - Vue.js with terminal integration
- `worktree-coordinator.md` - Git worktree parallel development management
- `bundler-optimization-specialist.md` - Build tool and bundle optimization

## OpenAI Compatibility Specialists (Cross-Platform Integration)
- `openai-bridge-architect.md` - Cross-platform AI assistant integration and compatibility layers
- `prompt-compression-specialist.md` - Text compression and token optimization for platform limits
- `role-instruction-engineer.md` - ChatGPT custom instructions and role-based prompting
- `context-bundler-specialist.md` - File bundling and context optimization for uploads
- `sync-orchestrator.md` - Bidirectional synchronization and conflict resolution
- `workflow-translator.md` - Workflow conversion and pattern translation between platforms
- `memory-unification-specialist.md` - Shared memory systems and cross-platform persistence
- `testing-compatibility-engineer.md` - Cross-platform testing and validation frameworks
- `documentation-bridge-specialist.md` - Multi-platform documentation and training materials
- `codex-configuration-expert.md` - OpenAI Codex setup and AGENTS.md optimization

## HOP/LOP Template System

### Overview
The HOP/LOP (Higher Order Prompt / Lower Order Prompt) system eliminates implementation prompt redundancy:
- **HOPs**: Master templates at `.claude/prompts/hop/implementation-master.md`
- **LOPs**: YAML configurations at `.claude/prompts/lop/*.yaml`
- **Validation**: JSON Schema at `.claude/prompts/lop/schema/lop-base-schema.json`
- **Reduction**: 78% → <5% redundancy in prompts

### /implement Command
Execute implementations directly in current context:
```
/implement ci-testing              # Execute CI testing immediately
/implement visual-dev              # Execute visual development
/implement plan my-plan.md         # Execute from markdown plan
/implement plan refactor.md --with-ci-tests  # Add tests to any plan
/implement --help                  # Show usage examples
```

### CLI Commands for LOPs
```bash
mac lop list                       # List available LOPs
mac lop validate <file>            # Validate against schema
mac lop create                     # Interactive creation
mac lop execute <file>             # Generate prompt
```

## Command Templates

- `TEMPLATE-COMMAND.md` - Base template for research-plan-execute pattern
- `implement-feature.md` - Feature implementation workflow
- `WAVE_EXECUTE.md` - Wave execution pattern
- `/implement` - Direct execution of implementation plans (NEW)

### Project-Specific Commands (Meta-Implementation)
- `/validate-templates` - Validate all templates for consistency
- `/generate-agent` - Interactive agent creation with best practices
- `/test-cli` - Comprehensive CLI testing
- `/sync-docs` - Synchronize all documentation
- `/implement` - Execute LOPs or plans directly in context

## Key Conventions

### Agent Creation Rules
1. Agents must be research-focused and plan-only
2. Always check session context before starting work
3. Output plans to `.claude/doc/` with proper naming
4. Never implement directly - only create plans
5. Return file path to parent, not plan content

### Memory System Usage
1. Master agent checks `.ai/memory/project.md` for project conventions
2. Scans `.ai/memory/patterns/` for existing solutions
3. References ADRs in `.ai/memory/decisions/`
4. Suggest (don't write) memory updates
5. Document successful patterns after 2+ uses

### MCP Tool Assignment
- **Context7**: All research agents for latest documentation
- **Sequential**: Complex analysis and multi-step reasoning
- **Magic**: Frontend UI component generation
- **Playwright**: Testing and browser automation
- **WebSearch**: Fallback for information not in Context7

## Development Guidelines

### Creating New Agents
1. Use `Examples/agents/TEMPLATE-agent.md` as base
2. Define clear trigger patterns and keywords
3. Specify MCP tools needed
4. Document output format and location
5. Include quality standards and examples

### Creating New Commands
1. Use `Examples/commands/TEMPLATE-COMMAND.md` as base
2. Follow research → plan → execute pattern
3. Define clear phase separation
4. Include error handling
5. Document anti-patterns to avoid

### Memory Management
- **Patterns**: Document after 2+ successful uses
- **ADRs**: Create for architectural decisions
- **Project.md**: Update with discovered conventions
- **Index.json**: Maintain statistics and quick lookups

## Common Workflows

### Initialize Multi-Agent Environment
```bash
# Using the CLI (recommended)
mac init
# Prompts for memory, CI/CD, and testing options

# Or manually with prompts:
1. Copy claude-code-init-prompts.md content
2. Paste into Claude Code conversation
3. System will:
   - Analyze project structure
   - Create memory system at .ai/memory/
   - Generate specialized agents in .claude/agents/
   - Create commands in .claude/commands/
   - Update CLAUDE.md with orchestration rules
```

### v2.0 Orchestration Workflows

#### Start Orchestrated Development
```bash
# Interactive mode selection
mac orchestrate
# Choose: Auto, Plan-Only, Parallel, Sequential, or Meta

# Tell Claude:
"Execute the orchestration config in .claude/orchestration/config.json"
```

#### Wave Execution Pattern
```bash
# Initialize 7-wave systematic execution
mac wave-execute

# The command will:
# 1. Create context session file at .claude/tasks/context_session_[session_id].md
# 2. Let you select which waves to execute
# 3. Allow agent assignment to each wave (or use smart defaults)
# 4. Generate execution plan at .claude/doc/wave-execution-plan-[id].md

# Tell Claude:
"Execute the wave pattern from session [session-id]"

# Claude will then:
# - Read the context session file
# - Follow the wave progression
# - Update context after each wave
# - Deploy agents as specified
```

#### Deploy Parallel Agents
```bash
# Select and deploy multiple agents
mac parallel

# Tell Claude:
"Execute the parallel agents defined in .claude/parallel-execution.json"
```

#### Visual Development Iteration
```bash
# Setup Playwright MCP first
mac mcp playwright

# Then in Claude:
"Use playwright_navigate to go to http://localhost:3000
Use playwright_screenshot to capture baseline
Compare with mock at .claude/mocks/component.png
Iterate until < 5% difference"
```

#### Parallel Feature Development
```bash
# Create worktrees for features
mac worktree auth-feature payment-feature ui-redesign

# Each worktree gets its own:
- Feature branch
- Claude configuration
- Independent development environment
```

### Add Features to Existing Projects
```bash
# Add CI/CD workflows
mac add ci-cd

# Add testing frameworks
mac add testing        # CLI testing
mac add web-testing    # Web app testing

# Add everything
mac add all
```

### Add Memory to Existing Setup
```bash
# Using CLI
mac add-memory

# Or manually:
1. Copy memory-system-addon-prompt.md content
2. Paste into Claude Code
3. System will:
   - Create memory infrastructure
   - Update existing agents with memory checks
   - Add pattern documentation
   - Implement ADR system
```

### Agent Invocation Pattern
```python
# Correct usage in main system:
invoke_task_tool(
    agent="specialist-agent",
    prompt="Create implementation plan for: [task]",
    expect_output=".claude/doc/[agent]-*.md"
)
plan_path = find_latest(".claude/doc/[agent]-*.md")
plan = read_file(plan_path)
execute_plan(plan)
```

## Quality Checklist

- [ ] Agents only create plans, never implement
- [ ] Plans saved to `.claude/doc/` with timestamps
- [ ] Session context checked before all operations
- [ ] Memory system consulted for patterns
- [ ] MCP tools used appropriately
- [ ] Success patterns documented
- [ ] Architectural decisions recorded

## Anti-Patterns to Avoid

❌ Agents directly editing files
❌ Skipping session context check
❌ Implementing without planning phase
❌ Hardcoding paths instead of using standard locations
❌ Forgetting to return plan path from agents
❌ Writing to memory directly instead of suggesting

## Tips for Development

1. **Proactive Agent Use**: Use specialized agents when keywords match their expertise
2. **Memory First**: Check existing patterns before creating new solutions
3. **Plan Thoroughly**: Agent plans should be comprehensive and actionable
4. **Document Success**: Save working patterns for future reuse
5. **Session Continuity**: Maintain context across agent invocations
6. **MCP Flexibility**: Adapt to available MCP servers

## CLI Commands Reference

### Global Commands
- `mac init` - Initialize multi-agent environment with prompts
- `mac add <feature>` - Add features (ci-cd, testing, web-testing, all)
- `mac setup` - Interactive setup wizard
- `mac add-memory` - Add memory system to existing project

### Agent Management
- `mac agent create` - Create new agent interactively
- `mac agent list` - List available agents
- `mac agent add <name>` - Add template agent to project
- `mac agent deploy <name>` - Deploy agent to Claude

### Memory System
- `mac memory status` - Check memory health
- `mac memory inspect` - View memory contents
- `mac memory search <query>` - Search patterns/decisions
- `mac memory report` - Generate memory report
- `mac memory validate` - Validate memory integrity

### v2.0 Orchestration Commands
- `mac orchestrate [--mode <mode>]` - Start orchestrated workflow (auto/parallel/sequential/meta)
- `mac parallel` - Deploy multiple agents in parallel
- `mac verify` - Create verification agent for current task
- `mac wave-execute` - Execute tasks using 7-wave systematic pattern
- `mac worktree <features...>` - Create git worktrees for parallel development

### MCP (Model Context Protocol) Commands
- `mac mcp [server]` - Add MCP server (playwright/filesystem/github)
- `mac mcp serve` - Start Claude Code as MCP server
- `mac mcp add-from-claude-desktop` - Import servers from Claude Desktop
- Uses proper Claude Desktop config paths:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

### Wave Execution Command
- `mac wave-execute` - Initialize 7-wave systematic task execution
  - Creates context session with proper structure
  - Scans available agents from Examples/agents/
  - Allows custom agent assignment or uses smart defaults
  - Generates execution plan for Claude to follow
  - Wave defaults:
    - Wave 1: codebase-truth-analyzer, aws-backend-architect
    - Wave 2: fullstack-feature-orchestrator, infrastructure-migration-architect
    - Wave 3: backend-api-frontend-integrator, ai-agent-architect
    - Wave 4: playwright-test-engineer, ui-design-auditor
    - Wave 5: documentation-architect
    - Wave 6: code-review-orchestrator
    - Wave 7: aws-deployment-specialist, vercel-deployment-troubleshooter

### Testing
- `npm test` - Run all tests with Playwright
- `npm run test:ui` - Interactive test mode with Playwright UI
- `npm run test:debug` - Debug tests with Playwright inspector
- `npm run test:headed` - Run tests with browser visible
- `npm run test:cli` - Run CLI-specific tests
- `npm run test:ci` - Run tests with GitHub reporter
- `npm run visual:test` - Visual regression tests
- `npm run visual:update` - Update visual baselines

### Visual CI Commands
- `mac visual:ci-setup` - Configure deployment detection for CI visual testing
- `mac visual:detect-url` - Test deployment URL detection locally
- `mac visual:ci-status` - Show visual CI configuration status

#### Test Configuration
- Tests use latest Playwright v1.48.2+
- Default timeout: 30 seconds
- Trace on failure for debugging
- Blob reporter for sharded tests
- GitHub Actions optimized with v4 actions

## Deployment Detection for Visual CI Testing

### Overview
The framework now supports automatic deployment URL detection for visual regression testing on CI, allowing tests to run against live preview deployments instead of localhost.

### Supported Providers
- **Vercel**: Automatic preview URL detection from PR comments
- **Custom**: Provide your own detection script
- **Manual**: Specify URL in GitHub secrets
- **None**: Fallback to localhost

### Configuration
Projects can configure deployment detection during setup:
```bash
mac init  # Prompts for deployment configuration
mac visual:ci-setup  # Dedicated visual CI configuration
```

Configuration is stored in `.claude/config/deployment.json`:
```json
{
  "deployment": {
    "provider": "vercel",
    "autoDetect": true,
    "fallbackUrl": "http://localhost:3000",
    "waitTimeout": 300000
  },
  "visualTesting": {
    "enableOnCI": true,
    "viewports": ["mobile", "desktop"],
    "threshold": 0.05
  }
}
```

### GitHub Actions Integration
The `playwright-web-tests.yml` workflow includes automatic deployment detection:
1. Checks for manual URL in secrets
2. Detects Vercel preview from PR comments
3. Waits for deployment to be ready
4. Falls back to localhost if needed

### Required Secrets
- `VERCEL_TOKEN` (optional) - For enhanced Vercel API access
- `DEPLOYMENT_URL` (optional) - Manual override URL
- `BASE_URL` (optional) - Fallback URL

### Testing Detection Locally
```bash
mac visual:detect-url  # Test detection with current environment
mac visual:ci-status   # View current configuration
```

## CI/CD Best Practices

### Preventing Redundant Commits
The CI/CD workflows are optimized to prevent spam commits:

1. **Smart Change Detection**: Only commits when meaningful changes occur
2. **Content Hashing**: Uses MD5 hashes to detect duplicate content  
3. **Daily Limits**: Test patterns documented once per day maximum
4. **Conditional Logic**: Skips commits for timestamp-only changes
5. **Failure Focus**: Test results only saved when tests fail

### Workflow Files Location
- **Active Workflows**: `.github/workflows/` (for this repository)
- **Templates**: `templates/workflows/` (for distribution to other projects)

### Key Optimizations Implemented
- **Memory Reports**: Uses `latest-report.md` instead of numbered report files
- **ADR Deduplication**: Checks for existing ADRs before creating new ones
- **Test Artifacts**: Blob reporter with numbered job indices for clean merging
- **Pattern Files**: Daily check prevents duplicate pattern documentation
- **Commit Filtering**: Excludes timestamp-only changes from commits

### Recent Improvements
- **No Redundant Commits**: Workflows only commit when meaningful changes occur
- **Smart Reports**: Single `latest-report.md` instead of numbered files  
- **Daily Test Patterns**: Test patterns documented once per day
- **Failure-Only Results**: Test results saved only when failures occur
- **Clean Git History**: No more "Update memory from CI" spam
- **Deployment URL Detection**: Automatic Vercel preview URL detection for visual CI testing
- **Visual CI Integration**: Test against live deployments instead of localhost

## Support Resources

- Review `claude-code-init-prompts.md` for complete initialization workflow
- Check `memory-system-addon-prompt.md` for memory system details
- See `Examples/agents/README.md` for orchestrator and specialist catalogs
- Consult `Examples/commands/README.md` for command templates and selection guidelines
- Run `mac --help` for CLI documentation
