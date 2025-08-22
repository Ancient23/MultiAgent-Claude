# OpenAI Codex/ChatGPT Compatibility Plan for MultiAgent-Claude Projects

## Executive Summary
This plan outlines how to enable team members using OpenAI Codex/ChatGPT to work effectively with projects configured using the MultiAgent-Claude framework, maintaining similar context richness and agent-like behavior patterns.

## Background Research

### OpenAI Codex (2025)
- Available to ChatGPT Plus users as of June 3, 2025
- Powered by codex-1 (OpenAI o3 optimized for software engineering)
- Context window up to ~192k tokens
- Supports AGENTS.md files for repository configuration
- Cloud-based execution with parallel task handling

### ChatGPT Projects Feature
- Available to all paid ChatGPT plans (Plus, Team, Pro)
- File upload limits: 20 files (Plus), 40 files (Pro/Team)
- 500MB file size limit
- Custom instructions (1500 character limit)
- Project-specific context and file management

## Implementation Plan

### Phase 1: Create OpenAI Configuration Files

#### 1.1 AGENTS.md File (OpenAI equivalent to CLAUDE.md)
Create a root-level AGENTS.md file that serves as the primary configuration for OpenAI Codex:

**Location:** `/AGENTS.md`

**Contents:**
- Project overview and architecture
- Technology stack and dependencies
- Testing commands and procedures
- Coding standards and conventions
- Agent behaviors as role instructions
- Memory system navigation guides
- Directory structure documentation
- Workflow patterns and best practices

**Key Sections:**
```markdown
# AGENTS.md - OpenAI Codex Configuration

## Project Overview
[Mirror CLAUDE.md project section]

## Testing Procedures
Run these commands before finalizing any PR:
- `npm test` - Run all tests
- `npm run lint` - Check code style
- `npm run typecheck` - Verify types

## Agent Roles
When working on specific areas, adopt these specialized roles:
- Frontend: Focus on React/Vue components, UI/UX patterns
- Backend: AWS architecture, API design, database schemas
- Testing: Playwright tests, visual regression, E2E scenarios

## Memory System
Check `.claude/memory/` for:
- `/patterns/` - Proven solutions
- `/decisions/` - Architectural Decision Records
- `/project.md` - Project conventions
```

#### 1.2 ChatGPT Project Configuration Bundle
Create a `.chatgpt/` directory for ChatGPT-specific configurations:

**Structure:**
```
.chatgpt/
├── project-instructions.md      # Compressed project instructions (1500 chars)
├── role-definitions/            # Agent roles as ChatGPT instructions
│   ├── frontend-expert.md
│   ├── backend-architect.md
│   └── test-engineer.md
├── workflows/                   # Step-by-step task patterns
│   ├── feature-development.md
│   ├── bug-fixing.md
│   └── code-review.md
├── memory-snapshot.md          # Current memory state
└── file-manifest.json          # List of essential files to upload
```

### Phase 2: CLI Extension for OpenAI Support

#### 2.1 New CLI Commands

**Command: `mac openai init`**
- Initialize OpenAI/Codex compatibility
- Generate AGENTS.md from CLAUDE.md
- Create .chatgpt/ directory structure
- Convert agents to role instructions

**Command: `mac openai bundle`**
- Create optimized bundle for ChatGPT Projects
- Compress files to fit upload limits
- Generate project instructions
- Create ZIP archive for easy upload

**Command: `mac openai sync`**
- Synchronize CLAUDE.md ↔ AGENTS.md
- Update role definitions from agents
- Refresh memory snapshots
- Maintain consistency between systems

**Command: `mac openai convert-agent <name>`**
- Convert specific agent to ChatGPT role
- Transform MCP tool usage to instructions
- Adapt workflow patterns
- Generate custom instructions

#### 2.2 Format Converters

**Agent Template → Role Instruction Converter:**
```javascript
// Convert agent YAML frontmatter and prompt to ChatGPT instructions
function convertAgentToRole(agentPath) {
  // Parse agent template
  // Extract expertise areas
  // Convert to "Act as..." format
  // Compress to 1500 chars if needed
  // Return role instruction
}
```

