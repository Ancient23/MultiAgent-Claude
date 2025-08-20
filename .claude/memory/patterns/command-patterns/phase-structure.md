# Command Phase Structure Patterns

## Standard Command Phase Pattern

All commands follow the "research → plan → execute" pattern with these phases:

### Phase 1: Research & Planning
```yaml
step: "Delegate to Specialist Agent"
agent: "[specialist-agent-name]"
purpose: "Create detailed implementation plan"
actions:
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
  - Update status files
  - Log completion
  - Archive plan
  - Update CHANGELOG if needed
```

## Command YAML Header Pattern

```yaml
---
command: "/[command-name]"
category: "[Category]"
purpose: "[What this command accomplishes]"
pattern: "research → plan → execute"
agents: ["[specialist-agent-1]", "[specialist-agent-2]"]
---
```

## Agent Invocation Pattern

### Correct Implementation Pattern
```python
# Correct pattern for main system:
if command == "/[command-name]":
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

## Successful Command Examples

### /validate-templates Command
```yaml
---
command: "/validate-templates"
category: "Quality Assurance"
purpose: "Validate all templates for consistency and correctness"
pattern: "research → plan → execute"
agents: ["template-validation-specialist"]
---

## Phase 1: Template Analysis
- Agent analyzes all agent templates in Examples/agents/
- Checks YAML headers, required sections, examples
- Identifies inconsistencies and missing elements
- Creates validation plan

## Phase 2: Validation Execution
- Main system runs validation checks
- Reports errors and warnings
- Suggests fixes for common issues
- Updates validation status
```

### /generate-agent Command
```yaml
---
command: "/generate-agent"
category: "Development"
purpose: "Create new agent following established patterns"
pattern: "research → plan → execute"
agents: ["agent-factory"]
---

## Phase 1: Agent Design Planning
- Agent-factory analyzes requirements
- Reviews existing patterns in memory
- Creates agent specification plan
- Includes YAML header, workflow, and examples

## Phase 2: Agent Creation
- Main system creates agent file
- Applies templates and patterns
- Validates against standards
- Adds to agent registry
```

## Error Handling Patterns

### Standard Error Handling
```yaml
error_handling:
  - Log issues to .claude/doc/errors/
  - Attempt automatic recovery
  - Fall back to manual intervention
  - Report failures with context
```

### Recovery Strategies
```yaml
recovery_strategies:
  - Retry with different parameters
  - Escalate to different agent
  - Provide partial completion
  - Document blockers for manual resolution
```

## Success Criteria Patterns

### Verification Requirements
All commands include verification phase:
```yaml
verification:
  success_criteria:
    - All planned files created
    - No critical errors occurred
    - Tests pass (if applicable)
    - Documentation updated
  failure_conditions:
    - Critical dependencies missing
    - File creation failed
    - Tests failed
    - User cancelled operation
```

## Tool Assignment Patterns

### Phase-Specific Tools
```yaml
phase_1_tools: [Context7, WebSearch, Sequential]  # Research
phase_2_tools: [Read, Grep, LS]                  # Analysis
phase_3_tools: [Edit, Write, MultiEdit, Bash]    # Implementation
phase_4_tools: [Bash, Read, Grep]                # Verification
phase_5_tools: [Write, Edit]                     # Documentation
```

## Quality Checklist for Commands

- [ ] Command follows 5-phase structure
- [ ] YAML header includes all required fields
- [ ] Agent invocation is plan-only (no direct implementation)
- [ ] Error handling strategy defined
- [ ] Success criteria clearly specified
- [ ] Appropriate tools assigned to each phase
- [ ] Documentation update step included

## Anti-Patterns to Avoid

❌ **Mixed Responsibilities**: Agent both plans and implements
❌ **Missing Phases**: Skipping verification or documentation
❌ **Vague Success Criteria**: Unclear completion conditions
❌ **Tool Misuse**: Wrong tools for the phase
❌ **No Error Handling**: Missing recovery strategies

## Usage Guidelines

When creating new commands:
1. Start with 5-phase template
2. Identify appropriate specialist agent
3. Define clear success criteria
4. Assign phase-appropriate tools
5. Include error handling strategy
6. Test with real scenarios
7. Document any deviations from standard pattern