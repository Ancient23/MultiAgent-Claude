# /generate-agent Command

## Command Definition

```yaml
---
command: "/generate-agent"
category: "Development"
purpose: "Create new agent templates following established patterns and framework best practices"
pattern: "research → plan → execute"
agents: ["agent-factory", "prompt-engineer-specialist"]
---
```

## Command Overview

This command creates new specialized agents for the MultiAgent-Claude framework, applying established patterns and ensuring consistency with existing agents while enabling domain-specific capabilities.

## Usage

```bash
# Interactive agent creation
/generate-agent

# Create agent with specific domain
/generate-agent --domain "database optimization"

# Create agent with template specification
/generate-agent --name "security-audit-specialist" --domain "security"

# Generate agent from existing partial specification
/generate-agent --from-spec ./agent-spec.md
```

## Examples

```bash
# Example 1: Interactive creation
/generate-agent
# Prompts for domain, capabilities, and specifications

# Example 2: Database specialist
/generate-agent --domain "database optimization" --name "database-performance-specialist"
# Creates database optimization agent following patterns

# Example 3: Security auditing agent
/generate-agent --name "security-audit-specialist" --domain "security" --color "red"
# Creates security specialist with specified characteristics
```

## Execution Flow

### Phase 1: Agent Design & Planning
```yaml
step: "Delegate to Agent Design Specialists"
primary_agent: "agent-factory"
secondary_agent: "prompt-engineer-specialist"
purpose: "Create comprehensive agent specification and template"
actions:
  - Analyze agent requirements and domain
  - Review existing patterns in .claude/memory/patterns/agent-templates/
  - Apply established YAML header conventions
  - Design specialized capabilities and workflows
  - Create complete agent template specification
  - Generate examples and documentation
output: ".claude/doc/agent-creation-[name]-[timestamp].md"
mcp_tools:
  - context7 (agent design patterns)
  - sequential (complex capability analysis)
```

### Phase 2: Template Specification Review
```yaml
step: "Main System Reviews Agent Specification"
handler: "main-system"
actions:
  - Read agent specification from .claude/doc/
  - Parse template requirements
  - Validate against framework standards
  - Check for naming conflicts
  - Prepare creation environment
validation:
  - Agent name is unique and follows conventions
  - Domain expertise is clearly defined
  - Template specification is complete
  - No conflicts with existing agents
```

### Phase 3: Agent Template Creation
```yaml
step: "Create Agent Template File"
handler: "main-system"
input: "Agent specification from .claude/doc/"
actions:
  - Generate YAML header with proper format
  - Create agent description with trigger keywords
  - Implement workflow pattern following standards
  - Add domain-specific competencies
  - Include quality standards and examples
  - Save to .claude/agents/[agent-name].md
tools: [Write, MultiEdit]
error_handling:
  - Check file creation permissions
  - Validate YAML syntax
  - Verify template completeness
```

### Phase 4: Template Validation & Integration
```yaml
step: "Validate Created Agent Template"
handler: "main-system"
actions:
  - Run template validation checks
  - Verify YAML header correctness
  - Check workflow pattern compliance
  - Validate example quality
  - Test agent integration with framework
tools: [Read, Grep, Bash]
validation_criteria:
  - YAML header follows established patterns
  - Workflow integrates with orchestration
  - Examples are realistic and complete
  - Quality standards are comprehensive
```

### Phase 5: Documentation & Registration
```yaml
step: "Update Agent Registry and Documentation"
handler: "main-system"
actions:
  - Add agent to .claude/agents/README.md
  - Update agent list in project documentation
  - Create usage examples
  - Log agent creation
  - Archive creation plan
```

## Agent Creation Criteria

### Required Specifications
- [ ] Unique agent name following naming conventions
- [ ] Clear domain expertise definition
- [ ] Specific trigger keywords and use cases
- [ ] Appropriate color assignment based on domain
- [ ] Comprehensive capability description

### Template Requirements
- [ ] YAML header with all required fields
- [ ] Standard 6-step workflow pattern
- [ ] Domain-specific MCP tool usage
- [ ] Quality standards section
- [ ] Realistic example scenarios with commentary

### Integration Requirements
- [ ] Compatibility with framework orchestration
- [ ] Proper memory system integration
- [ ] Standard output format compliance
- [ ] Error handling and validation rules

## Domain Categories

### Technical Domains
- **Backend Development**: APIs, databases, microservices
- **Frontend Development**: UI/UX, React, Vue, Angular
- **DevOps & Infrastructure**: AWS, Docker, Kubernetes, CI/CD
- **Testing & QA**: Unit testing, integration testing, automation
- **Security**: Security audits, vulnerability assessment, compliance

### Business Domains
- **E-commerce**: Payment systems, inventory, customer management
- **Finance**: Financial modeling, risk assessment, compliance
- **Healthcare**: HIPAA compliance, medical records, patient systems
- **Education**: Learning management, curriculum design, assessment

### Specialized Domains
- **AI/ML**: Model training, data science, MLOps
- **Mobile Development**: iOS, Android, React Native, Flutter
- **Game Development**: Unity, Unreal Engine, game mechanics
- **IoT**: Device management, sensor data, edge computing

## Quality Standards

### Template Quality
- [ ] Clear and specific agent purpose
- [ ] Comprehensive domain expertise documentation
- [ ] Realistic and relevant examples
- [ ] Proper integration with framework patterns
- [ ] High-quality prompt engineering

### Code Quality
- [ ] Valid YAML syntax
- [ ] Consistent formatting and style
- [ ] Complete section coverage
- [ ] Proper file naming and organization

### Documentation Quality
- [ ] Clear usage instructions
- [ ] Comprehensive capability descriptions
- [ ] Integration guidelines
- [ ] Maintenance procedures

## Success Criteria

### Creation Success
- [ ] Agent template file created successfully
- [ ] Template passes validation checks
- [ ] Agent integrates properly with framework
- [ ] Documentation updated appropriately

### Functional Success
- [ ] Agent addresses specified domain need
- [ ] Workflow patterns function correctly
- [ ] Examples demonstrate proper usage
- [ ] Quality standards enable effective operation

## Error Handling

### Creation Failures
- Check file system permissions
- Validate agent name uniqueness
- Verify template syntax correctness
- Handle missing dependencies gracefully

### Validation Failures
- Report specific validation issues
- Provide correction recommendations
- Allow iterative improvement
- Maintain partial progress

### Integration Issues
- Check framework compatibility
- Validate orchestration integration
- Test memory system access
- Verify MCP tool availability

## Interactive Mode

When run without parameters, the command enters interactive mode:

1. **Domain Selection**: Choose from predefined domains or specify custom
2. **Capability Definition**: Define specific agent capabilities and expertise
3. **Integration Requirements**: Specify MCP tools and framework integration needs
4. **Template Customization**: Customize YAML header and examples
5. **Validation & Creation**: Validate specification and create agent

## Output Format

### Creation Report
```markdown
# Agent Creation Report
## Agent: [agent-name]
- **Domain**: [domain]
- **File**: .claude/agents/[agent-name].md
- **Status**: [success/failed]
- **Validation**: [passed/failed with issues]

## Capabilities
[List of agent capabilities]

## Integration
[Framework integration details]

## Next Steps
[Usage instructions and recommendations]
```

## Related Commands
- `/validate-templates` - Validate created agent template
- `/sync-docs` - Update documentation with new agent
- `/test-cli` - Test agent creation CLI functionality