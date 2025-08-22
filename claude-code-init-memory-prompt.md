# Claude Code Multi-Agent Development Environment Initialization - Production Ready

## Master Initialization Prompt (Use After `/init`)

```markdown
Analyze this codebase and create a comprehensive Claude Code development environment with multi-agent orchestration and proper memory management.

## CRITICAL FILE PATHS TO USE

### Session Memory (Already Established)
- Session context: .claude/tasks/context_session_[session_id].md (uses Claude session ID)
- Agents MUST check this file first for session context
- Main system maintains this file across agent calls

### Agent Output (Established Pattern)
- Agent plans: .claude/doc/[agent-name]-[task]-[timestamp].md
- Agents create plans here and return the path to parent
- Parent agent/system reads from this location

## Phase 1: Project Analysis & Context Setup

### 1.0 Initialize Session Context
**CRITICAL: Create the session context file before any other work:**
1. Get Claude session ID (from environment or generate unique ID)
2. Create directory: `mkdir -p .claude/tasks`
3. Create `.claude/tasks/context_session_[session_id].md` with:
   ```markdown
   # Session Context: Memory System Initialization
   
   **Session ID**: [claude_session_id]_memory_init
   **Date**: [current_date]
   **Type**: Memory System Setup
   **Status**: Active
   
   ## Objectives
   - Create comprehensive memory system
   - Set up pattern library
   - Initialize ADR system
   - Configure session management
   
   ## Current State
   - Starting memory initialization
   - Project path: [path]
   ```
4. **Update this file after each step**

### 1.1 Read Existing Structure
First, check for existing Claude Code setup:
- Read CLAUDE.md for current configuration
- Check .claude/tasks/ for any context_session_[session_id].md files
- Scan .claude/doc/ for previous agent plans
- Analyze project structure and technology stack
- **Update context_session with findings**

### 1.2 CREATE Memory System Infrastructure
**ACTION: Create these files and directories:**

```bash
# Create directory structure
mkdir -p .ai/memory/patterns
mkdir -p .ai/memory/decisions
mkdir -p .ai/memory/sessions/archive

# Create initial files with the content below
```

**CREATE: .ai/memory/project.md**
```markdown
# Project Context

## Technology Stack
[Auto-detected from package.json, requirements.txt, etc.]

## Architecture Patterns
[Detected patterns: MVC, microservices, etc.]

## Key Conventions
- Import style: [detected]
- File organization: [detected]
- Naming patterns: [detected]

## Integration Points
- External services: [list]
- Databases: [list]
- APIs: [list]

## Active Features
- [List main features being worked on]

## Technical Debt Register
- [Known issues and planned improvements]
```

**CREATE: .ai/memory/patterns/README.md**
```markdown
# Pattern Library

Document successful implementation patterns here.
Each pattern should include:
- Context and problem solved
- Implementation approach
- Code examples
- Success metrics
- When to use/not use
```

**CREATE: .ai/memory/decisions/README.md**
```markdown
# Architectural Decision Records

## Template for New Decisions

### ADR-[NUMBER]: [TITLE]
**Date**: YYYY-MM-DD
**Status**: Proposed/Accepted/Deprecated
**Context**: What prompted this decision?
**Decision**: What was decided?
**Consequences**: What are the implications?
**Alternatives Considered**: What else was evaluated?
```

**CREATE: .ai/memory/index.json**
```json
{
  "lastUpdated": "[current timestamp]",
  "project": {
    "name": "[detected project name]",
    "type": "[detected type: frontend/backend/fullstack]",
    "initialized": "[current timestamp]"
  },
  "sessions": {
    "active": null,
    "history": []
  },
  "patterns": {},
  "decisions": {},
  "agents": {
    "activations": {},
    "performance": {},
    "lastUsed": {}
  },
  "statistics": {
    "totalSessions": 0,
    "successfulPatterns": 0,
    "documentedDecisions": 0
  }
}
```

**CREATE: .ai/memory/HOW_TO_USE.md**
```markdown
# Memory System Usage Guide

## For Main System (You)
1. **Starting a Session**: Update index.json with active session ID
2. **During Work**: Read from memory files for context
3. **Pattern Success**: Document in patterns/ directory
4. **Major Decisions**: Create ADR in decisions/
5. **Session End**: Archive session context

## For Agents
1. **Always Read First**:
   - .claude/tasks/context_session_[session_id].md (current session)
   - .ai/memory/project.md (project context)
   - Relevant patterns from .ai/memory/patterns/

