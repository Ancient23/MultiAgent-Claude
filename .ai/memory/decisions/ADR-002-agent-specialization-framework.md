# ADR-002: Agent Specialization Framework

**Date**: 2025-08-19  
**Status**: Accepted  
**Source**: Agent template pattern analysis

## Context

The MultiAgent-Claude framework requires a systematic approach to agent specialization to maximize effectiveness while maintaining consistency. Key challenges include:
1. Defining clear domains of expertise for each agent
2. Preventing overlap and confusion between agent responsibilities
3. Ensuring all agents follow consistent patterns and conventions
4. Enabling effective agent selection based on task requirements

## Decision

We establish a **Structured Agent Specialization Framework** with:

1. **Domain-Based Specialization**: Agents are specialized by technical domain or business area
2. **Trigger-Based Activation**: Agents are invoked based on specific keywords and context patterns
3. **Standardized Template Structure**: All agents follow identical YAML header and content patterns
4. **Color-Coded Organization**: Visual organization by domain using consistent color schemes

## Rationale

### Clear Specialization Benefits
- Agents can develop deep expertise in their specific domains
- Reduces cognitive load by eliminating domain overlap
- Enables more effective prompt engineering for specific use cases
- Allows for domain-specific MCP tool optimization

### Trigger-Based Activation
- Provides clear rules for when to use each agent
- Reduces decision fatigue in agent selection
- Enables automated agent recommendation
- Creates predictable user experience

### Standardized Structure
- Ensures consistency across all agent templates
- Reduces learning curve for new agents
- Enables automated validation and quality checking
- Facilitates pattern reuse and improvement

## Implementation Details

### Agent Categories

**Core Development Agents** (Technical Implementation):
- `ai-agent-architect` - AI systems, LangChain, MCP servers (Red)
- `frontend-ui-expert` - React, Next.js, UI components (Blue)
- `aws-backend-architect` - AWS services, infrastructure (Red)
- `fullstack-feature-orchestrator` - End-to-end features (Orange)

**Quality Assurance Agents** (Testing and Validation):
- `playwright-test-engineer` - E2E testing, automation (Green)
- `cli-test-engineer` - CLI testing and validation (Green)

**Documentation and Analysis Agents** (Information Management):
- `documentation-architect` - API docs, technical writing (Yellow)
- `codebase-truth-analyzer` - Code-documentation alignment (Yellow)
- `documentation-sync-guardian` - Documentation synchronization (Yellow)

**Specialized Domain Agents** (Specific Expertise):
- `multimodal-ai-specialist` - Vision models, RAG systems (Pink)
- `infrastructure-migration-architect` - Re-platforming (Purple)
- `prompt-engineer-specialist` - Agent template improvement (Yellow)

### Template Structure Requirements

**YAML Header Standard**:
```yaml
---
name: agent-name
description: Use this agent PROACTIVELY when [triggers]. This agent excels at [competency].
model: sonnet
color: [domain-color]
---
```

**Required Sections**:
1. Goal statement with clear scope
2. Core Workflow (6-step standard pattern)
3. Output Format requirements
4. Rules (including research-only constraint)
5. Core Competencies documentation
6. Planning Approach specification

### Color-Domain Mapping
- **Red**: Backend/AI systems (ai-agent-architect, aws-backend-architect)
- **Blue**: Frontend/UI (frontend-ui-expert, ui-design-auditor)
- **Green**: Testing/QA (playwright-test-engineer, cli-test-engineer)
- **Yellow**: Documentation/Analysis (documentation-architect, prompt-engineer-specialist)
- **Purple**: Infrastructure/DevOps (infrastructure-migration-architect)
- **Orange**: Integration/Orchestration (fullstack-feature-orchestrator)
- **Pink**: Specialized domains (multimodal-ai-specialist)

### Trigger Pattern Standards

**Keyword-Based Triggers**:
- Technology names (React, AWS, LangChain)
- Action verbs (design, test, deploy, document)
- Domain terms (frontend, backend, AI, testing)

**Context-Based Triggers**:
- Project phase (development, testing, deployment)
- Problem type (performance, security, integration)
- Artifact type (API, UI, documentation, tests)

## Agent Selection Criteria

### Primary Selection Factors
1. **Domain Match**: Agent's expertise aligns with task domain
2. **Technology Overlap**: Required technologies match agent capabilities
3. **Task Complexity**: Agent can handle the complexity level
4. **Output Requirements**: Agent can produce needed deliverables

### Secondary Selection Factors
1. **Current Context**: Available context matches agent needs
2. **Tool Requirements**: Needed MCP tools match agent capabilities
3. **Timeline Constraints**: Agent workflow fits available time
4. **Quality Standards**: Agent maintains required quality levels

## Consequences

### Positive
- **Clear Responsibility**: No ambiguity about which agent to use
- **Deep Expertise**: Agents can develop specialized knowledge
- **Consistent Quality**: Standardized templates ensure uniform quality
- **Easy Maintenance**: Clear patterns simplify agent updates
- **Scalable Growth**: New agents can be added following established patterns

### Negative
- **Learning Overhead**: Users must understand specialization domains
- **Template Maintenance**: Standardization requires ongoing enforcement
- **Rigid Structure**: May constrain creative agent design approaches

### Neutral
- **Agent Proliferation**: May lead to many specialized agents
- **Selection Complexity**: Users need guidance for agent selection

## Compliance Requirements

### For New Agents
1. **Domain Definition**: Clear, non-overlapping domain specification
2. **Trigger Keywords**: Specific trigger patterns documented
3. **Template Compliance**: Follow standardized YAML header and sections
4. **Color Assignment**: Use appropriate domain color
5. **Example Quality**: Provide realistic, contextual examples

### For Existing Agents
1. **Consistency Review**: Regular review against current standards
2. **Trigger Optimization**: Refine triggers based on usage patterns
3. **Capability Updates**: Keep expertise current with technology changes
4. **Cross-Reference Validation**: Ensure no domain overlap

### For Framework Maintenanceß
1. **Pattern Documentation**: Maintain patterns in `.ai/memory/patterns/`
2. **Quality Validation**: Regular template validation
3. **Usage Analytics**: Track agent usage patterns
4. **Continuous Improvement**: Evolve specialization based on experience

## Quality Metrics

### Agent Effectiveness Metrics
- Task completion rate by agent
- Plan quality assessment
- User satisfaction with agent selection
- Time to complete specialized tasks

### Framework Health Metrics
- Template compliance percentage
- Agent domain coverage completeness
- Trigger keyword effectiveness
- Cross-agent consistency scores

## Related Decisions
- ADR-001: Research-Plan-Execute Pattern
- ADR-003: Memory System Architecture
- ADR-004: File and Directory Conventions

## Review Schedule
This ADR should be reviewed quarterly to assess specialization effectiveness and identify new domain needs.