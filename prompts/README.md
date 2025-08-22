# YAML-Based Prompt Architecture

## Overview

The MultiAgent-Claude framework uses a component-based YAML architecture for generating prompts. This system replaces monolithic prompt files with reusable, composable components that can be dynamically assembled based on context and requirements.

## Benefits

- **78% Reduction in Redundancy**: Shared components eliminate duplicate content
- **Dynamic Composition**: Workflows adapt based on project context and options
- **Variable Substitution**: Templates use variables for customization
- **Conditional Inclusion**: Components included only when needed
- **Performance Caching**: Built-in caching for fast repeated compositions

## Directory Structure

```
prompts/
├── core/                 # Shared building blocks (100% reuse)
│   ├── session-context.yml      # Session initialization
│   ├── memory-structure.yml     # Memory system setup
│   ├── file-conventions.yml     # Standard paths and naming
│   ├── project-analysis.yml     # Project detection logic
│   └── quality-standards.yml    # Quality criteria
├── templates/            # Domain patterns (50-75% reuse)
│   ├── agent-creation.yml       # Agent generation
│   ├── command-creation.yml     # Command patterns
│   └── [other templates]
├── workflows/            # Complete flows (compositions)
│   ├── init-full.yml            # Complete initialization
│   ├── init-memory.yml          # Memory-only setup
│   └── add-memory.yml           # Add to existing project
└── manifest.json         # Component registry
```

## Component Structure

Each YAML component follows this structure:

```yaml
name: component-name
version: 1.0.0
description: Brief description of the component
category: core|templates|workflows
tags: [tag1, tag2, tag3]

variables:
  var_name: "${default_value}"
  dynamic_var: "${workflow.variable | transformation}"

dependencies:  # Optional
  - other/component

content: |
  The actual prompt content with ${variable} substitutions
  Supporting multiple lines and markdown formatting
```

## Workflow Structure

Workflows compose multiple components:

```yaml
name: workflow-name
version: 1.0.0
description: Workflow description

variables:
  session_type: "Type of session"
  objectives: "What to accomplish"

required:  # Always included
  - core/session-context
  - core/memory-structure

conditional:  # Conditionally included
  - if: "options.cicd"
    then: templates/cicd-setup
  - if: "!project.hasAgents"
    then: templates/agent-creation

post_processing:  # Applied after composition
  - validate_markdown
  - optimize_length
```

## Variable Substitution

### Syntax Patterns

- `${variable}` - Basic substitution
- `{{variable}}` - Alternative syntax
- `<%= variable %>` - ERB-style syntax

### Variable Sources

1. **Context Variables**: Passed from CLI or API
2. **Workflow Variables**: Defined in workflow
3. **Component Variables**: Defined in component
4. **Built-in Variables**:
   - `${date}` - Current date (YYYY-MM-DD)
   - `${time}` - Current time (HHMMSS)
   - `${timestamp}` - Unix timestamp
   - `${uuid}` - Generated UUID
   - `${random}` - Random string

### Transformations

Variables support transformation pipelines:

- `${name | upper}` - Uppercase
- `${name | lower}` - Lowercase
- `${name | capitalize}` - Capitalize words
- `${name | camelCase}` - Convert to camelCase
- `${name | snakeCase}` - Convert to snake_case
- `${name | kebabCase}` - Convert to kebab-case
- `${text | truncate(50)}` - Truncate to length
- `${text | indent(2)}` - Indent lines

### Nested Access

- `${user.name}` - Access nested properties
- `${items[0]}` - Array access
- `${users[0].email}` - Combined nesting

### Functions

- `${upper(name)}` - Uppercase function
- `${length(items)}` - Get length
- `${join(items, ", ")}` - Join array
- `${default(value, "fallback")}` - Provide default
- `${if(condition, "true", "false")}` - Conditional

## CLI Usage

### List Available Workflows

```bash
mac prompt list
```

### Show Workflow Details

```bash
mac prompt show init-full
```

### Validate All Workflows

```bash
mac prompt validate
```

### Test a Workflow

```bash
mac prompt test init-full --preview
mac prompt test init-memory --output composed.md
```

### Export Workflow with Dependencies

```bash
mac prompt export init-full workflow-export.json
```

### Cache Management

```bash
mac prompt cache-stats  # View cache statistics
mac prompt cache-clear  # Clear cache
```

## Creating Custom Components

### 1. Create Component File

Create a new YAML file in the appropriate directory:

```yaml
# prompts/templates/my-component.yml
name: my-component
version: 1.0.0
description: My custom component
category: templates

variables:
  project_name: "${workflow.project_name}"
  feature: "${options.feature | default('default')}"

content: |
  ## ${project_name} - ${feature}
  
  Custom content here with ${variable} substitutions
```

### 2. Reference in Workflow

```yaml
# prompts/workflows/my-workflow.yml
name: my-workflow
version: 1.0.0

required:
  - core/session-context
  - templates/my-component
```

### 3. Use via CLI

```bash
mac init --workflow my-workflow
```

## Conditional Logic

### Simple Conditions

```yaml
conditional:
  - if: "options.testing"
    then: templates/testing-setup
```

### Negation

```yaml
conditional:
  - if: "!project.hasAgents"
    then: templates/agent-creation
```

### Comparisons

```yaml
conditional:
  - if: "project.complexity > 0.7"
    then: templates/advanced-setup
```

### Multiple Conditions

```yaml
conditional:
  - if: "options.cicd"
    then:
      - templates/cicd-setup
      - templates/deployment-config
```

## Post-Processing

Workflows can apply post-processing steps:

- `validate_markdown` - Fix markdown syntax
- `check_required_sections` - Ensure sections exist
- `optimize_length` - Trim to size limit
- `remove_duplicates` - Remove duplicate sections
- `format_code_blocks` - Standardize code blocks

## Performance

### Caching

- **Memory Cache**: Fast in-memory LRU cache
- **Disk Cache**: Persistent cache for larger compositions
- **Cache Keys**: Based on workflow + context hash
- **TTL**: 1 hour default, configurable

### Optimization Tips

1. Use specific component dependencies
2. Minimize conditional branches
3. Cache frequently used workflows
4. Keep components focused and small

## Migration from Old System

The new system replaces these files:
- `claude-code-init-prompts.md` → `workflows/init-full.yml`
- `claude-code-init-memory-prompt.md` → `workflows/init-memory.yml`
- `memory-system-addon-prompt.md` → `workflows/add-memory.yml`

No backward compatibility needed - this is a clean replacement.

## Troubleshooting

### Component Not Found

```
Error: Failed to load component 'templates/missing'
```

Check that the component file exists at `prompts/templates/missing.yml`

### Variable Not Resolved

Variables that can't be resolved default to empty string. Check:
1. Variable name spelling
2. Context object structure
3. Variable source (workflow vs component)

### Circular Dependencies

Maximum composition depth is 10 to prevent infinite loops.

### Cache Issues

Clear cache if compositions seem stale:
```bash
mac prompt cache-clear
```

## Best Practices

1. **Keep Components Focused**: Single responsibility per component
2. **Use Meaningful Names**: Component names should describe their purpose
3. **Document Variables**: List all expected variables in component
4. **Version Components**: Update version when making breaking changes
5. **Test Workflows**: Use `mac prompt test` before deploying
6. **Validate Regularly**: Run `mac prompt validate` after changes