# ADR-004: File and Directory Conventions

**Date**: 2025-08-19  
**Status**: Accepted  
**Source**: Framework standardization requirements

## Context

The MultiAgent-Claude framework requires consistent file and directory naming conventions to:
1. Ensure predictable file locations for agents and automation
2. Enable reliable file discovery and organization
3. Support automated validation and quality checking
4. Maintain clean and professional project structure
5. Facilitate collaboration and knowledge transfer

Inconsistent naming creates confusion, breaks automation, and reduces framework effectiveness.

## Decision

We establish **Standardized File and Directory Conventions** with:

1. **Hierarchical Directory Structure**: Consistent organization across all projects
2. **Naming Patterns**: Predictable file naming for different content types
3. **File Type Standards**: Clear file extensions and format requirements
4. **Path Conventions**: Standard paths for common operations
5. **Metadata Standards**: Consistent frontmatter and header patterns

## Rationale

### Predictability Benefits
- Agents can reliably find and create files
- Automation tools work consistently
- Users know where to look for information
- Maintenance tasks can be automated

### Organization Benefits
- Related files are grouped logically
- Directory structure scales with project growth
- Clear separation of different content types
- Easy navigation and discovery

### Collaboration Benefits
- Team members follow same conventions
- Knowledge transfer is simplified
- Documentation is consistently organized
- Quality standards are maintainable

## Implementation Details

### Root Directory Structure
```
.claude/
├── tasks/                     # Session working memory
│   └── context_session_*.md  # Session context files
├── doc/                       # Agent implementation plans
│   └── [agent]-[task]-*.md   # Agent-generated plans
├── agents/                    # Project-specific agents
│   └── [agent-name].md       # Agent template files
├── commands/                  # Project-specific commands
│   └── [command-name].md     # Command workflow files
└── tests/                     # Testing infrastructure
    ├── cli/                   # CLI tests
    └── templates/             # Template validation tests
```

### Naming Conventions

**Agent Files**:
- Format: `[domain]-[role]-[optional-specifier].md`
- Examples: `frontend-ui-expert.md`, `aws-backend-architect.md`, `cli-test-engineer.md`
- Location: `.claude/agents/` or `Examples/agents/`

**Command Files**:
- Format: `[action]-[target].md` or `[command-name].md`
- Examples: `validate-templates.md`, `generate-agent.md`, `test-cli.md`
- Location: `.claude/commands/` or `Examples/commands/`

**Agent Plans**:
- Format: `[agent-type]-[task-description]-[timestamp].md`
- Examples: `frontend-ui-dashboard-20240819.md`, `ai-agent-chatbot-20240819.md`
- Location: `.claude/doc/`

**Session Context**:
- Format: `context_session_[timestamp].md`
- Examples: `context_session_20240819_143022.md`
- Location: `.claude/tasks/`

**ADR Files**:
- Format: `ADR-[number]-[kebab-case-title].md`
- Examples: `ADR-001-research-plan-execute-pattern.md`
- Location: `.ai/memory/decisions/`

**Pattern Files**:
- Format: `[pattern-name].md`
- Examples: `yaml-headers.md`, `workflow-patterns.md`
- Location: `.ai/memory/patterns/[category]/`

### File Content Standards

**YAML Frontmatter Requirements**:
```yaml
---
# Required for agents
name: agent-name
description: Agent description with triggers
model: sonnet
color: domain-color

# Required for commands
command: "/command-name"
category: "Category"
purpose: "Command purpose"
pattern: "research → plan → execute"
agents: ["primary-agent", "secondary-agent"]

# Required for ADRs
title: "Decision Title"
date: "YYYY-MM-DD"
status: "Proposed|Accepted|Deprecated|Superseded"
---
```

**Content Structure Requirements**:
- Markdown format for all content files
- Consistent heading hierarchy
- Required sections based on file type
- Standard metadata headers

### Directory Organization Patterns

**Memory Subdirectories**:
```
.ai/memory/
├── patterns/
│   ├── agent-templates/       # Agent design patterns
│   ├── command-patterns/      # Command workflow patterns
│   ├── prompt-engineering/    # Prompt optimization patterns
│   └── cli-patterns/         # CLI implementation patterns
├── decisions/                 # ADRs numbered sequentially
├── documentation/
│   ├── api/                  # API documentation
│   ├── guides/               # Development guides
│   ├── architecture/         # System architecture
│   └── troubleshooting/      # Known issues and solutions
└── knowledge/                # Domain-specific knowledge
```

