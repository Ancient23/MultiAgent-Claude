---
description: "Execute implementation plans directly in current context as the main agent"
argument-hint: "[type|plan] [path] [--with-ci-tests] [--with-visual-tests] [--output-only]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "Grep", "Glob"]
model: "sonnet"
---

# /implement

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Implementation type, plan path, and optional flags
- **$ARGUMENTS**: Parsed command including type (ci-testing|visual-dev|plan|custom), path, and flags
- **OUTPUT_DIR**: `.claude/prompts/generated/` - Directory for generated prompts (output-only mode)
- **SESSION_ID**: Generated from `Date.now()_[type]` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_PATH**: Path to markdown plan or LOP file to execute
- **IMPLEMENTATION_TYPE**: Type of implementation (ci-testing|visual-dev|plan|custom)
- **TEST_FLAGS**: Boolean flags for --with-ci-tests, --with-visual-tests, --with-all-tests

## Instructions

This command executes implementation plans directly in the current context:

1. **Parse Phase**: Determine implementation type and options from arguments
2. **Context Phase**: Create session context file for tracking (unless output-only)
3. **Load Phase**: Load LOP or markdown plan based on type
4. **Augment Phase**: Add optional test phases if flags specified
5. **Execute Phase**: Implement plan step-by-step (or generate prompt if output-only)
6. **Verify Phase**: Run tests and validate implementation

### Prerequisites
- Valid plan file or supported LOP type
- Write access to `.claude/` directories
- Required tools available for implementation

### Decision Points
- If -h or --help: Display help and EXIT without executing
- If --output-only: Generate prompt file, don't execute
- If plan type: Read markdown directly, no LOP processing
- If test flags: Add corresponding test phases to implementation

## Workflow

1. **Check for Help Mode**
   - If command contains -h or --help:
     - Display usage examples and options
     - STOP and return without execution
   - Else continue to implementation

2. **Parse Command Arguments**
   - Extract implementation type from first argument
   - If type is "plan":
     - Extract plan path from second argument
   - Parse optional flags (--with-ci-tests, --with-visual-tests, --output-only)

3. **Create Context Session**
   - If --output-only flag NOT present:
     - Generate SESSION_ID from timestamp and type
     - Create context_session_${SESSION_ID}.md
     - Document objectives and initial state
   - Skip if output-only mode

4. **Load Implementation Source**
   - If type is "ci-testing" or "visual-dev":
     - Load corresponding LOP from .claude/prompts/lop/
     - Process through HOP template system
   - If type is "plan":
     - Read markdown plan from specified path
   - If type is "custom":
     - Load LOP from --lop path parameter

5. **Add Optional Test Phases**
   - If --with-ci-tests flag:
     - Add CI testing phase with playwright-test-engineer
     - Include GitHub Actions workflow setup
   - If --with-visual-tests flag:
     - Add visual testing phase with playwright-visual-developer
     - Include MCP setup and mock comparison
   - If --with-all-tests flag:
     - Add both CI and visual test phases

6. **Execute Implementation**
   - If --output-only flag:
     - Save generated prompt to OUTPUT_DIR
     - Skip to completion
   - For each phase in implementation:
     - Deploy specified agents if needed
     - Execute all tasks in phase
     - Update context session with progress
     - Handle errors with retry logic

## Report

```markdown
# Implementation Execution Report

## Session Information
- **Session ID**: ${SESSION_ID}
- **Implementation Type**: ${IMPLEMENTATION_TYPE}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]

## Command Details
- **Command**: /implement ${ARGUMENTS}
- **Plan Source**: ${PLAN_PATH || LOP_TYPE}
- **Test Additions**: ${TEST_FLAGS}
- **Output Mode**: ${OUTPUT_ONLY ? "Prompt Generated" : "Direct Execution"}

## Implementation Phases
### Phase Execution
[For each phase executed]
- Phase: [name]
- Tasks Completed: [count]/[total]
- Agents Deployed: [list]
- Status: [complete|failed|skipped]

## Files Modified
- [file_path:line_numbers] - [change description]

## Tests Executed
- Test Type: [CI|Visual|Both|None]
- Tests Passed: [count]
- Tests Failed: [count]
- Coverage: [percentage]%

## Generated Outputs
- Context Session: ${CONTEXT_FILE}
- Prompt File: ${OUTPUT_ONLY ? OUTPUT_PATH : "N/A"}
- Test Files: [list if applicable]

## Verification Results
- Implementation Complete: [Yes/No]
- Tests Passing: [Yes/No/N/A]
- Memory Updated: [Yes/No]

## Next Steps
[Recommended follow-up actions]
```

## Control Flow Patterns

### Conditionals
```yaml
- If help requested (-h or --help):
    Display usage information
    EXIT without execution
  Else:
    Continue to implementation

- If --output-only provided:
    Generate prompt file
    Skip execution
  Else:
    Execute implementation directly

- If type is "plan":
    Read markdown directly
  Else if type is LOP-based:
    Process through HOP system
  Else:
    Error: unsupported type
```

### Iteration Loops
```yaml
- For each phase in implementation:
    Update context session
    Deploy agents if specified
    Execute all tasks
    Verify phase completion

- For each task in phase:
    Execute task action
    Handle errors with retry
    Update progress tracking

- For each test flag provided:
    Add corresponding test phase
    Include required agents
    Configure test environment
```

### Parallel Orchestration
```yaml
- When multiple agents specified:
    agents: [agent1, agent2, agent3]
    parallel_deployment:
      - Deploy all agents simultaneously
      - Collect all plans
      - Merge into unified execution

- When test phases added:
    test_execution:
      - CI tests and visual tests in parallel
      - Wait for all completions
      - Aggregate test results
    synchronization: "All tests must complete"
```

## Error Handling

### Command Parsing Errors
- Invalid type: Show available types (ci-testing, visual-dev, plan, custom)
- Missing path: Request plan path for plan/custom types
- Unknown flags: List valid flags and usage

### Execution Errors
- Plan not found: Check path and suggest alternatives
- Agent deployment failure: Retry with fallback agent
- Task execution failure: Log error, attempt recovery

### Test Failures
- Test framework missing: Suggest installation command
- Test failures: Continue but mark as failed
- Coverage below threshold: Warning but don't fail

## Usage Examples

```bash
# Execute CI testing immediately
/implement ci-testing

# Implement from markdown plan
/implement plan .ai/memory/implementation-plans/refactor.md

# Add CI tests to plan execution
/implement plan feature.md --with-ci-tests

# Add both test types
/implement plan api.md --with-all-tests

# Generate prompt without executing
/implement visual-dev --output-only

# Custom LOP with tests
/implement custom --lop my-feature.yaml --with-visual-tests

# Show help
/implement --help
```

## Implementation Types

### ci-testing
- Comprehensive CI-compatible testing setup
- GitHub Actions workflow configuration
- Visual regression with baselines
- No MCP requirements

### visual-dev
- Local browser iteration development
- Playwright MCP integration required
- Mock comparison workflow
- Target < 5% visual difference

### plan
- Direct execution from markdown plans
- No LOP/HOP processing needed
- Supports test addition flags
- Most flexible option

### custom
- User-provided LOP file
- Full validation before execution
- Custom agent deployment supported
- Override priority and phases

## Related Commands
- `/orchestrate` - Multi-agent orchestration
- `/wave-execute` - Seven-phase systematic execution
- `/test-cli` - CLI testing implementation
- `mac lop execute` - CLI equivalent for LOP execution