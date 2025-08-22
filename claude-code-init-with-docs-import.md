# Claude Code Multi-Agent Environment with Documentation Import

## Master Initialization Prompt with Documentation Migration (Use After `/init`)

```markdown
Analyze this codebase, import all existing documentation into a persistent memory system, and create a comprehensive Claude Code development environment with multi-agent orchestration.

## Phase 1: Documentation Discovery and Import

### 1.0 Initialize Session Context
**CRITICAL: Create the session context file before starting:**
1. Generate session ID: `YYYYMMDD_HHMMSS_docs_import`
2. Create directory: `mkdir -p .claude/tasks`
3. Create `.claude/tasks/context_session_[id].md` with:
   ```markdown
   # Session Context: Documentation Import & Environment Setup
   
   **Session ID**: [generated_id]
   **Date**: [current_date]
   **Type**: Documentation Import & Initialization
   **Status**: Active
   
   ## Objectives
   - Import all existing documentation
   - Create memory system with documentation
   - Generate specialized agents
   - Set up orchestration environment
   
   ## Current State
   - Starting documentation discovery
   - Project path: [path]
   ```
4. **Update after each phase**

### 1.1 Comprehensive Documentation Scan
**SCAN the entire project for documentation:**

```python
# Search for all documentation sources:
documentation_sources = [
    "README.md", "README.*",
    "CONTRIBUTING.md", "CHANGELOG.md", 
    "docs/**/*", "documentation/**/*", 
    "wiki/**/*", "*.md",
    "API.md", "ARCHITECTURE.md",
    "DEVELOPMENT.md", "DEPLOYMENT.md",
    "package.json (description, scripts)",
    "pyproject.toml (description, documentation)",
    ".github/ISSUE_TEMPLATE/**/*",
    ".github/PULL_REQUEST_TEMPLATE.md",
    "swagger.json", "openapi.yaml",
    "postman_collection.json",
    "Dockerfile (comments)",
    "docker-compose.yml (comments)",
    ".env.example",
    "Makefile (help targets)",
    "src/**/*.{js,ts,py,go,java} (JSDoc, docstrings, comments)"
]
```

### 1.2 Extract and Categorize Documentation
**ORGANIZE discovered documentation into categories:**

- **Architecture**: System design, component relationships, data flow
- **API Documentation**: Endpoints, contracts, examples
- **Development Guides**: Setup, workflow, conventions
- **Deployment**: Infrastructure, CI/CD, environments
- **Testing**: Test strategies, coverage requirements
- **Business Logic**: Domain knowledge, rules, constraints
- **Decisions**: Past choices, rationale, trade-offs
- **Patterns**: Code examples, common solutions
- **Troubleshooting**: Known issues, solutions, workarounds

### 1.3 Clean and Standardize Documentation
**PROCESS each documentation file:**

1. **Remove outdated information**:
   - Old version references
   - Deprecated features
   - Broken links
   - Obsolete instructions

2. **Extract valuable content**:
   - Architecture decisions → ADRs
   - Code patterns → Pattern library
   - Setup instructions → Development guides
   - API specs → API documentation
   - Known issues → Troubleshooting guide

3. **Identify gaps**:
   - Missing documentation areas
   - Incomplete sections
   - Undocumented features
   - Unclear explanations

## Phase 2: Memory System Creation with Documentation Import

**Update context_session with Phase 1 documentation discovery results**

### 2.1 Create Enhanced Memory Structure
**CREATE comprehensive memory system:**

```bash
# Create directory structure
mkdir -p .ai/memory/patterns
mkdir -p .ai/memory/decisions
mkdir -p .ai/memory/documentation/api
mkdir -p .ai/memory/documentation/guides
mkdir -p .ai/memory/documentation/architecture
mkdir -p .ai/memory/documentation/troubleshooting
mkdir -p .ai/memory/sessions/archive
mkdir -p .ai/memory/knowledge
```

### 2.2 Import Documentation to Memory

**CREATE: .ai/memory/project.md**
```markdown
# Project Context

## Project Overview
[Extract from README.md and package.json]

## Technology Stack
[Detected from dependencies and code]

## Architecture Summary
[Synthesized from architecture docs and code analysis]

## Core Business Logic
[Extracted from documentation and domain code]

## Key Conventions
- Code style: [from .eslintrc, .prettierrc, etc.]
- Git workflow: [from CONTRIBUTING.md]
- Testing approach: [from test files and docs]
- Naming patterns: [analyzed from codebase]

## API Surface
[Summary from API documentation]
- Public endpoints: [list]
- Internal APIs: [list]
- Authentication: [method]

## Development Workflow
[From CONTRIBUTING.md and docs]
- Setup steps: [summarized]
- Build process: [from scripts]
- Testing procedure: [from docs]

