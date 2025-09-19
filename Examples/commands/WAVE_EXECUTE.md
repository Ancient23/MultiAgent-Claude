---
description: "Seven-wave systematic task execution with context propagation and specialist orchestration"
argument-hint: "[task-file.md] [--session-id ID] [--confidence-check] [--no-stubs] [--cleanup]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "TodoWrite", "mcp__aws-api-mcp-server__call_aws", "mcp__playwright__browser_*"]
model: "opus"
---

# /wave-execute

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - The task description and any additional context provided by the user
- **$ARGUMENTS**: Parsed command arguments including task file, session ID, and execution flags
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and documentation
- **SESSION_ID**: Generated from `getSessionId('wave_[timestamp]')` or provided via --session-id flag
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking file
- **TASK_FILE**: Input task file for wave execution (if provided)
- **WAVE_COUNT**: `7` - Total number of execution waves (discovery, implementation, deployment, testing, documentation)
- **CONFIDENCE_THRESHOLD**: `85%` - Minimum confidence level for proceeding to next wave
- **COVERAGE_TARGET**: `90%` - Minimum test coverage required for modified code

## Instructions

This command implements systematic seven-wave task execution with comprehensive context management where:

1. **Wave 0 (Initialization)**: Create session context and establish objectives
2. **Wave 1 (Discovery)**: Deploy analysis agents to identify requirements and constraints
3. **Wave 2 (Implementation)**: Deploy implementation agents to create detailed execution plans
4. **Wave 3 (Deployment)**: Deploy deployment specialists for infrastructure and release planning
5. **Wave 4 (Testing)**: Deploy testing agents for comprehensive validation strategies
6. **Wave 5 (Documentation)**: Deploy documentation agents for knowledge capture and pattern extraction
7. **Wave 6 (Finalization)**: Archive session, update memory, and prepare next steps

### Prerequisites
- Valid task description or task file input
- Available specialist agents for required domains
- Access to MCP tools for AWS, Context7, and Sequential analysis
- Proper permissions for file system operations

### Decision Points
- If --session-id provided: Resume existing session, skip initialization
- If task-file.md provided: Load objectives from file, otherwise use USER_PROMPT
- If --no-stubs flag: Require real implementations, reject placeholder code
- If --confidence-check flag: Validate confidence scores before proceeding to next wave
- If agents unavailable: Fallback to main system analysis or request user agent selection

## Workflow

1. **Initialize Session Context (Wave 0)**
   - If --session-id provided and context exists:
     - Load existing context_session_${SESSION_ID}.md
     - Resume from last completed wave
   - If new session:
     - Generate SESSION_ID using timestamp
     - Create CONTEXT_FILE with session metadata
     - Load objectives from TASK_FILE or USER_PROMPT
     - Initialize wave tracking structure
   - STOP and alert user if context creation fails

2. **Discovery & Validation Planning (Wave 1)**
   - Deploy specialist agents for analysis:
     - aws-backend-architect for AWS infrastructure analysis
     - codebase-truth-analyzer for code verification planning
   - For each agent:
     - Pass CONTEXT_FILE and current objectives
     - Request discovery plan creation
     - Wait for plan output in OUTPUT_DIR
   - Update CONTEXT_FILE with agent plan locations
   - If confidence check enabled: Validate agent confidence scores > CONFIDENCE_THRESHOLD

3. **Execute Discovery & Update Context (Wave 1.5)**
   - For each discovery plan in OUTPUT_DIR:
     - Read and parse implementation steps
     - Execute AWS CLI commands per specifications
     - Analyze codebase following plan guidelines
     - Document findings and root causes
   - Update CONTEXT_FILE with:
     - Discovered issues and blockers
     - Dependencies and constraints identified
     - Technical debt items found
   - Create TodoWrite list for tracking discoveries

4. **Implementation Planning (Wave 2)**
   - Deploy implementation specialists based on discoveries:
     - fullstack-feature-orchestrator for feature coordination
     - ai-agent-architect for agent system planning
     - Additional specialists based on domain needs
   - For each agent:
     - Pass updated CONTEXT_FILE with Wave 1 findings
     - Request detailed implementation plan
     - Specify no-stubs requirement if --no-stubs flag set
   - Consolidate plans and check for conflicts
   - If conflicts found: Request user resolution before proceeding

5. **Execute Implementation & Update Context (Wave 2.5)**
   - For each implementation step in consolidated plans:
     - Execute using appropriate tools (Edit, MultiEdit, Write)
     - Apply error handling per specifications
     - Mark technical debt items as documented
     - Validate implementation against confidence requirements
   - Update CONTEXT_FILE with:
     - Files modified and change descriptions
     - Implementation status and remaining issues
     - New discoveries or blockers encountered

