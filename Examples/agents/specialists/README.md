# Claude Code Sub-Agents Documentation

## Overview

This directory contains specialized sub-agents for Claude Code that provide expert planning and research capabilities across various technical domains. These agents follow a **research-only architecture** where they create detailed implementation plans but never execute implementations directly.

## Architecture Philosophy

### Separation of Concerns

```
User Request
    ↓
Main Claude Code System (Parent)
    ↓
[Delegates Research/Planning]
    ↓
Specialist Sub-Agent (Research Only)
    ↓
Returns Plan (.claude/doc/*.md)
    ↓
Main System Executes Plan
```

### Key Principles

1. **Single Responsibility**: Each agent specializes in one domain
2. **Research-Only**: Agents create plans, never implement
3. **Documentation Output**: All plans saved to `.claude/doc/` in project directory
4. **MCP Integration**: Agents use Context7, WebSearch, and other MCP tools for latest information
5. **Clear Handoff**: Plans include everything needed for implementation

## Available Agents

### Frontend & UI
- **frontend-ui-expert**: Next.js, React 19, Tailwind CSS v4, Shadcn UI
- **ui-design-auditor**: UX/UI audits, design improvements, accessibility

### Backend & Infrastructure
- **aws-backend-architect**: AWS service architecture and optimization
- **aws-deployment-specialist**: IaC, deployment strategies, CI/CD
- **backend-api-frontend-integrator**: API integration patterns
- **infrastructure-migration-architect**: Infrastructure transformation plans

### AI & ML
- **ai-agent-architect**: LangChain, MCP servers, agent systems
- **multimodal-ai-specialist**: Vision-language models, RAG systems

### Specialized
- **vercel-deployment-troubleshooter**: Vercel deployment diagnostics
- **documentation-architect**: Comprehensive documentation planning
- **codebase-truth-analyzer**: Code-documentation alignment verification
- **fullstack-feature-orchestrator**: End-to-end feature planning
- **cpp-plugin-api-expert**: C++ game engine plugin development

## Usage Guidelines

### When to Use Sub-Agents

Sub-agents should be used PROACTIVELY when:
- Complex domain-specific planning is needed
- Latest framework/library knowledge is required
- Systematic analysis would benefit from specialized expertise
- Architecture decisions need expert input

### Agent Selection

Agents include PROACTIVELY keywords in their descriptions to help with automatic delegation:
- "Use PROACTIVELY when user mentions [keywords]"
- Specific technology triggers (React, AWS, LangChain, etc.)

### Output Structure

All agents create plans in `.claude/doc/` with naming pattern:
```
.claude/doc/[agent-type]-[task-description]-[timestamp].md
```

## Best Practices

### For Users

1. **Let Delegation Happen**: Claude Code will automatically delegate when appropriate
2. **Explicit Requests**: You can explicitly request an agent with "use the X agent"
3. **Review Plans**: Check `.claude/doc/` for created plans before implementation

### For Agent Development

1. **Use the Template**: Start with `TEMPLATE-agent.md` for consistency
2. **Clear Descriptions**: Include PROACTIVELY keywords and specific triggers
3. **Detailed Prompts**: Provide comprehensive instructions in the agent prompt
4. **MCP Tool Usage**: Specify which MCP tools the agent should use
5. **No Implementation**: Always emphasize the agent only creates plans

## Project Structure

When agents run in a project, they expect/create:
```
project-root/
├── CLAUDE.md           # Project-specific Claude instructions (if exists)
├── .claude/
│   ├── doc/           # Agent-created implementation plans
│   │   ├── frontend-ui-landing-page-20240817.md
│   │   ├── aws-backend-api-gateway-20240817.md
│   │   └── ...
│   └── tasks/         # Context session files (if available)
│       └── context_session_[session_id].md
```

## Agent Configuration

### Standard Frontmatter
```yaml
name: agent-name
description: Use this agent PROACTIVELY when...
model: sonnet
color: [blue|green|red|yellow|purple|orange|pink]
```

### Standard Sections
1. **Goal**: Clear statement about creating plans only
2. **Core Workflow**: Steps including MCP tool usage
3. **Output Format**: File path reporting requirement
4. **Rules**: Constraints and requirements
5. **Competencies**: What the agent documents in plans
6. **Planning Approach**: How the agent creates plans

## MCP Tool Allocation

Agents use specific MCP tools based on their domain:
- **Context7**: All agents for latest documentation
- **WebSearch**: All agents for recent updates
- **Sequential**: Complex analysis agents
- **Magic**: UI/frontend agents
- **Playwright**: Testing/visual agents
- **AWS MCP**: AWS-specific agents

## Version Control

These agents are stored at the user level (`~/.claude/agents/`) and apply across all projects. Project-specific agents can be created in `project/.claude/agents/` if needed.

## Maintenance

### Adding New Agents
1. Copy `TEMPLATE-agent.md` to new file
2. Customize for specific domain
3. Test with various prompts
4. Document in this README

### Updating Existing Agents
1. Maintain research-only focus
2. Update MCP tool usage as needed
3. Keep descriptions current with PROACTIVELY keywords
4. Ensure Goal section emphasizes planning-only

## FAQ

**Q: Why don't agents implement code directly?**
A: Separation of concerns - agents are experts at planning with latest knowledge, while the main system handles execution with full context.

**Q: Can I create implementation agents?**
A: Not recommended - it adds complexity without benefit since the main system already handles implementation well.

**Q: How do agents stay current?**
A: They use Context7 MCP for latest documentation and WebSearch for recent updates, ensuring plans use current best practices.

**Q: What if I need an agent to execute commands?**
A: The main Claude Code system should handle execution based on the agent's plan. This maintains clear boundaries and prevents confusion.