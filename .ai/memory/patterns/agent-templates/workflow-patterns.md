# Agent Workflow Patterns

## Standard Core Workflow Structure

All agents follow this standard workflow pattern:

```markdown
## Core Workflow
1. Check if .claude/tasks/context_session_[session_id].md exists for full context (if available)
2. Use Context7 MCP to get latest documentation for:
   - [Relevant framework/library 1]
   - [Relevant framework/library 2]
   - [Best practices documentation]
3. Use WebSearch for latest updates and changelogs not in Context7
4. [Additional MCP tools as needed - Sequential, Magic, Playwright, AWS]
5. Create detailed implementation plan with [specific deliverables]
6. Save plan to .claude/doc/ in the project directory
```

## MCP Tool Usage Patterns

### Context7 Integration
Always specify what documentation to research:
```markdown
2. Use Context7 MCP to get latest documentation for:
   - LangChain and LangGraph patterns
   - MCP (Model Context Protocol) specifications
   - FastAPI and Celery best practices
   - NVIDIA NeMo and other agent frameworks
```

### WebSearch Fallback
```markdown
3. Use WebSearch for latest agent framework updates and examples
```

### Specialized Tools
```markdown
4. Use Sequential MCP for complex agent architecture analysis
```

## Plan Creation Pattern

### File Naming Convention
```markdown
Save the implementation plan to .claude/doc/[agent-type]-[task]-[timestamp].md
```

Examples:
- `.claude/doc/ai-agent-document-processor-20240817.md`
- `.claude/doc/frontend-ui-dashboard-20240817.md`
- `.claude/doc/aws-backend-api-gateway-20240817.md`

### Output Format Requirement
```markdown
## Output Format
Your final message MUST include the implementation file path you created. No need to recreate the same content again in the final message.

Example: "I've created a detailed [type] plan at .claude/doc/[agent-type]-[description]-20240817.md, please read that first before you proceed with implementation."
```

## Rules Section Pattern

### Universal Rules
All agents include these core rules:
```markdown
## Rules
- NEVER do the actual implementation or execute commands
- Your goal is to research and plan - the parent agent will handle implementation
- Before doing any work, check for .claude/tasks/context_session_[session_id].md files if they exist
- After finishing work, MUST create the .claude/doc/*.md file in the project directory
- Use Context7 MCP for latest documentation
- Use WebSearch for recent updates
```

### Domain-Specific Rules
Each agent adds specialized rules:
```markdown
- Use Sequential MCP for complex architecture decisions
- Always include scalability and fault tolerance considerations
- Document agent communication protocols clearly
```

## Planning Approach Pattern

### Standard Structure
```markdown
## Planning Approach

When creating implementation plans, you will:

1. **[Step 1]**: Document [what you analyze/research]
2. **[Step 2]**: Specify [what you document]
3. **[Step 3]**: Document [requirements/specifications]
4. **[Step 4]**: Include [specific technical details]
5. **[Step 5]**: Provide [deliverables]
```

### Domain-Specific Variations

**AI Agent Architect**:
```markdown
1. **Requirements Analysis**: Document the specific use case, scale requirements, and constraints
2. **Architecture Documentation**: Document a clear, scalable architecture that addresses all requirements
3. **Technology Recommendations**: Document the optimal combination of tools and frameworks to use
4. **Implementation Planning**: Document the implementation broken down into manageable phases
5. **Code Specifications**: Provide detailed specifications for production-ready code patterns
```

**Frontend UI Expert**:
```markdown
1. **Component Analysis**: Document component requirements and user interaction patterns
2. **Architecture Planning**: Specify component hierarchy and state management approach
3. **Technology Selection**: Document optimal React/Next.js patterns and libraries
4. **Implementation Steps**: Break down development into manageable phases
5. **Quality Assurance**: Specify testing and accessibility requirements
```

## Quality Standards Pattern

All agents include quality standards:
```markdown
## Quality Standards

Your implementation plans must include:
- [Quality requirement 1]
- [Quality requirement 2]
- [Quality requirement 3]
- [Performance/security/compliance requirements as relevant]
```

## Context Integration Rules

### Session Context Check
```markdown
1. Check if .claude/tasks/context_session_[session_id].md exists for full context (if available)
```

### Memory Integration
Some agents include memory checks:
```markdown
2. Check .ai/memory/patterns/ for existing solutions
3. Reference .ai/memory/decisions/ for architectural context
```

## Successful Workflow Examples

### AI Agent Architect Workflow
1. Session context check
2. Context7 for LangChain, MCP, FastAPI docs
3. WebSearch for latest agent framework updates
4. Sequential for complex architecture analysis
5. Create detailed plan with code examples
6. Save to `.claude/doc/ai-agent-*.md`

### Frontend UI Expert Workflow
1. Session context check
2. Context7 for React, Next.js, TypeScript docs
3. WebSearch for latest component library updates
4. Magic for UI component generation (if needed)
5. Create component architecture plan
6. Save to `.claude/doc/frontend-ui-*.md`

## Anti-Patterns to Avoid

❌ **Implementation in workflow**: Never include actual code execution
❌ **Missing context check**: Always check session context first
❌ **Vague MCP usage**: Specify exactly what documentation to research
❌ **Wrong file naming**: Don't use generic names for plans
❌ **Missing output format**: Always specify the file path created

## Usage Guidelines

When creating new agent workflows:
1. Start with standard 6-step pattern
2. Customize MCP tool usage for domain
3. Add domain-specific rules
4. Specify exact documentation sources
5. Include quality standards for the domain
6. Test workflow with real scenarios