---
description: "Create ChatGPT/Codex-optimized roles from Claude agents with compression and cross-platform compatibility"
argument-hint: "[role-name] [--agent agent-name] [--domain domain] [--batch agents] [--interactive]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch", "Glob"]
model: "sonnet"
---

# /generate-role

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Role name, agent source, domain, or batch conversion request
- **$ARGUMENTS**: Parsed command arguments including role name, flags (--agent, --domain, --batch, --interactive), and options
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and documentation
- **ROLE_DIR**: `.chatgpt/roles/` - Directory for generated ChatGPT role files
- **SESSION_ID**: Generated from `getSessionId('generate_role_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/role-creation-[name]-[timestamp].md` - Agent-generated plan location
- **ROLE_NAME**: Extracted role name from arguments or generated from agent name
- **SOURCE_AGENT**: Source agent file path if --agent flag provided
- **TARGET_DOMAIN**: Domain expertise area if --domain flag provided
- **BATCH_AGENTS**: Comma-separated list of agents if --batch flag provided
- **CHARACTER_LIMIT**: 1500 - Maximum character count for ChatGPT roles
- **MANIFEST_FILE**: `.chatgpt/roles/manifest.json` - Role registry file

## Instructions

This command implements the research-plan-execute pattern for creating compressed, token-efficient ChatGPT/Codex roles from existing Claude agents or from scratch, ensuring cross-platform compatibility while maintaining agent capabilities.

1. **Role Design Phase**: Deploy role-instruction-engineer to analyze requirements and design role structure
2. **Compression Phase**: Deploy prompt-compression-specialist to optimize for ChatGPT token limits
3. **Generation Phase**: Create role file with compressed instructions and workflow patterns
4. **Validation Phase**: Verify character limits and functional compatibility
5. **Integration Phase**: Update manifest and documentation

### Prerequisites
- Source agent exists (if converting from existing agent)
- Role directory structure exists or can be created
- Compression specialists available for deployment

### Decision Points
- If --agent flag provided: Convert existing agent to role
- If --domain flag provided: Create new role from scratch in specified domain
- If --batch flag provided: Process multiple agents in sequence
- If --interactive flag provided: Launch interactive role creation wizard
- If no flags provided: Default to interactive mode
- If character limit exceeded: Request additional compression or manual optimization

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document role creation objectives from USER_PROMPT
     - Set role generation parameters and constraints
   - STOP and alert user if session creation fails

2. **Parse Arguments and Determine Mode**
   - If --batch flag provided:
     - Parse BATCH_AGENTS list
     - Set mode to "batch_conversion"
     - Continue to step 6 (Batch Processing)
   - If --interactive flag provided or no arguments:
     - Set mode to "interactive"
     - Continue to step 3 (Interactive Mode)
   - If --agent flag provided:
     - Set mode to "agent_conversion"
     - Validate SOURCE_AGENT exists
     - Continue to step 4 (Agent Analysis)
   - If --domain flag provided:
     - Set mode to "domain_creation"
     - Continue to step 5 (Domain Role Creation)

3. **Interactive Mode Setup**
   - Present source selection menu:
     - Convert existing agent
     - Create new role from domain
     - Batch convert multiple agents
   - Collect user inputs for ROLE_NAME, SOURCE_AGENT, or TARGET_DOMAIN
   - Set variables based on user selections
   - Continue to appropriate workflow step

4. **Agent Analysis and Conversion**
   - Read SOURCE_AGENT file content
   - Deploy role-instruction-engineer agent:
     - Pass agent content and conversion requirements
     - Request role structure analysis and design
     - Specify CHARACTER_LIMIT constraint
   - Wait for plan generation at PLAN_FILE
   - Continue to step 7 (Role Generation)

5. **Domain Role Creation**
   - Deploy role-instruction-engineer agent:
     - Pass TARGET_DOMAIN and role creation requirements
     - Request new role design from scratch
     - Specify CHARACTER_LIMIT constraint and best practices
   - Wait for plan generation at PLAN_FILE
   - Continue to step 7 (Role Generation)

6. **Batch Processing**
   - For each agent in BATCH_AGENTS:
     - Set SOURCE_AGENT to agent path
     - Execute steps 4 and 7 for current agent
     - Collect results and continue to next agent
   - Generate consolidated batch report
   - Continue to step 9 (Verification)

7. **Role Generation and Compression**
   - Read role design plan from PLAN_FILE
   - Deploy prompt-compression-specialist agent:
     - Pass role design and CHARACTER_LIMIT constraint
     - Request compression optimization for ChatGPT
     - Ensure essential capabilities preserved
   - Wait for compressed role specification
   - Validate character count meets limit

8. **Create Role File**
   - Ensure ROLE_DIR exists, create if necessary
   - Generate role markdown file at ${ROLE_DIR}${ROLE_NAME}.md
   - Include compressed instructions, workflow, and principles
   - Add ChatGPT-specific formatting and compatibility notes
   - Update MANIFEST_FILE with new role entry

9. **Verification and Integration**
   - Verify role file character count under CHARACTER_LIMIT
   - Test role file markdown syntax validity
   - Update .chatgpt/roles/manifest.json registry
   - Create or update AGENTS.md documentation if exists
   - Generate usage instructions and examples

