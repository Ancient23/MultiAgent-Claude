# AGENTS.md - Repository Guidelines

## Project Overview

MultiAgent-Claude is a sophisticated orchestration framework for AI development, built with Node.js and JavaScript. This repository follows a multi-agent architecture pattern and emphasizes modularity, extensibility, and cross-platform compatibility.

**Key Technologies**: Node.js, JavaScript, Playwright, GitHub Actions, CommonMark  
**Architecture**: Multi-agent orchestration with CLI tooling  
**Development Philosophy**: Research-plan-execute pattern, memory-driven development, cross-platform compatibility

## Directory Structure

```
src/
├── cli/                    # CLI implementation
│   ├── index.js           # Main entry point
│   └── commands/          # Command implementations
├── Examples/              # Agent and command templates
│   ├── agents/            # Agent template library
│   └── commands/          # Command templates
├── templates/             # Project setup templates
│   ├── workflows/         # CI/CD workflows
│   └── tests/            # Test templates
├── tests/                 # Test suite
├── .claude/              # Claude-specific configuration
│   ├── memory/           # Knowledge base
│   ├── agents/           # Project agents
│   └── tasks/            # Session contexts
└── .chatgpt/             # OpenAI-specific configuration
    ├── bundles/          # Optimized file bundles
    └── roles/            # Agent role instructions
```

## Role Guidelines

### When Working on CLI Development
**Triggers**: CLI, commands, terminal, command-line interface, mac command

**Approach**:
1. Review existing commands in `cli/commands/`
2. Follow Commander.js patterns for new commands
3. Add comprehensive help text and examples
4. Test with various input scenarios
5. Update CLI documentation in README.md
6. Run `npm test` to verify functionality

**Focus Areas**: User experience, error handling, cross-platform compatibility

### When Working on Agent Development
**Triggers**: Agents, orchestration, specialists, task delegation, automation

**Approach**:
1. Check agent templates in `Examples/agents/`
2. Follow research-plan-execute pattern
3. Define clear trigger keywords and patterns
4. Specify output locations in `.claude/doc/`
5. Document quality standards and examples
6. Test agent invocation and output

**Focus Areas**: Clear responsibilities, comprehensive planning, actionable outputs

### When Working on Memory System
**Triggers**: Memory, patterns, ADRs, knowledge base, documentation

**Approach**:
1. Review `.claude/memory/` structure
2. Document patterns after 2+ successful uses
3. Create ADRs for architectural decisions
4. Update project.md with conventions
5. Maintain index.json for quick lookups
6. Ensure cross-platform compatibility

**Focus Areas**: Knowledge preservation, pattern recognition, decision documentation

### When Working on Testing
**Triggers**: Tests, testing, validation, quality assurance, debugging

**Approach**:
1. Use Playwright for CLI and web testing
2. Maintain tests in `tests/` directory
3. Follow existing test patterns
4. Ensure >80% code coverage
5. Run full suite before commits
6. Update visual baselines when needed

**Focus Areas**: Edge cases, regression prevention, cross-platform validation

### When Working on Cross-Platform Integration
**Triggers**: OpenAI, ChatGPT, Codex, compatibility, sync, integration

**Approach**:
1. Maintain AGENTS.md ↔ CLAUDE.md sync
2. Update `.chatgpt/` bundles regularly
3. Test with both Claude and ChatGPT
4. Document platform-specific patterns
5. Ensure memory system compatibility
6. Create unified workflows

**Focus Areas**: Consistency, compatibility, seamless collaboration

## Testing Procedures

### Essential Commands
```bash
npm test              # Run all tests
npm run test:cli     # CLI-specific tests
npm run test:ui      # Interactive test mode
npm run test:debug   # Debug with inspector
```

### Before Submitting Changes
1. Run full test suite: `npm test`
2. Verify no regressions
3. Check test coverage
4. Update documentation if needed
5. Ensure cross-platform compatibility
6. Test with both Claude and ChatGPT if applicable

### Visual Testing
```bash
npm run visual:test    # Run visual regression tests
npm run visual:update  # Update baseline screenshots
```

## Memory System Navigation

### Key Locations
- **Project Context**: `.claude/memory/project.md` - Conventions and standards
- **Patterns**: `.claude/memory/patterns/` - Proven solutions by domain
- **Decisions**: `.claude/memory/decisions/` - Architectural Decision Records
- **Session Context**: `.claude/tasks/context_session_*.md` - Current work state

### Pattern Documentation
When discovering successful patterns:
1. Document in appropriate domain folder
2. Include problem context and solution
3. Add implementation examples
4. Update after 2+ successful uses
5. Reference in future implementations

### Decision Records
For architectural decisions:
1. Create ADR in `.claude/memory/decisions/`
2. Include context, decision, and consequences
3. Document both Claude and OpenAI considerations
4. Reference in related implementations

## Workflow Patterns

### Feature Development
1. Read session context from `.claude/tasks/`
2. Check memory for existing patterns
3. Research requirements and constraints
4. Create implementation plan
5. Execute plan with validation
6. Document successful patterns
7. Update memory and sync

### Bug Fixing
1. Reproduce and understand the issue
2. Search for similar patterns in memory
3. Identify root cause
4. Implement fix with tests
5. Verify no regressions
6. Document solution pattern

### Code Review
1. Check against project standards
2. Verify test coverage
3. Review architectural alignment
4. Ensure documentation updates
5. Validate cross-platform compatibility

## Quality Standards

### Code Quality
- Follow existing code conventions
- Maintain consistent style
- Include comprehensive error handling
- Write self-documenting code
- Add tests for new functionality

### Documentation
- Keep documentation current
- Include practical examples
- Document decisions and rationale
- Maintain cross-platform guides
- Update memory system

### Testing
- Achieve >80% code coverage
- Test edge cases
- Include integration tests
- Maintain visual regression tests
- Verify cross-platform functionality

## Cross-Platform Considerations

### Claude Code
- Leverages MCP tools for enhanced capabilities
- Uses Task tool for agent orchestration
- Supports parallel agent execution
- Maintains session context

### OpenAI Platforms
- Works within token and file limits
- Uses role-based instructions
- Follows structured workflows
- Relies on bundled context

### Synchronization
- Run `mac openai sync` regularly
- Update AGENTS.md from CLAUDE.md changes
- Maintain unified memory system
- Test with both platforms

## Anti-Patterns to Avoid

❌ Skipping tests before commits  
❌ Ignoring memory system patterns  
❌ Creating platform-specific silos  
❌ Forgetting documentation updates  
❌ Breaking cross-platform compatibility  
❌ Implementing without planning

## Tips for Success

1. **Leverage Memory**: Check patterns before implementing
2. **Plan Thoroughly**: Create detailed plans before execution
3. **Test Comprehensively**: Verify all changes work correctly
4. **Document Decisions**: Record architectural choices
5. **Maintain Compatibility**: Ensure both platforms work
6. **Follow Patterns**: Use established successful approaches