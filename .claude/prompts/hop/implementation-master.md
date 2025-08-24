# ${lop.metadata.name} Implementation

**Priority**: ${lop.metadata.priority}  
**Type**: ${lop.metadata.type}  
**Description**: ${lop.metadata.description}

## Session Setup

Create a new context session file at `.claude/tasks/context_session_[session_id]_${lop.variables.session_type}.md` to track this implementation.

Implementation plan location: `${lop.variables.plan_location}`

## Critical Requirements

- **COMPLETE IMPLEMENTATION**: Everything must be fully implemented - no stubs, mocks, or placeholders
- **NO BACKWARDS COMPATIBILITY**: Remove all legacy code when refactoring
- **TEST EVERYTHING**: Every feature must be tested and working
- **DOCUMENT EVERYTHING**: Complete documentation required
- **UPDATE MEMORY**: All patterns and decisions must be recorded

## Required Agents

${#foreach lop.agents as agent}
### ${agent.name}
- **Role**: ${agent.role}
- **Deploy for**: ${agent.deploy_for || 'See phases below'}
${/foreach}

${#if lop.mcp_servers}
## Required MCP Servers

${#foreach lop.mcp_servers as server}
- ${server}
${/foreach}
${/if}

## Implementation Phases

${#foreach lop.phases as phase index}
### Phase ${index + 1}: ${phase.name}

**Description**: ${phase.description}

**Tasks**:
${#foreach phase.tasks as task}
- ${task}
${/foreach}

${#if phase.agents}
**Deploy Agents**:
${#foreach phase.agents as agent}
- Use ${agent} to ${phase.agent_tasks[agent] || 'assist with this phase'}
${/foreach}
${/if}

**Session Update Required**: Update context session after completing this phase with:
- Completed tasks
- Files modified
- Discoveries made
- Any blockers encountered

${/foreach}

## Verification Checklist

ALL items MUST be checked before considering implementation complete:

${#foreach lop.verification.criteria as criterion}
□ ${criterion}
${/foreach}

## Memory System Updates

The following must be documented in the memory system:

${#foreach lop.memory_patterns as pattern}
- ${pattern}
${/foreach}

## Session Management Protocol

### On Start
1. Create context session file immediately
2. Document objectives from implementation plan
3. Note current project state
4. List files that will be modified

### During Implementation
1. Update context after EVERY phase completion
2. Document all architectural decisions
3. Track every file created or modified
4. Note successful patterns for reuse
5. Record any issues and resolutions

### On Completion
1. Mark all phases as complete
2. Verify all checklist items
3. Document final state
4. Create memory system entries
5. Generate summary of changes

## Testing Requirements

${#if lop.testing}
### Required Tests
${#foreach lop.testing.required_tests as test}
- ${test}
${/foreach}

### Test Commands
${#foreach lop.testing.test_commands as command}
- `${command}`
${/foreach}

### Success Criteria
${#foreach lop.testing.success_criteria as criterion}
- ${criterion}
${/foreach}
${/if}

## Anti-Patterns to Avoid

${#foreach lop.anti_patterns as pattern}
- ❌ ${pattern}
${/foreach}

## Final Verification

Before marking complete, ensure:
1. All code fully implemented (search for TODO, FIXME, stub, mock)
2. All tests passing
3. Documentation updated
4. Memory patterns recorded
5. No backwards compatibility code remains
6. Implementation matches plan exactly

## Completion Criteria

This implementation is ONLY complete when:
- Every phase is fully implemented
- All verification items are checked
- Tests are passing
- Documentation is complete
- Memory system is updated
- No placeholders remain

DO NOT consider this task complete until EVERY requirement is met.