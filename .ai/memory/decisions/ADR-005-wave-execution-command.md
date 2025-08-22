---
id: ADR-005
title: Wave Execution Command Design
date: 2025-08-21
status: Accepted
created_by: system
---

# ADR-005: Wave Execution Command Design

## Status
Accepted

## Context
The wave execution pattern from `Examples/agents/wave-execution-orchestrator.md` and `Examples/commands/WAVE_EXECUTE.md` needed a concrete implementation for this project's CLI. The challenge was ensuring proper context session management that would work seamlessly with Claude's orchestration patterns.

## Decision
Implement `mac wave-execute` as a CLI command that:
1. Creates properly structured context session files
2. Allows flexible agent assignment
3. Provides smart defaults
4. Generates both context and execution plan

## Consequences

### Positive
- Context sessions are properly initialized before Claude starts
- Users can customize agent assignments per wave
- Smart defaults work for common scenarios
- Clear execution instructions for Claude
- Proper integration with CLAUDE.md conventions

### Negative
- Additional complexity in CLI
- Users need to understand wave pattern
- Requires Examples/agents/ to be populated

## Implementation Details

### Context Session Creation
The command creates `.claude/tasks/context_session_[session_id].md` with:
- Proper metadata (claude session id, date, type, status)
- Wave progress checklist
- Agent assignments
- Sections for discoveries and updates

### Agent Discovery
- Scans `Examples/agents/` for available agents
- Filters out TEMPLATE files
- Presents list for user selection
- Falls back to smart defaults

### Execution Flow
1. User runs `mac wave-execute`
2. Answers prompts for task and waves
3. Optional: assigns specific agents
4. Command creates context and plan files
5. User tells Claude: "Execute wave pattern from session [session_id]"
6. Claude reads context and follows waves

### File Structure
```
.claude/
├── tasks/
│   └── context_session_[session_id].md  # Main context file
└── doc/
    └── wave-execution-plan-[id].md  # Execution instructions
```

## Alternatives Considered

1. **Auto-execute with Claude API**
   - Rejected: Would bypass user control
   
2. **Single config file**
   - Rejected: Context session separate from plan is cleaner
   
3. **Hardcoded agent assignments**
   - Rejected: Projects vary too much

## Related
- `Examples/agents/wave-execution-orchestrator.md`
- `Examples/commands/WAVE_EXECUTE.md`
- Context session management in CLAUDE.md

## Review Notes
This design ensures the wave execution pattern works properly with Claude's context management requirements while remaining flexible for different project types.