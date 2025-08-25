# HOP/LOP Prompt Template System

## Overview

The HOP/LOP (Higher Order Prompt / Lower Order Prompt) system eliminates redundancy in implementation prompts by providing reusable templates with variable interpolation. This reduces prompt duplication from 78% to less than 5%.

## Quick Start

### Execute Implementation Directly (Recommended)
```bash
# In Claude Code, use the /implement command:
/implement ci-testing              # Setup CI testing
/implement visual-dev              # Setup visual development
/implement plan my-plan.md         # Implement from markdown plan
```

### Or Use CLI Commands
```bash
mac lop list                       # List available LOPs
mac lop validate my-lop.yaml       # Validate a LOP
mac lop execute ci-visual-testing.yaml  # Generate prompt
mac lop create                     # Create new LOP interactively
```

## System Components

### 1. Higher Order Prompt (HOP)
- **Location**: `hop/implementation-master.md`
- **Purpose**: Master template with variable placeholders
- **Features**: Loops, conditionals, variable interpolation

### 2. Lower Order Prompts (LOPs)
- **Location**: `lop/*.yaml`
- **Purpose**: Specific implementation configurations
- **Validation**: JSON Schema at `lop/schema/lop-base-schema.json`

### 3. Commands
- **`/implement`**: Direct execution in Claude (`.claude/commands/implement.md`)
- **`mac lop`**: CLI management (`cli/commands/lop.js`)

## Available LOPs

### CI Visual Testing (`ci-visual-testing.yaml`)
Comprehensive CI-compatible Playwright testing:
- GitHub Actions workflows
- Visual regression tests
- Parallel execution
- Template generation

### Visual Feature Development (`visual-feature-development.yaml`)
Local visual development with Playwright MCP:
- Browser iteration
- Mock comparison
- Real-time refinement
- < 5% difference achievement

## Directory Structure

```
.claude/prompts/
├── hop/
│   └── implementation-master.md     # Master template
├── lop/
│   ├── schema/
│   │   └── lop-base-schema.json    # Validation schema
│   ├── ci-visual-testing.yaml      # CI testing LOP
│   └── visual-feature-development.yaml # Visual dev LOP
├── generated/                       # Output directory
└── README.md                        # This file

templates/prompts/                   # For distribution
├── hop/                            # Template HOPs
└── lop/                            # Template LOPs
```

## Creating Custom LOPs

### Interactive Creation
```bash
mac lop create
# Answer prompts for name, type, agents, phases
```

### Manual Creation
Create a YAML file following the schema:
```yaml
metadata:
  name: My Implementation
  type: feature
  priority: HIGH
  
variables:
  plan_location: .ai/memory/implementation-plans/my-plan.md
  session_type: my_implementation
  
agents:
  - name: meta-development-orchestrator
    role: Coordination
    
phases:
  - name: Setup
    description: Initial setup
    tasks:
      - Task 1
      - Task 2
      
verification:
  criteria:
    - All code implemented
    - Tests passing
    
memory_patterns:
  - Document patterns in memory system
```

## /implement Command Usage

### Default: Direct Execution
```
/implement ci-testing
```
→ Creates context session → Executes immediately

### From Implementation Plan
```
/implement plan .ai/memory/implementation-plans/my-plan.md
```
→ Reads plan → Executes directly

### With Test Addition
```
/implement plan refactor.md --with-ci-tests
/implement plan feature.md --with-visual-tests
```
→ Executes plan → Adds specified tests

### Output-Only Mode
```
/implement ci-testing --output-only
```
→ Generates prompt file → Does not execute

## Variable System

The HOP template supports:
- **Simple variables**: `${lop.metadata.name}`
- **Nested paths**: `${lop.variables.plan_location}`
- **Conditionals**: `${#if lop.mcp_servers}...${/if}`
- **Loops**: `${#foreach lop.phases as phase}...${/foreach}`

## Validation

LOPs are validated against JSON Schema:
```bash
mac lop validate my-lop.yaml
```

Checks:
- Required fields present
- Correct types
- Valid enum values
- Pattern matching

## Best Practices

1. **Use /implement for immediate execution** - Faster than copying prompts
2. **Validate LOPs before use** - Catch errors early
3. **Start from templates** - Modify existing LOPs
4. **Document patterns** - Update memory system
5. **Keep LOPs focused** - One implementation type per LOP

## Integration

The system integrates with:
- **Context Sessions**: Automatic creation and updates
- **Agent System**: Deploys specified agents
- **Memory System**: Documents patterns
- **CLI**: Full command-line support
- **Templates**: Available in new projects

## Troubleshooting

### LOP Validation Fails
- Check against schema requirements
- Ensure all required fields present
- Validate YAML syntax

### Command Not Found
- Ensure CLI is installed: `npm install -g`
- Check PATH includes `node_modules/.bin`

### Variable Not Replaced
- Check variable name matches schema
- Ensure LOP has the field defined
- Verify interpolation syntax

## Examples

See `implement-examples.md` for detailed usage examples.

## Benefits

- **78% → <5% redundancy** reduction
- **Rapid scenario creation** via YAML
- **Validation prevents errors**
- **Direct execution** in Claude
- **Reusable across projects**