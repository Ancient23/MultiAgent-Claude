# HOP/LOP Template System Implementation Prompt

Implement the complete HOP/LOP (Higher Order Prompt / Lower Order Prompt) template system from `.ai/memory/implementation-plans/hop-lop-template-system-plan.md`.

## Context

The HOP/LOP system has been fully implemented to reduce prompt redundancy from 78% to < 5% by creating reusable templates. The system includes:

1. **Master HOP Template**: At `.claude/prompts/hop/implementation-master.md`
2. **LOP Schema**: JSON Schema validation at `.claude/prompts/lop/schema/lop-base-schema.json`
3. **Example LOPs**: CI Visual Testing and Visual Feature Development
4. **CLI Integration**: `mac lop` commands for validate, create, list, execute
5. **Distribution Templates**: Copied to `templates/prompts/` for new projects

## Usage Instructions

### To Use the HOP/LOP System:

1. **List Available LOPs**:
   ```bash
   mac lop list
   ```

2. **Create a New LOP**:
   ```bash
   mac lop create
   # Follow interactive prompts
   ```

3. **Validate a LOP**:
   ```bash
   mac lop validate .claude/prompts/lop/my-scenario.yaml
   ```

4. **Execute a LOP** (Generate Implementation Prompt):
   ```bash
   mac lop execute .claude/prompts/lop/ci-visual-testing.yaml
   # Or for visual development:
   mac lop execute .claude/prompts/lop/visual-feature-development.yaml
   ```

5. **Copy Generated Prompt**: The system will generate a complete implementation prompt that can be copied to Claude for execution.

## Available LOPs

### 1. CI Visual Testing (`ci-visual-testing.yaml`)
- **Purpose**: Implement CI-compatible Playwright testing
- **Use When**: Setting up automated testing in GitHub Actions
- **Command**: `mac lop execute .claude/prompts/lop/ci-visual-testing.yaml`

### 2. Visual Feature Development (`visual-feature-development.yaml`)
- **Purpose**: Develop visual features with Playwright MCP
- **Use When**: Creating pixel-perfect UI with browser iteration
- **Command**: `mac lop execute .claude/prompts/lop/visual-feature-development.yaml`

## Creating Custom LOPs

To create your own implementation scenario:

1. Run `mac lop create` and answer the prompts
2. Edit the generated YAML file to add:
   - Specific agent roles
   - Detailed phase tasks
   - Verification criteria
   - MCP servers if needed
3. Validate with `mac lop validate <file>`
4. Execute to generate the prompt

## Key Features

- **Variable Interpolation**: LOPs inject variables into HOP template
- **Schema Validation**: Ensures LOPs are correctly structured
- **Agent Discovery**: Auto-detects available agents from Examples/agents/
- **Template Distribution**: Available in new projects via templates/
- **Interactive Creation**: Guided LOP creation with inquirer

## Benefits

1. **No More Copy-Paste**: Reuse proven implementation patterns
2. **Rapid Scenarios**: Create new implementations in minutes
3. **Consistency**: All implementations follow same structure
4. **Validation**: Catch errors before execution
5. **Documentation**: Self-documenting through YAML structure

## Testing the System

Test commands are working:
```bash
# Validation works
mac lop validate .claude/prompts/lop/ci-visual-testing.yaml
# Output: ✅ LOP validation successful!

# Listing works
mac lop list
# Shows both project and template LOPs

# Execution generates prompts
mac lop execute .claude/prompts/lop/visual-feature-development.yaml
# Generates complete implementation prompt
```

## Next Steps

1. Use the existing LOPs for your implementations
2. Create custom LOPs for your specific scenarios
3. Share successful LOPs with the team
4. Document patterns in `.ai/memory/patterns/prompts/`

The HOP/LOP system is now ready for use. Execute any LOP to generate a complete, validated implementation prompt tailored to your specific needs.