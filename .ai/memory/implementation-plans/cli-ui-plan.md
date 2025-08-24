# Responsive CLI UI Plan for MultiAgent-Claude Projects

## Executive Summary
This document outlines a comprehensive plan for a cross-platform interactive CLI that helps developers set up and manage multi-agent features in their projects. The CLI runs on macOS, standard Unix environments, and Windows via Ubuntu WSL2. When the `mac` package is globally installed and executed from a project's root directory, the UI provides guided flows for project memory, agent and command management, prompt libraries, documentation synchronization, MCP server configuration, Playwright visual development, and running prompts through the Claude Code MCP.

## Goals
- Deliver a responsive text-based interface with keyboard-driven navigation.
- Support project-scoped operations located under `.ai/`, `.claude/`, and `docs/`.
- Offer consistent behavior across macOS, Linux, and Windows (WSL2).
- Provide an extensible framework for future multi-agent features.

## Selected Libraries & Frameworks
| Purpose | Library |
| --- | --- |
| Command routing | [Commander.js](https://github.com/tj/commander.js) |
| Interactive prompts | [Inquirer](https://github.com/SBoudrias/Inquirer.js) (primary), [Enquirer](https://github.com/enquirer/enquirer) (fallback) |
| Spinners | [ora](https://github.com/sindresorhus/ora) |
| Progress bars | [cli-progress](https://github.com/AndiDittrich/Node.CLI-Progress) |
| Color and styles | [chalk](https://github.com/chalk/chalk), [figlet](https://github.com/patorjk/figlet.js) |
| Boxed messages | [boxen](https://github.com/sindresorhus/boxen) |
| Advanced TUI (future) | [ink](https://github.com/vadimdemedes/ink) or [blessed](https://github.com/chjj/blessed) |

## High-Level Architecture
1. **Entry Point**: existing `cli/index.js` dispatches to `commands/` modules using Commander.js.
2. **UI Module**: new `cli/ui/` utilities wrapping Inquirer, ora, and chalk for consistent styling.
3. **Feature Modules**: dedicated directories inside `cli/commands/` for memory, agents, prompts, docs, orchestration, MCP, setup, and Playwright.
4. **Config Detection**: each command ensures it is executed from a project root by verifying `.ai/` and `.claude/` directories.
5. **Cross-Platform Paths**: use Node's `path` and `os` modules and avoid shell-specific syntax.

## Planned User Flows
### 1. Project Setup & Initialization (`mac setup`, `mac init`)
- `mac setup`: interactive wizard that detects project type, suggests agents, and **discovers available MCP servers** (Playwright, filesystem, GitHub) to preconfigure `.mcp.json`.
- `mac init`: prompt-driven initialization that mirrors setup choices and records MCP server discovery results. Options include memory-only and docs-import variants.
- Both flows can scaffold Playwright directories and optionally add GitHub Actions workflows for memory updates and visual testing.

### 2. Project Memory (`mac memory`)
- `mac memory init`: create `.ai/memory` with scaffolded structure.
- `mac memory add`: open interactive prompt to append notes or ADRs.
- `mac memory view`: list or search memory entries with pagination.
- UI Features: spinner while loading, boxed summaries, progress bar for indexing.

### 3. Agent & Command Management (`mac agent` / `mac command`)
- `mac agent list`: display installed agents from `.claude/agents`.
- `mac agent install`: wizard to fetch templates from repository and customize metadata.
- `mac cmd list|install|remove`: similar flow for CLI commands.
- UI Features: autocomplete lists, validation hooks, colorful success messages.

### 4. Prompt System (`mac prompt`)
- `mac prompt list|show|validate`: explore and verify available workflows.
- `mac prompt test <workflow>`: run composed prompts through the Claude Code MCP with optional `--preview` or `--output` flags.
- `mac prompt export <name>` and cache management commands (`cache-stats`, `cache-clear`).

### 5. Documentation Sync & Restructure (`mac openai` / future `mac docs`)
- `mac openai sync`: synchronize CLAUDE.md ↔ AGENTS.md and update `.chatgpt/` bundles.
- Planned `mac docs` command to restructure `docs/` and `.ai/memory` using templates.
- UI Features: progress bars for file operations, confirmation prompts.

### 6. Orchestration & Parallel Execution (`mac orchestrate`, `mac parallel`, `mac verify`)
- `mac orchestrate`: start multi-agent workflows in modes such as `auto`, `parallel`, or `sequential`.
- `mac parallel`: deploy agents concurrently for faster task completion.
- `mac verify`: generate a verification agent for the current task.

### 7. MCP Server Management (`mac mcp`)
- `mac mcp add <server>`: configure MCP servers (Playwright, filesystem, GitHub, etc.).
- `mac mcp serve`: launch configured servers locally.
- `mac mcp add-from-claude-desktop`: import server settings from Claude Desktop.
- `mac setup` and `mac init` surface recommended servers automatically to streamline this process.

### 8. Playwright Visual Testing (`mac playwright`)
- `mac playwright init`: scaffold Playwright test directories, baseline storage, and configuration.
- `mac playwright add-visual-tests`: add visual regression harness and `.claude/visual-*` folders.
- `mac playwright setup-ci`: create GitHub Actions workflow for sharded visual and E2E tests.

### 9. Running Prompts via Claude Code MCP (`mac prompt test`)
- Use `mac prompt test` to execute stored workflows through the MCP client with real-time streaming.
- Optional flags: `--preview` to view composed prompts and `--output` to save results.

## Error Handling & Accessibility
- Validate prerequisites (Node version, project directories) before executing flows.
- Provide clear fallback messages and exit codes.
- Allow keyboard navigation with arrow keys, tab, and shortcuts.
- Use high-contrast colors and avoid relying solely on color for status.

## Testing Strategy
- Implement Playwright-based CLI tests in `tests/cli-ui.spec.ts` covering each interactive flow.
- Include visual regression tests and run `npm run visual:test` when `mac playwright` is enabled.
- Integrate `npm run test:cli` into CI pipelines for cross-platform verification.

## Implementation Phases
1. **Setup & Initialization Flows** (`mac setup`, `mac init` with MCP discovery and Playwright options).
2. **Scaffold UI Utilities** (`cli/ui/` with Inquirer wrappers, chalk theme, and shared spinners).
3. **Memory Management Commands** (`mac memory`): init, add, view.
4. **Agent & Command Wizards** (`mac agent`, `mac cmd`): listing and installation flows.
5. **Prompt System Integration** (`mac prompt`): listing, validation, testing, and export flows.
6. **Documentation Tools** (`mac openai sync`, planned `mac docs` restructure).
7. **Orchestration Utilities** (`mac orchestrate`, `mac parallel`, `mac verify`).
8. **MCP Server Management** (`mac mcp add|serve|add-from-claude-desktop`).
9. **Playwright CLI & CI Support** (`mac playwright` commands and workflows).
10. **Cross-Platform QA**: run tests on macOS, Linux, and Windows (WSL2) environments.

## Example Usage
```bash
# Run interactive project setup with MCP discovery
mac setup

# Initialize project with docs import
mac init --with-docs

# Install a new agent
mac agent install

# Add prompt to library and run
mac prompt list
mac prompt test hello-world --preview

# Sync documentation across platforms
mac openai sync

# Initialize Playwright and create CI workflow
mac playwright init
mac playwright setup-ci
```

## Next Steps
- Finalize UI component API and theming.
- Create task-specific ADRs in `.ai/memory/decisions/` as features stabilize.
- Gather user feedback from early adopters and iterate on command ergonomics.
