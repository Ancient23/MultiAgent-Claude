# ADR-009: Template Agent Copying in Init Process

## Status
Accepted

## Context
The `mac init` command was not copying template agents selected during setup. The config stores two types of agents:
1. **Template agents** (`config.agents`) - Pre-built agents from Examples/agents/ that should be copied
2. **Custom agents** (`config.queuedForCreation.customAgents`) - New agents to be created using agent-factory patterns

The init process was only handling custom agents, ignoring the template agents entirely.

## Decision
We added logic to copy template agents from the Examples directory before executing with Claude:

### 1. Added `copyTemplateAgents` Function
```javascript
function copyTemplateAgents(agents) {
  // Copies agents from Examples/agents/orchestrators/ or Examples/agents/specialists/
  // To .claude/agents/ in the project
}
```

### 2. Copy Template Agents Before Claude Execution
```javascript
// Copy template agents BEFORE executing with Claude
if (config && config.agents && config.agents.length > 0) {
  console.log(chalk.blue('\n📂 Copying template agents from Examples...'));
  const copiedCount = copyTemplateAgents(config.agents);
  console.log(chalk.green(`✓ Successfully copied ${copiedCount}/${config.agents.length} template agents`));
}
```

### 3. Updated Verification
Now checks for both:
- Template agents (should be copied)
- Custom agents (should be created by Claude)

## Agent Types Explained

### Template Agents (Copied)
Located in `Examples/agents/orchestrators/` and `Examples/agents/specialists/`:
- fullstack-feature-orchestrator
- aws-backend-architect
- playwright-test-engineer
- documentation-architect
- etc.

These are pre-built, tested agents that can be used immediately.

### Custom Agents (Created)
User-defined agents specific to their project:
- web3-blockchain-specialist
- mongodb-specialist
- account-linking-specialist
- etc.

These are created by Claude using agent-factory patterns based on the project's needs.

## Consequences

### Positive
- Template agents are now properly copied to projects
- Users get both pre-built agents AND custom agents
- Clear separation between copied and created agents
- Better user feedback showing what's being copied vs created

### Negative
- Slightly more complex init process
- Requires Examples/agents/ directory to be present

## Implementation
- `cli/commands/init.js`:
  - Lines 8-45: Added `copyTemplateAgents` function
  - Lines 467-475: Copy template agents before Claude execution
  - Lines 314-328: Verify template agents are present
  - Lines 418-425: Show template agents to be copied

## Testing
When running `mac init`:
1. Template agents should be copied immediately
2. Custom agents should be created by Claude
3. Both types should be verified and reported

## Success Metrics
- All selected template agents are copied (100%)
- All custom agents are created by Claude
- Clear distinction in output between copied and created agents