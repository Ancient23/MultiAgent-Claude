---
description: "End-to-end fullstack feature implementation with comprehensive planning, execution, and verification"
argument-hint: "[feature-spec] [--task-id ID] [--priority P0|P1|P2] [--type fix|feature|enhancement] [--plan PATH]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch", "TodoWrite"]
model: "sonnet"
---

# /implement-feature

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Feature specification and implementation requirements
- **$ARGUMENTS**: Parsed command arguments including feature description, task-id, priority, type, and plan path
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and documentation
- **SESSION_ID**: Generated from `getSessionId('implement_feature_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/fullstack-feature-[name]-[timestamp].md` - Agent-generated plan location
- **FEATURE_SPEC**: Extracted from USER_PROMPT - Detailed feature requirements
- **TASK_ID**: From --task-id flag - Reference to existing task (optional)
- **PRIORITY**: From --priority flag - P0 (critical), P1 (important), P2 (nice-to-have)
- **FEATURE_TYPE**: From --type flag - fix, feature, enhancement
- **PATH_TO_PLAN**: From --plan flag - Existing implementation plan (optional)

## Instructions

This command implements end-to-end fullstack feature development using the research-plan-execute pattern:

1. **Research Phase**: Deploy fullstack-feature-orchestrator to analyze codebase and create comprehensive plan
2. **Planning Phase**: Agent documents backend, frontend, testing, and deployment strategies
3. **Implementation Phase**: Main system executes plan with backend-first approach
4. **Integration Phase**: Connect frontend to backend with proper error handling
5. **Testing Phase**: Validate functionality with unit, integration, and E2E tests
6. **Documentation Phase**: Update all relevant documentation and status tracking

### Prerequisites
- Identify affected backend services (Lambda, API Gateway, DynamoDB)
- Determine frontend components and state management needs
- Check existing implementation status in FRONTEND_TRUTH.md
- Verify required tools and dependencies are available

### Decision Points
- If TASK_ID provided: Load existing task specifications from tasks.md
- If PATH_TO_PLAN provided: Skip research phase and execute plan
- If PRIORITY is P0: Execute immediately with enhanced monitoring
- If backend changes required: Start with backend implementation
- If only frontend changes: Skip backend phase

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document FEATURE_SPEC and objectives from USER_PROMPT
     - Load existing task details if TASK_ID provided
   - STOP and alert user if session creation fails

2. **Load Existing Task Context (if applicable)**
   - If TASK_ID provided:
     - Read task details from docs-internal/project-management/tasks.md
     - Extract requirements, acceptance criteria, and constraints
     - Update CONTEXT_FILE with task-specific information
   - If task not found:
     - Alert user and continue with FEATURE_SPEC

3. **Determine Execution Path**
   - If PATH_TO_PLAN provided:
     - Validate plan exists and is readable
     - Skip to step 5 (Plan Review)
   - If no plan exists or plan > 24hrs old:
     - Continue to step 4 (Agent Research)

4. **Deploy Fullstack Feature Orchestrator**
   - Invoke Task tool with fullstack-feature-orchestrator agent
   - Pass session context, FEATURE_SPEC, and current codebase state
   - Agent performs:
     - Codebase analysis using Context7 MCP for latest patterns
     - Backend architecture assessment (Lambda, API Gateway, DynamoDB)
     - Frontend component impact analysis
     - Testing strategy development
     - Integration requirements identification
   - Wait for agent to create comprehensive plan at PLAN_FILE

5. **Review Implementation Plan**
   - Read and parse PLAN_FILE
   - Validate backend implementation steps
   - Check frontend component specifications
   - Verify testing requirements
   - Assess integration complexity
   - If critical issues found:
     - Request user confirmation before proceeding

6. **Execute Backend Implementation**
   - For each backend step in plan:
     - Update Lambda handlers using Edit/MultiEdit
     - Modify API Gateway configurations
     - Update DynamoDB schemas if required
     - Implement new agent tools as specified
     - Add comprehensive error handling
     - Test API endpoints incrementally

7. **Execute Frontend Implementation**
   - For each frontend step in plan:
     - Create/update React components using Edit/Write
     - Implement API integration with proper error handling
     - Add state management (Redux/Context) as specified
     - Ensure responsive design compliance
     - Implement loading and error states
     - Update routing if required

8. **Integration and Testing**
   - Connect frontend to backend endpoints
   - Test data flow end-to-end using Bash commands
   - Verify CORS configuration
   - Check authentication flows
   - Run existing test suites to ensure no regressions
   - Create new tests as specified in plan

9. **Documentation and Status Updates**
   - Update docs-internal/FRONTEND_TRUTH.md with new implementation
   - Update docs-internal/project-management/tasks.md if TASK_ID provided
   - Document API changes in appropriate files
   - Update CHANGELOG.md with feature summary
   - Create/update user guides if UI changes significant

10. **Verification and Deployment**
    - Run all tests and verify success criteria
    - Check for ESLint/TypeScript errors
    - Validate performance metrics if applicable
    - Generate deployment-ready artifacts
    - Update deployment status in tracking files

## Report

