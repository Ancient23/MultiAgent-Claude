---
description: "Research-plan-execute command template for specialist agent orchestration"
argument-hint: "[task-description] [--flags] [options]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch"]
model: "sonnet"
---

# /[command-name]

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - The task description and any additional context provided by the user
- **$ARGUMENTS**: Parsed command arguments including task description, flags, and options
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and documentation
- **SESSION_ID**: Generated from `getSessionId('[command]_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/[agent]-[task]-[timestamp].md` - Agent-generated plan location

## Instructions

This command template implements the research-plan-execute pattern where:

1. **Initialization**: Create session context with objectives and current state
2. **Research Phase**: Deploy specialist agent to analyze requirements and create plan
3. **Planning Phase**: Agent documents comprehensive implementation strategy
4. **Review Phase**: Main system reads and validates the plan
5. **Execution Phase**: Main system implements the plan step-by-step
6. **Verification Phase**: Validate success criteria and run tests

### Prerequisites
- Identify appropriate specialist agent(s) for the task
- Ensure session context file exists before agent deployment
- Verify required tools are available

### Decision Points
- If no PATH_TO_PLAN provided: Deploy research agent first
- If plan exists and < 24hrs old: Skip research phase
- If file exists and changes requested: Edit existing files
- If critical errors occur: Stop and request user intervention

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document objectives from USER_PROMPT
   - STOP and alert user if session creation fails

2. **Determine Execution Path**
   - If PATH_TO_PLAN provided:
     - Skip to step 4 (Plan Review)
   - If no plan exists:
     - Continue to step 3 (Agent Research)

3. **Deploy Research Agent**
   - For each specialist area needed:
     - Invoke Task tool with appropriate agent
     - Pass session context and USER_PROMPT
   - Wait for all agents to complete
   - Process and consolidate multiple agent plans if parallel execution

4. **Review Agent Plan(s)**
   - For each plan in OUTPUT_DIR:
     - Read and parse implementation steps
     - Validate dependencies and requirements
     - Check for conflicts between steps
   - If issues found and user approval needed:
     - Request confirmation before proceeding

5. **Execute Implementation**
   - For each step in consolidated plan:
     - Execute using appropriate tool (Edit, Write, Bash)
     - Update context_session with progress
     - Handle errors with retry logic
   - Continue until all steps complete or critical failure

6. **Verify Implementation**
   - Run tests specified in plan
   - Check success criteria defined in objectives
   - Generate verification report

## Report

```markdown
# Command Execution Report: /[command-name]

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]

## Objectives
${USER_PROMPT}

## Agent Plans Generated
- ${PLAN_FILE}
- Additional plans: [if applicable]

## Implementation Summary
### Files Modified
- [file_path:line_numbers] - [change description]

### Commands Executed
- `[command]` - [result]

### Tests Run
- [test_name] - [pass/fail]

## Verification Results
- Success Criteria Met: [Yes/No]
- Regressions Detected: [Yes/No]
- Performance Impact: [metrics if applicable]

## Next Steps
[Recommended actions or follow-up tasks]

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
```

## Control Flow Patterns

### Conditionals
```yaml
- If PATH_TO_PLAN exists:
    Execute from existing plan
  Else:
    Deploy research agent first

- If multiple agents needed:
    Use parallel Task invocation
  Else:
    Single agent execution

- If tests fail:
    Rollback changes
    Report failure
  Else:
    Commit changes
    Update documentation
```

### Iteration Loops
```yaml
- For each specialist_agent in required_agents:
    Deploy agent with context
    Collect plan output

- For each implementation_step in plan:
    Execute step
    Verify step success
    Update progress

- For each test in verification_suite:
    Run test
    Record result
    Continue or halt based on criticality
```

### Parallel Orchestration
```yaml
- When multiple domains involved:
    agents: [frontend-specialist, backend-specialist, testing-specialist]
    parallel_execution:
      - Deploy all agents simultaneously
      - Wait for all completions
      - Merge plans into unified strategy

- When independent tasks identified:
    parallel_tasks:
      - UI updates
      - API changes
      - Documentation updates
    synchronization_point: "All tasks complete"
```

## Error Handling

### Recoverable Errors
- File not found: Create if in plan, otherwise alert
- Test failure: Attempt fix based on error message
- Dependency missing: Install if specified in plan

### Critical Errors
- Agent deployment failure: STOP and alert user
- Session context corruption: STOP and request recovery
- Multiple plan conflicts: STOP and request resolution

## Anti-Patterns to Avoid

❌ **Agent directly implementing changes**
❌ **Skipping session context creation**
❌ **Executing without reading plan**
❌ **Ignoring verification phase**
❌ **Hardcoding paths instead of using variables**

## Usage Examples

```bash
# Basic usage
/[command-name] "implement user authentication"

# With specific agent
/[command-name] "refactor API endpoints" --agent backend-specialist

# Using existing plan
/[command-name] --plan .claude/doc/backend-api-refactor-20240918.md

# Parallel agent deployment
/[command-name] "full-stack feature" --parallel --agents frontend,backend,test
```

## Related Commands
- `/orchestrate` - Multi-agent orchestration
- `/wave-execute` - Seven-phase systematic execution
- `/parallel` - Parallel agent deployment
- `/implement` - Direct plan execution