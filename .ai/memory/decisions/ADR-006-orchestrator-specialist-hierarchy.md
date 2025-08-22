# ADR-006: Orchestrator vs Specialist Agent Hierarchy

## Date
2025-08-21

## Status
Accepted

## Context
The MultiAgent-Claude framework had inconsistent model assignments (Opus vs Sonnet) across agents, with no clear distinction between orchestration and specialist roles. Some agents named "orchestrator" were using Sonnet (specialist model), while the framework lacked true orchestration patterns for complex workflows like issue triaging, code reviews, and meta-development.

## Decision
Establish a clear two-tier agent hierarchy:

### Orchestrators (Opus Model)
Agents that:
- Coordinate 2+ other agents
- Make architectural decisions
- Manage complex multi-phase workflows
- Need to understand entire system context
- Make pass/fail or go/no-go decisions
- Manage parallel execution or dependencies

### Specialists (Sonnet Model)
Agents that:
- Have focused domain expertise
- Create plans for others to execute
- Perform specific technical analysis
- Do research and documentation
- Have narrow, well-defined scope
- Work independently on specific tasks

## Implementation
### Promoted to Orchestrators (Now Opus)
1. **fullstack-feature-orchestrator** - Coordinates frontend, backend, testing, deployment
2. **infrastructure-migration-architect** - Manages complete infrastructure transformations
3. **parallel-controller** - Manages concurrent agent execution
4. **wave-execution-orchestrator** - 7-phase systematic execution
5. **master-orchestrator** - Already Opus, top-level coordination
6. **implementation-verifier** - Already Opus, verification coordination

### New Orchestrators Created (Opus)
1. **issue-triage-orchestrator** - Systematic issue analysis and resolution
2. **code-review-orchestrator** - Comprehensive multi-aspect code reviews
3. **meta-development-orchestrator** - Framework self-improvement coordination

### Remain Specialists (Sonnet)
All other agents remain specialists including:
- prompt-engineer-specialist
- template-evolution-tracker
- cli-test-engineer
- documentation-sync-guardian
- agent-factory
- codebase-truth-analyzer
- All domain-specific experts (frontend, backend, AWS, etc.)

## Consequences

### Positive
- **Clear Hierarchy**: Obvious distinction between coordinators and executors
- **Optimal Model Usage**: Opus for complex reasoning, Sonnet for focused tasks
- **Better Orchestration**: True multi-agent coordination for complex workflows
- **Cost Efficiency**: Sonnet for most tasks, Opus only when needed
- **Scalability**: Can add more specialists without increasing orchestrator overhead

### Negative
- **Increased Complexity**: Two-tier system more complex than flat hierarchy
- **Opus Cost**: More expensive model for orchestrators
- **Coordination Overhead**: Additional layer of indirection for some tasks

### Neutral
- **Migration Effort**: One-time effort to update existing agents
- **Documentation Needs**: Requires clear documentation of hierarchy

## Architecture Patterns

### Orchestration Pattern
```
User Request
    ↓
Master Orchestrator (Opus)
    ↓
Domain Orchestrator (Opus)
    ↓
Specialist Agents (Sonnet) [Parallel Execution]
    ↓
Results Consolidation
    ↓
User Response
```

### Direct Specialist Pattern
```
Simple User Request
    ↓
Specialist Agent (Sonnet)
    ↓
User Response
```

## Decision Criteria

### When to Create an Orchestrator
- Task requires multiple specialist domains
- Complex phased execution needed
- Parallel coordination required
- Architectural decisions involved
- Quality gates and approvals needed

### When to Create a Specialist
- Single domain expertise required
- Focused analysis or planning
- Research and documentation
- Specific technical implementation
- Independent execution possible

## Monitoring and Evaluation

### Success Metrics
- Reduction in task completion time through parallel execution
- Improved code quality through comprehensive reviews
- Faster issue resolution through systematic triage
- Framework self-improvement velocity

### Review Triggers
- If specialists frequently need coordination
- If orchestrators are underutilized
- If new complex workflows emerge
- After 3 months of production use

## Related Decisions
- ADR-001: Research-Plan-Execute Pattern
- ADR-002: Agent Specialization Framework
- ADR-005: v2.0 Orchestration Upgrade

## Notes
This decision formalizes the orchestration hierarchy that has been emerging organically through framework evolution. It provides clear guidelines for future agent development and helps users understand when to use orchestrators versus specialists.

The meta-development-orchestrator specifically embodies the framework's self-hosting principle, where MultiAgent-Claude uses its own patterns to improve itself.

## Future Considerations
- Consider "Senior Specialist" tier using Opus for complex specialist tasks
- Explore dynamic model selection based on task complexity
- Investigate agent chains where specialists can invoke other specialists
- Consider orchestrator specialization (e.g., Testing Orchestrator, Deployment Orchestrator)