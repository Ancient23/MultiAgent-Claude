# ADR-006: Intelligent Setup/Init System Refactoring

## Status
Proposed

## Context
The current `mac setup` and `mac init` commands have several issues:
1. `setup.js` creates files directly instead of just collecting configuration
2. `init.js` has a variable scoping bug (hasQueuedItems referenced before declaration)
3. Both commands have redundant code and poor separation of concerns
4. File creation uses boilerplate templates instead of intelligent, context-aware generation

## Decision
Refactor the setup/init system to leverage the framework's own capabilities for intelligent self-configuration:

### 1. Pure Configuration Collection (setup.js)
- Remove ALL file creation logic (lines 601-1048)
- Only gather user preferences and save to `.claude/config.json`
- Queue items for intelligent creation by Claude during init

### 2. Intelligent Orchestration (init.js)
- Fix variable scoping bug
- Enhance prompt composition using YAML workflow system
- Leverage specialized agents for creation:
  - `agent-factory` for custom agent creation
  - `codex-configuration-expert` for AGENTS.md optimization
  - `role-instruction-engineer` for ChatGPT role creation
  - `meta-development-orchestrator` for framework setup

### 3. YAML Workflow Components
Create new intelligent workflow components:
- `prompts/templates/intelligent-agent-creation.yml`
- `prompts/templates/codex-optimization.yml`
- `prompts/templates/role-generation.yml`

## Consequences

### Positive
- **No Boilerplate**: Context-aware agents based on actual project needs
- **Meta-Development**: Framework uses its own patterns to set itself up
- **Intelligent Merging**: Preserves custom content in existing files
- **Clean Architecture**: Clear separation between configuration and creation
- **Optimized Output**: ChatGPT roles properly compressed to <1500 chars

### Negative
- Requires Claude to be available for init (not standalone)
- More complex prompt generation
- Depends on agent quality for good results

## Implementation Notes

### Key Changes to setup.js
```javascript
// Simplified setupEnvironment function
function setupEnvironment(config) {
  // Only create directories and save config
  // NO file creation
}
```

### Key Changes to init.js
```javascript
// Fix variable declarations (move before line 95)
let hasQueuedItems = false;
let queuedAgents = [];
// ... other variables

// Enhanced prompt with intelligent creation
if (config.queuedForCreation?.needsProcessing) {
  enhancedPrompt += "Use framework patterns: agent-factory, codex-configuration-expert...";
}
```

### Agents to Leverage
1. **agent-factory**: Creates custom agents with proper patterns
2. **codex-configuration-expert**: Optimizes AGENTS.md for Codex
3. **role-instruction-engineer**: Compresses agents to ChatGPT roles
4. **meta-development-orchestrator**: Coordinates framework setup

## Related
- ADR-001: Multi-Agent Architecture
- ADR-002: Memory System Design
- agent-factory.md agent specification
- codex-configuration-expert.md agent specification
- /generate-agent command pattern
- /generate-role command pattern