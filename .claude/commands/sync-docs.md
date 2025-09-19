---
description: "Synchronize all project documentation with current implementation and ensure consistency across all documentation sources"
argument-hint: "[--type docs-type] [--check-only] [--verbose] [--force]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "Grep", "Glob", "WebFetch"]
model: "sonnet"
---

# /sync-docs

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Documentation synchronization request with optional type specification and flags
- **$ARGUMENTS**: Parsed command arguments including documentation type filter, operation mode, and options
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and synchronization reports
- **SESSION_ID**: Generated from `getSessionId('sync_docs_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/documentation-sync-guardian-[timestamp].md` - Agent-generated synchronization plan
- **DOCS_TYPE**: Parsed from `--type` flag - Specific documentation category to sync (readme|agents|cli|all)
- **CHECK_ONLY**: Boolean from `--check-only` flag - Whether to analyze without making changes
- **VERBOSE_MODE**: Boolean from `--verbose` flag - Enhanced reporting and logging
- **FORCE_SYNC**: Boolean from `--force` flag - Ignore conflicts and force synchronization
- **BACKUP_DIR**: `.claude/backups/docs-${SESSION_ID}/` - Backup location for original documentation

## Instructions

This command implements the research-plan-execute pattern for comprehensive documentation synchronization where:

1. **Analysis Phase**: Deploy documentation specialists to analyze current state and detect drift
2. **Planning Phase**: Create detailed synchronization strategy with priority-based approach
3. **Backup Phase**: Create safety backups before making any changes
4. **Execution Phase**: Systematically update documentation sources with validation
5. **Verification Phase**: Validate consistency, test links, and ensure accuracy
6. **Reporting Phase**: Generate comprehensive synchronization report

### Prerequisites
- Documentation Sync Guardian agent available in Examples/agents/
- Project documentation structure established
- Write access to all documentation locations
- Valid git repository for change tracking

### Decision Points
- If CHECK_ONLY flag: Stop after analysis and report findings
- If DOCS_TYPE specified: Filter operations to specific documentation category
- If FORCE_SYNC enabled: Skip conflict resolution prompts
- If backup creation fails: STOP and alert user for safety

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document synchronization objectives from USER_PROMPT
     - Record target documentation types and operation mode
   - STOP and alert user if session creation fails

2. **Analyze Documentation State**
   - If CHECK_ONLY flag set:
     - Deploy documentation-sync-guardian for analysis only
     - Generate drift report without modification plans
     - Skip to step 6 (Reporting)
   - If full synchronization requested:
     - Continue to step 3 (Agent Research)

3. **Deploy Documentation Analysis Agents**
   - Invoke Task tool with documentation-sync-guardian agent
   - Pass session context, DOCS_TYPE filter, and analysis requirements
   - Include template-evolution-tracker for template consistency analysis
   - Wait for comprehensive analysis and synchronization plan completion

4. **Review Synchronization Plan**
   - Read and parse implementation strategy from PLAN_FILE
   - Validate update procedures and safety measures
   - Check for potential documentation conflicts
   - If critical issues found and FORCE_SYNC not set:
     - Request user confirmation before proceeding

5. **Create Safety Backups**
   - For each documentation file identified for modification:
     - Create backup in BACKUP_DIR
     - Verify backup integrity
   - STOP if backup creation fails and alert user

6. **Execute Documentation Synchronization**
   - If DOCS_TYPE filter specified:
     - Process only matching documentation categories
   - For each synchronization step in plan:
     - Update documentation files using Edit/MultiEdit tools
     - Validate changes against implementation
     - Fix broken links and references
     - Standardize formatting and style
   - Update context_session with progress after each major category

7. **Validate Documentation Consistency**
   - Run link validation using Bash and Grep tools
   - Verify cross-references are accurate
   - Test code examples for correctness
   - Check formatting consistency across sources
   - Generate validation report

8. **Generate Synchronization Report**
   - Document all changes made
   - Report validation results
   - Provide recommendations for ongoing maintenance
   - Archive session context to memory system

## Report