2. **When Creating Plans**:
   - Reference successful patterns
   - Note any new patterns discovered
   - Suggest updates to project.md if needed

## For Commands
1. Check index.json for quick lookups
2. Read relevant patterns before implementing
3. Update statistics after successful operations
```

## Phase 2: Enhanced CLAUDE.md Orchestration

**First, update context_session with Phase 1 completion status**

**ACTION: Update root CLAUDE.md with these sections:**

```markdown
# [Project Name] - Claude Code Orchestration

## 📚 MEMORY SYSTEM

### Memory Hierarchy
```
.claude/
├── tasks/context_session_[session_id].md    # Current session working memory
├── doc/[agent]-[task]-*.md       # Agent research & plans  
└── memory/                        # Persistent knowledge base
    ├── project.md                 # Project-wide context
    ├── patterns/                  # Successful implementation patterns
    ├── decisions/                 # Architectural decisions (ADRs)
    └── index.json                 # Quick lookup index
```

### How to Use Memory System

#### For Main System
1. **Session Start**: Check .claude/tasks/context_session_[session_id].md for current context
2. **Before Implementation**: Read relevant patterns from .ai/memory/patterns/
3. **Major Decisions**: Document in .ai/memory/decisions/ using ADR template
4. **Pattern Success**: After successful implementation, save pattern to .ai/memory/patterns/
5. **Session End**: Update .ai/memory/index.json with session statistics

#### For Agents
Agents MUST follow this memory access pattern:
```
1. READ .claude/tasks/context_session_[session_id].md     # Current session context
2. READ .ai/memory/project.md               # Project conventions
3. CHECK .ai/memory/patterns/               # Existing solutions
4. RESEARCH using MCP tools                    # Latest documentation
5. CREATE plan at .claude/doc/[agent]-[task]-[timestamp].md
6. RETURN "Plan created at .claude/doc/..."    # Path only, not content
```

#### Memory Updates
- **Patterns**: Save after 2+ successful uses of same approach
- **Decisions**: Document when choosing between alternatives
- **Project.md**: Update when discovering new conventions
- **Index.json**: Auto-update after each session

### Example Memory Usage

**Saving a Successful Pattern**:
```markdown
# File: .ai/memory/patterns/jwt-authentication.md
## Pattern: JWT with Refresh Tokens
**First Used**: 2024-08-18
**Success Rate**: 95% (19/20 implementations)
**Context**: Stateless authentication for REST APIs

### Implementation
[Code example with explanation]

### When to Use
- Stateless architecture required
- Multiple client types (web, mobile)
- Need token revocation capability
```

**Recording a Decision**:
```markdown
# File: .ai/memory/decisions/2024-08-18-database-choice.md
## ADR-001: Use PostgreSQL over MongoDB
**Date**: 2024-08-18
**Status**: Accepted
**Context**: Need ACID compliance and complex queries
**Decision**: PostgreSQL for strong consistency
**Consequences**: Must handle schema migrations
**Alternatives**: MongoDB (rejected due to eventual consistency)
```

## 🎯 ORCHESTRATION RULES

### Memory Management Rules
- **Session Context**: Agents MUST read .claude/tasks/context_session_[session_id].md before any work
- **Agent Plans**: All agents output to .claude/doc/[agent]-[task]-[timestamp].md
- **Project Memory**: Consult .ai/memory/project.md for conventions
- **Pattern Reuse**: Check .ai/memory/patterns/ before creating new solutions
- **Decision History**: Major choices go in .ai/memory/decisions/

### Agent Activation Matrix
| Trigger Pattern | Primary Agent | Support Agents | Output Location |
|----------------|---------------|----------------|-----------------|
| "implement feature" | fullstack-orchestrator | frontend, backend | .claude/doc/fullstack-* |
| "fix bug" | debugger-analyst | test-engineer | .claude/doc/debugger-* |
| "optimize performance" | performance-analyst | architect | .claude/doc/performance-* |
| "security audit" | security-analyst | backend, devops | .claude/doc/security-* |

### Workflow Patterns
1. **Agent Research Phase**
   - Read: .claude/tasks/context_session_[session_id].md
   - Research: Use MCP tools (Context7, Sequential, etc.)
   - Plan: Create comprehensive implementation plan
   - Output: .claude/doc/[agent]-[task]-[timestamp].md

