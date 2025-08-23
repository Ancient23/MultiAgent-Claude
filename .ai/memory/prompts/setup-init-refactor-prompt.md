# Prompt for Setup/Init Intelligent Refactoring

Copy this prompt to use in a new Claude conversation to implement the refactoring:

---

## Task: Implement Intelligent Setup/Init Refactoring

I need to refactor the `mac setup` and `mac init` commands in the MultiAgent-Claude framework to use intelligent, context-aware initialization. The plan is documented in `.ai/memory/implementation-plans/setup-init-refactor-plan.md`.

### Key Objectives

1. **Refactor setup.js** to only collect configuration (no file creation)
2. **Fix init.js** variable scoping bug and enhance with intelligent prompting
3. **Use framework's own agents** for intelligent creation

### Please use these specialized agents to help:

1. **meta-development-orchestrator** - Coordinate the overall refactoring
2. **cli-test-engineer** - Ensure CLI commands work correctly after changes
3. **documentation-sync-guardian** - Keep documentation synchronized
4. **agent-factory** - Review patterns for agent creation
5. **codex-configuration-expert** - Review AGENTS.md optimization patterns

### Implementation Plan Location
Read the detailed plan at: `.ai/memory/implementation-plans/setup-init-refactor-plan.md`

### Specific Changes Needed

#### 1. In `cli/commands/setup.js`:
- Remove lines 601-686 (createCodexRole function)
- Remove lines 687-777 (createCustomAgent function)  
- Remove lines 779-918 (AGENTS.md parsing functions)
- Remove lines 920-1048 (createAGENTSmd function)
- Simplify setupEnvironment (lines 1050-1235) to only save config

#### 2. In `cli/commands/init.js`:
- Move variable declarations (lines 189-196) before line 95 to fix scoping bug
- Enhance executeWithClaude function to build intelligent prompts
- Include instructions for using agent-factory, codex-configuration-expert, and role-instruction-engineer patterns

#### 3. Create new YAML component:
- `prompts/templates/intelligent-agent-creation.yml` for intelligent agent creation

#### 4. Update workflow:
- Add intelligent-agent-creation to `prompts/workflows/init-full.yml`

### Testing Requirements
After implementation:
1. Run `mac setup` - should only create config
2. Run `mac init` - should intelligently create agents using framework patterns
3. Verify no boilerplate templates are used
4. Check that AGENTS.md is optimized for Codex
5. Ensure ChatGPT roles are compressed to <1500 chars

### Success Criteria
- setup.js creates NO files, only configuration
- init.js uses enhanced prompts with agent patterns
- Created agents are context-aware and project-specific
- Framework uses its own capabilities (meta-development)
- All tests pass after refactoring

Please start by reading the implementation plan, then proceed with the refactoring using the specialized agents mentioned above.

---

## Additional Context for Claude

This is a meta-development task where the MultiAgent-Claude framework is improving itself. The key insight is that instead of using static boilerplate templates, the framework should use its own specialized agents (agent-factory, codex-configuration-expert, role-instruction-engineer) to create intelligent, context-aware configurations.

The framework already has these capabilities - we just need to use them during initialization!