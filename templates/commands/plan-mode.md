---
description: "Force all agents to operate in plan-only mode for strategic planning without implementation"
argument-hint: "[task-description] [--complexity-threshold] [--output-format]"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch", "Bash"]
model: "sonnet"
---

# /plan-mode

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - The task description and strategic planning requirements provided by the user
- **$ARGUMENTS**: Parsed command arguments including task description, complexity threshold, and output format preferences
- **OUTPUT_DIR**: `.claude/doc/plans/` - Directory for strategic plan outputs and documentation
- **SESSION_ID**: Generated from `getSessionId('plan_mode_[timestamp]')` - Unique planning session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Planning session context tracking
- **PLAN_FILE**: `.claude/doc/plans/strategic-plan-[task]-[timestamp].md` - Strategic plan output location
- **COMPLEXITY_THRESHOLD**: `--complexity-threshold` or default 5 - Minimum complexity level (1-10) for detailed planning
- **OUTPUT_FORMAT**: `--output-format` or default "detailed" - Plan detail level (summary|detailed|comprehensive)
- **AGENTS_DEPLOYED**: Array of specialist agents invoked for plan creation
- **PLANNING_MODE**: "STRICT" - Enforces no-implementation rule across all agents

## Instructions

This command enforces strict plan-only mode across all agent operations, focusing on strategic planning without any implementation. It's designed for:

1. **Strategic Analysis**: Deep dive into requirements and constraints without execution
2. **Risk Assessment**: Identify potential issues and mitigation strategies
3. **Resource Planning**: Estimate effort, complexity, and required expertise
4. **Decision Making**: Create comprehensive plans for executive review
5. **Architecture Design**: Design systems and workflows before implementation
6. **Validation Framework**: Establish success criteria and verification methods

### Prerequisites
- Identify planning scope and complexity level
- Ensure sufficient context for strategic analysis
- Define success criteria and constraints
- Verify agent templates support plan-only mode

### Decision Points
- If complexity < COMPLEXITY_THRESHOLD: Generate summary plan only
- If multiple domains involved: Deploy parallel planning agents
- If existing plans found: Merge and consolidate planning approaches
- If critical dependencies identified: Create dependency analysis sub-plans

## Workflow

1. **Initialize Planning Session**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new planning session context
     - Set PLANNING_MODE to "STRICT"
     - Document strategic objectives from USER_PROMPT
   - STOP and alert user if planning session initialization fails

2. **Assess Planning Complexity**
   - Parse USER_PROMPT for complexity indicators:
     - Multiple domains/technologies involved
     - Integration requirements
     - Performance constraints
     - Timeline pressures
   - If complexity >= COMPLEXITY_THRESHOLD:
     - Continue to comprehensive planning
   - If complexity < COMPLEXITY_THRESHOLD:
     - Generate summary plan and exit

3. **Deploy Planning Agents**
   - For each strategic domain identified:
     - Invoke Task tool with appropriate specialist agent
     - Pass PLANNING_MODE="STRICT" to enforce plan-only behavior
     - Provide session context and USER_PROMPT
   - Wait for all planning agents to complete
   - Validate that no implementation occurred

4. **Consolidate Strategic Plans**
   - For each plan in OUTPUT_DIR/plans/:
     - Read and parse strategic recommendations
     - Extract complexity estimates and resource requirements
     - Identify dependencies and integration points
   - Create unified strategic plan with:
     - Executive summary
     - Risk analysis
     - Resource allocation
     - Timeline estimates
     - Success metrics

5. **Generate Planning Artifacts**
   - Create comprehensive planning documentation:
     - Strategic implementation roadmap
     - Risk mitigation strategies
     - Resource requirement analysis
     - Success criteria definitions
   - Output format based on OUTPUT_FORMAT variable

6. **Validate Planning Completeness**
   - Verify all strategic aspects covered:
     - Technical feasibility assessment
     - Resource availability confirmation
     - Risk mitigation planning
     - Success measurement framework
   - Generate planning validation report

## Report

