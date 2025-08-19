# /implement-feature - Fullstack Feature Implementation Command

## Overview
Orchestrates end-to-end feature implementation using a two-phase approach: first the fullstack-feature-orchestrator agent creates a comprehensive plan, then the main system executes that plan to ensure production-ready features with proper testing and documentation.

## Usage
```
/implement-feature [feature-spec] [--task-id ID] [--priority P0|P1|P2] [--type fix|feature|enhancement]
```

## Examples
```
# Implement a specific task from the task list
/implement-feature --task-id websocket-fix

# Implement authentication feature
/implement-feature "Enable Clerk authentication with protected routes" --priority P1

# Fix code quality issues
/implement-feature "Clean up ESLint warnings and TypeScript types" --type fix

# Add new dashboard feature
/implement-feature "Add real-time metrics dashboard with chart visualizations" --type feature
```

## Execution Flow

### Phase 1: Deep Analysis & Planning (Agent Creates Plan)
```yaml
step: "Delegate to fullstack-feature-orchestrator"
agent: fullstack-feature-orchestrator
purpose: "Create comprehensive implementation plan"
analysis:
  - Analyze existing codebase structure and patterns
  - Identify all affected components (frontend/backend)
  - Check latest API patterns from Context7 MCP
  - Review current implementation status
  - Create comprehensive implementation plan
thinking_mode: --ultrathink
mcp_servers: 
  - context7 (latest patterns)
  - sequential (deep analysis)
output: .claude/doc/fullstack-feature-[name]-[timestamp].md
```

### Phase 2: Plan Review & Backend Implementation (Main System Executes)
```yaml
step: "Main system reads plan and implements backend"
handler: main-system
input: "Read plan from .claude/doc/fullstack-feature-*.md"
backend_tasks:
  - Update Lambda handlers as specified in plan
  - Modify API Gateway configurations per plan
  - Update DynamoDB schemas if specified
  - Implement new agent tools as documented
  - Add error handling per plan specifications
tools: [Read, Edit, MultiEdit, Bash, TodoWrite]
```

### Phase 3: Frontend Implementation (Main System Continues)
```yaml
step: "Main system implements frontend per plan"
handler: main-system
input: "Frontend specifications from plan"
frontend_tasks:
  - Create/update React components as specified
  - Implement API integration per plan
  - Add state management as documented
  - Ensure responsive design per requirements
  - Implement loading/error states as specified
tools: [Edit, Write, MultiEdit]
note: "All details come from the plan created in Phase 1"
```

### Phase 4: Integration & Testing
```yaml
integration:
  - Connect frontend to backend endpoints
  - Test data flow end-to-end
  - Verify error handling
  - Check performance metrics
  - Update environment variables
testing_approach:
  - Unit tests for new functions
  - Integration tests for API endpoints
  - E2E tests for critical user flows
```

### Phase 5: Documentation & Status Update
```yaml
documentation:
  - Update implementation status files
  - Document API changes
  - Update CHANGELOG.md
  - Create/update user guides
  - Update task status in tasks.md
status_tracking:
  - Update docs-internal/FRONTEND_TRUTH.md
  - Update docs-internal/project-management/tasks.md
  - Mark completed tasks
  - Log implementation details
```

## Main System Instructions

When this command is invoked:

1. **Phase 1: Get Plan from Agent**
   - Invoke fullstack-feature-orchestrator using Task tool
   - Agent performs ultra-deep analysis
   - Agent creates plan at .claude/doc/fullstack-feature-*.md
   - Agent returns confirmation of plan creation

2. **Phase 2: Execute the Plan**
   - Read the plan from .claude/doc/
   - Parse implementation steps
   - Execute backend implementation per plan
   - Execute frontend implementation per plan
   - Follow all specifications in the plan

3. **Important**: The agent ONLY creates the plan
   - Main system handles ALL implementation based on that plan
   - Query Context7 for latest framework patterns (Next.js, AWS, React)
   - Analyze both frontend and backend codebases
   - Check current implementation status in FRONTEND_TRUTH.md

2. **Create Detailed Todo List**
   - Break down feature into granular tasks
   - Separate frontend and backend work
   - Include testing and documentation tasks
   - Set realistic completion markers

3. **Implement Systematically**
   - Start with backend changes if API modifications needed
   - Move to frontend implementation
   - Ensure proper error handling throughout
   - Follow existing code patterns and conventions

4. **Verify Integration**
   - Test API endpoints with curl or test scripts
   - Verify frontend can connect to backend
   - Check for CORS issues
   - Validate data flow

5. **Update All Documentation**
   - Update status tracking files
   - Document any new API endpoints
   - Update user guides if UI changed
   - Log in CHANGELOG.md

## Priority-Based Execution

### P0 Tasks (Critical)
- WebSocket endpoint fix
- Video processing pipeline issues
- Authentication breaking changes

### P1 Tasks (Important)
- Enable authentication
- Code cleanup and quality
- Performance optimizations

### P2 Tasks (Nice to Have)
- UI enhancements
- Mobile optimizations
- Advanced features

## Success Criteria

✅ Feature fully implemented (frontend + backend)
✅ All tests passing
✅ Documentation updated
✅ Status files updated
✅ No new ESLint or TypeScript errors
✅ API integration verified
✅ Deployed and accessible

## Common Patterns

### For API Endpoint Changes
```typescript
// Backend: api/lambda/handlers/
// Frontend: frontend/src/lib/api/client.ts
// Test: scripts/test_agents.py
```

### For UI Components
```typescript
// Components: frontend/src/components/
// Hooks: frontend/src/hooks/
// Utils: frontend/src/lib/utils/
```

### For Agent Modifications
```yaml
# Definitions: agents/definitions/
# Tools: agents/tools/
# Deploy: scripts/deploy-agents.sh
```

## Error Recovery

If implementation fails:
1. Check error logs in CloudWatch
2. Verify API Gateway configuration
3. Check CORS settings
4. Review TypeScript/ESLint errors
5. Validate environment variables
6. Test with minimal reproduction

## Notes

- Always check existing patterns before implementing
- Prefer editing existing files over creating new ones
- Test incrementally during implementation
- Update status tracking immediately after completion
- Use Context7 MCP for latest API documentation
- Leverage Magic MCP for UI component generation
- Apply Sequential thinking for complex logic