## Report

```markdown
# Role Generation Report: /generate-role

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Mode**: [agent_conversion|domain_creation|batch_conversion|interactive]

## Objectives
${USER_PROMPT}

## Role Details
- **Role Name**: ${ROLE_NAME}
- **Source**: ${SOURCE_AGENT || TARGET_DOMAIN || "Interactive Creation"}
- **File Location**: ${ROLE_DIR}${ROLE_NAME}.md
- **Character Count**: [count]/${CHARACTER_LIMIT}
- **Compression Ratio**: [percentage]% from original

## Agent Plans Generated
- ${PLAN_FILE}
- Compression plan: [if applicable]
- Additional plans: [if batch mode]

## Implementation Summary
### Files Created/Modified
- ${ROLE_DIR}${ROLE_NAME}.md - New ChatGPT role file
- ${MANIFEST_FILE} - Updated role registry
- AGENTS.md - Updated documentation [if applicable]

### Preserved Capabilities
- [List of key capabilities maintained from source]
- [Essential expertise areas retained]
- [Workflow patterns preserved]

### Compression Optimizations
- [Specific compression techniques applied]
- [Removed elements for space efficiency]
- [Token optimization strategies used]

## Verification Results
- Character Limit Met: [Yes/No] ([count]/${CHARACTER_LIMIT})
- Markdown Syntax Valid: [Yes/No]
- Essential Capabilities Preserved: [Yes/No]
- ChatGPT Compatibility: [Yes/No]
- Manifest Updated: [Yes/No]

## Usage Instructions
### ChatGPT Setup
1. Copy role content from ${ROLE_DIR}${ROLE_NAME}.md
2. Paste into ChatGPT custom instructions or project
3. Initialize with domain-specific context

### Example Usage
- Start conversations with: "Acting as [role name], help me..."
- Reference role principles when providing feedback
- Use role workflow for consistent outputs

## Next Steps
- Test role effectiveness in ChatGPT environment
- Gather feedback for compression optimization
- Consider additional role variations if needed

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Original Agent: [if conversion] - preserved for reference
```

## Control Flow Patterns

### Conditionals
```yaml
- If --agent flag provided:
    Convert existing agent to role
  Else If --domain flag provided:
    Create new role from domain specification
  Else If --batch flag provided:
    Process multiple agents sequentially
  Else:
    Launch interactive mode

- If character count > CHARACTER_LIMIT:
    Request additional compression
    Deploy compression specialist again
  Else:
    Proceed with role file creation

- If source agent not found:
    Alert user and request valid agent path
  Else:
    Continue with conversion process

- If compression fails to meet limit:
    Provide manual optimization suggestions
    Request user approval for reduced functionality
  Else:
    Complete role generation
```

### Iteration Loops
```yaml
- For each agent in BATCH_AGENTS:
    Set current agent as SOURCE_AGENT
    Execute conversion workflow
    Collect results in batch report

- For each compression_attempt in max_attempts:
    Deploy prompt-compression-specialist
    Check character count
    Break if limit met

- For each capability in source_agent:
    Evaluate importance score
    Include if essential or space permits
    Document if removed for compression

- For each role_file in generated_roles:
    Validate markdown syntax
    Update manifest registry
    Generate usage documentation
```

### Parallel Orchestration
```yaml
- When batch conversion requested:
    agents: [role-instruction-engineer, prompt-compression-specialist]
    parallel_execution:
      - Deploy role designer for analysis
      - Deploy compressor for optimization
      - Merge results into final role

- When multiple domains involved:
    parallel_tasks:
      - Role structure design
      - Compression optimization
      - Manifest updates
      - Documentation generation
    synchronization_point: "All components complete"
```

## Error Handling

### Recoverable Errors
- Character limit exceeded: Apply additional compression techniques
- Source agent not found: Prompt for correct path or switch to domain creation
- Manifest file corrupted: Recreate from existing role files
- Minor compression failures: Manual optimization with user guidance

### Critical Errors
- Role generation agent deployment failure: STOP and alert user
- Session context corruption: STOP and request recovery
- Cannot create role directory: STOP and check permissions
- Essential capabilities lost in compression: STOP and request user approval

## Anti-Patterns to Avoid

❌ **Creating roles without compression analysis**
❌ **Skipping character limit validation**
❌ **Losing essential agent capabilities in compression**
❌ **Creating roles incompatible with ChatGPT context**
❌ **Forgetting to update manifest registry**
❌ **Hardcoding paths instead of using variables**

## Usage Examples

```bash
# Convert existing agent to role
/generate-role frontend-ui-expert --agent frontend-ui-expert

# Create new role from domain
/generate-role database-optimizer --domain "database optimization"

# Batch convert multiple agents
/generate-role --batch "aws-backend-architect,playwright-test-engineer,documentation-architect"

# Interactive role creation
/generate-role --interactive

# Convert with custom role name
/generate-role web3-specialist --agent blockchain-developer --domain "Web3 development"
```

## Related Commands
- `/generate-agent` - Create new Claude agent templates
- `/sync-docs` - Update cross-platform documentation
- `mac convert-agent` - CLI agent/role conversion
- `mac sync` - Bidirectional synchronization
- `/implement` - Execute role-generated plans