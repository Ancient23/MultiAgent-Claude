# Pattern: OpenAI/ChatGPT Compatibility Layer

**Pattern ID**: openai-compatibility-001  
**Category**: Cross-Platform Integration  
**Success Rate**: High (2+ successful implementations)  
**Last Updated**: 2025-01-22

## Problem Context

Teams using both Claude Code and OpenAI platforms (ChatGPT, Codex) need to maintain consistent project configuration, agent behaviors, and memory systems across both environments while respecting platform-specific constraints.

## Solution Pattern

### 1. Dual Configuration System
Maintain parallel configuration files that auto-sync:
- `CLAUDE.md` for Claude Code (comprehensive, MCP-aware)
- `AGENTS.md` for OpenAI Codex (compressed, role-based)

### 2. Agent-to-Role Conversion
Convert MultiAgent-Claude agents to ChatGPT custom instructions:
```javascript
// Use AgentRoleConverter class
const converter = new AgentRoleConverter();
const role = converter.convertToRole(agentContent, agentName);
// Result: <1500 char role instruction
```

### 3. Directory Structure
```
.chatgpt/                    # OpenAI-specific files
├── roles/                   # Converted agent roles
├── bundles/                # Optimized file bundles
├── workflows/              # Step-by-step procedures
└── sync/                   # Synchronization metadata
```

### 4. CLI Integration
Extend CLI with OpenAI commands:
- `mac openai init` - Initialize compatibility
- `mac openai bundle` - Create ChatGPT bundles
- `mac openai sync` - Synchronize configurations
- `mac openai convert-agent` - Convert individual agents

### 5. Memory Unification
Shared memory format in `.ai/memory/`:
- Platform-agnostic markdown format
- Cross-platform ADR templates
- Unified pattern documentation
- Sync state tracking

## Implementation Steps

1. **Initialize**: Run `mac openai init` to create structure
2. **Convert**: Select top 5 agents for role conversion
3. **Bundle**: Create task-specific file bundles
4. **Sync**: Establish bidirectional sync protocol
5. **Document**: Update memory with patterns

## Success Indicators

- ✅ Both platforms can read/write same memory
- ✅ Agent behaviors preserved as roles
- ✅ Configurations stay synchronized
- ✅ Teams can switch platforms seamlessly
- ✅ No duplication of effort

## Common Pitfalls

- ❌ Exceeding ChatGPT's 1500 char limit
- ❌ Losing MCP tool functionality in translation
- ❌ Creating platform-specific silos
- ❌ Forgetting to sync after changes

## Related Patterns

- Agent Template Design
- Memory System Architecture
- CLI Command Extension
- Cross-Platform Workflow Translation

## Example Usage

```bash
# Initialize OpenAI compatibility
mac openai init

# Create bundle for frontend work
mac openai bundle frontend

# Sync after changes
mac openai sync

# Convert new agent
mac openai convert-agent new-specialist
```

## Validation

Test cross-platform compatibility:
1. Make change in Claude
2. Run sync
3. Verify in ChatGPT
4. Make change in ChatGPT
5. Run sync
6. Verify in Claude