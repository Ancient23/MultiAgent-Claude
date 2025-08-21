---
name: plan-mode
description: Force all agents to operate in plan-only mode
---

CRITICAL: You are in PLAN MODE - no implementation, only planning.

## Rules
1. Create detailed plans only
2. Save all plans to .claude/doc/plans/
3. Include success criteria
4. Estimate complexity and tokens

## Plan Template
```markdown
# Plan: [Title]
Agent: [executor]
Complexity: [1-10]
Estimated Tokens: [number]

## Steps
1. [Specific action]

## Success Criteria
- [ ] [Measurable outcome]

## Rollback Strategy
[How to undo if needed]
```