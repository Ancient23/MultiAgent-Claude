---
description: "Generate new specialized agent templates following established patterns and framework best practices"
argument-hint: "[agent-name] [--domain domain] [--color color] [--from-spec file] [options]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch", "Grep", "Glob"]
model: "sonnet"
---

# /generate-agent

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Agent specification including name, domain, and customization options
- **$ARGUMENTS**: Parsed command arguments including agent name, domain, color, and specification flags
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent creation plans and documentation
- **SESSION_ID**: Generated from `getSessionId('generate-agent_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/agent-creation-[name]-[timestamp].md` - Agent creation plan location
- **AGENT_NAME**: Parsed from arguments or interactive input - Name for the new agent
- **DOMAIN**: Parsed from arguments or interactive input - Domain expertise for the agent
- **COLOR**: Parsed from arguments or defaults to domain-appropriate color
- **SPEC_FILE**: Optional existing specification file to build from
- **TARGET_FILE**: `.claude/agents/${AGENT_NAME}.md` - Final agent template location

## Instructions

This command implements the research-plan-execute pattern for agent template creation where:

1. **Initialization**: Create session context with agent specification objectives
2. **Research Phase**: Deploy agent-factory and prompt-engineer specialists to analyze requirements
3. **Planning Phase**: Agents document comprehensive agent template design strategy
4. **Review Phase**: Main system reads and validates the agent creation plan
5. **Execution Phase**: Main system creates the agent template following the plan
6. **Verification Phase**: Validate template compliance and integration with framework

### Prerequisites
- Identify domain expertise requirements for the new agent
- Ensure agent name follows naming conventions (lowercase-with-hyphens)
- Verify no naming conflicts with existing agents
- Check available colors and MCP tool assignments

### Decision Points
- If SPEC_FILE provided: Build from existing specification
- If AGENT_NAME exists: Prompt for overwrite or rename
- If domain is new: Create comprehensive capability set
- If interactive mode: Guide user through specification process
- If validation fails: Iterate on template until compliant

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document agent creation objectives from USER_PROMPT
     - Parse command arguments (name, domain, color, spec-file)
   - STOP and alert user if session creation fails

2. **Validate Agent Specifications**
   - If AGENT_NAME provided:
     - Check naming conventions (lowercase-with-hyphens)
     - Verify uniqueness against existing agents in .claude/agents/
   - If no AGENT_NAME:
     - Enter interactive mode for name specification
   - If SPEC_FILE provided:
     - Read and validate existing specification format
   - Check COLOR assignment against domain standards

3. **Deploy Agent Creation Specialists**
   - For agent template design:
     - Invoke Task tool with agent-factory specialist
     - Pass session context, domain requirements, and specifications
   - For prompt engineering optimization:
     - Invoke Task tool with prompt-engineer-specialist
     - Pass template requirements and framework patterns
   - Wait for both agents to complete analysis and planning

4. **Review Agent Creation Plan(s)**
   - For each plan in OUTPUT_DIR:
     - Read and parse agent template specifications
     - Validate YAML header completeness and format
     - Check workflow pattern compliance with framework
     - Verify example quality and domain relevance
   - If issues found or user approval needed:
     - Request confirmation before proceeding with creation

5. **Execute Agent Template Creation**
   - For each step in consolidated creation plan:
     - Create YAML frontmatter with proper format
     - Generate agent description with trigger keywords
     - Implement standard workflow pattern
     - Add domain-specific competencies and capabilities
     - Create realistic examples with context and commentary
     - Apply quality standards and validation rules
   - Write complete template to TARGET_FILE using Write tool
   - Update context_session with creation progress

6. **Verify Agent Template**
   - Run template validation checks using Bash tool
   - Verify YAML header syntax and completeness
   - Check workflow pattern compliance
   - Validate example quality and relevance
   - Test agent integration with framework patterns
   - Generate verification report with any issues found

## Report

```markdown
# Command Execution Report: /generate-agent

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]

## Objectives
Create new agent: ${AGENT_NAME}
Domain: ${DOMAIN}
Color: ${COLOR}
Specification: ${SPEC_FILE || "Interactive"}

## Agent Plans Generated
- ${PLAN_FILE}
- Additional specialist plans: [if applicable]

## Implementation Summary
### Agent Template Created
- **File**: ${TARGET_FILE}
- **Name**: ${AGENT_NAME}
- **Domain**: ${DOMAIN}
- **Model**: sonnet
- **Color**: ${COLOR}

### Template Components
- YAML frontmatter: [complete/incomplete]
- Description with triggers: [complete/incomplete]
- Workflow pattern: [compliant/non-compliant]
- Domain competencies: [comprehensive/limited]
- Quality examples: [complete/incomplete]
- Validation rules: [complete/incomplete]

### Validation Results
- YAML syntax: [valid/invalid]
- Naming conventions: [compliant/non-compliant]
- Framework integration: [compatible/incompatible]
- Pattern compliance: [yes/no]

## Verification Results
- Template Creation: [Success/Failed]
- Validation Checks: [Pass/Fail]
- Framework Integration: [Compatible/Issues]
- Documentation Updated: [Yes/No]

## Next Steps
- Test agent with sample invocation
- Add agent to project documentation
- Update agent registry in .claude/agents/README.md
- Create usage examples in project guides

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Template: `.ai/memory/patterns/agent-templates/${AGENT_NAME}-pattern.md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If SPEC_FILE exists:
    Build from existing specification
  Else:
    Create specification through research

