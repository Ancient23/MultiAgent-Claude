# MultiAgent-Claude v2.0

**A multi-agent orchestration framework for Claude Code that maximizes context efficiency through specialized agents, structured memory, intelligent task delegation, and visual development capabilities.**

🚀 **Version 2.0 Features:**
- **YAML-Based Prompt Architecture**: Component-based system with 78% less redundancy
- **Orchestration Modes**: Auto, Plan-Only, Parallel, Sequential, Meta execution strategies
- **Parallel Agent Deployment**: Run multiple agents simultaneously with conflict prevention
- **Visual Development**: Playwright MCP integration for iterative UI refinement
- **Git Worktrees**: True parallel development in isolated environments
- **Verification System**: Automated validation of implementations against plans

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

# NEW v2.0 Commands
mac orchestrate        # Start orchestrated workflow with mode selection
mac parallel           # Deploy multiple agents in parallel
mac verify             # Create verification agent
mac mcp playwright     # Setup Playwright MCP for visual development
mac worktree feature1  # Create git worktree for parallel development
```

3. **Invoke specialized agents:**
   ```
   # For orchestration (complex tasks)
   "Use the master-orchestrator to analyze this task and select strategy"
   "Deploy the issue-triage-orchestrator to investigate this bug"
   "Use the code-review-orchestrator to review PR #123"
   "Launch the wave-execution-orchestrator for systematic fix"
   
   # For specialist tasks (focused work)
   "Use the frontend-ui-expert to design a dashboard component"
   "Launch the aws-backend-architect to plan our API structure"
   "Deploy the codebase-truth-analyzer to verify implementation"
   ```

## Why Multi-Agent Architecture?

### The Context Window Challenge

LLMs like Claude have a limited context window - the amount of text they can process at once. In complex projects, trying to hold all project knowledge, code, documentation, and current task details in a single context becomes inefficient and eventually impossible. Every token counts, and redundant information wastes valuable context space.

### The Research-Plan-Execute Pattern

Our multi-agent architecture solves this through separation of concerns:

1. **Specialized Research-Plan-Execute Agents** 
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
.ai/
├── memory/
│   ├── project.md           # Project-wide conventions and context
│   ├── patterns/            # Successful implementation patterns
│   ├── decisions/           # Architectural Decision Records (ADRs)
│   └── index.json          # Quick lookup and statistics
.claude/
├── tasks/
│   └── context_session_[session_id].md # Current session working memory
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
- **Persistent Memory** (`.ai/memory/`): Long-term project knowledge

This tiered approach ensures:
- Fast access to current task information
- Preservation of successful patterns
- Gradual knowledge accumulation
- Reduced repetition of solved problems

## HOP/LOP Template System

### Eliminating Redundancy with Reusable Templates

The HOP/LOP (Higher Order Prompt / Lower Order Prompt) system reduces implementation prompt redundancy from 78% to less than 5% through:

- **Higher Order Prompts (HOPs)**: Master templates with variable placeholders
- **Lower Order Prompts (LOPs)**: YAML configurations for specific scenarios
- **Variable Interpolation**: Dynamic content injection
- **Schema Validation**: Ensures LOPs are correctly structured

### Using the /implement Command in Claude

The `/implement` command allows direct execution of implementation plans:

```
# Execute immediately in current context
/implement ci-testing              # Setup CI testing
/implement visual-dev              # Setup visual development
/implement plan my-plan.md         # Execute from markdown plan

# Add tests to any implementation
/implement plan refactor.md --with-ci-tests
/implement plan feature.md --with-visual-tests

# Generate prompt without executing
/implement ci-testing --output-only

# Show help
/implement --help
```

### Available LOPs

- **ci-visual-testing.yaml**: CI-compatible Playwright testing
- **visual-feature-development.yaml**: Local visual development with MCP
- Custom LOPs can be created with `mac lop create`

## YAML-Based Prompt Architecture

### Component System

MultiAgent-Claude v2.0 uses a revolutionary YAML-based component system that eliminates 78% of prompt redundancy:

```
prompts/
├── core/                 # Shared components (100% reuse)
├── templates/            # Domain patterns (50-75% reuse)  
├── workflows/            # Complete compositions
└── manifest.json         # Component registry
```

**Key Benefits:**
- **Composable**: Build prompts from reusable components
- **Dynamic**: Variable substitution and conditional inclusion
- **Cacheable**: Built-in performance optimization
- **Maintainable**: Update once, apply everywhere

### How It Works

1. **Workflows** define which components to include:
```yaml
name: init-full
required:
  - core/session-context
  - core/memory-structure
