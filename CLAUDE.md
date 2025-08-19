# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-agent development environment framework for Claude Code, providing setup prompts and templates for creating specialized agents, commands, and a memory system. The repository contains prompt engineering resources rather than traditional code.

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
└── memory/                        # Persistent knowledge base
    ├── project.md                 # Project-wide context
    ├── patterns/                  # Successful implementation patterns
    ├── decisions/                 # Architectural Decision Records (ADRs)
    └── index.json                 # Quick lookup index
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

## Command Templates

- `TEMPLATE-COMMAND.md` - Base template for research-plan-execute pattern
- `implement-feature.md` - Feature implementation workflow
- `WAVE_EXECUTE.md` - Wave execution pattern

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
# Use claude-code-init-prompts.md content to:
1. Analyze project structure
2. Create memory system at .claude/memory/
3. Generate specialized agents in .claude/agents/
4. Create commands in .claude/commands/
5. Update CLAUDE.md with orchestration rules
```

### Add Memory to Existing Setup
```bash
# Use memory-system-addon-prompt.md to:
1. Create memory infrastructure
2. Update existing agents with memory checks
3. Add pattern documentation
4. Implement ADR system
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

## Support Resources

- Review `claude-code-init-prompts.md` for complete initialization workflow
- Check `memory-system-addon-prompt.md` for memory system details
- Reference individual agent templates for specialization patterns
- Use command templates for consistent workflow implementation