# MultiAgent-Claude

**A multi-agent orchestration framework for Claude Code that maximizes context efficiency through specialized agents, structured memory, and intelligent task delegation.**

## Overview

MultiAgent-Claude provides a collection of prompt engineering templates and initialization scripts that transform Claude Code into a sophisticated multi-agent development environment. Rather than having a single AI assistant handle all tasks, this framework creates specialized agents that research and plan, while the main Claude instance executes implementations based on those plans.

## Quick Start

### Global Installation (Recommended)
```bash
# Install globally via npm
npm install -g multiagent-claude

# Or clone and link for development
git clone https://github.com/yourusername/MultiAgent-Claude.git
cd MultiAgent-Claude
npm link
```

### Initialize Your Project
```bash
# Interactive setup with prompts
multiagent-claude init
# or use the short alias
mac init

# You'll be prompted for:
# - Memory system setup
# - GitHub Actions for CI/CD
# - Playwright testing (CLI or web)
```

### Add Features to Existing Projects
```bash
# Add specific features
mac add ci-cd          # GitHub Actions workflows
mac add testing        # CLI testing with Playwright
mac add web-testing    # Web app testing
mac add all            # Everything
```

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

### Global Installation
```bash
# Install from npm (when published)
npm install -g multiagent-claude

# Or install from GitHub
npm install -g github:yourusername/MultiAgent-Claude

# Or clone and link for development
git clone https://github.com/yourusername/MultiAgent-Claude.git
cd MultiAgent-Claude
npm install
npm link
```

After installation, the CLI is available globally as:
- `multiagent-claude` - Full command
- `mac` - Short alias

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

### Testing Framework

The project includes comprehensive Playwright testing for CLI functionality and integration testing.

#### Current Test Status
- **19 tests passing** ✅
- **3 tests skipped** (unimplemented features)
- **5 test suites** covering all major functionality
- **Parallel execution** with sharding for speed

#### Test Coverage
- **CLI Commands**: All command functionality verified
- **Memory System**: Status, validation, and report generation
- **Agent Management**: List, inspect, and create operations
- **Error Handling**: Invalid commands and edge cases
- **Performance**: Command execution time and concurrency
- **Integration**: End-to-end workflow testing
- **Add Command**: CI/CD and testing feature additions

#### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI (interactive mode)
npm run test:ui

# Run specific test file
npm run test:cli

# Debug tests
npm run test:debug

# View test report
npm run test:report

# CI mode (GitHub Actions)
npm run test:ci
```

#### Test Structure
```
tests/
├── cli.test.js           # Core CLI functionality tests
├── integration.test.js   # Integration workflow tests
└── performance.test.js   # Performance benchmarks
```

#### CI/CD Integration
Tests run automatically on:
- Every push to main/develop branches
- All pull requests
- Results posted as PR comments
- Test artifacts saved for 30 days
- Failed test videos captured

#### Writing New Tests
```javascript
test('should perform specific action', async () => {
  const result = await runCLI('command args');
  expect(result.success).toBeTruthy();
  expect(result.stdout).toContain('expected output');
});
```

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

The repository includes GitHub Actions workflows for automated memory updates and testing.

#### Available Workflows

##### 1. Memory System Updates (`claude-memory-update.yml`)
- **Smart Commit Detection**: Only commits when meaningful changes occur
- **Report Generation**: Creates `latest-report.md` instead of numbered files
- **Pattern Detection**: Learns from commits (only on significant changes)
- **ADR Generation**: Documents architectural decisions from PRs
- **Duplicate Prevention**: Checks for existing ADRs before creating new ones
- **No Spam Commits**: Filters out timestamp-only changes and redundant reports

##### 2. CLI Testing (`playwright-cli-tests.yml`)
- **Automated Testing**: Runs on push and PRs
- **Sharded Execution**: Parallel test runs for speed (3 shards)
- **Memory Integration**: Documents test patterns (once per day maximum)
- **Report Merging**: Combines sharded test results using blob reporter
- **Artifact Management**: Uses numbered job indices to prevent conflicts
- **Daily Pattern Limit**: Prevents duplicate pattern documentation

##### 3. Web Testing (`playwright-web-tests.yml`)
- **Web App Testing**: Comprehensive browser testing with 4 shards
- **Failure-Only Tracking**: Only saves results when tests fail or are flaky
- **Visual Regression**: Screenshot comparisons with diff detection
- **Performance Metrics**: Tracks test duration and flakiness
- **PR Comments**: Automated test result summaries on pull requests
- **Smart Memory Updates**: Skips updates for successful test runs

#### Setup

##### During Initialization
```bash
mac init
# You'll be prompted:
# - Enable GitHub Actions for memory updates? (y/n)
# - Add Playwright testing framework? (y/n)
# - Include CLI tests? (y/n)
# - Include web application tests? (y/n)
```

##### Add to Existing Project
```bash
# Add all CI/CD features
mac add all

# Or add specific features
mac add ci-cd          # Memory system workflows
mac add testing        # CLI testing
mac add web-testing    # Web app testing
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

##### Memory Updates (Optimized)
1. **Change Detection**: Only runs when files actually change
2. **Smart Reports**: Uses `latest-report.md` instead of numbered files
3. **Conditional Commits**: Skips commits for timestamp-only changes
4. **Pattern Recognition**: Documents patterns only when discovered

##### Test Integration
1. **Daily Patterns**: Documents test patterns once per day
2. **Failure Focus**: Only saves test results when failures occur
3. **Deduplication**: Prevents duplicate pattern files
4. **Clean History**: No redundant commits in git log

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

## Package Distribution

The package is configured for npm distribution with:

```json
{
  "name": "multiagent-claude",
  "version": "1.0.0",
  "bin": {
    "multiagent-claude": "./cli/index.js",
    "mac": "./cli/index.js"
  },
  "files": [
    "cli/",
    "Examples/",
    "templates/",
    "*.md",
    "LICENSE"
  ]
}
```

### What's Included
- **CLI**: Full command-line interface implementation
- **Templates**: GitHub Actions workflows and test templates
- **Examples**: All agent and command templates
- **Documentation**: All markdown files

### Publishing
```bash
# When ready to publish to npm
npm publish

# Users can then install globally
npm install -g multiagent-claude
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
