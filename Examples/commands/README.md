# Command Templates

This directory provides reusable command patterns for the MultiAgent-Claude CLI. Each command follows the research → plan → execute workflow where specialists create plans and the main system executes them.

## Available Commands

| Command | Purpose | When to Use |
|--------|---------|-------------|
| `/wave-execute` | Runs the full 7‑wave orchestration cycle with context propagation. | Choose for complex, multi‑phase tasks that require discovery, implementation, testing, deployment and documentation.
| `/generate-tests` | Generates comprehensive Playwright test plans. | Use when adding or expanding end‑to‑end or visual regression tests.
| `/implement-feature` | Coordinates full‑stack feature delivery via planning then execution. | Invoke for end‑to‑end features touching frontend and backend code.
| `TEMPLATE-COMMAND` | Starter template for creating new commands. | Copy when defining a new custom command following the standard workflow.

## Selection Guidelines

1. Prefer `/wave-execute` for large efforts needing strict phase boundaries.
2. Use `/implement-feature` for feature work that spans multiple stacks.
3. Pick `/generate-tests` when the primary goal is Playwright test coverage.
4. Start from `TEMPLATE-COMMAND` for any new command designs.

All commands expect plans to be written to `.claude/doc/` and tests run via `npm test` before committing changes.