6. **Deployment Planning (Wave 3)**
   - Deploy deployment specialists:
     - aws-deployment-specialist for AWS infrastructure
     - vercel-deployment-troubleshooter for frontend deployment
   - For each agent:
     - Pass CONTEXT_FILE with implementation details
     - Request deployment strategy and procedures
     - Specify monitoring and rollback requirements
   - Review deployment plans for production readiness

7. **Execute Deployment & Update Context (Wave 3.5)**
   - For each deployment step:
     - Execute infrastructure commands (terraform, AWS CLI)
     - Deploy applications following plan specifications
     - Monitor deployment status and logs
     - Execute rollback procedures if critical failures
   - Update CONTEXT_FILE with:
     - Deployment results and endpoint URLs
     - Errors encountered and resolutions
     - Performance metrics and monitoring setup

8. **Testing Planning (Wave 4)**
   - Deploy testing specialists:
     - codebase-truth-analyzer for test strategy
     - ui-design-auditor for UI/UX testing plans
     - playwright-test-engineer for E2E testing (if available)
   - For each agent:
     - Pass CONTEXT_FILE with deployment endpoints
     - Request comprehensive testing strategy
     - Define coverage targets and success criteria

9. **Execute Testing & Update Context (Wave 4.5)**
   - For each testing category:
     - Run unit tests with coverage reporting
     - Execute integration tests with authentication
     - Perform E2E tests using Playwright MCP tools
     - Capture screenshots and performance metrics
   - Validate COVERAGE_TARGET achievement
   - Update CONTEXT_FILE with test results and metrics

10. **Documentation Planning (Wave 5)**
    - Deploy documentation specialist:
      - documentation-architect for comprehensive documentation
    - Pass complete CONTEXT_FILE with all wave results
    - Request documentation strategy including:
      - Pattern extraction for .ai/memory/patterns/
      - Decision documentation for .ai/memory/decisions/
      - Summary report generation

11. **Execute Documentation & Finalize (Wave 5.5)**
    - Create comprehensive documentation:
      - WAVE_EXECUTION_SUMMARY.md with complete results
      - Extract successful patterns to memory system
      - Document architectural decisions made
      - Update .ai/memory/project.md with learnings
    - Archive session context to .ai/memory/sessions/archive/
    - Create NEXT_WAVE_TASKS.md if incomplete items remain

## Report

```markdown
# Wave Execution Report: /wave-execute

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Waves Completed**: [X/7]

## Objectives
${USER_PROMPT}

## Wave Results Summary

### Wave 1: Discovery
- **Agents Deployed**: aws-backend-architect, codebase-truth-analyzer
- **Plans Generated**: ${OUTPUT_DIR}/aws-backend-discovery-[timestamp].md, ${OUTPUT_DIR}/codebase-truth-validation-[timestamp].md
- **Issues Identified**: [count] critical, [count] major, [count] minor
- **Dependencies Found**: [list key dependencies]

### Wave 2: Implementation
- **Agents Deployed**: fullstack-feature-orchestrator, ai-agent-architect
- **Plans Generated**: ${OUTPUT_DIR}/fullstack-feature-wave-[timestamp].md, ${OUTPUT_DIR}/ai-agent-wave-[timestamp].md
- **Files Modified**: [count] files changed
- **Confidence Score**: [average]%

### Wave 3: Deployment
- **Agents Deployed**: aws-deployment-specialist, vercel-deployment-troubleshooter
- **Resources Deployed**: [list AWS/Vercel resources]
- **Endpoints Created**: [list URLs]
- **Deployment Status**: [Success/Failed/Partial]

### Wave 4: Testing
- **Test Coverage**: Unit: [%], Integration: [%], E2E: [%]
- **Tests Passed**: [count]/[total]
- **Performance Metrics**: [key metrics]
- **Screenshots Captured**: [count]

### Wave 5: Documentation
- **Patterns Extracted**: [count] to .ai/memory/patterns/
- **Decisions Documented**: [count] to .ai/memory/decisions/
- **Memory Updates**: [list updates to project.md]

## Implementation Summary
### Files Modified
- [file_path:line_numbers] - [change description]
- [additional files...]

### Commands Executed
- `[AWS CLI command]` - [result]
- `[terraform command]` - [result]
- `[test command]` - [result]

### Tests Run
- [test_suite] - [pass_count]/[total_count] passed
- Coverage: [percentage]%

## Verification Results
- Success Criteria Met: [Yes/No]
- Confidence Threshold Achieved: [Yes/No] ([average]% vs ${CONFIDENCE_THRESHOLD}%)
- Coverage Target Met: [Yes/No] ([actual]% vs ${COVERAGE_TARGET}%)
- Regressions Detected: [Yes/No]
- Performance Impact: [metrics if applicable]

## Outstanding Items
- [ ] [incomplete task 1]
- [ ] [incomplete task 2]

## Next Steps
[Recommended actions or follow-up tasks from NEXT_WAVE_TASKS.md]

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plans: `.ai/memory/sessions/archive/wave-plans-${SESSION_ID}/`
- Summary: `WAVE_EXECUTION_SUMMARY.md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If --session-id provided and context exists:
    Resume from last completed wave
  Else:
    Initialize new session context