```markdown
# Strategic Planning Report: /plan-mode

## Planning Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Planning Mode**: STRICT (No Implementation)
- **Complexity Level**: [1-10]
- **Output Format**: ${OUTPUT_FORMAT}

## Strategic Objectives
${USER_PROMPT}

## Planning Agents Deployed
${AGENTS_DEPLOYED}

## Strategic Plans Generated
- Primary Plan: ${PLAN_FILE}
- Supporting Plans: [if applicable]
- Risk Analysis: `.claude/doc/plans/risk-analysis-[timestamp].md`
- Resource Plan: `.claude/doc/plans/resource-plan-[timestamp].md`

## Executive Summary
### Strategic Approach
[High-level strategy and methodology]

### Key Findings
- [Strategic insight 1]
- [Strategic insight 2]
- [Strategic insight 3]

### Recommended Timeline
- Phase 1: [duration] - [objectives]
- Phase 2: [duration] - [objectives]
- Phase 3: [duration] - [objectives]

## Risk Assessment
### High Priority Risks
- [Risk 1] - Probability: [%] Impact: [High/Medium/Low]
- [Risk 2] - Probability: [%] Impact: [High/Medium/Low]

### Mitigation Strategies
- [Risk 1 Mitigation]
- [Risk 2 Mitigation]

## Resource Requirements
### Human Resources
- [Role]: [FTE] for [duration]
- [Role]: [FTE] for [duration]

### Technology Resources
- [Technology/Tool]: [Justification]
- [Infrastructure]: [Requirements]

### Budget Estimates
- Development: $[amount]
- Infrastructure: $[amount]
- Contingency (20%): $[amount]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Performance metric target]
- [ ] [Quality standard]

## Next Steps for Implementation
1. [Strategic preparation step]
2. [Resource acquisition step]
3. [Implementation kickoff requirements]

## Planning Artifacts Archive
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Strategic Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Risk Analysis: `.ai/memory/sessions/archive/risk-analysis-[timestamp].md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If complexity < COMPLEXITY_THRESHOLD:
    Generate summary plan only
    Skip comprehensive analysis
  Else:
    Deploy full planning agent suite
    Create comprehensive strategic plan

- If multiple strategic domains identified:
    Use parallel planning agent deployment
    Consolidate plans into unified strategy
  Else:
    Single domain strategic analysis

- If existing strategic plans found:
    Merge with new requirements
    Create evolution strategy
  Else:
    Create new strategic framework

- If critical dependencies identified:
    Create dependency analysis sub-plan
    Identify blocking issues
  Else:
    Proceed with standard planning flow
```

### Iteration Loops
```yaml
- For each strategic_domain in identified_domains:
    Deploy specialist planning agent
    Collect strategic recommendations
    Validate plan-only compliance

- For each risk_factor in identified_risks:
    Assess probability and impact
    Design mitigation strategy
    Calculate contingency requirements

- For each resource_requirement in plan:
    Estimate availability and cost
    Identify procurement timeline
    Plan allocation strategy

- For each success_metric in criteria:
    Define measurement methodology
    Set target values
    Plan monitoring approach
```

### Parallel Orchestration
```yaml
- When multiple strategic domains involved:
    planning_agents: [architecture-strategist, resource-planner, risk-analyst]
    parallel_execution:
      - Deploy all planning agents simultaneously
      - Enforce PLANNING_MODE="STRICT" for all
      - Wait for all strategic analyses
      - Merge into unified strategic plan

- When complex dependencies identified:
    parallel_analysis:
      - Technical feasibility assessment
      - Resource availability analysis
      - Risk mitigation planning
      - Timeline optimization
    synchronization_point: "All analyses complete"
```

## Error Handling

### Recoverable Errors
- Planning agent attempts implementation: Redirect to plan-only mode
- Incomplete strategic analysis: Request additional planning iterations
- Resource estimation uncertainty: Create range estimates with confidence levels

### Critical Errors
- Agent deployment failure in planning mode: STOP and alert user
- Planning session context corruption: STOP and request recovery
- Multiple conflicting strategic approaches: STOP and request resolution criteria

## Anti-Patterns to Avoid

❌ **Any implementation during planning mode**
❌ **Skipping risk assessment in strategic planning**
❌ **Underestimating complexity for comprehensive tasks**
❌ **Ignoring resource constraints in planning**
❌ **Creating plans without measurable success criteria**
❌ **Deploying agents without enforcing plan-only mode**

## Usage Examples

```bash
# Basic strategic planning
/plan-mode "migrate legacy system to microservices"

# High-complexity planning with detailed output
/plan-mode "enterprise digital transformation" --complexity-threshold 8 --output-format comprehensive

# Summary planning for simple tasks
/plan-mode "update user dashboard UI" --complexity-threshold 3 --output-format summary

# Strategic planning with specific focus
/plan-mode "implement zero-trust security architecture" --output-format detailed
```

## Related Commands
- `/orchestrate` - Multi-agent orchestration (with implementation)
- `/wave-execute` - Seven-phase execution (implementation mode)
- `/implement` - Direct plan execution (opposite of plan-mode)
- `/validate-templates` - Ensure agents support plan-only mode