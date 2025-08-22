# WAVE_EXECUTE.md - SuperClaude Wave Execution Command

Custom wave orchestration command for systematic task execution with proper context management.

## Command Definition

**`/wave-execute $ARGUMENTS`**
```yaml
---
command: "/wave-execute"
category: "Orchestration & Automation"
purpose: "Execute comprehensive 7-wave task orchestration with context propagation"
wave-enabled: true
performance-profile: "complex"
memory-aware: true
---
```
- **Auto-Persona**: Architect, DevOps, QA, Analyzer, Scribe (phase-dependent)
- **MCP Integration**: AWS API, Context7, Sequential, Playwright (as needed)
- **Tool Orchestration**: [Task, Read, Grep, Bash, TodoWrite, Edit, MultiEdit, AWS CLI, Vercel CLI]
- **Arguments**: `[task-file.md]`, `--confidence-check`, `--no-stubs`, `--cleanup`, `--session-id`

## Session Memory Structure
```
.claude/
├── tasks/               # Session-specific memory
│   └── context_session_[session_id].md
└── doc/                        # Agent-created plans
    └── [agent]-[task]-[timestamp].md
```

## Long Term Memory Structure
```
.ai/
└── memory/
    ├── project.md              # Persistent project context
    ├── reports/               # Memory reports
    ├── patterns/               # Successful patterns
    ├── decisions/              # ADRs
    └── index.json             # Quick lookup index

```

## Context Management Protocol

### Session Initialization (Wave 0)
```yaml
step: "Initialize session context"
handler: main-system
actions:
  - Generate session_id (claude_session_id)
  - Create .ai/memory/tasks/context_session_[session_id].md
  - Load .ai/memory/project.md into session context
  - Document initial task list and objectives
  - Set session metadata (start time, user, goals)
output: .ai/memory/tasks/context_session_[session_id].md
```

## Command Execution Pattern

### Wave 1: Discovery & Validation Planning
```yaml
step: "Get analysis plan from specialists"
agents: 
  - aws-backend-architect (for AWS analysis plan)
  - codebase-truth-analyzer (for verification plan)
context_input: .ai/memory/tasks/context_session_[session_id].md (latest)
purpose: "Create discovery and validation plan"
actions:
  - Read session context if available
  - Document how to check AWS CloudWatch logs
  - Specify Vercel deployment log analysis steps
  - Plan code analysis approach for root causes
  - Create task breakdown structure
output: 
  - .claude/doc/aws-backend-discovery-[timestamp].md
  - .claude/doc/codebase-truth-validation-[timestamp].md
```

### Wave 1.5: Execute Discovery & Update Context
```yaml
step: "Main system executes discovery"
handler: main-system
input: 
  - Plans from .claude/doc/
  - Context from .ai/memory/tasks/context_session_[session_id].md
actions:
  - Execute AWS CLI commands per plan
  - Check Vercel logs as specified
  - Analyze code following plan
  - Create TodoWrite list
  - UPDATE context_session_[session_id].md with findings:
    * Discovered issues
    * Root causes identified
    * Dependencies mapped
    * Blockers documented
tools: [mcp__aws-api-mcp-server__call_aws, Bash, Read, Grep, TodoWrite, Write]
output_update: .ai/memory/tasks/context_session_[session_id].md (append findings)
```

### Wave 2: Implementation Planning
```yaml
step: "Get implementation plan from specialists"
agents:
  - fullstack-feature-orchestrator (for feature plan)
  - ai-agent-architect (for agent system plan)
context_input: .ai/memory/tasks/context_session_[session_id].md (with Wave 1 findings)
purpose: "Create detailed implementation plan based on discoveries"
actions:
  - Read updated session context with findings
  - Research latest documentation via Context7
  - Document real fixes needed (no mocks/stubs)
  - Specify error handling requirements
  - Mark technical debt items
  - Reference specific issues from Wave 1
output:
  - .claude/doc/fullstack-feature-wave-[timestamp].md
  - .claude/doc/ai-agent-wave-[timestamp].md
```

