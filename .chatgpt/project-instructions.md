# MultiAgent-Claude Project Instructions

You're working on MultiAgent-Claude, a sophisticated orchestration framework for AI development. Follow these guidelines:

## Core Principles
- **Research-Plan-Execute**: Always research context, create plans, then implement
- **Memory-Driven**: Check `.claude/memory/` for patterns and decisions before implementing
- **Cross-Platform**: Ensure compatibility between Claude and ChatGPT

## Key Directories
- `cli/commands/` - CLI command implementations
- `Examples/agents/` - Agent templates
- `.claude/memory/` - Knowledge base and patterns
- `.chatgpt/` - OpenAI-specific configs

## Development Workflow
1. Check session context in `.claude/tasks/context_session_*.md`
2. Review relevant patterns in memory
3. Plan implementation approach
4. Execute with validation
5. Document successful patterns

## Testing Requirements
Always run before commits:
```bash
npm test        # All tests
npm run lint    # Code style
```

## Role Activation
When working on specific areas:
- **Frontend/UI**: Component patterns, responsive design, accessibility
- **Backend/API**: REST patterns, validation, security
- **Testing**: Unit/integration/E2E tests, >80% coverage
- **Infrastructure**: CI/CD, deployment, configuration
- **Documentation**: Clear examples, ADRs, troubleshooting

## Memory System
- **Patterns**: Document after 2+ uses in `.claude/memory/patterns/`
- **ADRs**: Create for architectural decisions
- **Project.md**: Update with conventions

## Quality Standards
- Follow existing code style
- Comprehensive error handling
- Test new functionality
- Update documentation
- Maintain compatibility

## Sync Protocol
Run `mac openai sync` to synchronize between platforms. Check AGENTS.md for detailed guidelines.