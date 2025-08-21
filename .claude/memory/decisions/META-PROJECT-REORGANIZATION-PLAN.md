# META-PROJECT REORGANIZATION PLAN

## Executive Summary
MultiAgent-Claude is a META-FRAMEWORK that needs clear separation between:
1. **Meta-agents**: Used to develop the framework itself (.claude/)
2. **Template agents**: Distributed to other projects (Examples/)

## Current Problems
1. ❌ Confusion about which agents are for meta-development vs templates
2. ❌ Duplication between commands and orchestrator agents
3. ❌ CLI doesn't distinguish between meta and template agents
4. ❌ Some agents serve dual purposes without clear documentation
5. ❌ Directory structure doesn't reflect the meta-project nature

## Proposed Solution

### 1. Clear Directory Separation
```
MultiAgent-Claude/
├── .claude/                    # META-DEVELOPMENT (Framework Development)
│   ├── agents/                 # Agents that develop THIS framework
│   ├── commands/               # Commands for meta-development
│   └── manifest.json           # Registry of meta resources
│
├── Examples/                   # TEMPLATES (For Other Projects)
│   ├── agents/
│   │   ├── orchestrators/      # Template orchestrators (Opus)
│   │   ├── specialists/        # Template specialists (Sonnet)
│   │   └── manifest.json       # Registry of template agents
│   └── commands/               # Template commands
│
└── templates/                  # Non-agent templates (workflows, tests)
```

### 2. Agent Classification

#### Meta-Agents (Stay in .claude/)
- `meta-development-orchestrator` ✓ (already there)
- `meta-agent-factory` (rename from agent-factory)
- `meta-template-tracker` (rename from template-evolution-tracker)
- `meta-cli-engineer` (rename from cli-test-engineer)
- `meta-framework-guardian` (new - maintain framework integrity)

#### Template Orchestrators (Move to Examples/agents/orchestrators/)
- `fullstack-feature-orchestrator` (update to opus)
- `infrastructure-migration-architect` (update to opus)
- `issue-triage-orchestrator` (new, create in Examples)
- `code-review-orchestrator` (new, create in Examples)
- `wave-execution-orchestrator` (new, create in Examples)
- `parallel-controller` (exists, update to opus)

#### Template Specialists (Stay/Move to Examples/agents/specialists/)
- All current specialists in Examples/
- Move `documentation-sync-guardian` from .claude/ to Examples/
- Move `prompt-engineer-specialist` from .claude/ to Examples/
- These can be REFERENCED by meta-agents when needed

### 3. Command Consolidation
- **DELETE**: `WAVE_EXECUTE.md` command (replaced by wave-execution-orchestrator)
- **CONVERT**: Complex commands → simple triggers that invoke orchestrators
- **KEEP**: Atomic, single-purpose commands only

### 4. CLI Updates

#### New Command Structure
```bash
# For template operations (99% of users)
mac agent list              # Lists ONLY template agents
mac agent add <name>        # Adds template to project
mac init                    # Standard project setup

# For meta-development (framework contributors)
mac meta list               # Lists meta-agents
mac meta deploy <name>      # Deploy for framework work
mac init --meta             # Setup for framework development
```

#### Manifest-Driven Selection
- CLI reads manifest.json files
- Understands meta vs template distinction
- Prevents accidental meta-agent distribution

### 5. Implementation Steps

#### Phase 1: Documentation & Planning ✓
- [x] Create ADR-007 for the reorganization
- [x] Create manifest.json specifications
- [x] Document the plan

#### Phase 2: Agent Migration
- [ ] Create directories: Examples/agents/orchestrators/ and specialists/
- [ ] Move orchestrators to Examples/agents/orchestrators/
- [ ] Move shared specialists to Examples/agents/specialists/
- [ ] Rename meta-agents with "meta-" prefix
- [ ] Update all agent model assignments (opus for orchestrators)

#### Phase 3: CLI Updates
- [ ] Update cli/commands/agent.js to read manifests
- [ ] Add `mac meta` command suite
- [ ] Update `mac init` to exclude meta-agents
- [ ] Add `mac init --meta` for framework development

#### Phase 4: Command Cleanup
- [ ] Delete WAVE_EXECUTE.md (replaced by orchestrator)
- [ ] Review all commands for duplication
- [ ] Convert complex commands to agent triggers

#### Phase 5: Documentation Updates
- [ ] Update README.md with meta vs template explanation
- [ ] Update CLAUDE.md with meta-development section
- [ ] Create CONTRIBUTING.md for framework developers
- [ ] Update all agent references in documentation

#### Phase 6: Testing & Validation
- [ ] Test `mac init` (should not include meta-agents)
- [ ] Test `mac agent list` (should show only templates)
- [ ] Test `mac meta` commands (for framework development)
- [ ] Verify all orchestrators use Opus model
- [ ] Verify all specialists use Sonnet model

## Benefits of Reorganization

### For Users
- ✅ Clear template library without meta clutter
- ✅ Better organized agent discovery
- ✅ No confusion about which agents to use

### For Contributors
- ✅ Clear separation of concerns
- ✅ Obvious where to add new agents
- ✅ Meta-development tools readily available

### For the Framework
- ✅ Self-hosting clarity (meta-agents develop the framework)
- ✅ Reduced duplication and confusion
- ✅ Scalable architecture for growth

## Key Principles

1. **Meta-agents are private**: They develop the framework, not distributed
2. **Templates are public**: They're what users get with `mac init`
3. **No duplication**: Shared agents live in Examples/, referenced by meta
4. **Clear naming**: Meta-agents prefixed with "meta-"
5. **Manifest-driven**: JSON manifests control what's available where

## Success Criteria

- [ ] Zero meta-agents distributed to user projects
- [ ] All orchestrators using Opus model
- [ ] All specialists using Sonnet model
- [ ] CLI correctly filters based on manifests
- [ ] Documentation clearly explains the distinction
- [ ] No command/orchestrator duplication

## Migration Support

### For Existing Users
```bash
# No immediate action required
# Future `mac update` will handle any needed changes
```

### For Meta-Developers
```bash
# Reinitialize with meta support
mac init --meta

# Or manually add meta-agents
mac meta deploy meta-development-orchestrator
```

## Timeline
- Phase 1: ✓ Complete (Planning)
- Phase 2: Today (Agent Migration)
- Phase 3: Today (CLI Updates)
- Phase 4: Today (Command Cleanup)
- Phase 5: Today (Documentation)
- Phase 6: Today (Testing)

## Next Steps
1. Get approval for this plan
2. Create migration scripts
3. Execute phases 2-6
4. Update all documentation
5. Test thoroughly
6. Create migration guide for existing users