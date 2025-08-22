---
source: wave-execute-command
created_by: system
created_at: 2025-08-21T18:00:00Z
version: 1.0
---

# Wave Execution Pattern

## Successful Pattern: 7-Wave Systematic Execution

### Overview
The wave execution pattern provides systematic task execution through 7 distinct phases, with proper context propagation and session management.

### Implementation Details

#### Wave 0: Session Initialization
- Get Claude Session ID and generate a unique session_id: `[claude_session_id]_wave`
- Create `.claude/tasks/context_session_[session_id].md`
- Initialize with objectives and wave list
- Document agent assignments

#### Wave Structure
1. **Discovery & Validation** - Analyze current state, identify issues
2. **Architecture & Planning** - Design solutions, create implementation plans
3. **Core Implementation** - Execute main changes
4. **Testing & Validation** - Verify implementation works correctly
5. **Documentation** - Update all relevant docs
6. **Review & Optimization** - Code review and performance tuning
7. **Deployment & Monitoring** - Deploy changes and setup monitoring

### Context Session Management

#### Required Structure
```markdown
# Session Context: [Task]

**Session ID**: [session_id]
**Date**: [ISO date]
**Type**: wave-execution
**Status**: Active|Completed
**Current Wave**: [0-7]

## Objectives
[Task description]

## Wave Progress
- [ ] Wave 1: Discovery & Validation
- [ ] Wave 2: Architecture & Planning
[etc...]

## Wave Agents Assignment
### Wave 1
Agents: [list]

## Current State
[What has been done]

## Files Modified
[List of changed files]

## Discovered Issues
[Issues found during discovery]

## Next Steps
[Planned actions]
```

### CLI Command Pattern

The `mac wave-execute` command:
1. Prompts for task description
2. Allows wave selection
3. Enables agent assignment (optional)
4. Creates context session file
5. Generates execution plan
6. Provides clear instructions for Claude

### Agent Assignment Defaults

Smart defaults based on wave objectives:
- **Wave 1**: codebase-truth-analyzer, aws-backend-architect
- **Wave 2**: fullstack-feature-orchestrator, infrastructure-migration-architect
- **Wave 3**: backend-api-frontend-integrator, ai-agent-architect
- **Wave 4**: playwright-test-engineer, ui-design-auditor
- **Wave 5**: documentation-architect
- **Wave 6**: code-review-orchestrator
- **Wave 7**: aws-deployment-specialist, vercel-deployment-troubleshooter

### Success Indicators

1. Context session properly initialized
2. Each wave updates context with findings
3. Agents read context before starting
4. Progress tracked in wave checklist
5. Issues documented as discovered
6. Session marked complete when done

### Common Use Cases

1. **Complex Feature Implementation**
   - All 7 waves for comprehensive execution
   - Custom agent assignment per wave

2. **Bug Investigation and Fix**
   - Focus on waves 1, 3, 4
   - Heavy discovery phase

3. **Documentation Update**
   - Waves 1 and 5 primarily
   - Documentation-architect focus

4. **Performance Optimization**
   - Waves 1, 6 (review/optimization)
   - Performance-focused agents

### Anti-Patterns to Avoid

- ❌ Skipping context initialization
- ❌ Not updating context between waves
- ❌ Agents not reading context
- ❌ Missing wave completion marks
- ❌ No documentation of blockers

### Integration with CLAUDE.md

The wave execution pattern integrates with project conventions:
1. Claude reads CLAUDE.md for orchestration rules
2. Context session management protocols apply
3. Agents follow standard file paths
4. Memory system updated with patterns

### Verification Steps

After wave execution:
1. Check context session for completion
2. Verify all waves marked done
3. Review agent outputs in `.claude/doc/`
4. Confirm implementations match plans
5. Validate test results if applicable