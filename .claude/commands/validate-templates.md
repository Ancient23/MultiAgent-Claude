---
description: "Comprehensive validation of all agent and command templates for consistency, completeness, and framework compliance"
argument-hint: "[--type agents|commands] [--verbose] [--suggest-fixes] [--output report-path]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Grep", "Glob", "Task", "TodoWrite"]
model: "sonnet"
---

# /validate-templates

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Template validation scope and options provided by the user
- **$ARGUMENTS**: Parsed command arguments including validation type, flags, and output options
- **OUTPUT_DIR**: `.claude/doc/validation-results/` - Directory for validation reports and detailed findings
- **SESSION_ID**: Generated from `getSessionId('validate_templates_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/template-validation-plan-[timestamp].md` - Agent-generated validation plan
- **VALIDATION_TYPE**: `agents|commands|all` - Scope of templates to validate (default: all)
- **VERBOSE_MODE**: `true|false` - Enable detailed validation reporting (default: false)
- **SUGGEST_FIXES**: `true|false` - Generate specific improvement recommendations (default: false)
- **TEMPLATE_DIRS**: Array of template directories to scan
- **VALIDATION_CRITERIA**: Loaded validation rules and quality standards
- **REPORT_PATH**: Output path for final validation report

## Instructions

This command implements comprehensive template validation using the research-plan-execute pattern where:

1. **Initialization**: Create session context and scan template directories
2. **Research Phase**: Deploy prompt-engineer-specialist to analyze templates and create validation plan
3. **Planning Phase**: Agent documents validation criteria, checks, and quality standards
4. **Review Phase**: Main system reads validation plan and prepares execution environment
5. **Execution Phase**: Execute validation checks systematically across all templates
6. **Reporting Phase**: Generate comprehensive validation report with findings and recommendations

### Prerequisites
- Ensure template directories exist (Examples/agents/, Examples/commands/, .claude/agents/, .claude/commands/)
- Verify prompt-engineer-specialist agent is available
- Confirm session context tracking is operational
- Check write permissions for OUTPUT_DIR

### Decision Points
- If VALIDATION_TYPE is "agents": Focus only on agent template validation
- If VALIDATION_TYPE is "commands": Focus only on command template validation
- If template directory missing: Log warning and continue with available directories
- If validation plan exists and < 6hrs old: Skip research phase unless --force flag
- If critical validation failures found: Continue validation but flag for manual review

## Workflow

1. **Initialize Session and Environment**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file with validation objectives
     - Document USER_PROMPT and validation scope
   - Scan and inventory all template files in target directories
   - Initialize TEMPLATE_DIRS based on VALIDATION_TYPE
   - STOP and alert user if no templates found to validate

2. **Determine Validation Scope**
   - If VALIDATION_TYPE is "agents":
     - Set TEMPLATE_DIRS to [Examples/agents/, .claude/agents/]
   - If VALIDATION_TYPE is "commands":
     - Set TEMPLATE_DIRS to [Examples/commands/, .claude/commands/]
   - If VALIDATION_TYPE is "all" or unspecified:
     - Set TEMPLATE_DIRS to all template directories
   - Count total templates to validate and update context

3. **Deploy Validation Research Agent**
   - Invoke Task tool with prompt-engineer-specialist agent
   - Pass session context, template inventory, and validation requirements
   - Agent analyzes template structure and creates validation plan
   - Wait for agent completion and validate PLAN_FILE exists
   - If agent deployment fails: STOP and alert user

4. **Review Validation Plan**
   - Read and parse validation plan from PLAN_FILE
   - Extract validation criteria and quality checks
   - Load VALIDATION_CRITERIA from plan specifications
   - Validate plan completeness and feasibility
   - If plan has critical issues: Request user confirmation to proceed

5. **Execute Template Validation**
   - For each template_file in TEMPLATE_DIRS:
     - Run YAML header validation checks
     - Verify required sections presence and structure
     - Check example quality and completeness
     - Validate workflow pattern consistency
     - Analyze rule completeness and clarity
     - Check MCP tool usage patterns
     - Validate color scheme and naming adherence
     - Document all findings with severity levels
   - Update context with validation progress
   - Continue until all templates processed or critical system failure

6. **Generate Validation Report**
   - Compile all validation findings by severity
   - Calculate template compliance percentages
   - Generate fix recommendations if SUGGEST_FIXES enabled
   - Create detailed validation report
   - Save report to OUTPUT_DIR with timestamp
   - Update session context with completion status

## Report