2. **Main System Execution Phase**
   - Read: Agent plan from .claude/doc/
   - Execute: Implement based on plan
   - Update: .claude/tasks/context_session_[session_id].md with progress
   - Validate: Run tests and checks

### Auto-Delegation Rules
IF task.complexity > 0.7 AND files.count > 20:
  DELEGATE to specialized agents
  COORDINATE via .claude/doc/ plans
  AGGREGATE in .claude/tasks/context_session_[session_id].md

IF security_keywords IN request:
  REQUIRE security-analyst review
  OUTPUT to .claude/doc/security-review-*.md
  BLOCK execution until approved
```

## Phase 3: Agent Generation (Research-Only Pattern)

**Update context_session with Phase 2 completion and agent creation progress**

### 3.1 Agent Template Structure
Create agents in .claude/agents/ using this template:

```yaml
---
name: [agent-name]
model: sonnet  # Use sonnet for research, haiku for simple tasks
description: Use PROACTIVELY when [triggers]
---

## Goal
Research and create detailed implementation plan for [domain].
**IMPORTANT**: This agent ONLY creates plans. NEVER implements.
Save plan to .claude/doc/[agent-name]-[task]-[timestamp].md

## Core Workflow
1. Check .claude/tasks/context_session_[session_id].md for session context
2. Read .ai/memory/project.md for project patterns
3. Use Context7 MCP for latest documentation
4. Research using Sequential MCP for complex analysis
5. Create detailed plan with all implementation steps
6. Save to .claude/doc/[agent-name]-[task]-[timestamp].md
7. Return path to parent: "Plan created at .claude/doc/[agent-name]-[task]-[timestamp].md"

## Output Format
MUST include: "I've created a detailed plan at .claude/doc/[agent-name]-[description]-[timestamp].md"

## Rules
- NEVER implement, only plan
- ALWAYS check session context first
- MUST save plan to .claude/doc/
- Include code examples in plan
- Document all dependencies
```

### 3.2 Generate Specialized Agents Based on Stack

Detect technology and create appropriate agents:

**Frontend Detected (React/Vue/Angular):**
- frontend-specialist.md - UI component planning
- ux-designer.md - User flow and interaction design
- a11y-expert.md - Accessibility compliance planning
- style-architect.md - Design system planning

**Backend Detected (Node/Python/Go):**
- backend-specialist.md - API design and architecture
- database-architect.md - Schema and query optimization
- integration-specialist.md - External service integration
- performance-optimizer.md - Backend optimization strategies

**Infrastructure Detected (Docker/K8s/Terraform):**
- devops-engineer.md - Deployment strategies
- infrastructure-architect.md - Cloud architecture
- security-engineer.md - Security hardening plans
- monitoring-specialist.md - Observability setup

## Phase 4: Command System with Session Integration

**Update context_session with Phase 3 completion**

### 4.1 Command Template
Create commands in .claude/commands/ following this pattern:

```yaml
---
command: "/[command-name]"
description: "[Purpose]"
---

## Execution Flow

### Phase 1: Context Loading
1. Read .claude/tasks/context_session_[session_id].md for current state
2. Read .ai/memory/project.md for patterns
3. Determine complexity and agent needs

### Phase 2: Agent Delegation (if complex)
```
invoke_agent(
  agent: "[specialist-agent]",
  context: ".claude/tasks/context_session_[session_id].md",
  task: "[specific task]",
  expect_output: ".claude/doc/[agent]-*.md"
)
```

### Phase 3: Plan Retrieval
```
plan_path = find_latest(".claude/doc/[agent]-*.md")
plan_content = read_file(plan_path)
```

### Phase 4: Implementation
- Execute plan steps from .claude/doc/
- Update .claude/tasks/context_session_[session_id].md with progress
- Handle errors and rollbacks

### Phase 5: Documentation
- Update .ai/memory/patterns/ if successful
- Document decisions in .ai/memory/decisions/
- Update session context with completion status
```

### 4.2 Core Commands to Generate

```markdown
/feature - Full feature implementation with multi-agent coordination
/debug - Intelligent debugging with root cause analysis
/optimize - Performance optimization workflow
/secure - Security audit and hardening
/test - Comprehensive test generation
/document - Documentation generation with context awareness
/refactor - Safe refactoring with pattern preservation
```

## Phase 5: MCP Tool Configuration

**Update context_session with Phase 4 completion and MCP configuration**

### Assign MCP Tools Based on Available Servers

```yaml
# Check which MCP servers are available and assign appropriately

