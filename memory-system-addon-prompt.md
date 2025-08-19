# Memory System Add-on for Existing Claude Code Environment

## Prompt to Add Memory System to Already-Initialized Project

```markdown
Add a comprehensive memory system to this existing Claude Code setup. The agents and commands are already created, but we need to add persistent memory and update the existing files to use it.

## Phase 1: Create Memory Infrastructure

### Create Directory Structure and Files

**CREATE these directories:**
```bash
mkdir -p .claude/memory/patterns
mkdir -p .claude/memory/decisions
mkdir -p .claude/memory/sessions/archive
```

**CREATE: .claude/memory/project.md**
```markdown
# Project Context

## Technology Stack
[Detect from package.json, requirements.txt, Gemfile, etc.]

## Architecture Patterns
[Analyze codebase and list detected patterns]

## Key Conventions
- Import style: [analyze and document]
- File organization: [analyze and document]
- Naming patterns: [analyze and document]
- Testing approach: [analyze and document]

## Integration Points
- External services: [scan for API calls]
- Databases: [check for DB connections]
- APIs: [list exposed endpoints]
- Authentication: [document auth method]

## Active Features
[List based on recent commits or TODO files]

## Technical Debt Register
[Scan for TODO, FIXME, HACK comments]

## Code Quality Metrics
- Test coverage: [if available]
- Linting rules: [from .eslintrc, etc.]
- Type checking: [TypeScript, Python types, etc.]
```

**CREATE: .claude/memory/patterns/README.md**
```markdown
# Pattern Library

Document successful implementation patterns that work well in this codebase.

## Pattern Template

### Pattern: [Name]
**Category**: [Architecture|Security|Performance|Testing|etc.]
**First Used**: [Date]
**Success Rate**: [Track successful applications]
**Context**: When and why to use this pattern

#### Problem
[What problem does this solve?]

#### Solution
[Implementation approach with code example]

#### Example
```[language]
[Actual code example from this project]
```

#### When to Use
- [Condition 1]
- [Condition 2]

#### When NOT to Use
- [Anti-pattern 1]
- [Anti-pattern 2]

#### Related Patterns
- [Link to other patterns]
```

**CREATE: .claude/memory/patterns/example-pattern.md**
```markdown
# Pattern: Research-Plan-Execute