## Deployment Information
[From deployment docs and configs]
- Environments: [list]
- Infrastructure: [summary]
- CI/CD: [pipeline overview]

## Known Issues & Solutions
[From troubleshooting docs and issues]

## Documentation Index
- Original docs location: [paths]
- Imported to: .ai/memory/documentation/
- Last import: [timestamp]
- Coverage: [percentage of codebase documented]
```

**CREATE: .ai/memory/documentation/README.md**
```markdown
# Imported Documentation Index

## Source Documentation Mapping
| Original Location | Imported To | Status | Last Updated |
|------------------|-------------|---------|--------------|
| README.md | project.md | ✅ Processed | [date] |
| docs/API.md | documentation/api/endpoints.md | ✅ Processed | [date] |
| ARCHITECTURE.md | documentation/architecture/system.md | ✅ Processed | [date] |
| [continue for all docs] |

## Documentation Health
- Total files found: [count]
- Successfully imported: [count]
- Needs update: [count]
- Missing areas: [list]

## Quick Links
- [API Documentation](./api/)
- [Architecture Guides](./architecture/)
- [Development Guides](./guides/)
- [Troubleshooting](./troubleshooting/)
```

**MIGRATE Architecture Documentation:**
```markdown
# File: .ai/memory/documentation/architecture/system.md
[Clean, consolidated architecture documentation from all sources]

## System Overview
[Extracted and cleaned from ARCHITECTURE.md, README.md]

## Component Architecture
[From code analysis and docs]

## Data Flow
[From documentation and code tracing]

## Technology Decisions
[Converted to ADRs in decisions/]
```

**MIGRATE API Documentation:**
```markdown
# File: .ai/memory/documentation/api/endpoints.md
[Consolidated from OpenAPI, Swagger, code comments]

## API Overview
[Extracted from API docs]

## Endpoints
[Organized by resource/domain]

## Authentication
[From security docs]

## Examples
[From tests and documentation]
```

**EXTRACT Patterns from Code:**
```markdown
# File: .ai/memory/patterns/[pattern-name].md
[For each identified pattern in code]

## Pattern: [Detected Pattern Name]
**Source**: [Where found in codebase]
**Category**: [Type]
**Usage Count**: [How often used]

### Implementation
[Code example from actual codebase]

### Context
[When/why this pattern is used]
```

**CONVERT to ADRs:**
```markdown
# File: .ai/memory/decisions/ADR-[number]-[title].md
[For each major decision found in docs]

## ADR-[number]: [Decision Title]
**Date**: [Extracted or inferred]
**Source**: [Original documentation]
**Status**: Accepted

### Context
[From documentation]

### Decision
[What was decided]

### Consequences
[Impacts and trade-offs]
```

### 2.3 Create Knowledge Base
**CREATE: .ai/memory/knowledge/domain.md**
```markdown
# Domain Knowledge Base

## Business Rules
[Extracted from code and documentation]

## Terminology Glossary
[Project-specific terms and their meanings]

## External Integrations
[Third-party services and their purposes]

## Performance Benchmarks
[From documentation and code comments]

## Security Considerations
[From security docs and code analysis]
```

### 2.4 Documentation Gap Analysis
**CREATE: .ai/memory/documentation/gaps.md**
```markdown
# Documentation Gap Analysis

## Missing Documentation
- [ ] [Feature X] - No documentation found
- [ ] [API endpoint Y] - Undocumented
- [ ] [Configuration Z] - No setup guide

## Outdated Documentation
- [ ] [README.md] - References old version
- [ ] [API.md] - Missing new endpoints

## Unclear Documentation
- [ ] [Setup guide] - Steps 3-5 unclear
- [ ] [Architecture] - Missing component X

## Recommended Documentation Tasks
1. Document [highest priority gap]
2. Update [most outdated section]
3. Clarify [most confusing part]
```

## Phase 3: Enhanced CLAUDE.md with Documentation Intelligence

**Update context_session with Phase 2 memory creation status**

**CREATE/UPDATE root CLAUDE.md:**

```markdown
# [Project Name] - Claude Code Orchestration

## 📚 INTEGRATED DOCUMENTATION & MEMORY SYSTEM

### Documentation Import Summary
- **Total Documentation Imported**: [count] files
- **Knowledge Coverage**: [percentage]%
- **Last Import**: [timestamp]
- **Documentation Health**: [score]/100

### Memory Architecture with Documentation
```
.ai/
└── memory/                          # Persistent knowledge base
    ├── project.md                   # Project overview (from docs)
    ├── documentation/               # Imported & cleaned docs
    │   ├── api/                     # API documentation
    │   ├── architecture/            # System design docs
    │   ├── guides/                  # Development guides
    │   └── troubleshooting/         # Known issues & solutions
    ├── patterns/                    # Extracted code patterns
    ├── decisions/                   # Architectural decisions (ADRs)
    ├── knowledge/                   # Domain knowledge base
    └── index.json                   # Complete knowledge index
```