conditional:
  - if: "options.cicd"
    then: templates/cicd-setup
```

2. **Components** contain the actual prompt content:
```yaml
name: session-context
variables:
  session_id: "${date}_${time}_${session_type}"
content: |
  Initialize session ${session_id}...
```

3. **Variables** enable dynamic customization:
- Built-in: `${date}`, `${time}`, `${uuid}`
- Context: `${project.name}`, `${options.testing}`
- Transformations: `${name | upper}`, `${text | truncate(50)}`

See [prompts/README.md](prompts/README.md) for complete documentation.

## Agent Architecture

### Meta-Framework Design

MultiAgent-Claude is a **meta-framework** that uses itself to develop itself. This creates two distinct categories of agents:

#### Meta-Agents (.claude/agents/)
Agents used exclusively for developing the MultiAgent-Claude framework:
- Never distributed to user projects
- Access via `mac meta` commands (coming soon)
- Examples: meta-development-orchestrator, cli-test-engineer

#### Template Agents (Examples/agents/)
Agents distributed to user projects via `mac init`:
- Organized into `orchestrators/` (Opus) and `specialists/` (Sonnet)
- Available through standard `mac agent` commands
- Form the actual toolkit for end users

### Two-Tier Hierarchy
MultiAgent-Claude uses a two-tier hierarchy of orchestrators and specialists:

#### Orchestrators (Opus Model)
High-level coordinators that manage complex workflows and other agents:
- **master-orchestrator**: Top-level task analysis and strategy selection
- **fullstack-feature-orchestrator**: End-to-end feature coordination
- **infrastructure-migration-architect**: Complete infrastructure transformations
- **parallel-controller**: Concurrent agent execution management
- **wave-execution-orchestrator**: 7-phase systematic task execution
- **issue-triage-orchestrator**: Comprehensive issue analysis and resolution
- **code-review-orchestrator**: Multi-aspect code review coordination

**Note**: The `meta-development-orchestrator` exists in `.claude/agents/` for framework self-improvement, not in template library.

#### Specialists (Sonnet Model)
Domain experts that create plans and perform focused tasks:

**Development Specialists:**
- **ai-agent-architect**: AI systems, LangChain, MCP servers
- **frontend-ui-expert**: React, Next.js, UI components
- **aws-backend-architect**: AWS services, infrastructure design
- **backend-api-frontend-integrator**: API integration planning
- **cpp-plugin-api-expert**: Cross-platform C++ libraries

**Quality & Testing Specialists:**
- **playwright-test-engineer**: E2E testing, visual regression
- **codebase-truth-analyzer**: Code-documentation alignment verification
- **ui-design-auditor**: UX/UI analysis, design improvements
- **cli-test-engineer**: CLI testing and validation

**Documentation & Meta Specialists:**
- **documentation-architect**: API docs, tutorials, technical writing
- **documentation-sync-guardian**: Documentation consistency maintenance
- **prompt-engineer-specialist**: Agent prompt optimization
- **template-evolution-tracker**: Template change analysis
- **agent-factory**: New agent creation

**Deployment Specialists:**
- **aws-deployment-specialist**: AWS deployment orchestration
- **vercel-deployment-troubleshooter**: Vercel deployment issues
- **multimodal-ai-specialist**: Vision models, RAG systems

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

#### HOP/LOP Prompt System
```bash
# List available LOPs (Lower Order Prompts)
multiagent-claude lop list

# Validate a LOP against schema
multiagent-claude lop validate <file>

# Create new LOP interactively
multiagent-claude lop create

# Execute LOP to generate implementation prompt
multiagent-claude lop execute <file>
```

#### Agent/Role Conversion & Sync
```bash
# Convert between Claude and ChatGPT formats
mac convert-agent claude chatgpt agent.md
mac convert-agent chatgpt claude role.md
mac convert-agent claude chatgpt ./agents/ --batch

# Start bidirectional sync service
mac sync start               # Manual conflict resolution
mac sync start newest        # Newest file wins
mac sync status              # Check sync status
mac sync resolve <name> <claude|chatgpt|skip>
mac sync clear errors        # Clear error log

# Web-based sync monitoring dashboard
mac sync-dashboard           # Start on port 8080
mac sync-dashboard 3000      # Custom port
```

#### Validation & Quality
```bash
# Validate agents and templates
mac validate agent <path>    # Validate single agent
mac validate all             # Validate all agents
mac validate conversion <path>  # Test conversion
mac validate yaml <template>    # Validate YAML template