**Category**: Development Workflow
**First Used**: [Today's date]
**Success Rate**: New pattern
**Context**: Standard workflow for all Claude Code operations

## Problem
Need consistent approach for complex tasks that require research before implementation.

## Solution
1. Agent performs research using MCP tools
2. Agent creates plan at .claude/doc/[agent]-[task]-[timestamp].md
3. Agent returns path to parent
4. Parent system reads plan and executes

## Example
```yaml
# Agent workflow
1. READ: .claude/tasks/context_session_*.md
2. RESEARCH: Use Context7, Sequential, etc.
3. PLAN: Create detailed implementation steps
4. OUTPUT: Save to .claude/doc/
5. RETURN: "Plan created at .claude/doc/[agent]-[task]-[timestamp].md"
```

## When to Use
- Any task requiring specialized knowledge
- Complex multi-step operations
- When latest documentation needed

## Related Patterns
- See all agent files in .claude/agents/
```

**CREATE: .claude/memory/decisions/README.md**
```markdown
# Architectural Decision Records (ADRs)

Document important technical decisions and their rationale.

## ADR Template

### ADR-[NUMBER]: [TITLE]
**Date**: YYYY-MM-DD
**Status**: [Proposed|Accepted|Deprecated|Superseded]
**Author**: [Claude Code + User]
**Tags**: [Architecture, Security, Performance, etc.]

#### Context
[What is the issue that we're seeing that is motivating this decision?]

#### Decision Drivers
- [Driver 1]
- [Driver 2]

#### Considered Options
1. [Option 1]
2. [Option 2]
3. [Option 3]

#### Decision Outcome
[Which option was chosen and why]

#### Consequences
**Positive:**
- [Good consequence 1]
- [Good consequence 2]

**Negative:**
- [Trade-off 1]
- [Trade-off 2]

#### Implementation Notes
[Any specific implementation details]

#### Review Date
[When to revisit this decision]
```

**CREATE: .claude/memory/decisions/ADR-001-memory-system.md**
```markdown
# ADR-001: Implement Persistent Memory System

**Date**: [Today's date]
**Status**: Accepted
**Author**: Claude Code + User
**Tags**: Architecture, Knowledge Management

## Context
Need persistent knowledge across Claude Code sessions to maintain patterns, decisions, and project context.

## Decision Drivers
- Agents need access to project conventions
- Successful patterns should be reused
- Decisions need documentation
- Session context alone is insufficient

## Considered Options
1. JSON-only storage
2. Markdown-only documentation
3. Hybrid markdown + JSON index
4. External database

## Decision Outcome
Chose Option 3: Hybrid markdown + JSON index
- Human-readable markdown for documentation
- JSON index for quick lookups
- No external dependencies

## Consequences
**Positive:**
- Easy to version control
- Human-readable and editable
- Fast lookups via index
- No setup complexity

**Negative:**
- No semantic search without processing
- Manual pattern documentation needed

## Implementation Notes
- All agents updated to check memory
- CLAUDE.md updated with memory instructions
- Patterns documented as discovered
```

**CREATE: .claude/memory/index.json**
```json
{
  "version": "1.0.0",
  "lastUpdated": "[current ISO timestamp]",
  "project": {
    "name": "[from package.json or directory name]",
    "type": "[detected: frontend|backend|fullstack|library|service]",
    "language": "[primary language]",
    "framework": "[detected framework]",
    "initialized": "[current ISO timestamp]"
  },
  "sessions": {
    "active": null,
    "total": 0,
    "history": []
  },
  "patterns": {
    "research-plan-execute": "patterns/example-pattern.md",
    "count": 1
  },
  "decisions": {
    "ADR-001": "decisions/ADR-001-memory-system.md",
    "count": 1,
    "lastDecision": "[current ISO timestamp]"
  },
  "agents": {
    "registered": [
      "[list all agents from .claude/agents/]"
    ],
    "activations": {},
    "performance": {},
    "lastUsed": {}
  },
  "statistics": {
    "totalSessions": 0,
    "successfulPatterns": 1,
    "documentedDecisions": 1,
    "agentInvocations": 0,
    "averageSessionDuration": null
  },
  "health": {
    "memoryUsage": "healthy",
    "lastCheck": "[current ISO timestamp]",
    "issues": []
  }
}
```

**CREATE: .claude/memory/HOW_TO_USE.md**
```markdown
# Memory System Usage Guide

## Quick Reference

### File Locations
- **Session Context**: `.claude/tasks/context_session_*.md` (per-session)
- **Agent Plans**: `.claude/doc/[agent]-[task]-[timestamp].md` (per-task)
- **Project Memory**: `.claude/memory/` (persistent)

### Memory Hierarchy
```
Session (ephemeral) → Agent Plans (task-specific) → Project Memory (persistent)
```

## For Main Claude Code System

### Starting a Session
1. Check for existing `.claude/tasks/context_session_*.md`
2. Read `.claude/memory/project.md` for project context
3. Check `.claude/memory/index.json` for statistics
4. Update index.json with session start

### During Development
1. Before implementing: Check `.claude/memory/patterns/` for existing solutions
2. For decisions: Check `.claude/memory/decisions/` for precedents
3. After success: Consider saving new pattern
4. For major choices: Create new ADR

### Pattern Documentation Triggers
Save a new pattern when:
- Same approach succeeds 2+ times
- Novel solution works well
- Complex problem solved elegantly
- Team wants to standardize approach

### Decision Documentation Triggers
Create an ADR when:
- Choosing between multiple valid options
- Making breaking changes
- Adopting new technology
- Changing established patterns

## For Agents

### Required Memory Check Sequence
```python
# Every agent MUST follow this sequence:
1. read(".claude/tasks/context_session_*.md")  # Current session
2. read(".claude/memory/project.md")            # Project context  
3. scan(".claude/memory/patterns/")            # Existing patterns
4. check_relevant_decisions()                   # Related ADRs
5. perform_research()                           # MCP tools
6. create_plan()                               # Synthesis
7. save(".claude/doc/[agent]-[task]-[timestamp].md")
8. return "Plan created at .claude/doc/..."    # Path only
```

### Suggesting Memory Updates
Agents should suggest (not perform) updates:
- "Consider saving this as a pattern: [description]"
- "This decision should be documented as an ADR"
- "Update project.md with discovered convention: [detail]"

## For Commands

### Memory Integration
Commands should:
1. Load index.json for quick lookups
2. Check patterns before implementing
3. Reference decisions for context
4. Update statistics after operations

### Example Command Memory Usage
```python
# In a command implementation
memory_index = read(".claude/memory/index.json")
if "authentication" in memory_index["patterns"]:
    pattern = read(memory_index["patterns"]["authentication"])
    # Apply pattern to implementation

# After successful operation
memory_index["statistics"]["successfulPatterns"] += 1
save(".claude/memory/index.json", memory_index)
```

## Maintenance

### Weekly Tasks
- Review new patterns for documentation
- Update project.md with changes
- Archive old session contexts
- Update statistics in index.json

### Monthly Tasks
- Review ADRs for relevance
- Consolidate similar patterns
- Clean up outdated information
- Generate memory health report
```

## Phase 2: Update Existing CLAUDE.md

### ADD these sections to the existing CLAUDE.md:

Find the main orchestration section and ADD:

```markdown
## 📚 MEMORY SYSTEM INTEGRATION

### Memory Architecture
The project now includes a persistent memory system that complements session context:

```
.claude/
├── tasks/context_session_*.md    # Session working memory (existing)
├── doc/[agent]-[task]-*.md       # Agent plans (existing)
└── memory/                        # Persistent knowledge (NEW)
    ├── project.md                 # Project-wide context
    ├── patterns/                  # Successful patterns
    ├── decisions/                 # Architectural decisions
    └── index.json                 # Quick lookup index
```

### Memory Usage Rules

#### All Agents MUST:
1. **READ** `.claude/tasks/context_session_*.md` FIRST (existing behavior)
2. **CHECK** `.claude/memory/project.md` for conventions (NEW)
3. **SCAN** `.claude/memory/patterns/` for solutions (NEW)
4. **CREATE** plans at `.claude/doc/[agent]-[task]-[timestamp].md` (existing)
5. **SUGGEST** memory updates, never write directly (NEW)

#### Main System SHOULD:
1. **DOCUMENT** successful patterns after 2+ uses
2. **RECORD** architectural decisions in ADRs
3. **UPDATE** index.json with session statistics
4. **MAINTAIN** project.md with discovered conventions

### Pattern Recognition
Save patterns when you notice:
- Repeated successful approaches
- Elegant solutions to complex problems
- Team-agreed standards
- Performance optimizations that work

### Decision Recording
Create ADRs for:
- Technology choices
- Architecture changes
- Breaking changes
- Process modifications

### Memory Maintenance
- Check `.claude/memory/HOW_TO_USE.md` for detailed instructions
- Run memory health checks weekly
- Archive old sessions monthly
```

## Phase 3: Update All Existing Agents

### For EACH agent file in .claude/agents/, UPDATE the Core Workflow section:

**FIND sections like:**
```markdown
## Core Workflow
1. Check if .claude/tasks/context_session_*.md exists for full context
2. Use Context7 MCP to get latest documentation
3. [other steps]
```

**REPLACE with:**
```markdown
## Core Workflow
1. Check if .claude/tasks/context_session_*.md exists for full context
2. Read .claude/memory/project.md for project conventions and patterns
3. Scan .claude/memory/patterns/ for relevant existing solutions
4. Check .claude/memory/decisions/ for related architectural decisions
5. Use Context7 MCP to get latest documentation
6. [continue with other existing steps]
7. Save plan to .claude/doc/[agent-name]-[task]-[timestamp].md
8. If discovering new pattern, note: "Consider saving as pattern: [description]"
9. Return: "Plan created at .claude/doc/[agent-name]-[task]-[timestamp].md"
```

### Also ADD to each agent's Rules section:
```markdown
- MUST check memory system before creating new solutions
- SUGGEST pattern documentation, don't write to memory directly
- REFERENCE successful patterns in plans
- NOTE when solution deviates from established patterns
```

## Phase 4: Update Existing Commands (if any)

### For EACH command in .claude/commands/, ADD memory checking:

**In Phase 1 (Context Loading):**
```markdown
1. Read .claude/tasks/context_session_*.md for current state
2. Load .claude/memory/index.json for quick lookups (NEW)
3. Check .claude/memory/patterns/ for relevant patterns (NEW)
4. Read .claude/memory/project.md for conventions (NEW)
```

**In Phase 5 (Documentation):**
```markdown
- Update .claude/memory/patterns/ if pattern succeeded 2+ times (NEW)
- Document major decisions in .claude/memory/decisions/ (NEW)
- Update .claude/memory/index.json statistics (NEW)
- Update session context with completion status
```

## Phase 5: Verification

### Run these checks to ensure memory system is working:

1. **Structure Check**:
   - Verify all memory directories exist
   - Confirm all README files are in place
   - Validate index.json is proper JSON

2. **Agent Integration Check**:
   - Pick one agent and trace its workflow
   - Verify it mentions checking memory
   - Confirm it suggests pattern updates

3. **Test Memory Flow**:
   ```
   Ask: "Implement user authentication"
   Verify agent:
   - Checks .claude/memory/patterns/ for auth patterns
   - References any found patterns in plan
   - Suggests saving new pattern if novel approach
   ```

4. **Pattern Documentation Test**:
   - Implement something successfully
   - Document it in .claude/memory/patterns/
   - Update index.json
   - Verify next agent references it

## IMPORTANT NOTES

1. **Don't Break Existing Flow**: Memory system ADDS to existing workflow, doesn't replace it
2. **Session Context Still Primary**: .claude/tasks/context_session_*.md remains the main working memory
3. **Agents Still Output to doc/**: Plans still go to .claude/doc/[agent]-[task]-[timestamp].md
4. **Memory is Persistent**: Unlike session context, memory survives across sessions
5. **Human-Readable**: All memory files are markdown for easy editing

After running this, you'll have a complete memory system integrated with your existing Claude Code setup!
```

## Quick Verification Script

After running the prompt above, verify with:

```markdown
Check memory system installation:

1. Directory structure exists:
   - [ ] .claude/memory/
   - [ ] .claude/memory/patterns/
   - [ ] .claude/memory/decisions/
   - [ ] .claude/memory/sessions/

2. Core files created:
   - [ ] .claude/memory/project.md
   - [ ] .claude/memory/index.json
   - [ ] .claude/memory/HOW_TO_USE.md
   - [ ] .claude/memory/patterns/README.md
   - [ ] .claude/memory/decisions/README.md

3. CLAUDE.md updated:
   - [ ] Memory system section added
   - [ ] Usage rules documented

4. Agents updated:
   - [ ] Memory checking in workflow
   - [ ] Pattern suggestion capability

5. Test the flow:
   Ask an agent to create a plan and verify it checks memory first
```