### Session Memory and working plans
```
.claude/
├── tasks/context_session_*.md      # Session working memory
├── doc/[agent]-[task]-*.md         # Agent plans
```

### Documentation-Aware Orchestration Rules

#### Agent Documentation Access
Agents MUST utilize imported documentation:
1. **CHECK** .ai/memory/documentation/ for existing docs
2. **REFERENCE** documentation in plans with citations
3. **IDENTIFY** documentation gaps during research
4. **UPDATE** gaps.md when finding undocumented features

#### Documentation Maintenance Workflow
When agents discover undocumented features:
1. Note in .ai/memory/documentation/gaps.md
2. Create minimal documentation in appropriate location
3. Mark for human review
4. Update index.json with changes

#### Knowledge Retrieval Priority
1. Session context (tasks/context_session_*.md)
2. Imported documentation (memory/documentation/)
3. Extracted patterns (memory/patterns/)
4. Previous decisions (memory/decisions/)
5. External research (MCP tools)

### Agent Activation with Documentation Context

| Trigger | Primary Agent | Documentation Check | Memory Sources |
|---------|--------------|-------------------|----------------|
| "implement feature" | fullstack-orchestrator | guides/development.md | patterns/, decisions/ |
| "fix bug" | debugger-analyst | troubleshooting/ | known issues, patterns/ |
| "explain architecture" | architect | architecture/ | decisions/, project.md |
| "update API" | backend-specialist | api/endpoints.md | patterns/api-*.md |

## 🎯 ORCHESTRATION RULES

[Include all standard orchestration rules from original prompt]

### Documentation-Specific Rules
- **Documentation First**: Check imported docs before external research
- **Gap Detection**: Actively identify missing documentation
- **Citation Required**: Reference documentation sources in plans
- **Update Triggers**: Note when documentation needs updates
```

## Phase 4: Create Documentation-Aware Agents

**Update context_session with Phase 3 CLAUDE.md updates**

### 4.1 Create Documentation Specialist Agent
**CREATE: .claude/agents/documentation-curator.md**

```yaml
---
name: documentation-curator
model: sonnet
description: Use PROACTIVELY when documentation needs review, gaps found, or knowledge base updates needed
---

## Goal
Maintain and improve project documentation quality, identify gaps, and ensure knowledge base accuracy.

## Core Workflow
1. Read .claude/tasks/context_session_*.md
2. Scan .ai/memory/documentation/ for relevant docs
3. Check .ai/memory/documentation/gaps.md
4. Analyze documentation completeness and accuracy
5. Create improvement plan at .claude/doc/documentation-curator-[task]-[timestamp].md

## Specializations
- Documentation gap analysis
- README optimization
- API documentation generation
- Architecture diagram suggestions
- Knowledge base curation

## Rules
- Never delete existing documentation without backup
- Always preserve historical context in ADRs
- Suggest improvements, don't implement directly
- Maintain documentation standards and consistency
```

### 4.2 Enhance Existing Agents with Documentation Awareness

**UPDATE all agents to include:**

```markdown
## Documentation Integration
Before creating plans, this agent will:
1. Check .ai/memory/documentation/ for relevant guides
2. Reference existing patterns from .ai/memory/patterns/
3. Cite documentation sources in plans
4. Note any documentation gaps discovered

