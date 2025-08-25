# HOP/LOP Template Pattern

**Pattern Type**: Prompt Architecture  
**Created**: 2025-08-24  
**Status**: Active  
**Success Rate**: High  

## Pattern Description

The HOP/LOP (Higher Order Prompt / Lower Order Prompt) template system eliminates redundancy in implementation prompts through variable interpolation and reusable templates.

## Implementation

### Structure
```
.claude/prompts/
├── hop/
│   └── implementation-master.md    # Master template with variables
├── lop/
│   ├── schema/
│   │   └── lop-base-schema.json   # JSON Schema validation
│   ├── ci-visual-testing.yaml     # CI testing configuration
│   └── visual-feature-development.yaml # Visual dev configuration
└── generated/                      # Output directory
```

### Variable System
- **Simple variables**: `${lop.metadata.name}`
- **Nested paths**: `${lop.variables.plan_location}`
- **Conditionals**: `${#if lop.mcp_servers}...${/if}`
- **Loops**: `${#foreach lop.phases as phase}...${/foreach}`

### LOP Schema Structure
```yaml
metadata:
  name: Implementation Name
  type: testing|feature|refactor|infrastructure
  priority: HIGH|MEDIUM|LOW
  
variables:
  plan_location: .ai/memory/implementation-plans/plan.md
  session_type: identifier
  
agents:
  - name: agent-name
    role: Agent's role
    
phases:
  - name: Phase Name
    description: What this phase does
    tasks: [task1, task2]
    agents: [agent1, agent2]
    
verification:
  criteria: [criterion1, criterion2]
  
memory_patterns:
  - Pattern to document
```

## Usage

### CLI Commands
```bash
mac lop list                    # List available LOPs
mac lop validate <file>         # Validate against schema
mac lop create                  # Interactive creation
mac lop execute <file>          # Generate prompt
```

### Claude Commands
```
/implement ci-testing           # Execute CI testing immediately
/implement visual-dev           # Execute visual development
/implement plan my-plan.md      # Execute from markdown plan
/implement --help              # Show usage
```

## Benefits

1. **Redundancy Reduction**: 78% → <5% duplication
2. **Rapid Creation**: New scenarios in minutes
3. **Validation**: Schema ensures correctness
4. **Direct Execution**: No copying between sessions
5. **Reusability**: Templates shared across projects

## Key Success Factors

1. **Variable Interpolation**: Dynamic content injection works reliably
2. **Schema Validation**: Catches errors before execution
3. **Self-Documenting**: Help built into commands
4. **Template Distribution**: Available in new projects automatically
5. **Context Management**: Automatic session creation

## Common Use Cases

### CI Testing Setup
```
/implement ci-testing
```
- Creates test infrastructure
- Implements CLI tests
- Sets up visual regression
- Configures GitHub Actions

### Visual Development
```
/implement visual-dev
```
- Sets up Playwright MCP
- Creates comparison tools
- Implements iteration workflow
- Configures mock directories

### Custom Implementation
```
/implement custom --lop my-feature.yaml
```
- Uses custom LOP configuration
- Full validation before execution
- Supports all standard features

### Plan with Tests
```
/implement plan refactor.md --with-ci-tests
```
- Executes plan directly
- Adds comprehensive testing
- No LOP/HOP processing needed

## Anti-Patterns to Avoid

- ❌ Creating monolithic prompts instead of using templates
- ❌ Skipping validation before execution
- ❌ Not using variables for common values
- ❌ Copying prompts between sessions
- ❌ Hardcoding values that should be variables

## Related Patterns

- Context Session Management
- Agent Orchestration
- Memory System Integration
- Direct Execution Pattern

## Metrics

- **Creation Time**: < 5 minutes for new LOP
- **Validation Time**: < 1 second
- **Execution Time**: Immediate (no copy/paste)
- **Error Rate**: < 5% with validation
- **Reuse Rate**: > 80% of implementations use templates