```markdown
# Command Execution Report: /implement-feature

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Feature Type**: ${FEATURE_TYPE}
- **Priority**: ${PRIORITY}
- **Task ID**: ${TASK_ID} (if applicable)

## Feature Specification
${FEATURE_SPEC}

## Implementation Plan
- **Plan File**: ${PLAN_FILE}
- **Agent Used**: fullstack-feature-orchestrator
- **Analysis Depth**: [Ultra-deep with Context7 MCP]

## Backend Changes
### Lambda Handlers Modified
- [handler_path] - [change description]

### API Gateway Updates
- [endpoint] - [modification details]

### Database Schema Changes
- [table_name] - [schema updates]

## Frontend Changes
### Components Created/Modified
- [component_path] - [change description]

### State Management Updates
- [store/context] - [changes made]

### API Integration
- [api_client_changes] - [integration details]

## Testing Results
### Unit Tests
- [test_name] - [pass/fail]

### Integration Tests
- [test_name] - [pass/fail]

### E2E Tests
- [test_name] - [pass/fail]

## Documentation Updates
- FRONTEND_TRUTH.md - [updated sections]
- tasks.md - [status changes]
- CHANGELOG.md - [feature entry]
- [other_docs] - [changes made]

## Verification Results
- Success Criteria Met: [Yes/No]
- API Endpoints Functional: [Yes/No]
- Frontend Integration Working: [Yes/No]
- Tests Passing: [Yes/No]
- Performance Impact: [metrics if applicable]

## Deployment Status
- Backend Deployed: [Yes/No]
- Frontend Deployed: [Yes/No]
- Environment Variables Updated: [Yes/No]

## Next Steps
[Recommended actions, follow-up tasks, or known limitations]

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
```

## Control Flow Patterns

### Conditionals
```yaml
- If TASK_ID provided:
    Load task specifications from tasks.md
    Include task context in planning
  Else:
    Use FEATURE_SPEC as primary requirements

- If PATH_TO_PLAN exists:
    Skip research phase and execute plan directly
  Else:
    Deploy fullstack-feature-orchestrator for analysis

- If PRIORITY is P0:
    Execute with enhanced monitoring
    Add additional verification steps
  Else:
    Follow standard execution path

- If backend changes required:
    Execute backend implementation first
    Test API endpoints before frontend
  Else:
    Focus on frontend-only implementation

- If tests fail:
    Rollback recent changes
    Report failure with diagnostics
  Else:
    Continue to deployment phase
```

### Iteration Loops
```yaml
- For each backend_component in plan.backend_changes:
    Update Lambda handler
    Test endpoint functionality
    Verify error handling

- For each frontend_component in plan.frontend_changes:
    Create/update React component
    Implement API integration
    Test user interactions

- For each test_suite in verification_plan:
    Run test suite
    Record results
    Fix failures if critical

- For each documentation_file in update_list:
    Read current content
    Apply updates per plan
    Verify accuracy
```

### Parallel Orchestration
```yaml
- When independent backend services affected:
    parallel_lambda_updates:
      - Update authentication handler
      - Update data processing handler
      - Update notification handler
    synchronization_point: "All Lambda updates complete"

- When multiple frontend domains involved:
    parallel_ui_updates:
      - Update dashboard components
      - Update user profile components
      - Update settings components
    synchronization_point: "All UI components updated"

- When comprehensive testing required:
    parallel_test_execution:
      - Run unit tests
      - Run integration tests
      - Run E2E tests
    synchronization_point: "All test suites complete"
```

## Error Handling

### Recoverable Errors
- API endpoint test failure: Retry with exponential backoff
- Frontend build errors: Fix TypeScript/ESLint issues automatically
- Test failures: Attempt fix based on error message analysis
- Documentation conflicts: Merge changes with conflict resolution

### Critical Errors
- Backend deployment failure: STOP and preserve rollback state
- Database schema corruption: STOP and request DBA intervention
- Agent plan generation failure: STOP and request manual planning
- Session context corruption: STOP and request recovery action

### Priority-Specific Error Handling
- P0 Tasks: Immediate escalation on any failure
- P1 Tasks: Attempt automated recovery once
- P2 Tasks: Log errors and continue with partial implementation

## Anti-Patterns to Avoid

❌ **Implementing frontend before backend API is ready**
❌ **Skipping incremental testing during development**
❌ **Modifying production database schema without backup**
❌ **Deploying without updating documentation**
❌ **Ignoring existing code patterns and conventions**
❌ **Creating new files when editing existing ones is sufficient**
❌ **Forgetting to update status tracking files**

## Usage Examples

```bash
# Basic feature implementation
/implement-feature "Add user notification preferences"

# Implement specific task with priority
/implement-feature --task-id websocket-fix --priority P0

# Implement enhancement with existing plan
/implement-feature "Optimize dashboard performance" --type enhancement --plan .claude/doc/dashboard-optimization-plan.md

# Critical bug fix
/implement-feature "Fix authentication token expiration" --type fix --priority P0

# Complex feature with multiple components
/implement-feature "Add real-time chat system with WebSocket support" --type feature --priority P1
```

## Success Criteria

✅ **Backend Implementation Complete**
- All Lambda handlers updated and tested
- API Gateway configurations verified
- Database schemas updated if required
- Error handling implemented

✅ **Frontend Integration Working**
- React components created/updated
- API integration functional
- State management properly implemented
- Responsive design maintained

✅ **Testing Comprehensive**
- Unit tests passing
- Integration tests passing
- E2E tests covering critical flows
- No regressions detected

✅ **Documentation Current**
- FRONTEND_TRUTH.md reflects new implementation
- Task status updated in tasks.md
- API changes documented
- User guides updated if applicable

✅ **Deployment Ready**
- No TypeScript/ESLint errors
- Performance metrics acceptable
- Environment variables configured
- Ready for production deployment

## Related Commands
- `/orchestrate` - Multi-agent orchestration for complex features
- `/wave-execute` - Seven-phase systematic execution
- `/implement` - Direct LOP or plan execution
- `/parallel` - Parallel agent deployment for large features