## Documentation References
This agent commonly uses:
- [Specific docs relevant to agent's domain]
- [Pattern files this agent should check]
- [ADRs relevant to agent's decisions]
```

## Phase 5: Create Import Report

**Update context_session with Phase 4 agent creation**

**CREATE: .ai/memory/IMPORT_REPORT.md**

```markdown
# Documentation Import Report

## Import Summary
- **Date**: [timestamp]
- **Total Files Scanned**: [count]
- **Documentation Found**: [count]
- **Successfully Imported**: [count]
- **Patterns Extracted**: [count]
- **Decisions Documented**: [count]

## Documentation Coverage Analysis
| Area | Coverage | Quality | Notes |
|------|----------|---------|-------|
| Architecture | [%] | [1-5] | [details] |
| API | [%] | [1-5] | [details] |
| Setup/Development | [%] | [1-5] | [details] |
| Testing | [%] | [1-5] | [details] |
| Deployment | [%] | [1-5] | [details] |
| Business Logic | [%] | [1-5] | [details] |

## Key Findings
### Well-Documented Areas
- [Area 1]: [What's good about it]
- [Area 2]: [What's good about it]

### Documentation Gaps
- [Gap 1]: [What's missing and priority]
- [Gap 2]: [What's missing and priority]

### Outdated Documentation
- [File 1]: [What needs updating]
- [File 2]: [What needs updating]

## Extracted Knowledge Assets
### Patterns (Count: [n])
- [Pattern 1]: Used [x] times
- [Pattern 2]: Used [x] times

### Decisions (Count: [n])
- [Decision 1]: [Impact area]
- [Decision 2]: [Impact area]

### Domain Knowledge
- Business rules documented: [count]
- Glossary terms: [count]
- Integration points: [count]

## Recommendations
1. **Immediate**: [Most critical documentation needs]
2. **Short-term**: [Important but not urgent]
3. **Long-term**: [Nice to have improvements]

## Quality Metrics
- **Completeness Score**: [x]/100
- **Accuracy Score**: [x]/100  
- **Clarity Score**: [x]/100
- **Overall Health**: [x]/100

## Next Steps
1. Review gaps.md for missing documentation
2. Update outdated sections listed above
3. Create ADRs for undocumented decisions
4. Standardize pattern documentation
```

## Phase 6: Create Commands for Documentation Management

**CREATE: .claude/commands/doc-audit.md**
```yaml
---
command: "/doc-audit"
description: "Audit documentation completeness and quality"
---

## Execution Flow
1. Scan all documentation in .ai/memory/documentation/
2. Compare with actual codebase
3. Identify gaps and outdated content
4. Generate audit report
5. Update gaps.md with findings
```

**CREATE: .claude/commands/doc-import.md**
```yaml
---
command: "/doc-import"
description: "Re-import and update documentation from sources"
---

## Execution Flow
1. Scan for new or updated documentation
2. Process and clean content
3. Update memory/documentation/
4. Extract new patterns
5. Generate import report
```

## Phase 7: Optional CI/CD Integration

### GitHub Actions with Documentation Awareness
Ask: "Enable GitHub Actions for automated memory updates? (y/n)"

If yes, create workflow that:
- Imports new documentation automatically
- Creates ADRs from PRs with deduplication
- Updates documentation index when docs change
- Tags all CI entries with metadata headers
- Prevents duplicates via content hashing

Special features for documentation:
- Auto-updates gaps.md when documentation is added
- Tracks documentation coverage over time
- Alerts on documentation drift from code

## Phase 8: Final Integration Checklist

**CREATE: .ai/memory/INTEGRATION_CHECKLIST.md**

## Phase 6: Finalize Session Context

**Complete the documentation import session:**
1. Update `.claude/tasks/context_session_*.md` with:
   - All phases completed
   - Final status: "Documentation Import Complete"
   - Summary of documentation imported
   - List of patterns and ADRs created
   - Documentation gaps identified
2. Archive session to `.ai/memory/sessions/archive/`
3. Document ongoing documentation maintenance needs

```markdown
# Documentation Import Integration Checklist

## Session Context Management
- [ ] Context session created at initialization start
- [ ] Context updated after each phase
- [ ] Final session archived to memory/sessions/archive

## Import Verification
- [ ] All README files imported to project.md
- [ ] API documentation consolidated in documentation/api/
- [ ] Architecture docs in documentation/architecture/
- [ ] Development guides in documentation/guides/
- [ ] Patterns extracted to patterns/
- [ ] Decisions converted to ADRs

## Memory System Verification
- [ ] index.json contains all documentation references
- [ ] project.md has complete project overview
- [ ] gaps.md lists all missing documentation
- [ ] Knowledge base populated with domain info

## Agent Integration
- [ ] All agents check documentation before external research
- [ ] Documentation-curator agent created
- [ ] Agents reference docs in their plans
- [ ] Gap detection working

## Quality Checks
- [ ] No duplicate documentation
- [ ] All broken links fixed or noted
- [ ] Outdated information marked or updated
- [ ] Documentation follows consistent format

## Usage Verification
Test: "Explain the authentication system"
- [ ] Agent checks documentation/api/auth.md
- [ ] Agent references patterns/authentication.md
- [ ] Agent cites documentation in response
- [ ] Any gaps noted in gaps.md
```

## IMPORTANT NOTES

1. **Preserve Original Docs**: Keep original documentation files, import copies to memory
2. **Clean During Import**: Remove outdated info, fix formatting, standardize structure
3. **Extract Maximum Value**: Convert docs to patterns, ADRs, and knowledge base entries
4. **Maintain Traceability**: Document where each piece of information came from
5. **Continuous Improvement**: Documentation import is not one-time, should be repeated

## Quick Test After Running

Ask: "What do we know about [major feature in your project]?"

The system should:
1. Check imported documentation first
2. Find relevant patterns and decisions
3. Provide comprehensive answer from memory
4. Note any documentation gaps found

This ensures your entire project's knowledge is captured and accessible!
```
