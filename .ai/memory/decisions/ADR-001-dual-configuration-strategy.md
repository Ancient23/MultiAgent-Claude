# ADR-001: Dual Configuration Strategy for Cross-Platform Compatibility

## Status
Accepted

## Context

The MultiAgent-Claude framework needs to support teams using both Claude Code and OpenAI platforms (ChatGPT, Codex). Each platform has different capabilities and constraints:

- **Claude Code**: Supports CLAUDE.md, MCP tools, unlimited context, agent orchestration
- **OpenAI Codex**: Requires AGENTS.md (32KB limit), no MCP tools, role-based instructions
- **ChatGPT Projects**: 1500 char custom instructions, 20-40 file upload limits

A single configuration file cannot effectively serve both platforms due to these fundamental differences.

## Decision

We will maintain dual configuration files that are automatically synchronized:

1. **CLAUDE.md**: Primary configuration for Claude Code
   - Comprehensive documentation (no size limit)
   - MCP tool references
   - Agent orchestration patterns
   - Full memory system integration

2. **AGENTS.md**: Derivative configuration for OpenAI Codex
   - Compressed to 32KB limit
   - Role-based guidelines instead of agents
   - Natural language instructions instead of MCP tools
   - Simplified workflow patterns

3. **Synchronization**: Bidirectional sync via `mac openai sync`
   - CLAUDE.md → AGENTS.md (compression)
   - AGENTS.md → CLAUDE.md (expansion)
   - Conflict resolution with platform preferences

## Consequences

### Positive
- Both platforms work with native configuration formats
- No manual translation needed between platforms
- Teams can choose tools based on preference
- Maintains single source of truth with sync

### Negative
- Additional complexity in maintaining two files
- Potential for sync conflicts
- Some information loss in compression
- Extra CLI commands to learn

### Neutral
- Requires new CLI infrastructure
- Memory system must be platform-agnostic
- Documentation needs cross-platform sections

## Implementation

### Claude-Specific
```markdown
# CLAUDE.md
- Full agent templates with YAML frontmatter
- MCP tool usage documentation
- Detailed orchestration patterns
- Unlimited content length
```

### OpenAI-Specific
```markdown
# AGENTS.md
- Compressed role guidelines
- Natural language procedures
- 32KB maximum size
- Codex-optimized structure
```

## Alternatives Considered

1. **Single Universal Config**: Too limiting for Claude, too large for OpenAI
2. **Platform-Specific Repos**: Would create silos and duplication
3. **Runtime Translation**: Too complex and error-prone
4. **Manual Sync**: Too labor-intensive and inconsistent

## References

- OpenAI Codex Documentation
- Claude Code Configuration Guide
- ChatGPT Projects Limitations
- Cross-Platform Development Best Practices