**Memory System → Project Files Converter:**
```javascript
// Convert memory structure to uploadable files
function convertMemoryToProject() {
  // Scan .claude/memory/
  // Extract key patterns
  // Compress ADRs
  // Create snapshot
  // Return file list
}
```

### Phase 3: Agent Behavior Simulation

#### 3.1 Role-Based Instructions

Convert each specialized agent into ChatGPT custom instructions:

**Example: Frontend UI Expert**
```markdown
Act as a Frontend UI Expert specializing in React/Vue components, state management, and responsive design. When I mention UI, components, or frontend, proactively:
1. Check existing component patterns
2. Research latest best practices
3. Create detailed implementation plans
4. Focus on accessibility and performance
5. Document in .claude/doc/frontend-plan-[timestamp].md
```

**Example: AWS Backend Architect**
```markdown
Act as an AWS Solutions Architect with expertise in serverless, microservices, and cloud-native patterns. When discussing backend, API, or infrastructure:
1. Analyze current architecture
2. Research AWS service updates
3. Plan scalable solutions
4. Consider cost optimization
5. Document in .claude/doc/backend-plan-[timestamp].md
```

#### 3.2 Workflow Templates

Create step-by-step guides for common workflows:

**Feature Development Workflow:**
```markdown
1. Read context: .claude/tasks/context_session_*.md
2. Check memory: .claude/memory/patterns/
3. Research using web search
4. Create plan: .claude/doc/feature-plan-[timestamp].md
5. Implement following plan
6. Update memory with successful patterns
```

### Phase 4: Context Management Strategy

#### 4.1 File Organization for ChatGPT Projects

**Essential Files Bundle (5-10 files max):**
1. `AGENTS.md` - Main configuration
2. `.chatgpt/project-instructions.md` - Compressed instructions
3. `.claude/memory/project.md` - Project conventions
4. `package.json` - Dependencies and scripts
5. `README.md` - Project overview
6. `.chatgpt/role-definitions/current-role.md` - Active role
7. `.chatgpt/workflows/current-task.md` - Task workflow
8. Selected source files based on current task

#### 4.2 Dynamic Context Loading

**Context Loader Script:**
```javascript
// cli/commands/openai-context.js
function loadContextForTask(taskType) {
  const essentialFiles = ['AGENTS.md', 'package.json'];
  const taskSpecificFiles = getFilesForTask(taskType);
  const memoryFiles = getRelevantMemory(taskType);
  
  return {
    files: [...essentialFiles, ...taskSpecificFiles, ...memoryFiles],
    instructions: generateInstructions(taskType),
    totalSize: calculateSize()
  };
}
```

### Phase 5: Memory System Adaptation

#### 5.1 Shared Memory Format

**Unified Memory Structure:**
```
.claude/memory/
├── project.md           # Both systems read/write
├── patterns/           # Shared successful solutions
│   └── [pattern].md    # Markdown format
├── decisions/          # Architectural Decision Records
│   └── ADR-[number].md # Standard ADR format
├── index.json          # Quick lookup for both systems
└── sync.log            # Track updates from both platforms
```

#### 5.2 Decision Documentation

**Cross-Platform ADR Format:**
```markdown
# ADR-001: [Decision Title]

## Status
Accepted

## Context
[Background applicable to both Claude and ChatGPT]

## Decision
[What was decided]

## Consequences
[Impact on both systems]

## Implementation
- Claude: [Claude-specific details]
- ChatGPT/Codex: [OpenAI-specific details]
```

### Phase 6: Testing and Validation Integration

#### 6.1 Unified Test Commands

**AGENTS.md Testing Section:**
```markdown
## Testing Procedures

### All Changes
```bash
npm test              # Run all tests
npm run lint          # Code style
npm run typecheck     # Type checking
```

### Feature Testing
```bash
npm run test:feature  # Feature-specific tests
npm run test:visual   # Visual regression
npm run test:e2e      # End-to-end tests
```

### Before PR
1. Run all tests
2. Check coverage
3. Verify no regressions
4. Update snapshots if needed
```