- If --confidence-check enabled:
    Validate confidence scores before next wave
  Else:
    Proceed without confidence validation

- If --no-stubs flag set:
    Reject placeholder implementations
    Require real code solutions
  Else:
    Allow temporary stubs with documentation

- If test coverage < COVERAGE_TARGET:
    Request additional tests
    Block progression to next wave
  Else:
    Proceed to next wave

- If deployment fails:
    Execute rollback procedures
    Document failure in context
  Else:
    Proceed to testing wave
```

### Iteration Loops
```yaml
- For each wave in [1, 2, 3, 4, 5]:
    Execute planning phase (wave N)
    Execute implementation phase (wave N.5)
    Update context with results
    Validate success criteria

- For each specialist_agent in wave_agents:
    Deploy agent with current context
    Wait for plan generation
    Collect and validate output

- For each implementation_step in consolidated_plan:
    Execute step using appropriate tool
    Verify step completion
    Update progress in context
    Handle errors with retry logic

- For each test_category in [unit, integration, e2e]:
    Run test suite
    Collect coverage metrics
    Document failures
    Continue or halt based on criticality
```

### Parallel Orchestration
```yaml
- When multiple domains involved in wave:
    agents: [aws-backend-architect, codebase-truth-analyzer]
    parallel_execution:
      - Deploy all agents simultaneously with shared context
      - Wait for all plan completions
      - Merge plans into unified strategy
      - Check for conflicts before execution

- When independent deployment targets:
    parallel_deployments:
      - AWS Lambda functions
      - Vercel frontend deployment
      - Database migrations
    synchronization_point: "All deployments complete"
    rollback_strategy: "Individual or coordinated"

- When testing multiple environments:
    parallel_testing:
      - Unit test execution
      - Integration test suites
      - E2E browser testing
      - Performance benchmarking
    consolidation: "Aggregate results before next wave"
```

## Error Handling

### Recoverable Errors
- Agent deployment timeout: Retry with extended timeout
- Test failure: Attempt fix based on error analysis
- Deployment partial failure: Continue with rollback documentation
- Context file corruption: Restore from backup or recreate

### Critical Errors
- Session context creation failure: STOP and alert user
- Multiple wave plan conflicts: STOP and request user resolution
- Confidence score below threshold: STOP and request review
- Complete deployment failure: Execute rollback and STOP

### Wave-Specific Recovery
- Wave 1: If discovery fails, proceed with manual analysis
- Wave 2: If implementation fails, document blockers and continue
- Wave 3: If deployment fails, document state and rollback
- Wave 4: If tests fail, document failures and proceed to documentation
- Wave 5: If documentation fails, create minimal summary

## Anti-Patterns to Avoid

❌ **Skipping wave execution phases (.5 waves)**
❌ **Proceeding without context updates**
❌ **Ignoring confidence thresholds when enabled**
❌ **Deploying without proper rollback plans**
❌ **Missing session context between waves**
❌ **Creating stubs when --no-stubs flag is set**
❌ **Proceeding with failed tests in critical paths**

## Usage Examples

```bash
# Basic wave execution
/wave-execute "implement user authentication system"

# Resume existing session
/wave-execute --session-id wave_20240918_143000

# Execute with confidence checking
/wave-execute "deploy API changes" --confidence-check

# Execute without stubs allowed
/wave-execute "refactor database layer" --no-stubs

# Execute with cleanup enabled
/wave-execute "migrate to new infrastructure" --cleanup

# Execute from task file
/wave-execute task-file.md --confidence-check --no-stubs
```

## Related Commands
- `/orchestrate` - Multi-agent orchestration patterns
- `/parallel` - Parallel agent deployment
- `/implement` - Direct plan execution
- `/validate-templates` - Template validation