Context7 (if available):
  assigned_to: [all research agents]
  purpose: Latest documentation and patterns
  fallback: WebSearch

Sequential (if available):
  assigned_to: [architect, analyst agents]
  purpose: Complex multi-step analysis
  fallback: Native reasoning

Magic (if available):
  assigned_to: [frontend agents]
  purpose: UI component generation
  fallback: Manual component templates

Playwright (if available):
  assigned_to: [QA, testing agents]
  purpose: E2E testing and automation
  fallback: Test case documentation

# Add custom MCP servers if available
[Custom MCP]:
  assigned_to: [appropriate agents]
  purpose: [specific use case]
  fallback: [alternative approach]
```

## Phase 6: Optional CI/CD Integration

### GitHub Actions for Automated Memory
Ask user: "Would you like to enable GitHub Actions for automated memory updates? (y/n)"

If yes, create .github/workflows/claude-memory-update.yml:
- Pattern detection from commits with content hashing
- ADR generation from PRs with duplicate checking
- All CI-generated files tagged with metadata headers
- Prevents conflicts with manual memory updates

Benefits:
- Automatic learning from development workflow
- No duplicate entries (content-based deduplication)
- Clear source tracking (manual vs CI)
- Respects existing patterns and decisions

## Phase 7: Integration Verification

### Create Test Scenarios
**ACTION: Create .claude/tests/integration.md:**

```markdown
# Integration Test Checklist

## Memory System Verification
- [ ] Created .ai/memory/ directory structure
- [ ] project.md contains detected project information
- [ ] patterns/ directory has README.md
- [ ] decisions/ directory has README.md template
- [ ] index.json is valid and tracks statistics
- [ ] HOW_TO_USE.md provides clear instructions

## Session Memory
- [ ] Session context readable from .claude/tasks/context_session_[session_id].md
- [ ] Agents checking session context before work
- [ ] Session updates being saved correctly

## Agent Memory Flow
- [ ] Agents reading from .claude/tasks/context_session_[session_id].md first
- [ ] Agents checking .ai/memory/project.md for conventions
- [ ] Agents referencing .ai/memory/patterns/ for existing solutions
- [ ] Plans being created in .claude/doc/[agent]-[task]-[timestamp].md
- [ ] Agents returning plan paths, not content

## Pattern Documentation
- [ ] Successful implementations being saved to patterns/
- [ ] Patterns include context, code, and usage guidelines
- [ ] Pattern references in index.json are updated

## Decision Recording
- [ ] Major decisions documented in decisions/
- [ ] ADR format being followed
- [ ] Decision references in index.json are updated

## Command Integration
- [ ] Commands reading session context correctly
- [ ] Commands checking memory before implementation
- [ ] Commands updating memory after success

## MCP Integration
- [ ] Tools accessible to agents
- [ ] Fallback mechanisms working
- [ ] Results properly formatted

## Statistics Tracking
- [ ] index.json statistics updating after operations
- [ ] Session history being maintained
- [ ] Agent activation counts being tracked
```

### Memory System Self-Test
**ACTION: Create .ai/memory/self-test.md:**

```markdown
# Memory System Self-Test

Run these commands to verify memory system:

## Test 1: Session Memory
```
Create a test task in .claude/tasks/context_session_test.md
Verify agents can read and reference it
```

## Test 2: Pattern Creation
```
Implement a simple feature successfully
Document it in .ai/memory/patterns/test-pattern.md
Verify it appears in index.json
```

## Test 3: Decision Recording
```
Make an architectural choice
Document in .ai/memory/decisions/YYYY-MM-DD-test-decision.md
Update index.json with decision reference
```

## Test 4: Agent Memory Flow
```
Trigger an agent with: "Create a user authentication system"
Verify agent:
1. Reads .claude/tasks/context_session_[session_id].md
2. Checks .ai/memory/patterns/ for auth patterns
3. Creates plan at .claude/doc/[agent]-auth-[timestamp].md
4. Returns path to parent
```

## Expected Results
- All memory files accessible and writable
- Agents following memory hierarchy
- Patterns and decisions being referenced
- Statistics updating correctly
```

## IMPORTANT IMPLEMENTATION NOTES

1. **Session Context is Sacred**: Every agent MUST read .claude/tasks/context_session_[session_id].md first
2. **Plans Not Implementation**: Agents create plans in .claude/doc/, never implement directly
3. **Path Communication**: Agents return the plan file path, not the plan content
4. **Memory Hierarchy**: Session (tasks) → Agent Plans (doc) → Project Memory (memory)
5. **MCP Flexibility**: Detect available servers and adapt assignments

Generate all files with working examples focused on immediate usability.
```