### Wave 2.5: Execute Implementation & Update Context
```yaml
step: "Main system implements per plans"
handler: main-system
input: 
  - Implementation plans from .claude/doc/
  - Context from .ai/memory/tasks/context_session_[session_id].md
actions:
  - Implement fixes as specified in plans
  - Add error handling per specifications
  - Mark technical debt as documented
  - UPDATE context_session_[session_id].md with:
    * Implemented changes
    * Files modified
    * Remaining issues
    * New discoveries
tools: [Edit, MultiEdit, Write]
confidence_threshold: 85%
output_update: .ai/memory/tasks/context_session_[session_id].md (append implementation notes)
```

### Wave 3: Deployment Planning
```yaml
step: "Get deployment plan from specialists"
agents:
  - aws-deployment-specialist (for AWS deployment plan)
  - vercel-deployment-troubleshooter (for Vercel plan)
context_input: .ai/memory/tasks/context_session_[session_id].md (with implementation details)
purpose: "Create deployment strategy based on implementations"
actions:
  - Read session context with implementation details
  - Document Lambda deployment steps
  - Specify terraform commands needed
  - Plan Git commit strategy
  - Document monitoring approach
  - Specify retry strategies
output:
  - .claude/doc/aws-deployment-wave-[timestamp].md
  - .claude/doc/vercel-troubleshoot-wave-[timestamp].md
```

### Wave 3.5: Execute Deployment & Update Context
```yaml
step: "Main system deploys per plans"
handler: main-system
input: 
  - Deployment plans from .claude/doc/
  - Context from .ai/memory/tasks/context_session_[session_id].md
actions:
  - Deploy Lambda functions as specified
  - Run terraform commands per plan
  - Commit and push following plan
  - Monitor logs as documented
  - Retry per specified strategy
  - UPDATE context_session_[session_id].md with:
    * Deployment results
    * URLs/endpoints created
    * Errors encountered
    * Rollback actions taken
tools: [Bash, mcp__aws-api-mcp-server__call_aws, Git commands, Write]
output_update: .ai/memory/tasks/context_session_[session_id].md (append deployment results)
```

### Wave 4: Testing Planning
```yaml
step: "Get testing plan from specialists"
agents:
  - codebase-truth-analyzer (for test strategy)
  - ui-design-auditor (for UI testing plan)
context_input: .ai/memory/tasks/context_session_[session_id].md (with deployment info)
purpose: "Create comprehensive testing plan"
actions:
  - Read session context with deployment endpoints
  - Document API test scenarios
  - Specify E2E test flows
  - Plan screenshot captures
  - Define coverage targets
output:
  - .claude/doc/testing-strategy-[timestamp].md
  - .claude/doc/ui-testing-plan-[timestamp].md
```

### Wave 4.5: Execute Testing & Update Context
```yaml
step: "Main system executes tests"
handler: main-system
input:
  - Testing plans from .claude/doc/
  - Context from .ai/memory/tasks/context_session_[session_id].md
actions:
  - Run API tests with authentication
  - Execute Playwright E2E tests
  - Capture screenshots
  - UPDATE context_session_[session_id].md with:
    * Test results
    * Failed test details
    * Coverage metrics
    * Performance data
tools: [Bash, mcp__playwright__browser_*, TodoWrite, Write]
coverage_target: 90%
output_update: .ai/memory/tasks/context_session_[session_id].md (append test results)
```

### Wave 5: Documentation Planning
```yaml
step: "Get documentation plan from specialist"
agent: documentation-architect
context_input: .ai/memory/tasks/context_session_[session_id].md (complete session)
purpose: "Create documentation strategy"
actions:
  - Read entire session context
  - Plan summary documentation
  - Identify patterns for .ai/memory/patterns/
  - Document decisions for .ai/memory/decisions/
  - Specify cleanup tasks
output: .claude/doc/documentation-plan-[timestamp].md
```

### Wave 5.5: Execute Documentation & Finalize
```yaml
step: "Main system creates documentation"
handler: main-system
input:
  - Documentation plan from .claude/doc/
  - Complete context from .ai/memory/tasks/
actions:
  - Create WAVE_EXECUTION_SUMMARY.md
  - Extract patterns to .ai/memory/patterns/
  - Document decisions in .ai/memory/decisions/
  - Update .ai/memory/project.md with learnings
  - Update .ai/memory/index.json
  - Archive session context
  - Create NEXT_WAVE_TASKS.md if needed
tools: [Write, Read, Bash]
final_outputs:
  - WAVE_EXECUTION_SUMMARY.md
  - .ai/memory/patterns/[pattern].md (if new patterns)
  - .ai/memory/decisions/[decision].md (if new decisions)
  - NEXT_WAVE_TASKS.md (if incomplete items)
```

