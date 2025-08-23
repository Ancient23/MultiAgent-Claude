# /generate-role Command

## Command Definition

```yaml
---
command: "/generate-role"
category: "Development"
purpose: "Create ChatGPT/Codex-optimized roles from Claude agents"
pattern: "research → compress → optimize"
agents: ["role-instruction-engineer", "prompt-compression-specialist"]
---
```

## Command Overview

This command creates compressed, token-efficient ChatGPT/Codex roles from existing Claude agents, ensuring cross-platform compatibility while maintaining agent capabilities.

## Usage

```bash
# Convert existing agent to role
/generate-role --agent frontend-ui-expert

# Create role from scratch
/generate-role --name "database-optimizer" --domain "database"

# Batch convert multiple agents
/generate-role --batch aws-backend-architect,playwright-test-engineer

# Interactive role creation
/generate-role
```

## Examples

```bash
# Example 1: Convert existing agent
/generate-role --agent frontend-ui-expert
# Creates .chatgpt/roles/frontend-ui-expert.md

# Example 2: Create custom role
/generate-role --name "web3-developer" --domain "blockchain"
# Creates optimized role for Web3 development

# Example 3: Batch conversion
/generate-role --batch agent1,agent2,agent3
# Converts multiple agents to roles
```

## Execution Flow

### Phase 1: Role Design & Compression
```yaml
step: "Delegate to Role Engineering Specialists"
primary_agent: "role-instruction-engineer"
secondary_agent: "prompt-compression-specialist"
purpose: "Create compressed, effective ChatGPT role"
actions:
  - Analyze agent capabilities and domain
  - Extract essential behaviors and expertise
  - Compress to <1500 characters
  - Optimize for token efficiency
  - Create role with workflow and principles
output: ".claude/doc/role-creation-[name]-[timestamp].md"
mcp_tools:
  - sequential (compression analysis)
  - context7 (best practices)
```

### Phase 2: Role Specification Review
```yaml
step: "Main System Reviews Role Specification"
handler: "main-system"
actions:
  - Read role specification from .claude/doc/
  - Validate compression effectiveness
  - Check character count (<1500)
  - Ensure essential capabilities preserved
  - Verify ChatGPT compatibility
validation:
  - Role is under 1500 characters
  - Essential expertise preserved
  - Workflow instructions clear
  - Output format specified
```

### Phase 3: Role File Creation
```yaml
step: "Create Role File"
handler: "main-system"
input: "Role specification from .claude/doc/"
actions:
  - Generate role markdown file
  - Create compressed instructions
  - Include workflow pattern
  - Add principles section
  - Specify output format
  - Save to .chatgpt/roles/[role-name].md
tools: [Write, MultiEdit]
error_handling:
  - Check character limit
  - Validate markdown syntax
  - Ensure directory exists
```

### Phase 4: Integration & Manifest Update
```yaml
step: "Update Role Manifest"
handler: "main-system"
actions:
  - Update .chatgpt/roles/manifest.json
  - Add role to AGENTS.md if exists
  - Create usage documentation
  - Log role creation
```

## Role Compression Strategies

### Essential Elements to Preserve
- Core domain expertise
- Key technical skills
- Primary workflow pattern
- Critical quality standards
- Output format requirements

### Elements to Compress/Remove
- Verbose explanations
- Example scenarios
- MCP tool references (ChatGPT-specific)
- Claude-specific patterns
- Redundant instructions

### Compression Techniques
1. **Keyword Dense**: Use domain keywords efficiently
2. **Implicit Context**: Rely on ChatGPT's understanding
3. **Bullet Points**: Replace paragraphs with lists
4. **Abbreviations**: Use common abbreviations
5. **Combined Instructions**: Merge related directives

## Role Template Structure

```markdown
# [Role Name]

You are a [domain] [role] expert. [Core expertise in one sentence].

## Expertise
- [Key skill 1]
- [Key skill 2]
- [Key skill 3]

## Workflow
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Principles
- [Principle 1]
- [Principle 2]

## Output
- [Format requirement]
- [Quality standard]
```

## Quality Standards

### Compression Quality
- [ ] Under 1500 characters
- [ ] Preserves essential capabilities
- [ ] Clear and actionable
- [ ] No redundancy

### Functional Quality
- [ ] Produces correct behavior
- [ ] Maintains agent expertise
- [ ] Works with ChatGPT context limits
- [ ] Compatible with Projects feature

## Success Criteria

### Creation Success
- [ ] Role file created successfully
- [ ] Character limit maintained
- [ ] Manifest updated
- [ ] Documentation complete

### Functional Success
- [ ] Role produces expected behavior
- [ ] Works within ChatGPT limits
- [ ] Maintains quality standards
- [ ] Cross-platform compatible

## Error Handling

### Compression Failures
- Report character count exceeded
- Identify sections for further compression
- Suggest content prioritization
- Offer alternative compression

### Conversion Issues
- Handle missing agent files
- Report incompatible patterns
- Provide fallback templates
- Maintain partial progress

## Interactive Mode

When run without parameters:

1. **Source Selection**: Choose agent or create new
2. **Domain Definition**: Specify expertise area
3. **Compression Preview**: Review compressed version
4. **Optimization**: Further compress if needed
5. **Creation**: Generate role file

## Output Format

### Role Creation Report
```markdown
# Role Creation Report
## Role: [role-name]
- **Source**: [agent-name or custom]
- **File**: .chatgpt/roles/[role-name].md
- **Character Count**: [count]/1500
- **Compression Ratio**: [percentage]

## Preserved Capabilities
[List of key capabilities]

## Usage Instructions
[How to use in ChatGPT]
```

## Related Commands
- `/generate-agent` - Create new agents
- `/sync-docs` - Update documentation
- `mac openai sync` - Synchronize with OpenAI config