```markdown
# Template Validation Report: /validate-templates

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Validation Scope**: ${VALIDATION_TYPE}

## Objectives
${USER_PROMPT}

## Validation Plan Generated
- ${PLAN_FILE}

## Summary Statistics
- **Templates Validated**: [total_count]
- **Critical Issues**: [critical_count]
- **Warnings**: [warning_count]
- **Suggestions**: [suggestion_count]
- **Compliance Score**: [percentage]%

## Detailed Validation Results

### Agent Templates
#### Critical Issues
- [template_name] - [issue_description] - [file:line]

#### Warnings
- [template_name] - [issue_description] - [file:line]

#### Suggestions
- [template_name] - [improvement_suggestion] - [file:line]

### Command Templates
#### Critical Issues
- [template_name] - [issue_description] - [file:line]

#### Warnings
- [template_name] - [issue_description] - [file:line]

#### Suggestions
- [template_name] - [improvement_suggestion] - [file:line]

## Validation Criteria Applied
- YAML Header Structure Compliance
- Required Section Presence
- Example Quality and Completeness
- Workflow Pattern Consistency
- Rule Completeness Analysis
- MCP Tool Usage Validation
- Color Scheme Adherence
- Naming Convention Compliance

## Fix Recommendations
[Generated only if SUGGEST_FIXES enabled]
### Priority 1 - Critical Fixes
- [specific_fix_description] - [affected_files]

### Priority 2 - Important Improvements
- [specific_fix_description] - [affected_files]

### Priority 3 - Style and Consistency
- [specific_fix_description] - [affected_files]

## Files Analyzed
### Template Inventory
- [file_path] - [validation_status] - [issues_count]

## Quality Metrics
- **Header Compliance**: [percentage]%
- **Section Completeness**: [percentage]%
- **Example Quality**: [percentage]%
- **Pattern Consistency**: [percentage]%

## Next Steps
- Address critical issues before template usage
- Implement priority fixes for improved quality
- Schedule regular validation runs
- Update template standards based on findings

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Report: `.ai/memory/validation/archive/validation-report-${SESSION_ID}.md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If VALIDATION_TYPE is "agents":
    Focus validation on agent templates only
  ElseIf VALIDATION_TYPE is "commands":
    Focus validation on command templates only
  Else:
    Validate all template types

- If VERBOSE_MODE enabled:
    Include detailed analysis in report
    Log all validation steps
  Else:
    Generate summary report only

- If SUGGEST_FIXES enabled:
    Generate specific improvement recommendations
    Prioritize fixes by impact
  Else:
    Report issues without fix suggestions

- If template directory missing:
    Log warning and skip directory
    Continue with available directories
  Else:
    Process all templates in directory

- If critical validation errors found:
    Flag for manual review
    Continue validation
  Else:
    Mark template as compliant
```

### Iteration Loops
```yaml
- For each template_directory in TEMPLATE_DIRS:
    Scan for template files
    Add to validation queue

- For each template_file in validation_queue:
    Load and parse template
    Apply validation criteria
    Record findings with severity
    Update progress tracking

- For each validation_rule in VALIDATION_CRITERIA:
    Check rule compliance
    Document violations
    Suggest improvements if applicable

- For each finding in validation_results:
    Categorize by severity
    Generate fix recommendation
    Add to final report
```

### Parallel Orchestration
```yaml
- When validating large template sets:
    validation_batches:
      - Agent templates batch
      - Command templates batch
      - Project-specific templates batch
    parallel_processing:
      - Process batches simultaneously
      - Merge results into unified report
      - Maintain consistency across batches

- When multiple validation aspects needed:
    parallel_checks:
      - YAML header validation
      - Content structure analysis
      - Quality standards verification
      - Pattern consistency checking
    synchronization_point: "All checks complete"
```

## Error Handling

### Recoverable Errors
- Template file not readable: Log error and continue with remaining templates
- YAML parsing failure: Report syntax issue and skip content validation
- Missing validation criteria: Use default standards and warn user
- Agent plan incomplete: Generate basic validation plan and proceed

### Critical Errors
- Session context creation failure: STOP and alert user
- All template directories missing: STOP and request configuration check
- Validation agent deployment failure: STOP and alert user
- Output directory not writable: STOP and request permission fix

## Anti-Patterns to Avoid

❌ **Stopping validation on first error**
❌ **Modifying templates during validation**
❌ **Skipping session context tracking**
❌ **Hardcoding validation criteria**
❌ **Ignoring agent-generated validation plan**
❌ **Generating reports without consolidating findings**

## Usage Examples

```bash
# Basic validation of all templates
/validate-templates

# Validate only agent templates with detailed output
/validate-templates --type agents --verbose

# Validate command templates with fix suggestions
/validate-templates --type commands --suggest-fixes

# Comprehensive validation with custom output location
/validate-templates --verbose --suggest-fixes --output .claude/reports/template-audit.md

# Quick compliance check
/validate-templates --type agents
```

## Related Commands
- `/generate-agent` - Create new agents following validated patterns
- `/sync-docs` - Update documentation based on validation results
- `/test-cli` - Test CLI functionality including validation commands
- `/implement` - Execute template improvement plans
- `/orchestrate` - Multi-agent template improvement coordination