# Evolution tracking
mac evolution track <path>   # Track agent version
mac evolution report         # Generate evolution report
mac evolution learn          # Learn from patterns
mac evolution compare <path> --from 1.0.0 --to 2.0.0

# Quality metrics
mac metrics collect          # Collect metrics
mac metrics show            # Display metrics
mac metrics html            # Generate HTML dashboard
mac metrics watch           # Live metrics monitor
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

#### OpenAI Integration Commands
```bash
# Initialize OpenAI/ChatGPT compatibility
multiagent-claude openai init
# Creates AGENTS.md configuration
# Sets up .chatgpt/ directory structure
# Configures dual-platform support

# Bundle files for ChatGPT upload
multiagent-claude openai bundle [files...]
# Optimizes and compresses files for token limits
# Uses COMPACT algorithm for maximum compression
# Creates timestamped bundles in .chatgpt/bundles/

# Sync configurations between platforms
multiagent-claude openai sync
# Synchronizes CLAUDE.md ↔ AGENTS.md
# Updates agent definitions across platforms
# Resolves configuration conflicts
# Generates sync report

# Convert Claude agent to ChatGPT role
multiagent-claude openai convert-agent <agent-name>
# Transforms agent template to role instructions
# Optimizes for ChatGPT's 1500-character limit
# Creates role file in .chatgpt/roles/
# Maintains behavior parity

# List available bundles
multiagent-claude openai list-bundles
# Shows all bundles in .chatgpt/bundles/
# Displays size and token count
# Indicates sync status

# Extract bundle contents
multiagent-claude openai extract <bundle-file>
# Decompresses and restores original files
# Validates bundle integrity
# Preserves directory structure
```

#### v2.0 Orchestration Commands
```bash
# Start orchestrated workflow with mode selection
multiagent-claude orchestrate

# Deploy agents in parallel
multiagent-claude parallel

# Create verification agent
multiagent-claude verify

# Setup MCP servers (playwright/filesystem/github)
multiagent-claude mcp [server]

# Create git worktrees for parallel development
multiagent-claude worktree feature1 feature2
```

#### Prompt System Commands
```bash
# List available workflows
multiagent-claude prompt list
# Shows all YAML workflows in prompts/
# Displays workflow type and description
# Indicates composition dependencies

# Show workflow details
multiagent-claude prompt show init-full
# Displays workflow metadata and components
# Shows variable definitions and requirements
# Lists included prompt files

# Create new workflow
multiagent-claude prompt create <name>
# Interactive workflow builder
# Select components to include
# Define variables and metadata
# Generates YAML configuration

# Validate all workflows
multiagent-claude prompt validate
# Checks YAML syntax and structure
# Verifies component references exist
# Validates variable interpolation
# Reports any schema violations

# Test workflow composition
multiagent-claude prompt test init-full --preview
# Composes workflow with test variables
# Shows final assembled prompt
# Validates output format
# Checks token count estimation

# Export workflow with dependencies
multiagent-claude prompt export init-full
# Bundles workflow and all components
# Resolves variable interpolation
# Creates standalone prompt file
# Optionally compresses for sharing

# Cache management
multiagent-claude prompt cache-stats
# Shows cache size and hit rate
# Lists cached workflows
# Displays memory usage

multiagent-claude prompt cache-clear
# Clears composed prompt cache
# Resets validation cache
# Frees memory resources

# Variable management
multiagent-claude prompt vars <workflow>
# Lists all variables in workflow
# Shows default values and types
# Indicates required vs optional

# Component management
multiagent-claude prompt components
# Lists all available components
# Shows component dependencies
# Displays usage statistics
```

## v2.0 Orchestration Modes

### Auto Mode
Let the master-orchestrator analyze your task and select the optimal strategy:
- Evaluates complexity (1-10 scale)
- Considers parallelization opportunities
- Selects appropriate agent combination
- Creates comprehensive execution plan

### Plan-Only Mode
All agents operate in planning mode without implementation:
- Ideal for architectural reviews
- Pre-implementation validation
- Multi-perspective analysis
- Risk assessment before execution

### Parallel Mode
Deploy multiple agents simultaneously:
- Frontend and backend development in parallel
- Automatic conflict prevention
- File locking mechanism
- Status tracking in `.claude/parallel-status.json`

### Sequential Mode
Step-by-step execution for dependent tasks:
- Ensures proper order of operations
- Ideal for migration workflows
- Clear progress tracking
- Rollback points between steps

### Meta Mode
For complex architectural changes:
- Framework migrations
- System-wide refactoring
- Multi-phase execution
- Comprehensive verification at each phase

## Common Orchestration Workflows