```markdown
# Documentation Synchronization Report: /sync-docs

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Operation Mode**: [Full Sync|Check Only|Type Filtered]
- **Documentation Type**: ${DOCS_TYPE}

## Objectives
${USER_PROMPT}

## Agent Plans Generated
- ${PLAN_FILE}
- Template analysis: [if template-evolution-tracker used]

## Synchronization Summary
### Documentation Sources Processed
- README.md: [updated|current|skipped]
- CLAUDE.md: [updated|current|skipped]
- Agent Templates: [count updated]/[total]
- CLI Documentation: [updated|current|skipped]
- API Documentation: [updated|current|skipped]

### Changes Applied
- Content Updates: [count]
- Link Fixes: [count]
- Format Standardization: [count]
- Cross-Reference Updates: [count]

## Detailed Changes
### README Updates
- [specific changes made with line references]

### Agent Documentation Updates
- [agent template updates with descriptions]

### CLI Documentation Updates
- [command reference and guide updates]

### Technical Documentation Updates
- [architecture, API, and pattern updates]

## Validation Results
### Link Validation
- Internal Links Checked: [count]
- External Links Checked: [count]
- Broken Links Fixed: [count]
- Redirect Updates: [count]

### Consistency Check
- Cross-Reference Accuracy: [pass/fail]
- Code Example Validation: [pass/fail]
- Format Standardization: [pass/fail]
- Version Consistency: [pass/fail]

## Quality Metrics
- Documentation Drift Score: [before] → [after]
- Link Health Score: [percentage]
- Example Accuracy Score: [percentage]
- Style Consistency Score: [percentage]

## Backup Information
- Backup Location: ${BACKUP_DIR}
- Files Backed Up: [count]
- Backup Verification: [success/failed]

## Recommendations
- [Suggestions for ongoing documentation maintenance]
- [Areas requiring manual review]
- [Process improvements for future syncs]

## Next Steps
- Monitor documentation health with periodic syncs
- Review and validate recommended improvements
- Consider automated documentation validation in CI/CD

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Backups: `${BACKUP_DIR}` (retained for 30 days)
```

## Control Flow Patterns

### Conditionals
```yaml
- If CHECK_ONLY flag set:
    Execute analysis only
    Generate drift report
    Skip all modifications
  Else:
    Proceed with full synchronization

- If DOCS_TYPE specified:
    Filter operations to specific category
    Process only matching documentation
  Else:
    Process all documentation sources

- If FORCE_SYNC enabled:
    Skip conflict resolution prompts
    Proceed with automated resolution
  Else:
    Request user confirmation for conflicts

- If backup creation fails:
    STOP all operations
    Alert user for safety
  Else:
    Proceed with modifications
```

### Iteration Loops
```yaml
- For each documentation_source in target_sources:
    Analyze current state
    Compare with implementation
    Plan required updates

- For each synchronization_step in plan:
    Create backup if not exists
    Execute modification
    Validate change
    Update progress tracking

- For each link in documentation:
    Test link validity
    Record result
    Fix if broken and strategy available

- For each code_example in documentation:
    Validate syntax
    Test execution if applicable
    Update if outdated
```

### Parallel Orchestration
```yaml
- When multiple documentation types processed:
    parallel_analysis:
      - README and project docs
      - Agent template documentation
      - CLI command documentation
      - Technical API documentation
    synchronization_point: "All analysis complete"

- When validation performed:
    parallel_validation:
      - Link checking
      - Code example testing
      - Cross-reference validation
      - Format consistency checking
    consolidation: "Generate unified validation report"
```

## Error Handling

### Recoverable Errors
- Documentation file not found: Create if specified in plan, otherwise skip
- Link validation failure: Mark for manual review, continue processing
- Format inconsistency: Apply standardization, log change
- Minor syntax errors: Auto-correct if pattern recognized

### Critical Errors
- Backup creation failure: STOP and alert user for data safety
- Agent deployment failure: STOP and request troubleshooting
- Session context corruption: STOP and request recovery assistance
- Write permission denied: STOP and request permission resolution

## Anti-Patterns to Avoid

❌ **Modifying documentation without backups**
❌ **Skipping validation phase**
❌ **Ignoring user confirmation for major changes**
❌ **Processing without session context**
❌ **Force-syncing without understanding conflicts**

## Usage Examples

```bash
# Complete documentation synchronization
/sync-docs

# Check for documentation drift without changes
/sync-docs --check-only

# Sync only agent documentation with detailed output
/sync-docs --type agents --verbose

# Force sync ignoring conflicts
/sync-docs --force

# Sync CLI documentation only
/sync-docs --type cli

# Check README and project docs only
/sync-docs --type readme --check-only
```

## Related Commands
- `/validate-templates` - Validate documentation in agent templates
- `/generate-agent` - Sync documentation after agent creation
- `/test-cli` - Validate CLI documentation accuracy
- `/implement` - Execute documentation updates from existing plans