#### 6.2 Visual Testing Bridge

**Shared Visual Testing Workflow:**
```markdown
## Visual Testing Procedure

1. Capture baseline:
   - Claude: Use Playwright MCP
   - ChatGPT: Run `npm run visual:capture`

2. Compare changes:
   - Both: `npm run visual:compare`

3. Update baselines:
   - Both: `npm run visual:update`

4. Review reports:
   - Both: Check `.visual-reports/`
```

### Phase 7: Documentation and Training

#### 7.1 User Guides

**Guide: "Using MultiAgent Projects with ChatGPT"**
```markdown
# Using MultiAgent Projects with ChatGPT

## Initial Setup
1. Run `mac openai init` in your project
2. Upload bundle to ChatGPT Projects
3. Select appropriate role from .chatgpt/role-definitions/
4. Follow workflow from .chatgpt/workflows/

## Daily Workflow
1. Sync latest changes: `mac openai sync`
2. Upload updated files to ChatGPT
3. Work using role instructions
4. Document patterns in shared memory
5. Sync back: `mac openai sync`
```

**Guide: "Codex Integration Guide"**
```markdown
# Codex Integration Guide

## Repository Setup
1. Ensure AGENTS.md exists at root
2. Document all test commands
3. Include workflow patterns
4. Specify coding standards

## Using Codex
1. Open ChatGPT sidebar
2. Click "Code" for new tasks
3. Codex reads AGENTS.md automatically
4. Follows testing procedures
5. Creates PRs following patterns
```

#### 7.2 Example Workflows

**Mixed Team Feature Development:**
```markdown
## Feature: Add User Authentication

### Claude Developer:
1. Uses master-orchestrator for planning
2. Deploys frontend-ui-expert agent
3. Creates plan at .claude/doc/auth-plan.md
4. Implements frontend components

### ChatGPT Developer:
1. Uploads project bundle
2. Adopts backend-architect role
3. Reads .claude/doc/auth-plan.md
4. Implements API endpoints
5. Updates AGENTS.md with new endpoints

### Synchronization:
1. Both run `mac openai sync`
2. Memory updated with patterns
3. ADR created for auth approach
4. Tests updated for both parts
```

### Phase 8: Implementation Checklist

- [ ] Create AGENTS.md template generator
- [ ] Build .chatgpt/ directory structure
- [ ] Implement CLI commands:
  - [ ] `mac openai init`
  - [ ] `mac openai bundle`
  - [ ] `mac openai sync`
  - [ ] `mac openai convert-agent`
- [ ] Create converters:
  - [ ] Agent → Role converter
  - [ ] Memory → Project converter
  - [ ] Command → Workflow converter
- [ ] Generate role instructions for all agents
- [ ] Create workflow templates
- [ ] Build context loader
- [ ] Implement sync mechanism
- [ ] Write user documentation
- [ ] Create example workflows
- [ ] Test with sample project
- [ ] Validate with both Claude and ChatGPT

### Success Metrics

1. **Seamless Switching:** Team members can move between Claude and ChatGPT without friction
2. **Context Preservation:** Project context and memory remain synchronized
3. **Behavior Consistency:** Agent-like behavior maintained in ChatGPT
4. **Testing Compatibility:** All tests work across both platforms
5. **No Duplication:** Single source of truth for project configuration
6. **Easy Onboarding:** New team members can use either platform immediately

### Next Steps

1. **Immediate Actions:**
   - Create AGENTS.md for current project
   - Test with ChatGPT Projects feature
   - Gather feedback from team

2. **Short-term (1-2 weeks):**
   - Implement CLI extensions
   - Create converter utilities
   - Document workflows

3. **Long-term (1 month):**
   - Full sync mechanism
   - Automated testing
   - Team training materials

## Conclusion

This compatibility layer enables teams to leverage both Claude Code and OpenAI Codex/ChatGPT effectively, maintaining the sophisticated multi-agent architecture while providing flexibility in tool choice. The shared memory system and unified configuration ensure consistency across platforms while allowing each system to play to its strengths.