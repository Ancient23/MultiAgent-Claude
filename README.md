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
   - Use `playwright-testing-init.md` to add Playwright testing
   - Use individual agent templates from `Examples/agents/` as needed

3. **Invoke specialized agents:**
   ```
   "Use the frontend-ui-expert agent to design a dashboard component"
   "Launch the aws-backend-architect to plan our API structure"
   "Deploy the playwright-test-engineer to create E2E tests"
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
- **playwright-test-engineer**: E2E testing, visual regression, test automation

### Specialized Agents
- **documentation-architect**: API docs, tutorials, technical writing
- **multimodal-ai-specialist**: Vision models, RAG systems
- **infrastructure-migration-architect**: Re-platforming, migrations
- **codebase-truth-analyzer**: Code-documentation alignment
- **ui-design-auditor**: UX/UI analysis, design improvements

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

### Playwright Testing

The framework includes comprehensive Playwright testing support for automated UI testing in CI/CD.

#### Features
- **E2E Testing**: Automated user journey testing
- **Visual Regression**: Screenshot comparison to catch UI changes
- **Interaction Testing**: Form validation and click testing
- **Accessibility Testing**: WCAG compliance verification
- **CI/CD Integration**: Automatic test execution in GitHub Actions

#### Quick Setup
```bash
# Initialize Playwright testing
multiagent-claude playwright init

# Generate tests from UI interactions
multiagent-claude playwright generate-tests

# Add visual regression tests
multiagent-claude playwright add-visual-tests

# Setup CI/CD workflow
multiagent-claude playwright setup-ci
```

#### Test Structure
```
.playwright/
├── tests/
│   ├── e2e/           # End-to-end user journey tests
│   ├── visual/        # Visual regression tests
│   ├── interaction/   # Form and click interaction tests
│   └── accessibility/ # WCAG compliance tests
├── baseline/          # Visual regression baseline images
├── page-objects/      # Page object models for maintainability
└── fixtures/          # Test data and fixtures
```

#### Running Tests
```bash
# Run all tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Update visual baselines
npm run test:update-snapshots

# Run specific test type
npm run test:visual
```

#### CI/CD Workflow
Tests run automatically on:
- Push to main/develop branches
- Pull requests to main
- Daily regression schedule (optional)

The workflow includes:
- Parallel test execution (sharding)
- Screenshot/video capture on failure
- PR comments with test results
- Memory system updates with test outcomes

#### Memory Integration
Test results are automatically documented:
- Failed tests create entries in `.claude/memory/test-results/failures/`
- Visual regressions tracked over time
- Test patterns documented for reuse
- Coverage metrics stored for analysis

#### Using the Playwright Test Engineer
```bash
# Use the specialized agent to create test plans
"Use the playwright-test-engineer agent to create checkout flow tests"

# The agent will:
# 1. Analyze your application
# 2. Create comprehensive test scenarios
# 3. Generate page objects
# 4. Design CI/CD configuration
# 5. Save plan to .claude/doc/playwright-tests-*.md
```

### CI/CD Integration

The repository includes optional GitHub Actions workflow for automated memory updates.

#### Features
- **Automatic Pattern Detection**: Learns from your commits with deduplication
- **ADR Generation**: Creates architectural decisions from Pull Requests
- **Duplicate Prevention**: Content-based hashing prevents duplicate entries
- **Source Tracking**: All CI-generated files tagged with metadata headers
- **Conflict Resolution**: Smart merging strategies for manual vs automated updates

#### Setup
Enable during initialization:
```bash
multiagent-claude setup
# Answer "y" when asked about GitHub Actions
```

Or add to existing project:
```bash
# Copy workflow manually
cp node_modules/multiagent-claude/.github/workflows/claude-memory-update.yml .github/workflows/
```

#### GitHub Actions Permissions

The workflow needs permission to push changes back to your repository. Choose one of these approaches:

**Option 1: Grant Write Permissions (Recommended)**
The workflow already includes the necessary permissions:
```yaml
jobs:
  update-memory:
    permissions:
      contents: write  # Allows pushing to repository
```

**Option 2: Use Personal Access Token (For Protected Branches)**
If you have branch protection rules:

1. Create a Personal Access Token with `repo` scope
2. Add it as a repository secret named `GH_PAT`
3. Update the workflow checkout step:
```yaml
- name: Checkout code
  uses: actions/checkout@v3
  with:
    token: ${{ secrets.GH_PAT }}
```

**Note**: No additional secrets are needed for basic operation - the default `GITHUB_TOKEN` works with proper permissions.

#### How It Works
1. **On Every Commit**: Analyzes changes for patterns
2. **On PR Merge**: Creates ADR with decision rationale
3. **Deduplication**: Checks content hash before creating entries
4. **Metadata Headers**: Tags all entries with source (manual/CI)

#### Preventing Duplicates
The system prevents duplicates through:
- **Content Hashing**: MD5 hash of content (excluding metadata)
- **PR Number Tracking**: ADRs include PR number in metadata
- **Source Tagging**: Clear distinction between manual and CI entries
- **Conflict Strategies**: Configurable merge/replace/keep-both options

Example metadata header:
```markdown
---
source: github-action
created_by: ci
created_at: 2024-08-19T10:00:00Z
related_pr: 123
related_commit: abc123def
version: 1.0
---
```

## Contributing

To create new agents:
1. Use `Examples/agents/TEMPLATE-agent.md` as your starting point
2. Define clear trigger keywords and use cases
3. Specify required MCP tools
4. Document output format and location
5. Test the agent in isolation before integration

## License

MIT
