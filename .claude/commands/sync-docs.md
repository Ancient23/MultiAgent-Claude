# /sync-docs Command

## Command Definition

```yaml
---
command: "/sync-docs"
category: "Documentation"
purpose: "Synchronize all project documentation with current implementation and ensure consistency across all documentation sources"
pattern: "research → plan → execute"
agents: ["documentation-sync-guardian", "template-evolution-tracker"]
---
```

## Command Overview

This command ensures all project documentation remains synchronized with the current implementation, detects documentation drift, and maintains consistency across all documentation sources in the MultiAgent-Claude framework.

## Usage

```bash
# Synchronize all documentation
/sync-docs

# Sync specific documentation type
/sync-docs --type readme
/sync-docs --type agents
/sync-docs --type cli

# Check for drift without making changes
/sync-docs --check-only

# Sync with detailed reporting
/sync-docs --verbose

# Force sync ignoring conflicts
/sync-docs --force
```

## Examples

```bash
# Example 1: Complete documentation sync
/sync-docs
# Synchronizes README, agent descriptions, CLI docs, and all other documentation

# Example 2: Agent documentation only
/sync-docs --type agents --verbose
# Updates agent descriptions and ensures consistency

# Example 3: Drift detection
/sync-docs --check-only
# Reports documentation inconsistencies without making changes
```

## Execution Flow

### Phase 1: Documentation Analysis & Planning
```yaml
step: "Delegate to Documentation Synchronization Specialists"
primary_agent: "documentation-sync-guardian"
secondary_agent: "template-evolution-tracker"
purpose: "Create comprehensive documentation synchronization plan"
actions:
  - Analyze current documentation state across all sources
  - Compare documentation with actual implementation
  - Identify inconsistencies and drift
  - Review recent changes that may affect documentation
  - Create detailed synchronization plan with priorities
output: ".claude/doc/documentation-sync-[timestamp].md"
mcp_tools:
  - context7 (documentation standards)
  - sequential (complex consistency analysis)
```

### Phase 2: Synchronization Plan Review
```yaml
step: "Main System Reviews Synchronization Plan"
handler: "main-system"
actions:
  - Read synchronization plan from .claude/doc/
  - Parse documentation updates and changes needed
  - Validate update procedures
  - Check for potential conflicts
  - Prepare documentation environment
validation:
  - All documentation sources are accessible
  - Update procedures are safe and reversible
  - No destructive changes planned without confirmation
  - Backup procedures are in place
```

### Phase 3: Documentation Synchronization
```yaml
step: "Execute Documentation Updates"
handler: "main-system"
input: "Synchronization plan from .claude/doc/"
actions:
  - Update README.md with current feature set
  - Sync agent descriptions with actual templates
  - Update CLI command documentation
  - Align API documentation with implementation
  - Fix broken links and references
  - Update version information
  - Standardize formatting and style
tools: [Edit, MultiEdit, Write, Read, Grep]
error_handling:
  - Create backups before major changes
  - Validate changes before committing
  - Roll back on critical errors
  - Log all changes for audit trail
```

### Phase 4: Consistency Validation
```yaml
step: "Validate Documentation Consistency"
handler: "main-system"
actions:
  - Verify cross-references are correct
  - Check link validity
  - Validate example code accuracy
  - Ensure formatting consistency
  - Test documentation completeness
tools: [Read, Bash, Grep]
validation_criteria:
  - All internal links function correctly
  - Code examples are executable and accurate
  - Version information is consistent
  - Style guide compliance achieved
```

### Phase 5: Documentation Updates & Archival
```yaml
step: "Finalize Documentation Updates"
handler: "main-system"
actions:
  - Generate synchronization report
  - Update documentation index
  - Archive old documentation versions
  - Log synchronization completion
  - Update .claude/memory/documentation/gaps.md
```

## Documentation Categories

### Core Project Documentation
- **README.md**: Project overview, installation, usage
- **CLAUDE.md**: Orchestration rules and agent guidelines
- **Package.json**: Project metadata and script descriptions
- **License and Contributing**: Legal and contribution information

### Agent Documentation
- **Agent Templates**: Individual agent descriptions and capabilities
- **Agent Registry**: Complete agent list and categorization
- **Usage Examples**: Agent invocation patterns and scenarios
- **Integration Guidelines**: Framework integration requirements

