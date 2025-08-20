# Agent YAML Header Patterns

## Standard YAML Header Format

### Required Fields
```yaml
---
name: agent-name
description: Use this agent PROACTIVELY when [triggers]. This agent excels at [competency].
model: sonnet
color: [blue|green|red|yellow|purple|orange|pink]
---
```

### Description Pattern
The description field follows a specific formula:

1. **Proactive Trigger**: "Use this agent PROACTIVELY when [specific conditions]"
2. **Keyword Triggers**: "Use PROACTIVELY when user mentions [keywords, technologies, concepts]"
3. **Core Competency**: "This agent excels at [primary skill]"
4. **Specialization**: "and specializes in [specific domains]"

### Example Headers

**Successful Pattern - ai-agent-architect**:
```yaml
---
name: ai-agent-architect
description: Use this agent PROACTIVELY when you need to design, architect, or implement AI agentic systems and workflows. Use PROACTIVELY when user mentions LangChain, MCP servers, agent orchestration, multi-agent systems, or AI workflows. This includes building agent-based microservices, MCP servers, orchestration systems, or any cloud-deployed AI agent infrastructure.
model: sonnet
color: red
---
```

**Successful Pattern - frontend-ui-expert**:
```yaml
---
name: frontend-ui-expert
description: Use this agent PROACTIVELY when building frontend components, UI systems, or modern web applications. Use PROACTIVELY when user mentions React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, or frontend architecture. This agent excels at creating scalable component systems and interactive user interfaces.
model: sonnet
color: blue
---
```

## Color Conventions

- **Red**: AI/Backend systems (ai-agent-architect, aws-backend-architect)
- **Blue**: Frontend/UI (frontend-ui-expert, ui-design-auditor)  
- **Green**: Testing/QA (playwright-test-engineer)
- **Yellow**: Documentation/Analysis (documentation-architect, codebase-truth-analyzer)
- **Purple**: Infrastructure/DevOps (infrastructure-migration-architect)
- **Orange**: Integration/Orchestration (fullstack-feature-orchestrator)
- **Pink**: Specialized domains (multimodal-ai-specialist)

## Examples Section Pattern

Each agent includes 2-3 examples following this structure:

```yaml
Examples:
- <example>
  Context: [Specific scenario description]
  user: "[Example user request]"
  assistant: "I'll use the [agent-name] agent to [specific action]"
  <commentary>
  [Explanation of why this agent is the right choice]
  </commentary>
</example>
```

## Quality Checklist for YAML Headers

- [ ] Name is lowercase with hyphens
- [ ] Description starts with "Use this agent PROACTIVELY when"
- [ ] Specific trigger keywords included
- [ ] Core competency clearly stated
- [ ] Model set to "sonnet"
- [ ] Color chosen from approved list
- [ ] 2-3 examples provided
- [ ] Examples include context, user request, and assistant response
- [ ] Commentary explains agent selection rationale

## Common Anti-Patterns

❌ **Vague descriptions**: "Use when you need help with frontend"
✅ **Specific descriptions**: "Use PROACTIVELY when building React components with TypeScript"

❌ **Missing keywords**: No mention of specific technologies
✅ **Clear keywords**: "React, Next.js, TypeScript, Tailwind CSS"

❌ **Generic examples**: Basic scenarios without context
✅ **Specific examples**: Real-world scenarios with clear reasoning

## Usage in New Agents

When creating new agents:
1. Copy YAML header pattern from template
2. Customize description with specific triggers
3. Choose appropriate color based on domain
4. Create realistic examples with commentary
5. Validate against quality checklist