**Testing Directory Structure**:
```
.claude/tests/
├── cli/
│   ├── unit/                 # Unit tests for CLI commands
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
└── templates/
    ├── validation/           # Template validation tests
    └── consistency/          # Consistency check tests
```

## Path Resolution Standards

### Absolute vs Relative Paths
- **Agent Plans**: Always use absolute paths in implementation instructions
- **Internal References**: Use relative paths from `.claude/` root
- **External References**: Use absolute paths for system files
- **Documentation Links**: Use relative paths for internal docs

### Standard Path Variables
- `${CLAUDE_ROOT}`: `.claude/` directory
- `${PROJECT_ROOT}`: Project root directory
- `${AGENT_DIR}`: `.claude/agents/`
- `${MEMORY_DIR}`: `.ai/memory/`

### Common File Paths
- Session Context: `.claude/tasks/context_session_latest.md`
- Project Overview: `.ai/memory/project.md`
- Agent Registry: `.claude/agents/README.md`
- Command Registry: `.claude/commands/README.md`
- Memory Index: `.ai/memory/index.json`

## Quality Standards

### File Naming Requirements
- Use kebab-case for multi-word names
- Include descriptive terms that indicate content
- Follow timestamp format: `YYYYMMDD` or `YYYYMMDD_HHMMSS`
- Avoid special characters except hyphens and underscores
- Use descriptive suffixes for file variants

### Content Requirements
- YAML frontmatter for all template files
- Consistent heading structure
- Required sections present
- Proper markdown formatting
- No trailing whitespace

### Organization Requirements
- Files in correct directories
- Related files grouped together
- Clear separation of different content types
- Logical hierarchy maintained

## Consequences

### Positive
- **Predictable Structure**: Files are always in expected locations
- **Automated Processing**: Tools can reliably find and process files
- **Professional Organization**: Clean, maintainable project structure
- **Collaboration Support**: Team members follow same conventions
- **Quality Assurance**: Standards enable automated validation

### Negative
- **Learning Overhead**: New users must learn conventions
- **Enforcement Burden**: Standards require ongoing maintenance
- **Rigidity**: May constrain creative file organization

### Neutral
- **Tool Integration**: Some tools may need configuration for custom structure
- **Migration Effort**: Existing projects may need restructuring

## Compliance Requirements

### File Creation
1. **Follow Naming Patterns**: Use established naming conventions
2. **Correct Directory Placement**: Put files in appropriate directories
3. **Include Required Metadata**: Add proper YAML frontmatter
4. **Format Consistently**: Follow markdown and content standards

### File Organization
1. **Maintain Hierarchy**: Keep directory structure organized
2. **Group Related Content**: Place related files together
3. **Update Indices**: Maintain README and index files
4. **Clean Up Obsolete Files**: Remove outdated content

### Quality Assurance
1. **Validate Naming**: Check file names against standards
2. **Verify Structure**: Ensure directory organization is correct
3. **Check Content**: Validate required sections and formatting
4. **Update Documentation**: Keep organizational docs current

## Automation Support

### File Discovery
- Agents can reliably find files using standard paths
- Automated tools can process files by type and location
- Search and indexing tools work consistently
- Backup and sync tools follow predictable patterns

### Validation Tools
- Automated naming convention checking
- Directory structure validation
- Content format verification
- Cross-reference validation

### Generation Tools
- Template-based file creation
- Automatic metadata insertion
- Standard directory structure creation
- Index file generation and maintenance

## Migration Guidelines

### Existing Projects
1. **Assess Current Structure**: Identify files that need reorganization
2. **Plan Migration**: Create migration plan with minimal disruption
3. **Execute Gradually**: Migrate in phases to maintain functionality
4. **Update References**: Fix all references to moved files
5. **Validate Results**: Ensure all functionality works after migration

### New Projects
1. **Start with Standards**: Create directory structure from beginning
2. **Use Templates**: Apply standard templates for file creation
3. **Validate Early**: Check compliance regularly during development
4. **Document Exceptions**: Note any necessary deviations with rationale

## Related Decisions
- ADR-001: Research-Plan-Execute Pattern
- ADR-002: Agent Specialization Framework
- ADR-003: Memory System Architecture

## Review Schedule
This ADR should be reviewed quarterly to assess convention effectiveness and identify needed updates.