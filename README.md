# MultiAgent-Claude

**A multi-agent orchestration framework for Claude Code that maximizes context efficiency through specialized agents, structured memory, and intelligent task delegation.**

## Overview

MultiAgent-Claude provides a collection of prompt engineering templates and initialization scripts that transform Claude Code into a sophisticated multi-agent development environment. Rather than having a single AI assistant handle all tasks, this framework creates specialized agents that research and plan, while the main Claude instance executes implementations based on those plans.

## Quick Start

1. **Initialize the multi-agent environment:**
   - Copy the content from `claude-code-init-prompts.md`
   - Paste it into a new Claude Code conversation
   - Claude will analyze your project and set up the agent infrastructure

2. **Add to existing projects:**
   - Use `memory-system-addon-prompt.md` to add just the memory system
   - Use individual agent templates from `Examples/agents/` as needed

3. **Invoke specialized agents:**
   ```
   "Use the frontend-ui-expert agent to design a dashboard component"
   "Launch the aws-backend-architect to plan our API structure"
   ```

## Why Multi-Agent Architecture?

### The Context Window Challenge

LLMs like Claude have a limited context window - the amount of text they can process at once. In complex projects, trying to hold all project knowledge, code, documentation, and current task details in a single context becomes inefficient and eventually impossible. Every token counts, and redundant information wastes valuable context space.

### The Research-Plan-Execute Pattern

Our multi-agent architecture solves this through separation of concerns:

1. **Specialized Research Agents** 
   - Load only the context needed for their specific domain
   - Use MCP tools to gather information without polluting main context
   - Create detailed, actionable plans saved to disk
   - Return only a file path to the parent agent

2. **Main Execution Agent**
   - Maintains project-wide context and current task focus
   - Reads plans from disk when needed
   - Executes implementations with full codebase access
   - Orchestrates multiple specialized agents

This separation means:
- Research agents can dive deep without worrying about context limits
- The main agent keeps a clean working context
- Plans persist on disk for reference without consuming memory
- Multiple agents can work on different aspects in parallel

### Why Agents Don't Execute Directly

Having agents only create plans rather than directly modifying code provides several critical benefits:

1. **Context Isolation**: Research agents don't need write access to your entire codebase
2. **Verification Layer**: The main agent can review plans before execution
3. **Audit Trail**: All decisions are documented in plan files
4. **Rollback Capability**: Plans can be adjusted without touching code
5. **Parallel Planning**: Multiple agents can create plans simultaneously

## The Memory System

### Structure and Purpose

```
.claude/
├── memory/
│   ├── project.md           # Project-wide conventions and context
│   ├── patterns/            # Successful implementation patterns
│   ├── decisions/           # Architectural Decision Records (ADRs)
│   └── index.json          # Quick lookup and statistics
├── tasks/
│   └── context_session_*.md # Current session working memory
└── doc/
    └── [agent]-[task]-*.md  # Agent-generated plans
```

### How Memory Enhances Development

1. **Pattern Recognition**: Successful solutions are saved and reused
2. **Consistency**: Project conventions are maintained across sessions
3. **Decision History**: Architectural choices are documented with rationale
4. **Knowledge Persistence**: Learning survives between conversations
5. **Quick Retrieval**: Index enables fast pattern matching

### Memory Hierarchy

- **Session Context** (`.claude/tasks/`): Immediate task focus
- **Agent Plans** (`.claude/doc/`): Detailed implementation blueprints  
- **Persistent Memory** (`.claude/memory/`): Long-term project knowledge

This tiered approach ensures:
- Fast access to current task information
- Preservation of successful patterns
- Gradual knowledge accumulation
- Reduced repetition of solved problems

## Available Agents

### Core Development Agents
- **ai-agent-architect**: AI systems, LangChain, MCP servers
- **frontend-ui-expert**: React, Next.js, UI components
- **aws-backend-architect**: AWS services, infrastructure design
- **fullstack-feature-orchestrator**: End-to-end feature implementation

### Specialized Agents
- **documentation-architect**: API docs, tutorials, technical writing
- **multimodal-ai-specialist**: Vision models, RAG systems
- **infrastructure-migration-architect**: Re-platforming, migrations
- **codebase-truth-analyzer**: Code-documentation alignment

See `Examples/agents/` for the complete library of agent templates.

## Key Benefits

- **🧠 Context Efficiency**: Each agent uses only necessary context
- **📋 Persistent Planning**: Plans saved to disk, not held in memory
- **🔄 Reusable Patterns**: Successful solutions become templates
- **📚 Knowledge Accumulation**: Project learning persists across sessions
- **🎯 Specialized Expertise**: Agents excel in their specific domains
- **🔍 Traceable Decisions**: All architectural choices documented

## Installation & Usage

### Quick Install
```bash
# Clone the repository
git clone https://github.com/yourusername/MultiAgent-Claude.git
cd MultiAgent-Claude

# Install dependencies
npm install

# Option 1: Use directly with Node
node cli/index.js init

# Option 2: Use shell script
./init.sh  # Mac/Linux
init.bat   # Windows

# Option 3: Install globally
npm install -g .
multiagent-claude init
```

### CLI Commands

#### Initialization
```bash
# Standard multi-agent setup
multiagent-claude init

# Memory-focused setup
multiagent-claude init --memory-only

# Setup with documentation import
multiagent-claude init --with-docs

# Add memory to existing project
multiagent-claude add-memory

# Interactive setup wizard
multiagent-claude setup
```

#### Agent Management
```bash
# Create new agent interactively
multiagent-claude agent create

# List available agents
multiagent-claude agent list

# Deploy agent to Claude
multiagent-claude agent deploy <name>

# Add template agent to project
multiagent-claude agent add <name>
```

#### Memory System
```bash
# Check memory status
multiagent-claude memory status

# Inspect memory contents
multiagent-claude memory inspect --type patterns

# Search memory
multiagent-claude memory search "authentication"

# Add new pattern
multiagent-claude memory add-pattern

# Add architectural decision
multiagent-claude memory add-decision

# Learn from git history
multiagent-claude memory learn --from-git-history

# Update from specific commit
multiagent-claude memory update-from-commit --commit <sha>
```

#### Command Management
```bash
# Create new command workflow
multiagent-claude command create

# List available commands
multiagent-claude command list

# Add command template
multiagent-claude command add <name>
```

### NPM Scripts
```json
{
  "scripts": {
    "setup": "multiagent-claude setup",
    "init": "multiagent-claude init",
    "init:memory": "multiagent-claude init --memory-only",
    "init:docs": "multiagent-claude init --with-docs",
    "memory:status": "multiagent-claude memory status",
    "agent:create": "multiagent-claude agent create",
    "command:create": "multiagent-claude command create"
  }
}
```

### CI/CD Integration

The repository includes GitHub Actions workflow that:
- Automatically updates memory from commits
- Creates ADRs from merged PRs
- Detects and documents patterns
- Validates memory system integrity

To enable CI integration:
1. Ensure `.github/workflows/claude-memory-update.yml` is in your repo
2. Memory updates will run automatically on pushes to main
3. PRs will generate architectural decisions when merged

## Contributing

To create new agents:
1. Use `Examples/agents/TEMPLATE-agent.md` as your starting point
2. Define clear trigger keywords and use cases
3. Specify required MCP tools
4. Document output format and location
5. Test the agent in isolation before integration

## License

MIT
