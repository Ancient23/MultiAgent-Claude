# Claude Code Multi-Agent Development Environment Initialization - Production Ready

## Master Initialization Prompt (Use After `/init`)

```markdown
Analyze this codebase and create a comprehensive Claude Code development environment with multi-agent orchestration and proper memory management.

## CRITICAL FILE PATHS TO USE

### Session Memory (Already Established)
- Session context: .claude/tasks/context_session_*.md (where * is session ID)
- Agents MUST check this file first for session context
- Main system maintains this file across agent calls

### Agent Output (Established Pattern)
- Agent plans: .claude/doc/[agent-name]-[task]-[timestamp].md
- Agents create plans here and return the path to parent
- Parent agent/system reads from this location

## Phase 1: Project Analysis & Context Setup

### 1.0 Initialize Session Context
**CRITICAL: Before any other work, create the session context file:**
1. Generate session ID: `YYYYMMDD_HHMMSS_init`
2. Create directory: `mkdir -p .claude/tasks`
3. Create `.claude/tasks/context_session_[id].md` with:
   ```markdown
   # Session Context: Project Initialization
   
   **Session ID**: [generated_id]
   **Date**: [current_date]
   **Type**: Framework Initialization
   **Status**: Active
   
   ## Objectives
   - Initialize MultiAgent-Claude environment
   - Create memory system
   - Generate specialized agents
   - Set up orchestration rules
   
   ## Current State
   - Starting initialization
   - Project path: [path]
   - Available MCP tools: [list]
   ```
4. **Update this file after each phase completion**

### 1.1 Read Existing Structure
First, check for existing Claude Code setup:
- Read CLAUDE.md for current configuration
- Check .claude/tasks/ for any context_session_*.md files
- Scan .claude/doc/ for previous agent plans
- Analyze project structure and technology stack
- **Update context_session with findings**

### 1.2 Create Memory System
Establish memory hierarchy at .claude/memory/:

```markdown
.claude/memory/
├── project.md                    # Persistent project-wide context
├── patterns/                     # Documented successful patterns
│   ├── authentication.md
│   ├── api-design.md
│   └── testing-strategies.md
├── decisions/                    # Architectural Decision Records
│   ├── YYYY-MM-DD-decision-name.md
│   └── README.md
└── index.json                   # Quick lookup index for all memory
```

**project.md Template:**
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
```

**index.json Structure:**
```json
{
  "lastUpdated": "timestamp",
  "sessions": {
    "active": "session-id",
    "history": ["session-1", "session-2"]
  },
  "patterns": {
    "authentication": "patterns/authentication.md",
    "api-design": "patterns/api-design.md"
  },
  "agents": {
    "activations": {},
    "performance": {}
  }
}
```

## Phase 2: Enhanced CLAUDE.md Orchestration

**First, update context_session with Phase 1 completion status**

Update root CLAUDE.md with orchestration rules:

```markdown
# [Project Name] - Claude Code Orchestration

## 🎯 ORCHESTRATION RULES

### Memory Management
- **Session Context**: Master creates .claude/tasks/context_session_*.md at session start
  - Update after each significant action
  - Ensure exists before deploying agents
  - Agents MUST read before any work
- **Agent Plans**: All agents output to .claude/doc/[agent]-[task]-[timestamp].md
- **Project Memory**: Persistent context in .claude/memory/project.md
- **Pattern Library**: Successful patterns in .claude/memory/patterns/

### Agent Activation Matrix
| Trigger Pattern | Primary Agent | Support Agents | Output Location |
|----------------|---------------|----------------|-----------------|
| "implement feature" | fullstack-orchestrator | frontend, backend | .claude/doc/fullstack-* |
| "fix bug" | debugger-analyst | test-engineer | .claude/doc/debugger-* |
| "optimize performance" | performance-analyst | architect | .claude/doc/performance-* |
| "security audit" | security-analyst | backend, devops | .claude/doc/security-* |

### Workflow Patterns
1. **Agent Research Phase**
   - Read: .claude/tasks/context_session_*.md
   - Research: Use MCP tools (Context7, Sequential, etc.)
   - Plan: Create comprehensive implementation plan
   - Output: .claude/doc/[agent]-[task]-[timestamp].md

2. **Main System Execution Phase**
   - Read: Agent plan from .claude/doc/
   - Execute: Implement based on plan
   - Update: .claude/tasks/context_session_*.md with progress
   - Validate: Run tests and checks

### Auto-Delegation Rules
IF task.complexity > 0.7 AND files.count > 20:
  DELEGATE to specialized agents
  COORDINATE via .claude/doc/ plans
  AGGREGATE in .claude/tasks/context_session_*.md

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
1. Check .claude/tasks/context_session_*.md for session context
2. Read .claude/memory/project.md for project patterns
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

### 4.1 Command Template
Create commands in .claude/commands/ following this pattern:

```yaml
---
command: "/[command-name]"
description: "[Purpose]"
---

