# ADR-007: Meta-Development vs Template Agent Separation

## Date
2025-08-21

## Status
Proposed

## Context
MultiAgent-Claude is a meta-framework that:
1. Uses agents to develop itself (meta-agents)
2. Provides agent templates for other projects (template agents)
3. Has significant overlap and confusion between these two categories

Current issues:
- Agents in `.claude/` are meta-specific but some could be templates
- Agents in `Examples/` are templates but some are needed for meta-work
- Commands duplicate orchestrator functionality
- CLI doesn't distinguish between meta and template agents
- Documentation doesn't clarify the meta-project nature

## Decision
Establish clear separation between meta-development infrastructure and distributable templates.

### Directory Structure
```
MultiAgent-Claude/
├── .claude/                    # META-DEVELOPMENT ONLY
│   ├── agents/                 # Framework development agents
│   │   ├── meta-development-orchestrator.md  # Orchestrates framework improvements
│   │   ├── meta-agent-factory.md             # Creates new agent templates
│   │   ├── meta-template-tracker.md          # Tracks template evolution
│   │   ├── meta-cli-engineer.md              # Tests and improves CLI
│   │   └── meta-framework-guardian.md        # Maintains framework integrity
│   ├── commands/               # Meta-development commands
│   └── manifest.json           # Meta-agent registry
├── Examples/                   # TEMPLATES FOR OTHER PROJECTS
│   ├── agents/
│   │   ├── orchestrators/      # General-use orchestrators (Opus)
│   │   │   ├── fullstack-feature-orchestrator.md
│   │   │   ├── infrastructure-migration-architect.md
│   │   │   ├── issue-triage-orchestrator.md
│   │   │   ├── code-review-orchestrator.md
│   │   │   ├── wave-execution-orchestrator.md
│   │   │   └── parallel-controller.md
│   │   ├── specialists/        # General-use specialists (Sonnet)
│   │   │   ├── frontend-ui-expert.md
│   │   │   ├── aws-backend-architect.md
│   │   │   ├── documentation-architect.md
│   │   │   ├── codebase-truth-analyzer.md
│   │   │   ├── prompt-engineer-specialist.md
│   │   │   ├── documentation-sync-guardian.md
│   │   │   └── [other specialists].md
│   │   └── manifest.json       # Template agent registry
│   └── commands/               # Template commands
│       └── simple-triggers/    # Commands that invoke agents
└── templates/                  # Non-agent templates
```

### Naming Conventions
- **Meta-agents**: Prefix with `meta-` to clearly indicate framework development role
- **Template agents**: No prefix, descriptive names for general use
- **Shared agents**: Can exist in both locations with different configurations

### Agent Categories

#### Meta-Only Agents (.claude/agents/)
- `meta-development-orchestrator` - Orchestrates framework self-improvement
- `meta-agent-factory` - Creates new agent templates for the framework
- `meta-template-tracker` - Tracks and improves template quality
- `meta-cli-engineer` - Tests and enhances CLI functionality
- `meta-framework-guardian` - Maintains framework consistency

#### Template Orchestrators (Examples/agents/orchestrators/)
- `fullstack-feature-orchestrator` - End-to-end feature implementation
- `infrastructure-migration-architect` - Infrastructure transformations
- `issue-triage-orchestrator` - Systematic issue resolution
- `code-review-orchestrator` - Comprehensive code reviews
- `wave-execution-orchestrator` - Phased execution patterns
- `parallel-controller` - Parallel agent coordination

#### Template Specialists (Examples/agents/specialists/)
- All current specialist agents
- Moved from .claude/: `documentation-sync-guardian`, `prompt-engineer-specialist`
- Organized by domain expertise

### CLI Changes

#### New Command Structure
```bash
# Template operations (for other projects)
mac agent list              # Lists template agents from Examples/
mac agent add <name>        # Adds template agent to project
mac agent create            # Interactive template creation

# Meta operations (for framework development)
mac meta list               # Lists meta-agents
mac meta deploy <name>      # Deploys meta-agent for framework work
mac meta create             # Creates new meta-agent

# Initialization
mac init                    # Copies templates, not meta-agents
mac init --meta             # Special mode for framework development
```

#### Manifest System
Create `manifest.json` files to track agents:

```json
// .claude/manifest.json
{
  "type": "meta",
  "agents": [
    {
      "name": "meta-development-orchestrator",
      "model": "opus",
      "purpose": "framework-development",
      "dependencies": ["meta-agent-factory", "meta-template-tracker"]
    }
  ]
}

// Examples/agents/manifest.json
{
  "type": "template",
  "agents": {
    "orchestrators": [
      {
        "name": "fullstack-feature-orchestrator",
        "model": "opus",
        "purpose": "general-use",
        "domains": ["frontend", "backend", "testing"]
      }
    ],
    "specialists": [
      {
        "name": "frontend-ui-expert",
        "model": "sonnet",
        "purpose": "general-use",
        "domains": ["frontend", "ui", "react"]
      }
    ]
  }
}
```

### Command Deprecation
- Deprecate `WAVE_EXECUTE.md` command in favor of `wave-execution-orchestrator.md` agent
- Convert complex commands to simple triggers that invoke orchestrators
- Keep only atomic, single-purpose commands

## Consequences

### Positive
- **Clear Separation**: No confusion between meta and template resources
- **Reduced Duplication**: Shared agents referenced, not duplicated
- **Better Organization**: Logical structure for both development and distribution
- **Improved CLI**: Smarter about what to copy and when
- **Cleaner Meta-Development**: Framework can develop itself without polluting templates

### Negative
- **Migration Effort**: Existing projects may need updates
- **Learning Curve**: Contributors need to understand the distinction
- **Complexity**: Two parallel structures to maintain

### Neutral
- **Documentation Needs**: Extensive documentation updates required
- **CLI Refactoring**: Significant changes to command structure

## Implementation Plan

### Phase 1: Preparation
1. Create new directory structure
2. Write migration scripts
3. Update manifest schemas

### Phase 2: Migration
1. Move agents to appropriate locations
2. Rename meta-agents with prefix
3. Update all references in code

### Phase 3: CLI Updates
1. Implement manifest readers
2. Add `mac meta` commands
3. Update `mac agent` commands

### Phase 4: Documentation
1. Update README with clear separation
2. Update CLAUDE.md for meta-development
3. Create CONTRIBUTING.md for framework developers
4. Update all agent templates with correct paths

### Phase 5: Validation
1. Test all CLI commands
2. Verify meta-development workflow
3. Test template distribution
4. Update CI/CD as needed

## Migration Guide

### For Existing Projects
```bash
# Projects using MultiAgent-Claude templates
# No immediate action required
# Future `mac update` command will handle migration

# Projects doing meta-development
mac init --meta  # Reinitialize with meta-agents
```

### For Contributors
- Meta-development work goes in `.claude/`
- New agent templates go in `Examples/agents/`
- Test both meta and template workflows

## Success Criteria
- Zero duplication between meta and template agents
- CLI correctly distinguishes agent types
- Documentation clearly explains the separation
- Meta-development workflow unchanged
- Template distribution improved

## Related Decisions
- ADR-006: Orchestrator vs Specialist Hierarchy
- ADR-001: Research-Plan-Execute Pattern
- ADR-005: v2.0 Orchestration Upgrade

## Notes
This separation is critical for the framework's maturity. It enables:
1. Clean self-hosting (meta-development)
2. Clear distribution model (templates)
3. Reduced confusion for users and contributors
4. Better maintenance and evolution

The key insight is that MultiAgent-Claude is both a product (the templates) and a project (using itself to develop). This ADR formalizes that duality.