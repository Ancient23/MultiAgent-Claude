# TEMPLATE-COMMAND.md - Command Template for Research-Only Agent Architecture

## Command Definition Template

```yaml
---
command: "/[command-name]"
category: "[Category]"
purpose: "[What this command accomplishes]"
pattern: "research → plan → execute"
agents: ["[specialist-agent-1]", "[specialist-agent-2]"]
---
```

## Command Structure

### Overview
This command follows the research-only agent pattern where specialist agents create plans and the main system executes them.

### Usage
```bash
/[command-name] [arguments] [--flags]
```

### Examples
```bash
# Example 1
/[command-name] "description" --flag

# Example 2
/[command-name] --option value
```

## Execution Flow

### Phase 0: Initialize Session Context
```yaml
step: "Create/Update Session Context"
handler: "main-system"
actions:
  - Generate session ID: "[claude_session_id]_[command]"
  - Create/update .claude/tasks/context_session_[id].md
  - Document command objectives
  - List available agents
  - Record initial state
output: ".claude/tasks/context_session_[id].md"
content:
  - Session metadata (ID, date, type, status)
  - Command objectives and parameters
  - Current project state
  - Available resources
note: "Update this file after each phase"
```

### Phase 1: Research & Planning
```yaml
step: "Delegate to Specialist Agent"
agent: "[specialist-agent-name]"
purpose: "Create detailed implementation plan"
context_input: ".claude/tasks/context_session_[session_id].md (latest)"
actions:
  - Read session context file
  - Analyze current codebase/situation
  - Research latest best practices via Context7
  - Identify all requirements and dependencies
  - Create comprehensive plan
output: ".claude/doc/[type]-[description]-[timestamp].md"
mcp_tools: 
  - context7 (documentation research)
  - websearch (latest updates)
  - sequential (complex analysis)
```

### Phase 2: Plan Review & Preparation
```yaml
step: "Main System Reads Plan"
handler: "main-system"
actions:
  - Read plan from .claude/doc/
  - Update context_session with plan summary
  - Parse implementation steps
  - Prepare execution environment
  - Create TodoWrite list from plan
validation:
  - Verify all dependencies available
  - Check for conflicts
  - Confirm user approval if needed
```

### Phase 3: Implementation
```yaml
step: "Execute Plan"
handler: "main-system"
input: "Plan from .claude/doc/"
actions:
  - Execute each step from plan
  - Update context_session with progress
  - Handle file modifications
  - Run commands
  - Deploy if needed
tools: [Edit, Write, MultiEdit, Bash, Git]
error_handling:
  - Log issues
  - Attempt recovery
  - Report failures
```

### Phase 4: Verification
```yaml
step: "Validate Implementation"
handler: "main-system"
actions:
  - Run tests specified in plan
  - Verify success criteria
  - Check for regressions
  - Update documentation
tools: [Bash, Read, Grep]
```

### Phase 5: Documentation
```yaml
step: "Update Records"
handler: "main-system"
actions:
  - Update context_session with completion status
  - Update status files
  - Log completion
  - Archive plan to .ai/memory/sessions/archive/
  - Update CHANGELOG if needed
```

## Main System Instructions

When this command is invoked:

1. **DO NOT** have agents implement directly
2. **DO** use agents for planning only
3. **ALWAYS** read plans from .claude/doc/ before implementing
4. **NEVER** skip the planning phase for complex tasks

### Agent Invocation Pattern

```python
# Correct pattern for main system:
if command == "/[command-name]":
    # Step 0: Initialize session context
    session_id = generate_session_id()
    create_context_session(session_id, command, objectives)
    
    # Step 1: Get plan from specialist
    invoke_task_tool(
        agent="[specialist-agent]",
        prompt="Create implementation plan for: [description]",
        expect_output=".claude/doc/[type]-*.md"
    )
    
    # Step 2: Read the plan
    plan_file = find_latest(".claude/doc/[type]-*.md")
    plan = read_file(plan_file)
    
    # Step 3: Execute the plan
    for step in plan.steps:
        execute_step(step)
    
    # Step 4: Verify
    run_verification(plan.tests)
```

## Important Notes

### Research-Only Agents
- Agents create plans, they don't implement
- Plans must be comprehensive and actionable
- All technical details go in the plan document

### Main System Responsibilities
- Read and interpret plans
- Execute all file changes
- Run all commands
- Handle all deployments
- Manage error recovery

### Quality Checks
- [ ] Agent only created a plan (no implementation)
- [ ] Plan saved to .claude/doc/
- [ ] Main system read the plan before acting
- [ ] Implementation followed the plan
- [ ] Verification completed successfully

## Anti-Patterns to Avoid

❌ **Wrong**: Agent directly edits files
```yaml
agent: frontend-ui-expert
actions: 
  - Edit components/Button.tsx  # WRONG - agent shouldn't edit
```

✅ **Right**: Agent documents what to edit
```yaml
agent: frontend-ui-expert
output: .claude/doc/frontend-ui-button-20240817.md
plan_includes:
  - "Edit components/Button.tsx: Add disabled prop"
  - "Specific code changes documented in plan"
```

❌ **Wrong**: Single phase mixing planning and execution
```yaml
phase: implementation
agent: does everything  # WRONG - mixes responsibilities
```

✅ **Right**: Separate phases
```yaml
phase_1: planning
  agent: creates plan
phase_2: implementation
  main_system: executes plan
```

## Customization Guide

When creating a new command from this template:

1. Replace all `[bracketed]` placeholders
2. Specify which specialist agent(s) to use
3. Define clear success criteria
4. Document expected plan structure
5. Add command-specific validation steps
6. Include error recovery procedures

## Related Documentation

- `.claude/agents/README.md` - Agent architecture overview
- `.claude/agents/TEMPLATE-agent.md` - Agent creation template
- Individual agent files for specific capabilities