- If AGENT_NAME conflicts:
    Prompt for resolution (overwrite/rename)
  Else:
    Proceed with creation

- If validation fails:
    Iterate template improvements
    Re-validate until compliant
  Else:
    Complete creation and document

- If interactive mode:
    Guide user through specification process
  Else:
    Use provided arguments directly
```

### Iteration Loops
```yaml
- For each domain_requirement in specifications:
    Add relevant competency section
    Include appropriate MCP tools
    Create domain-specific examples

- For each validation_check in framework_standards:
    Run validation test
    Record results
    Fix issues if found

- For each example_scenario in template:
    Verify realistic context
    Check assistant response quality
    Ensure educational commentary
```

### Parallel Orchestration
```yaml
- When complex agent requirements:
    agents: [agent-factory, prompt-engineer-specialist]
    parallel_execution:
      - Deploy both specialists simultaneously
      - Agent-factory: template structure and domain analysis
      - Prompt-engineer: optimization and pattern compliance
      - Wait for both completions
      - Merge plans into unified creation strategy

- When template validation needed:
    parallel_tasks:
      - YAML syntax validation
      - Framework pattern compliance
      - Example quality assessment
      - Integration testing
    synchronization_point: "All validations complete"
```

## Error Handling

### Recoverable Errors
- Invalid agent name: Prompt for correction following conventions
- Color conflict: Suggest alternative colors based on domain
- Incomplete specification: Guide user through missing requirements
- Template validation failure: Provide specific improvement recommendations

### Critical Errors
- Session context creation failure: STOP and alert user
- File system permission issues: STOP and request resolution
- Agent specialist deployment failure: STOP and provide diagnostics
- Naming collision with critical system files: STOP and prevent overwrite

## Anti-Patterns to Avoid

❌ **Creating agents without domain-specific expertise**
❌ **Skipping validation of YAML frontmatter**
❌ **Using generic examples instead of domain-specific scenarios**
❌ **Ignoring framework pattern compliance**
❌ **Hardcoding paths instead of using standard locations**
❌ **Creating agents without proper trigger keywords**

## Usage Examples

```bash
# Interactive agent creation
/generate-agent

# Create database optimization specialist
/generate-agent "database-performance-specialist" --domain "database optimization" --color "green"

# Create security auditing agent
/generate-agent "security-audit-specialist" --domain "security" --color "red"

# Build from existing specification
/generate-agent --from-spec ./specs/blockchain-specialist.md

# Create with specific model assignment
/generate-agent "ai-ethics-specialist" --domain "AI ethics" --model "opus" --color "purple"
```

## Domain Categories

### Technical Domains
- **Backend Development**: APIs, databases, microservices, serverless
- **Frontend Development**: UI/UX, React, Vue, Angular, responsive design
- **DevOps & Infrastructure**: AWS, Docker, Kubernetes, CI/CD, monitoring
- **Testing & QA**: Unit testing, integration testing, automation, performance
- **Security**: Security audits, vulnerability assessment, compliance, cryptography

### Business Domains
- **E-commerce**: Payment systems, inventory, customer management, analytics
- **Finance**: Financial modeling, risk assessment, compliance, blockchain
- **Healthcare**: HIPAA compliance, medical records, patient systems, telemedicine
- **Education**: Learning management, curriculum design, assessment, accessibility

### Specialized Domains
- **AI/ML**: Model training, data science, MLOps, neural networks, NLP
- **Mobile Development**: iOS, Android, React Native, Flutter, PWAs
- **Game Development**: Unity, Unreal Engine, game mechanics, monetization
- **IoT**: Device management, sensor data, edge computing, embedded systems

## Quality Standards

### Template Requirements
- [ ] Complete YAML frontmatter with all required fields
- [ ] Clear agent description with specific trigger keywords
- [ ] Standard 6-step workflow pattern implementation
- [ ] Domain-specific MCP tool assignments
- [ ] Comprehensive competency sections
- [ ] Quality examples with context and commentary
- [ ] Validation rules and quality standards

### Framework Integration
- [ ] Compatibility with orchestration patterns
- [ ] Proper memory system integration
- [ ] Standard output format compliance
- [ ] Error handling and recovery procedures
- [ ] Anti-pattern prevention rules

### Documentation Quality
- [ ] Clear usage instructions and examples
- [ ] Comprehensive capability descriptions
- [ ] Integration guidelines with other agents
- [ ] Maintenance and evolution procedures

## Related Commands
- `/validate-templates` - Validate created agent template compliance
- `/sync-docs` - Update documentation with new agent
- `/test-cli` - Test agent creation CLI functionality
- `/orchestrate` - Multi-agent orchestration with new agent