# MultiAgent-Claude Project Memory

**Last Updated**: 2025-01-22  
**Version**: 2.1.0  
**Status**: Active Development

## Project Overview

MultiAgent-Claude is a sophisticated orchestration framework for AI development, providing multi-agent coordination, visual development support, and intelligent task delegation. The framework now includes comprehensive OpenAI/ChatGPT compatibility.

## Core Conventions

### File Naming
- Agents: `[name]-agent.md` or `[name]-specialist.md`
- Roles: `[name]-role.md` (ChatGPT format)
- Commands: `[name]-command.md`
- Memory: `[category]-[topic].md`
- ADRs: `ADR-[number]-[title].md`

### Directory Structure
```
.claude/                    # Claude-specific configuration
├── agents/                # Project agents
├── commands/             # Project commands
└── tasks/                # Session contexts

.chatgpt/                  # OpenAI-specific configuration
├── roles/                # Converted agent roles
├── bundles/              # File bundles
├── workflows/            # Step-by-step guides
└── sync/                 # Sync metadata

.ai/
└── memory/               # Knowledge base
```

### Development Patterns

#### Research-Plan-Execute
1. Agents research using MCP tools
2. Create detailed plans in `.claude/doc/`
3. Main system executes plans
4. Document successful patterns

#### Cross-Platform Workflow
1. Maintain dual configs (CLAUDE.md/AGENTS.md)
2. Convert agents to roles for ChatGPT
3. Sync regularly with `mac openai sync`
4. Test on both platforms

### Testing Standards
- Minimum 80% code coverage
- Playwright for E2E testing
- Visual regression baselines
- Cross-platform validation

## Technology Stack

### Core Technologies
- Node.js 18+
- JavaScript/ES6+
- Commander.js (CLI)
- Playwright (Testing)

### AI Platforms
- Claude Code with MCP tools
- OpenAI Codex support
- ChatGPT Projects integration

### Key Dependencies
- chalk: Terminal styling
- fs-extra: File operations
- inquirer: Interactive prompts
- archiver: Bundle creation
- js-yaml: YAML parsing

## Architectural Decisions

### ADR-001: Dual Configuration Strategy
Maintain CLAUDE.md and AGENTS.md for platform compatibility

### ADR-002: Agent to Role Compression
COMPACT algorithm for 1500-char ChatGPT limits

### ADR-003: Bidirectional Sync Protocol
Multi-level sync with conflict resolution

## Established Patterns

### OpenAI Compatibility Pattern
- Dual configuration files
- Agent-to-role conversion
- Bundle optimization
- Sync protocol

### Agent Role Conversion Pattern
- COMPACT compression algorithm
- Trigger preservation
- Workflow adaptation
- Character optimization

### Memory Unification Pattern
- Platform-agnostic format
- Shared ADR structure
- Cross-platform sync
- Conflict resolution

## Quality Metrics

### Code Quality
- ESLint compliance
- Consistent formatting
- Comprehensive error handling
- Type safety where applicable

### Documentation
- README completeness
- Inline code comments
- ADR maintenance
- Pattern documentation

### Cross-Platform
- Claude compatibility: 100%
- OpenAI compatibility: 95%
- Sync reliability: 90%
- Role conversion: 85%

## Common Issues & Solutions

### Issue: ChatGPT character limit
**Solution**: Use COMPACT algorithm for compression

### Issue: MCP tool translation
**Solution**: Convert to natural language instructions

### Issue: Sync conflicts
**Solution**: Platform-specific resolution preferences

### Issue: Bundle size limits
**Solution**: Task-specific bundle optimization

## Performance Benchmarks

- CLI command response: <500ms
- Agent conversion: <2s
- Bundle creation: <10s
- Sync operation: <60s
- Memory query: <100ms

## Security Considerations

- No secrets in configurations
- Secure file permissions
- Input validation on CLI
- Safe path operations
- No arbitrary code execution

## Future Enhancements

- [ ] Real-time sync capability
- [ ] Cloud backup option
- [ ] Advanced conflict resolution
- [ ] Visual configuration editor
- [ ] Automated testing for roles
- [ ] Performance monitoring dashboard

## Team Guidelines

### When Adding Features
1. Check existing patterns first
2. Create ADR for architectural changes
3. Update both CLAUDE.md and AGENTS.md
4. Test on both platforms
5. Document in memory system

### When Fixing Bugs
1. Search memory for similar issues
2. Create test to reproduce
3. Implement fix
4. Verify no regressions
5. Document solution pattern

### When Reviewing Code
1. Check cross-platform compatibility
2. Verify pattern adherence
3. Ensure documentation updates
4. Validate test coverage
5. Confirm sync integrity

## Integration Points

### GitHub Actions
- Memory updates on push
- Test execution on PR
- Visual regression checks
- Cross-platform validation

### MCP Servers
- Context7 for documentation
- Sequential for reasoning
- Playwright for testing
- Magic for UI components

### External Tools
- ChatGPT Projects
- OpenAI Codex
- Claude Desktop
- VS Code integration

## Success Indicators

- ✅ Seamless platform switching
- ✅ Consistent agent behaviors
- ✅ Reliable synchronization
- ✅ Comprehensive documentation
- ✅ Active pattern library
- ✅ Growing ADR collection
- ✅ High test coverage
- ✅ Team adoption