## Context Session File Format

```markdown
# Context Session: [session_id]

## Session Metadata
- Started: [timestamp]
- Session ID: [session_id]
- Initial Tasks: [count]
- User: [user]

## Wave 1: Discovery Results
### Issues Found
- [issue 1]
- [issue 2]

### Root Causes
- [cause 1]
- [cause 2]

## Wave 2: Implementation Notes
### Changes Made
- Modified: [file1] - [description]
- Created: [file2] - [description]

### Technical Debt
- [debt item 1]
- [debt item 2]

## Wave 3: Deployment Results
### Deployed Resources
- Lambda: [function-name] at [arn]
- API: [endpoint-url]

### Issues Encountered
- [deployment issue 1]

## Wave 4: Test Results
### Coverage
- Unit: [percentage]
- Integration: [percentage]
- E2E: [percentage]

### Failed Tests
- [test 1]: [reason]

## Wave 5: Documentation Created
- Summary: WAVE_EXECUTION_SUMMARY.md
- Patterns: [list]
- Decisions: [list]

## Outstanding Items
- [ ] [incomplete task 1]
- [ ] [incomplete task 2]
```

## Usage Syntax

### Basic Usage
```bash
/wave-execute @[task-file.md]
```

### With Session ID (Resume)
```bash
/wave-execute @[task-file.md] --session-id [timestamp]
```

### With Options
```bash
/wave-execute @[task-file.md] --confidence-check --no-stubs --cleanup
```

## Quality Gates

### Mandatory Requirements
1. **Context Propagation**: Each wave must read and update context
2. **Real Implementations**: No stubs or mocks unless justified
3. **Confidence Scoring**: Each component rated 0-100%
4. **Test Coverage**: Minimum 90% for modified code
5. **Documentation**: Complete session documentation

### Success Criteria
```yaml
context_maintained: true
deployment_success: true
test_pass_rate: ">90%"
confidence_average: ">85%"
documentation_complete: true
memory_updated: true
```

## Output Artifacts

### Required Deliverables
1. `WAVE_EXECUTION_SUMMARY.md` - Complete execution report
2. `.ai/memory/tasks/context_session_[session_id].md` - Full session context
3. `.ai/memory/patterns/*.md` - Extracted patterns
4. `.ai/memory/decisions/*.md` - Architectural decisions
5. `NEXT_WAVE_TASKS.md` - Remaining tasks (if any)

### Memory Updates
- `.ai/memory/project.md` - Updated with session learnings
- `.ai/memory/index.json` - Updated with new entries

## Error Handling

### Context Recovery
```yaml
if_context_missing:
  - Check .ai/memory/tasks/ for latest
  - Fallback to .ai/memory/project.md
  - Create new session if none exists
```

### Retry Strategy
```yaml
max_retries: 3
backoff: exponential
fallback: document_and_continue
preserve_context: always
```

## Integration with SuperClaude

### Memory-Aware Execution
- Reads from `.ai/memory/` hierarchy
- Updates persistent project knowledge
- Maintains session isolation
- Enables learning across sessions

### Wave Coordination
```yaml
wave_0: [main-system: initialize]
wave_1: [agents: plan discovery]
wave_1.5: [main-system: execute + update context]
wave_2: [agents: plan implementation]
wave_2.5: [main-system: execute + update context]
wave_3: [agents: plan deployment]
wave_3.5: [main-system: execute + update context]
wave_4: [agents: plan testing]
wave_4.5: [main-system: execute + update context]
wave_5: [agent: plan documentation]
wave_5.5: [main-system: execute + finalize]
```

## Example Invocation

```bash
/wave-execute @NEXT_WAVE_TASKS.md --confidence-check --no-stubs

# This will:
# 1. Initialize session context
# 2. Execute 7 waves (including .5 execution waves)
# 3. Maintain context throughout
# 4. Update memory structures
# 5. Create comprehensive documentation
# 6. Extract patterns and decisions
```

## Command Registration

Add to COMMANDS.md:
```yaml
wave-execute:
  category: "Orchestration"
  purpose: "Systematic task execution with memory"
  wave-enabled: true
  memory-aware: true
  complexity: high
  agents: [multiple]
  waves: 7 (including execution waves)
  context-management: automatic
```