## Execution Flow

### Phase 1: Context Loading
1. Read .claude/tasks/context_session_*.md for current state
2. Read .claude/memory/project.md for patterns
3. Determine complexity and agent needs

### Phase 2: Agent Delegation (if complex)
```
invoke_agent(
  agent: "[specialist-agent]",
  context: ".claude/tasks/context_session_*.md",
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
- Update .claude/tasks/context_session_*.md with progress
- Handle errors and rollbacks

### Phase 5: Documentation
- Update .claude/memory/patterns/ if successful
- Document decisions in .claude/memory/decisions/
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

**Update context_session with Phase 5 completion**

### GitHub Actions Setup
Ask user: "Would you like to enable GitHub Actions for automated memory updates? (y/n)"

If yes, create .github/workflows/claude-memory-update.yml:
```yaml
name: Update Claude Memory System
on:
  push:
    branches: [main]
  pull_request:
    types: [closed]
    
# Workflow includes:
# - Automated pattern detection with deduplication
# - ADR creation from PRs with metadata headers
# - Conflict prevention via content hashing
# - Source tracking (manual vs CI-generated)
```

Benefits:
- Learns from your development workflow automatically
- Prevents duplicate memory entries
- Tags all entries with source metadata
- Respects manually created patterns

## Phase 7: Integration Verification

### Create Test Scenarios
Generate .claude/tests/integration.md:

```markdown
# Integration Test Checklist

## Memory System
- [ ] Session context readable from .claude/tasks/context_session_*.md
- [ ] Agents creating plans in .claude/doc/
- [ ] Project memory persisting in .claude/memory/

## Agent Activation
- [ ] Correct agent triggered for keywords
- [ ] Plans generated in correct format
- [ ] Path returned to parent system

## Command Execution
- [ ] Commands reading session context
- [ ] Successful agent delegation
- [ ] Plan retrieval and execution

## MCP Integration
- [ ] Tools accessible to agents
- [ ] Fallback mechanisms working
- [ ] Results properly formatted
```

## IMPORTANT IMPLEMENTATION NOTES

1. **Session Context is Sacred**: Every agent MUST read .claude/tasks/context_session_*.md first
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
- Session: .claude/tasks/context_session_*.md
- Plans: .claude/doc/[agent]-[task]-[timestamp].md
- Memory: .claude/memory/ for patterns and decisions

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
- Session context: .claude/tasks/context_session_*.md
- Agent plans: .claude/doc/[agent]-[task]-[timestamp].md
- Patterns: .claude/memory/patterns/

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
- Session: .claude/tasks/context_session_*.md (maintain across agents)
- Plans: .claude/doc/[agent]-[task]-[timestamp].md (agent outputs)
- Memory: .claude/memory/ (persistent patterns)

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
- .claude/tasks/context_session_*.md
- .claude/doc/[agent]-[task]-[timestamp].md
```

### With Existing Agent Structure
```markdown
Existing agents found in .claude/agents/.
Enhance them to:
1. Always check .claude/tasks/context_session_*.md first
2. Output plans to .claude/doc/[agent]-[task]-[timestamp].md
3. Never implement, only research and plan
4. Return plan path to parent

Update CLAUDE.md with orchestration rules for these agents.
```

### For Microservices Architecture
```markdown
Create multi-agent system for microservices.

Memory strategy:
- Global context: .claude/tasks/context_session_*.md
- Service plans: .claude/doc/[service]-[agent]-[task]-[timestamp].md
- Shared patterns: .claude/memory/patterns/microservices/

Create service-specific agents that:
- Read global session context
- Create service-scoped plans
- Coordinate through shared memory
- Never implement directly
```

## Phase 7: Finalize Session Context

**Complete the initialization session:**
1. Update `.claude/tasks/context_session_*.md` with:
   - All phases completed
   - Final status: "Initialization Complete"
   - Summary of created agents and commands
   - List of all files created/modified
2. Optionally archive to `.claude/memory/sessions/archive/` for future reference
3. Document any outstanding tasks or recommendations

## Validation Checklist

After running this initialization, verify:

✅ **Memory System**
- [ ] .claude/tasks/context_session_*.md created at session start
- [ ] Context session updated throughout initialization
- [ ] Agents successfully reading context session
- [ ] .claude/doc/ contains agent plans with proper naming
- [ ] .claude/memory/ has project.md and patterns/

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