## Quick Start Examples by Project Type

### React/Next.js Project
```markdown
/init
Create Claude Code environment for this Next.js project.

Use established memory patterns:
- Session: .claude/tasks/context_session_[session_id].md
- Plans: .claude/doc/[agent]-[task]-[timestamp].md
- Memory: .ai/memory/ for patterns and decisions

Generate agents for:
- React components (using Magic MCP if available)
- API routes (using Context7 for Next.js patterns)
- Performance optimization (using Playwright for testing)
- State management patterns

Ensure all agents check session context first and output plans only.
```

### Python FastAPI Backend
```markdown
/init
Setup Claude Code for this FastAPI project.

Memory locations:
- Session context: .claude/tasks/context_session_[session_id].md
- Agent plans: .claude/doc/[agent]-[task]-[timestamp].md
- Patterns: .ai/memory/patterns/

Create research-only agents for:
- API endpoint design
- Database operations (SQLAlchemy)
- Background tasks (Celery/Redis)
- Testing strategies (pytest)

All agents must read session context and create plans, not implement.
```

### Full-Stack Application
```markdown
/init
Initialize Claude Code for full-stack development.

Critical paths:
- Session: .claude/tasks/context_session_[session_id].md (maintain across agents)
- Plans: .claude/doc/[agent]-[task]-[timestamp].md (agent outputs)
- Memory: .ai/memory/ (persistent patterns)

Create orchestrator and specialized agents:
- fullstack-orchestrator (coordinates frontend/backend)
- frontend-specialist (UI/UX planning)
- backend-specialist (API/database planning)
- integration-specialist (frontend-backend connection)
- deployment-specialist (CI/CD planning)

Workflow: Orchestrator delegates → Agents plan → Main system implements
```

## Advanced Initialization Options

### With Custom MCP Servers
```markdown
Available MCP servers for this project:
- PostgreSQL MCP - Database operations
- GitHub MCP - Code repository management
- Slack MCP - Team notifications
- Custom Analytics MCP - Metrics tracking

Assign these intelligently to agents based on their specialization.
Maintain standard memory paths:
- .claude/tasks/context_session_[session_id].md
- .claude/doc/[agent]-[task]-[timestamp].md
```

### With Existing Agent Structure
```markdown
Existing agents found in .claude/agents/.
Enhance them to:
1. Always check .claude/tasks/context_session_[session_id].md first
2. Output plans to .claude/doc/[agent]-[task]-[timestamp].md
3. Never implement, only research and plan
4. Return plan path to parent

Update CLAUDE.md with orchestration rules for these agents.
```

### For Microservices Architecture
```markdown
Create multi-agent system for microservices.

Memory strategy:
- Global context: .claude/tasks/context_session_[session_id].md
- Service plans: .claude/doc/[service]-[agent]-[task]-[timestamp].md
- Shared patterns: .ai/memory/patterns/microservices/

Create service-specific agents that:
- Read global session context
- Create service-scoped plans
- Coordinate through shared memory
- Never implement directly
```

## Phase 6: Finalize Session Context

**Complete the memory initialization session:**
1. Update `.claude/tasks/context_session_[session_id].md` with:
   - All phases completed
   - Final status: "Memory System Initialized"
   - Summary of memory structure created
   - List of patterns and ADRs established
2. Archive initial session to `.ai/memory/sessions/archive/`
3. Document recommendations for ongoing memory maintenance

## Validation Checklist

After running this initialization, verify:

✅ **Memory System**
- [ ] .claude/tasks/context_session_[session_id].md created at initialization start
- [ ] Context session updated throughout all phases
- [ ] Agents successfully reading context session
- [ ] .claude/doc/ contains agent plans with proper naming
- [ ] .ai/memory/ has project.md and patterns/

✅ **Agent Behavior**
- [ ] Agents read session context first
- [ ] Agents create plans, not implementations
- [ ] Agents return plan paths to parent

✅ **Command Flow**
- [ ] Commands check session context
- [ ] Commands delegate to appropriate agents
- [ ] Commands read plans from .claude/doc/

✅ **Integration**
- [ ] MCP tools are properly assigned
- [ ] Fallback mechanisms work
- [ ] Session context maintains continuity

This prompt ensures your established memory patterns are preserved and properly utilized throughout the system.
