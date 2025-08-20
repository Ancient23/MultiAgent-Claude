# /validate-templates Command

## Command Definition

```yaml
---
command: "/validate-templates"
category: "Quality Assurance"
purpose: "Validate all agent and command templates for consistency, completeness, and adherence to framework standards"
pattern: "research → plan → execute"
agents: ["prompt-engineer-specialist", "template-evolution-tracker"]
---
```

## Command Overview

This command performs comprehensive validation of all templates in the MultiAgent-Claude framework, ensuring consistency, completeness, and adherence to established patterns and best practices.

## Usage

```bash
# Validate all templates
/validate-templates

# Validate specific template type
/validate-templates --type agents
/validate-templates --type commands

# Validate with detailed reporting
/validate-templates --verbose

# Validate and suggest fixes
/validate-templates --suggest-fixes
```

## Examples

```bash
# Example 1: Complete validation
/validate-templates
# Output: Comprehensive validation report with issues and recommendations

# Example 2: Agent-only validation
/validate-templates --type agents
# Output: Agent template validation focusing on YAML headers and workflows

# Example 3: Validation with fix suggestions
/validate-templates --suggest-fixes
# Output: Validation report plus specific improvement recommendations
```

## Execution Flow

### Phase 1: Template Analysis & Planning
```yaml
step: "Delegate to Template Validation Specialists"
primary_agent: "prompt-engineer-specialist"
secondary_agent: "template-evolution-tracker"
purpose: "Create comprehensive template validation plan"
actions:
  - Analyze all agent templates in Examples/agents/ and .claude/agents/
  - Review command templates in Examples/commands/ and .claude/commands/
  - Check against established patterns in .claude/memory/patterns/
  - Identify inconsistencies and missing elements
  - Create detailed validation plan with specific checks
output: ".claude/doc/template-validation-[timestamp].md"
mcp_tools:
  - context7 (template standards documentation)
  - sequential (complex pattern analysis)
```

### Phase 2: Validation Plan Review
```yaml
step: "Main System Reviews Validation Plan"
handler: "main-system"
actions:
  - Read validation plan from .claude/doc/
  - Parse validation criteria and checks
  - Prepare validation environment
  - Create TodoWrite list from validation plan
validation:
  - Verify all templates are accessible
  - Check validation criteria are complete
  - Confirm no destructive operations planned
```

### Phase 3: Template Validation Execution
```yaml
step: "Execute Template Validation"
handler: "main-system"
input: "Validation plan from .claude/doc/"
actions:
  - Run YAML header validation checks
  - Verify required sections presence
  - Check example quality and completeness
  - Validate workflow pattern consistency
  - Analyze rule completeness
  - Check MCP tool usage patterns
  - Validate color scheme adherence
  - Generate validation report
tools: [Read, Grep, Bash]
error_handling:
  - Log validation failures
  - Continue validation despite individual failures
  - Collect all issues for comprehensive report
```

### Phase 4: Report Generation & Verification
```yaml
step: "Generate Validation Report"
handler: "main-system"
actions:
  - Compile validation results
  - Generate detailed issue report
  - Create fix recommendations (if requested)
  - Update validation status
  - Save report to .claude/doc/validation-results/
tools: [Write, MultiEdit]
```

### Phase 5: Documentation Updates
```yaml
step: "Update Validation Records"
handler: "main-system"
actions:
  - Update validation history
  - Log validation completion
  - Archive validation plan
  - Update quality metrics
```

## Validation Criteria

### YAML Header Validation
- [ ] Name follows lowercase-with-hyphens convention
- [ ] Description starts with "Use this agent PROACTIVELY when"
- [ ] Specific trigger keywords included
- [ ] Model field present and set to "sonnet"
- [ ] Color field present and from approved list
- [ ] Examples section with 2-3 realistic scenarios

### Content Structure Validation
- [ ] Goal section clearly defines agent purpose
- [ ] Core Workflow follows 6-step standard pattern
- [ ] Output Format section specifies file path requirement
- [ ] Rules section includes all required rules
- [ ] Core Competencies section details expertise areas

### Quality Standards Validation
- [ ] Examples include context, user request, and commentary
- [ ] MCP tool usage is appropriate for domain
- [ ] Workflow integrates with framework orchestration
- [ ] Quality standards section defines clear requirements
- [ ] Planning approach section is comprehensive

### Consistency Validation
- [ ] Template follows established patterns
- [ ] Naming conventions are consistent
- [ ] Color usage follows domain conventions
- [ ] File structure matches template requirements

## Success Criteria

### Validation Completion
- [ ] All templates processed without critical errors
- [ ] Validation report generated successfully
- [ ] Issues categorized by severity (critical, warning, suggestion)
- [ ] Fix recommendations provided where applicable

### Quality Metrics
- [ ] Template compliance percentage calculated
- [ ] Critical issues identified and documented
- [ ] Improvement suggestions prioritized
- [ ] Validation history updated

## Error Handling

### Template Access Issues
- Log inaccessible templates
- Continue validation with available templates
- Report access issues in final report

### Validation Rule Failures
- Continue validation despite rule failures
- Collect all failures for comprehensive reporting
- Categorize failures by severity

### Report Generation Failures
- Attempt alternative report formats
- Save partial results if full report fails
- Provide fallback summary information

## Integration with Framework

### Memory System Integration
- Reference established patterns from .claude/memory/patterns/
- Update validation patterns based on results
- Log successful validation procedures

### Agent Coordination
- Primary validation by prompt-engineer-specialist
- Historical analysis by template-evolution-tracker
- Coordination through standard orchestration patterns

### Quality Assurance Pipeline
- Can be integrated into CI/CD workflows
- Supports automated quality checking
- Provides metrics for template health monitoring

## Output Format

### Validation Report Structure
```markdown
# Template Validation Report
## Summary
- Templates Validated: [count]
- Critical Issues: [count]
- Warnings: [count]
- Suggestions: [count]

## Detailed Results
### Agent Templates
[Individual template results]

### Command Templates
[Individual template results]

## Recommendations
[Prioritized improvement suggestions]
```

### Fix Suggestions (Optional)
When `--suggest-fixes` is used, specific improvement recommendations are included for each identified issue.

## Related Commands
- `/generate-agent` - Create new agents following validated patterns
- `/sync-docs` - Update documentation based on validation results
- `/test-cli` - Test CLI functionality including validation commands