# ADR-001: Research-Plan-Execute Pattern

**Date**: 2025-08-19  
**Status**: Accepted  
**Source**: Framework core architecture analysis

## Context

The MultiAgent-Claude framework needs a consistent pattern for managing complex tasks while maintaining context efficiency. Traditional approaches either:
1. Use a single agent that holds all context (leading to context window overflow)
2. Allow agents to implement directly (creating coordination and audit trail issues)
3. Mix planning and execution responsibilities (reducing specialization effectiveness)

## Decision

We adopt the **Research-Plan-Execute** pattern where:

1. **Specialized Research Agents** research and create detailed implementation plans but never execute
2. **Main Execution System** reads plans from disk and performs all actual implementation
3. **Plans are persisted** to `.claude/doc/` as Markdown files for audit and reference

## Rationale

### Context Efficiency
- Research agents can load domain-specific context without main session overhead
- Plans are stored on disk, not held in active memory
- Main agent maintains clean working context focused on current task

### Specialization Benefits
- Agents can focus deeply on their domain expertise
- No need for agents to understand implementation tools
- Clear separation of research vs. execution skills

### Audit Trail and Safety
- All decisions documented in plan files
- Plans can be reviewed before execution
- Easy rollback by not executing plans
- Historical record of all architectural decisions

### Scalability
- Multiple agents can work on different aspects simultaneously
- Plans can be generated in parallel
- Main agent orchestrates based on priority

## Implementation Details

### Agent Responsibilities
- **Research Only**: Agents create plans, never implement
- **Comprehensive Planning**: Plans must be detailed and actionable
- **Standard Output**: All plans saved to `.claude/doc/[agent]-[task]-[timestamp].md`

### Main System Responsibilities
- **Plan Execution**: Read and implement all plans
- **File Operations**: Handle all file creation/modification
- **Command Execution**: Run all commands and deployments
- **Error Recovery**: Manage failures and rollbacks

### Plan Format
```markdown
# [Agent Type] Implementation Plan
## Overview
[High-level description]

## Implementation Steps
1. [Detailed step with specific actions]
2. [File modifications needed]
3. [Commands to run]

## Success Criteria
[How to verify completion]

## Rollback Procedures
[How to undo if needed]
```

## Consequences

### Positive
- **Reduced Context Pollution**: Agents don't need full codebase context
- **Better Specialization**: Agents focus on their domain expertise
- **Improved Safety**: Plans can be reviewed before execution
- **Enhanced Auditability**: Complete record of all decisions
- **Parallel Capability**: Multiple agents can work simultaneously

### Negative
- **Additional Complexity**: Two-phase process instead of direct implementation
- **Plan Quality Dependency**: Poor plans lead to poor implementations
- **Disk I/O Overhead**: Plans must be written to and read from disk

### Neutral
- **Learning Curve**: Teams need to understand the pattern
- **Plan Maintenance**: Plans may need updates as requirements change

## Compliance

To comply with this ADR:

1. **All agents must**:
   - Create detailed implementation plans only
   - Save plans to `.claude/doc/` with proper naming
   - Never perform direct implementation
   - Include success criteria and rollback procedures

2. **Main system must**:
   - Read plans before any implementation
   - Execute all file operations and commands
   - Handle error recovery and rollbacks
   - Maintain audit trail of implementations

3. **Plans must**:
   - Be comprehensive and actionable
   - Include specific file paths and changes
   - Specify exact commands to run
   - Define clear success criteria

## Related Decisions
- ADR-002: Agent Specialization Framework
- ADR-003: Memory System Architecture  
- ADR-004: File and Directory Conventions

## Review Schedule
This ADR should be reviewed quarterly to assess effectiveness and identify improvements.