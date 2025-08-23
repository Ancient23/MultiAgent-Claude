# Intelligent Init Pattern

## Pattern Name
Intelligent Self-Configuration Using Framework Agents

## Context
When initializing a MultiAgent-Claude project, the system should use its own specialized agents to create context-aware configurations rather than static boilerplate templates.

## Problem
Static template-based initialization creates generic, non-optimized configurations that don't match the specific project's needs.

## Solution
Use the framework's own specialized agents during initialization:

### Phase 1: Configuration Collection (setup.js)
```javascript
// Only collect and save configuration
const config = {
  variant,
  agents: selectedAgents,
  mcpServers,
  projectAnalysis: {...},
  queuedForCreation: {
    customAgents: [...],
    codexRoles: [...],
    agentsMd: 'create|merge|skip'
  }
};
fs.writeFileSync('.claude/config.json', JSON.stringify(config, null, 2));
```

### Phase 2: Intelligent Creation (init.js)
```javascript
// Build enhanced prompt for Claude
let enhancedPrompt = basePrompt;

if (config.queuedForCreation?.needsProcessing) {
  enhancedPrompt += `
## Intelligent Creation Using Framework Patterns

Use these specialized agents' patterns:
- agent-factory: For creating custom agents
- codex-configuration-expert: For AGENTS.md optimization
- role-instruction-engineer: For ChatGPT role compression
- meta-development-orchestrator: For coordinating setup

Project Analysis:
${JSON.stringify(config.projectAnalysis, null, 2)}

Custom Agents to Create:
${config.queuedForCreation.customAgents.map(agent => 
  `- ${agent}: Create using agent-factory patterns for ${agent.replace(/-/g, ' ')} domain`
).join('\n')}

AGENTS.md Action: ${config.queuedForCreation.agentsMd}
${config.queuedForCreation.agentsMd === 'merge' ? 
  '- Intelligently merge with existing content\n- Preserve custom sections' : 
  '- Create optimized for Codex 192k context'}

ChatGPT Roles to Create:
${config.queuedForCreation.codexRoles.map(role =>
  `- ${role}: Compress to <1500 chars using role-instruction-engineer patterns`
).join('\n')}
`;
}
```

### Phase 3: Agent-Driven Creation
Claude uses the framework's patterns to:

1. **Custom Agent Creation** (agent-factory pattern):
   - Analyze domain from agent name
   - Select appropriate MCP tools
   - Create specialized workflows
   - Apply quality standards

2. **AGENTS.md Optimization** (codex-configuration-expert pattern):
   - Structure for 192k token window
   - Include testing procedures
   - Add memory system navigation
   - Create role guidelines

3. **Role Compression** (role-instruction-engineer pattern):
   - Extract essential capabilities
   - Compress to <1500 characters
   - Maintain functionality
   - Create manifest

## Implementation Example

### Custom Agent Creation
Instead of boilerplate:
```yaml
# BEFORE (boilerplate)
name: web3-blockchain-specialist
model: sonnet
# Generic template content...

# AFTER (intelligent)
name: web3-blockchain-specialist
model: sonnet
description: Use PROACTIVELY when user mentions Web3, DeFi, smart contracts, wallet integration, or blockchain transactions
triggers: [web3, blockchain, smart contract, defi, wallet, ethereum, solana]
mcp_tools: [WebSearch for blockchain updates, Context7 for Web3.js docs]

## Goal
Research and plan Web3/blockchain implementations with focus on:
- Smart contract integration (detected: contracts/ directory)
- Wallet connectivity (detected: web3, ethers dependencies)
- DeFi protocols (if applicable)
# ... context-aware content based on project
```

## Benefits
1. **Context-Aware**: Agents match actual project needs
2. **Self-Improving**: Framework uses its own tools
3. **No Boilerplate**: Each agent is unique and optimized
4. **Intelligent Merging**: Preserves custom content
5. **Optimal Compression**: Roles fit platform limits

## When to Use
- During `mac init` command execution
- When creating custom agents for projects
- When updating existing AGENTS.md files
- When generating ChatGPT/Codex roles

## Related Patterns
- Agent Factory Pattern
- Meta-Development Pattern
- Role Compression Pattern
- YAML Workflow Composition Pattern