### Issue Triage and Resolution
```bash
# For bug investigation and fixing
"Deploy the issue-triage-orchestrator to investigate login failures"

# The orchestrator will:
# 1. Analyze symptoms and determine severity
# 2. Deploy specialists to find root cause
# 3. Create fix plan
# 4. Coordinate implementation
# 5. Verify resolution
```

### Code Review
```bash
# For comprehensive code reviews
"Use the code-review-orchestrator to review the authentication changes"

# The orchestrator will:
# 1. Analyze changes across all domains
# 2. Check security, performance, quality
# 3. Verify test coverage
# 4. Provide actionable feedback
```

### Wave Execution (7-Phase)
```bash
# For complex, systematic task execution
"Launch the wave-execution-orchestrator for the payment system implementation"

# Executes through 7 waves:
# Wave 1: Discovery & Validation
# Wave 2: Implementation Planning
# Wave 3: Deployment Strategy
# Wave 4: Testing
# Wave 5: Monitoring
# Wave 6: Documentation
# Wave 7: Retrospective
```

### Meta-Development
```bash
# For framework self-improvement
"Use the meta-development-orchestrator to improve our agent templates"

# The orchestrator will:
# 1. Analyze current framework state
# 2. Identify improvement opportunities
# 3. Coordinate framework's own agents
# 4. Implement improvements
# 5. Update documentation
```

## Visual Development with Playwright MCP

The v2.0 upgrade includes first-class support for visual development:

### Setup
```bash
# Install Playwright MCP
mac mcp playwright

# Creates directories:
# .claude/mocks/           - Design mockups
# .claude/visual-iterations/ - Screenshot history
# .claude/visual-reports/   - Implementation reports
```

### Iteration Workflow
1. **Capture Baseline**: Screenshot current implementation
2. **Compare with Mock**: Identify differences
3. **Iterate**: Make improvements (2-3 cycles recommended)
4. **Verify**: Achieve < 5% visual difference
5. **Test Responsive**: Validate at multiple viewports

### Playwright MCP Tools
- `playwright_navigate` - Navigate to URLs
- `playwright_screenshot` - Capture screenshots
- `playwright_set_viewport` - Test responsive designs
- `playwright_click/fill` - Interact with elements

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
    "command:create": "multiagent-claude command create",
    "orchestrate": "multiagent-claude orchestrate",
    "verify": "multiagent-claude verify",
    "visual:test": "playwright test tests/visual/",
    "visual:update": "playwright test tests/visual/ --update-snapshots"
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
- Failed tests create entries in `.ai/memory/test-results/failures/`
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

## Testing

### Running Tests Locally

The project uses Playwright for comprehensive testing including CLI commands, unit tests, and visual regression.

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:cli          # CLI command tests only
npm run test:visual        # Visual regression tests only

# Run tests in different modes
npm run test:headed        # Run with browser visible
npm run test:debug         # Debug mode with inspector
npm run test:ui            # Interactive UI mode

# Update visual baselines (when intentional changes are made)
npm run test:update-snapshots
```

### CI/CD Testing

Tests run automatically on GitHub Actions with:
- **4-way parallel sharding** for optimal performance
- **Visual regression testing** with automatic baseline updates
- **Cross-platform testing** on Ubuntu (CI) and all platforms locally
- **Comprehensive test reports** with artifacts on failure

CI test command:
```bash
npm run test:ci  # Runs with blob reporter for CI
```

### Test Organization

```
tests/
├── cli-playwright.spec.js      # CLI command tests
├── visual-regression.spec.js   # Visual regression tests
├── cli.cli.spec.js             # Legacy CLI tests
└── utils/
    ├── cli-helpers.js          # CLI testing utilities
    └── visual-helpers.js       # Visual baseline management
```

### Writing New Tests

Use the provided test utilities for consistency:

```javascript
const { CLITestHelper } = require('./utils/cli-helpers');

test('my new test', async () => {
  const helper = new CLITestHelper();
  await helper.createTestDirectory();
  
  const result = await helper.runCommand('setup --variant base');
  expect(result.success).toBe(true);
  
  await helper.cleanupAll();
});
```

### Visual Regression Testing

Visual tests automatically capture and compare CLI output:
- Baselines stored in `.playwright/baseline/`
- Automatic updates on main branch via CI
- Local updates with `npm run test:update-snapshots`
- Diffs shown in test reports on failure

## Contributing

To create new agents:
1. Use `Examples/agents/specialists/TEMPLATE-agent.md` as your starting point
2. Define clear trigger keywords and use cases
3. Specify required MCP tools
4. Document output format and location
5. Test the agent in isolation before integration

## License

MIT
