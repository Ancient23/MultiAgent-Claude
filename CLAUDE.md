# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-agent development environment framework for Claude Code, providing setup prompts and templates for creating specialized agents, commands, and a memory system. The repository contains prompt engineering resources rather than traditional code.

## 🚀 META-IMPLEMENTATION ACTIVE

This project is running MultiAgent-Claude on itself! The framework manages its own development through specialized agents and commands.

## Project Structure

```
MultiAgent-Claude/
├── Examples/
│   ├── agents/          # Agent template library for specialized tasks
│   │   ├── TEMPLATE-agent.md         # Base template for creating new agents
│   │   └── [various specialized agents].md
│   └── commands/        # Command template library
│       ├── TEMPLATE-COMMAND.md        # Base template for creating commands
│       └── [various command implementations].md
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
│   └── tests/           # Test templates
│       └── cli.cli.spec.js
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
├── tasks/context_session_*.md    # Session working memory
├── doc/[agent]-[task]-*.md       # Agent output plans
├── memory/                        # Persistent knowledge base
│   ├── project.md                 # Project-wide context
│   ├── patterns/                  # Successful implementation patterns
│   ├── decisions/                 # Architectural Decision Records (ADRs)
│   └── index.json                 # Quick lookup index
├── agents/                        # Project-specific agents
│   ├── prompt-engineer-specialist.md
│   ├── template-evolution-tracker.md
│   ├── cli-test-engineer.md
│   ├── documentation-sync-guardian.md
│   └── agent-factory.md
└── commands/                      # Project-specific commands
    ├── validate-templates.md
    ├── generate-agent.md
    ├── test-cli.md
    └── sync-docs.md
```

### 3. Agent Workflow
1. Read session context from `.claude/tasks/context_session_*.md`
2. Check memory system in `.claude/memory/`
3. Research using MCP tools (Context7, Sequential, etc.)
4. Create detailed plan at `.claude/doc/[agent]-[task]-[timestamp].md`
5. Return path to parent: "Plan created at .claude/doc/..."

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

### Specialized Agents
- `aws-deployment-specialist.md` - AWS deployment and troubleshooting
- `backend-api-frontend-integrator.md` - API-frontend integration
- `cpp-plugin-api-expert.md` - Cross-platform C++ libraries
- `ui-design-auditor.md` - UI/UX design analysis
- `vercel-deployment-troubleshooter.md` - Vercel deployment issues

### Project-Specific Agents (Meta-Implementation)
- `prompt-engineer-specialist` - Expert in creating effective agent prompts
- `template-evolution-tracker` - Track and improve template changes
- `cli-test-engineer` - Create comprehensive tests for CLI
- `documentation-sync-guardian` - Keep documentation synchronized
- `agent-factory` - Specialize in creating new agents

## Command Templates

- `TEMPLATE-COMMAND.md` - Base template for research-plan-execute pattern
- `implement-feature.md` - Feature implementation workflow
- `WAVE_EXECUTE.md` - Wave execution pattern

### Project-Specific Commands (Meta-Implementation)
- `/validate-templates` - Validate all templates for consistency
- `/generate-agent` - Interactive agent creation with best practices
- `/test-cli` - Comprehensive CLI testing
- `/sync-docs` - Synchronize all documentation

## Key Conventions

### Agent Creation Rules
1. Agents must be research-focused and plan-only
2. Always check session context before starting work
3. Output plans to `.claude/doc/` with proper naming
4. Never implement directly - only create plans
5. Return file path to parent, not plan content

### Memory System Usage
1. Check `.claude/memory/project.md` for project conventions
2. Scan `.claude/memory/patterns/` for existing solutions
3. Reference ADRs in `.claude/memory/decisions/`
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
   - Create memory system at .claude/memory/
   - Generate specialized agents in .claude/agents/
   - Create commands in .claude/commands/
   - Update CLAUDE.md with orchestration rules
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

### Testing
- `npm test` - Run all tests (19 passing, 3 skipped)
- `npm run test:ui` - Interactive test mode
- `npm run test:debug` - Debug tests

## CI/CD Optimization

### Recent Improvements
- **No Redundant Commits**: Workflows only commit when meaningful changes occur
- **Smart Reports**: Single `latest-report.md` instead of numbered files
- **Daily Test Patterns**: Test patterns documented once per day
- **Failure-Only Results**: Test results saved only when failures occur
- **Clean Git History**: No more "Update memory from CI" spam

## Support Resources

- Review `claude-code-init-prompts.md` for complete initialization workflow
- Check `memory-system-addon-prompt.md` for memory system details
- Reference individual agent templates for specialization patterns
- Use command templates for consistent workflow implementation
- Run `mac --help` for CLI documentation