### CLI Documentation
- **Command Reference**: Complete CLI command documentation
- **Installation Guide**: Setup and configuration instructions
- **Usage Examples**: Common CLI usage patterns
- **Troubleshooting**: Common issues and solutions

### Technical Documentation
- **Architecture**: System design and component relationships
- **API Reference**: Internal API documentation
- **Pattern Library**: Documented implementation patterns
- **Decision Records**: Architectural decision documentation

## Synchronization Priorities

### Critical Synchronization
- **Feature Accuracy**: Documentation matches actual capabilities
- **Installation Instructions**: Setup procedures are current and accurate
- **API Documentation**: Endpoints and interfaces are correctly documented
- **Security Information**: Security practices and requirements are current

### Important Updates
- **Usage Examples**: Examples reflect current best practices
- **Configuration Options**: All configuration options documented
- **Troubleshooting**: Known issues and solutions are current
- **Performance Information**: Performance characteristics are accurate

### Enhancement Updates
- **Style Consistency**: Formatting and style standardization
- **Link Validation**: All links functional and current
- **Cross-References**: Internal references are accurate
- **Accessibility**: Documentation accessibility improvements

## Quality Standards

### Content Quality
- [ ] Accuracy verified against implementation
- [ ] Completeness ensured for all documented features
- [ ] Clarity improved where needed
- [ ] Examples tested and validated

### Technical Quality
- [ ] Links validated and functional
- [ ] Code examples executable
- [ ] Version consistency maintained
- [ ] Format standardization applied

### User Experience
- [ ] Navigation improved where needed
- [ ] Search functionality optimized
- [ ] Accessibility guidelines followed
- [ ] Mobile responsiveness maintained

## Success Criteria

### Synchronization Success
- [ ] All documentation sources updated successfully
- [ ] Critical inconsistencies resolved
- [ ] Links validated and fixed
- [ ] Examples tested and corrected

### Quality Improvement
- [ ] Documentation accuracy improved
- [ ] User experience enhanced
- [ ] Maintenance burden reduced
- [ ] Search and discovery improved

## Error Handling

### Update Failures
- Create backups before making changes
- Validate syntax before committing updates
- Provide rollback procedures for failures
- Log all changes for audit and recovery

### Consistency Issues
- Report conflicts without automatic resolution
- Provide manual resolution procedures
- Document unresolved conflicts for review
- Enable partial synchronization completion

### Validation Failures
- Continue synchronization despite validation issues
- Report validation problems for manual review
- Provide correction recommendations
- Enable iterative improvement

## Automated Checks

### Link Validation
- Check all internal and external links
- Report broken links with source location
- Suggest corrections for common link issues
- Update redirected links automatically

### Code Example Validation
- Test example code for syntax correctness
- Verify examples work with current versions
- Update deprecated examples
- Check example output accuracy

### Cross-Reference Validation
- Verify internal references are accurate
- Check cross-document consistency
- Update references when targets change
- Report orphaned references

## Integration Features

### Git Integration
- Detect documentation changes via git history
- Track who made documentation changes
- Identify areas needing frequent updates
- Generate change summaries for review

### Memory System Integration
- Update documentation gaps tracking
- Record successful synchronization patterns
- Document common documentation issues
- Maintain documentation health metrics

### CI/CD Integration
- Can be run automatically on commits
- Provides documentation quality gates
- Generates documentation health reports
- Enables continuous documentation maintenance

## Output Format

### Synchronization Report
```markdown
# Documentation Synchronization Report
## Summary
- Sources Synchronized: [count]
- Updates Applied: [count]
- Issues Resolved: [count]
- Links Fixed: [count]

## Detailed Changes
### README Updates
[List of changes made]

### Agent Documentation
[Agent description updates]

### CLI Documentation
[CLI reference updates]

## Validation Results
[Link validation and consistency check results]

## Recommendations
[Suggestions for ongoing documentation maintenance]
```

## Related Commands
- `/validate-templates` - Validate documentation in templates
- `/generate-agent` - Sync documentation after agent creation
- `/test-cli` - Validate CLI documentation accuracy