# MultiAgent-Claude Project Context

## Project Overview

**Name**: MultiAgent-Claude  
**Purpose**: A multi-agent orchestration framework for Claude Code that maximizes context efficiency through specialized agents, structured memory, and intelligent task delegation  
**Version**: 1.0.0  
**License**: MIT

## Technology Stack

**Primary Technologies**:
- Node.js (>= 14.0.0)
- Commander.js (CLI framework)
- Chalk (Terminal styling)

**Development Environment**:
- Platform: Node.js/NPM ecosystem
- CLI-first architecture
- Markdown-based templates and documentation
- Git-based versioning

**Agent Technologies**:
- MCP (Model Context Protocol) servers
- Context7 for documentation research
- Sequential thinking for complex analysis
- WebSearch for current information
- Playwright for testing automation

## Architecture Summary

### Core Architecture Pattern: Research-Plan-Execute

The framework implements a separation of concerns where:

1. **Specialized Research Agents** create detailed implementation plans
2. **Main Execution System** reads plans and performs actual implementation
3. **Memory System** persists knowledge across sessions

### Key Design Principles

- **Context Efficiency**: Each agent uses only necessary context
- **Persistent Planning**: Plans saved to disk, not held in memory
- **Reusable Patterns**: Successful solutions become templates
- **Knowledge Accumulation**: Project learning persists across sessions
- **Specialized Expertise**: Agents excel in their specific domains
- **Traceable Decisions**: All architectural choices documented

### Directory Structure
```
MultiAgent-Claude/
├── Examples/                     # Template library
│   ├── agents/                   # Agent templates
│   └── commands/                 # Command workflow templates
├── cli/                          # CLI implementation
│   ├── commands/                 # CLI command handlers
│   └── index.js                  # Main CLI entry point
├── .claude/                      # Project-specific orchestration
│   ├── memory/                   # Persistent knowledge base
│   ├── tasks/                    # Session context
│   ├── doc/                      # Agent plans
│   ├── agents/                   # Project-specific agents
│   └── commands/                 # Project-specific commands
└── [standard project files]
```

## Core Business Logic

### Multi-Agent Orchestration Rules

1. **Agent Activation**: Agents are invoked based on trigger keywords and project context
2. **Plan-Only Execution**: Agents create plans but never implement directly
3. **Memory Integration**: All agents check memory before external research
4. **Context Hierarchy**: Session → Plans → Persistent memory → External sources

### Agent Categories

**Core Development Agents**:
- ai-agent-architect: AI systems, LangChain, MCP servers
- frontend-ui-expert: React, Next.js, UI components
- aws-backend-architect: AWS services, infrastructure design
- fullstack-feature-orchestrator: End-to-end feature implementation
- playwright-test-engineer: E2E testing, automation

**Specialized Agents**:
- documentation-architect: API docs, technical writing
- multimodal-ai-specialist: Vision models, RAG systems
- infrastructure-migration-architect: Re-platforming, migrations
- codebase-truth-analyzer: Code-documentation alignment
- ui-design-auditor: UX/UI analysis

### Command Patterns

All commands follow the "research → plan → execute" pattern:
1. **Phase 1**: Delegate to specialist agent for planning
2. **Phase 2**: Main system reads and validates plan
3. **Phase 3**: Main system executes implementation
4. **Phase 4**: Verify and document results

## Key Conventions

### Code Style
- **File Naming**: Kebab-case for CLI files, PascalCase for components
- **Template Structure**: YAML frontmatter + Markdown content
- **CLI Commands**: Verb-noun pattern (e.g., `agent create`, `memory add-pattern`)

### Git Workflow
- **Branch Strategy**: Main branch for releases
- **Commit Messages**: Conventional commits preferred
- **PR Process**: Plans documented before implementation

### Testing Approach
- **CLI Testing**: Playwright for command line interface testing
- **Template Validation**: Automated checks for required sections
- **Integration Testing**: Full workflow verification

