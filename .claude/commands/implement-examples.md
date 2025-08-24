# /implement Command Examples

## Quick Start Examples

### 1. Implement CI Testing (Execute Immediately)
```
/implement ci-testing
```

**What happens:**
1. I create `.claude/tasks/context_session_[timestamp]_ci_testing.md`
2. Load `ci-visual-testing.yaml` LOP
3. Execute all 7 phases:
   - Core Test Infrastructure
   - CLI Test Implementation
   - Visual Regression Testing
   - CI/CD Integration
   - Template Creation
   - Testing and Verification
   - Documentation and Memory
4. Update context session throughout
5. Complete implementation in current context

### 2. Implement from Existing Plan
```
/implement plan .ai/memory/implementation-plans/setup-init-browser-automation-plan.md
```

**What happens:**
1. I create context session
2. Read the markdown plan directly
3. Execute the plan step by step:
   - Update setup.js
   - Update init.js
   - Create browser automation tests
   - Update CI workflow
4. No LOP/HOP processing needed
5. Direct implementation from plan

### 3. Add Tests to Any Plan
```
/implement plan refactor-plan.md --with-ci-tests
```

**What happens:**
1. Read the refactor plan
2. Execute the refactor
3. THEN add comprehensive CI tests:
   - Create test files
   - Setup Playwright
   - Add GitHub Actions
   - Verify everything works

### 4. Visual Development Setup
```
/implement visual-dev
```

**What happens:**
1. Create context session
2. Setup Playwright MCP
3. Create visual directories
4. Implement comparison tools
5. Setup iteration workflow
6. All in current context

### 5. Output-Only Mode (Don't Execute)
```
/implement ci-testing --output-only
```

**What happens:**
1. Generate complete prompt
2. Save to `.claude/prompts/generated/`
3. Display path
4. Do NOT execute
5. User can review/modify before using

## Advanced Examples

### Custom LOP with Options
```
/implement custom --lop .claude/prompts/lop/my-feature.yaml --with-visual-tests --priority HIGH
```

### Minimal Implementation
```
/implement ci-testing --minimal
```
Only essential phases: Setup → Core Implementation → Verification

### Plan with Both Test Types
```
/implement plan architecture-change.md --with-all-tests
```
Implements plan + CI tests + visual tests

## Comparison: Old vs New

### Old Way (Manual):
1. Run `mac lop execute ci-visual-testing.yaml`
2. Copy generated prompt
3. Paste in new Claude session
4. Create context session manually
5. Start implementation

### New Way (Direct):
1. Run `/implement ci-testing`
2. Done! Implementation starts immediately

## Default Behavior

**IMPORTANT**: By default, the command EXECUTES immediately:
- `/implement ci-testing` → Executes now
- `/implement plan my-plan.md` → Executes now
- `/implement visual-dev` → Executes now

Only with `--output-only` flag does it just generate a prompt file.

## Context Session Example

When executing, I automatically create:

```markdown
# Session Context: CI Visual Testing Implementation

**Session ID**: 1735000000000_ci_testing
**Date**: 2024-12-24
**Type**: implementation
**Status**: Active

## Objectives
- Setup test infrastructure
- Implement CLI tests
- Add visual regression
- Configure CI/CD
- Create templates

## Current State
✓ Wave 0: Initialization
→ Wave 1: Core Test Infrastructure (IN PROGRESS)
  - Created tests/utils/cli-helpers.js
  - Working on visual-helpers.js

## Files Modified
- tests/utils/cli-helpers.js (created)
- tests/utils/visual-helpers.js (in progress)

## Next Steps
- Complete visual helpers
- Move to CLI test implementation
```

## Why This Is Better

1. **Faster**: No copying prompts between sessions
2. **Integrated**: Works as main agent immediately  
3. **Flexible**: Can use LOPs or raw plans
4. **Smart**: Adds tests when needed
5. **Tracked**: Automatic context session management

## Common Workflows

### Starting Fresh Project Testing
```
/implement ci-testing
```

### Adding Visual Features
```
/implement visual-dev
```

### Implementing Saved Plan
```
/implement plan .ai/memory/implementation-plans/my-saved-plan.md
```

### Getting a Prompt to Review First
```
/implement ci-testing --output-only
# Review generated prompt
# Then execute if satisfied
```