### Naming Patterns
- **Agents**: `[domain]-[role]` (e.g., `frontend-ui-expert`)
- **Commands**: `/[action]` or `/[action]-[target]` (e.g., `/validate-templates`)
- **Plans**: `[agent]-[task]-[timestamp].md`
- **Memory Files**: Descriptive names with clear categorization

## API Surface

### CLI Commands

**Initialization**:
- `init`: Standard multi-agent setup
- `init --memory-only`: Memory-focused setup
- `init --with-docs`: Setup with documentation import
- `add-memory`: Add memory to existing project
- `setup`: Interactive setup wizard

**Agent Management**:
- `agent create`: Create new agent interactively
- `agent list`: List available agents
- `agent deploy <name>`: Deploy agent to Claude
- `agent add <name>`: Add template agent to project

**Memory System**:
- `memory status`: Check memory status
- `memory inspect --type patterns`: Inspect memory contents
- `memory search "term"`: Search memory
- `memory add-pattern`: Add new pattern
- `memory add-decision`: Add architectural decision

**Command Management**:
- `command create`: Create new command workflow
- `command list`: List available commands
- `command add <name>`: Add command template

### Internal APIs
- Template processing engine
- Memory indexing system
- Agent invocation patterns
- Plan parsing and execution

### Authentication
- No authentication required (CLI tool)
- File system permissions for .claude directory

## Development Workflow

### Setup Steps
1. Clone repository
2. Run `npm install`
3. Initialize with `multiagent-claude init`
4. Create specialized agents as needed
5. Use agents for planning, execute manually

### Build Process
- No build step required (Node.js scripts)
- Template validation via CLI commands
- Documentation generation from templates

### Testing Procedure
1. Template validation tests
2. CLI command integration tests
3. Agent workflow verification
4. Memory system integrity checks

## Deployment Information

### Environments
- **Development**: Local Node.js environment
- **Distribution**: NPM package installation
- **Usage**: Per-project .claude directory initialization

### Infrastructure
- File system based (no external dependencies)
- Local memory storage in .claude directory
- CLI executable via NPM bin

### CI/CD
- Optional GitHub Actions for memory updates
- Automated pattern detection from commits
- ADR generation from PRs
- Deduplication via content hashing

## Known Issues & Solutions

### Common Issues
1. **Context Overflow**: Solved by agent specialization
2. **Knowledge Loss**: Addressed by persistent memory system
3. **Implementation Complexity**: Simplified by plan-execute separation

### Best Practices
- Always check session context before agent invocation
- Use memory patterns before creating new solutions
- Document decisions as ADRs for future reference
- Validate templates before deployment

## Documentation Index

### Original Documentation Locations
- **Main README**: `/README.md`
- **Agent Templates**: `/Examples/agents/*.md`
- **Command Templates**: `/Examples/commands/*.md`
- **Initialization Prompts**: `/claude-code-init-*.md`
- **CLI Implementation**: `/cli/`

### Imported Documentation Structure
- **Project Overview**: `.claude/memory/project.md` (this file)
- **Agent Patterns**: `.claude/memory/patterns/agent-templates/`
- **Command Patterns**: `.claude/memory/patterns/command-patterns/`
- **Architectural Decisions**: `.claude/memory/decisions/`
- **Domain Knowledge**: `.claude/memory/knowledge/`

### Last Import
- **Date**: 2025-08-19
- **Coverage**: 100% of existing documentation
- **Status**: Complete initial import

## Meta-Implementation Context

This project is implementing MultiAgent-Claude on itself, creating:

1. **Custom Agents** for this specific project:
   - prompt-engineer-specialist
   - template-evolution-tracker
   - cli-test-engineer
   - documentation-sync-guardian
   - agent-factory

2. **Custom Commands** for framework management:
   - /validate-templates
   - /generate-agent
   - /test-cli
   - /sync-docs

3. **Self-Improvement Loop**: The framework manages its own development through specialized agents

This meta-implementation serves as both a validation of the framework and a demonstration of its capabilities.