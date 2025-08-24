# Example Library & Specialist Expansion Plan

## Status Overview
- Terraform, MongoDB, SQL, and RAG vector DB specialists have been added.
- Playwright specialist docs were refined.
- No iOS/SwiftUI commands or specialists yet; template and orchestration cleanup outstanding.

## Remaining Work

### 1. Command Templates & Cleanup
- Rename `TEMPLATE-COMMAND.md` to `TEMPLATE-command.md` and fix references.
- Consolidate `WAVE_EXECUTE.md` with `implement-feature.md` or clearly document distinct use cases.
- Introduce iOS command examples:
  - `ios-init.md` – scaffold Xcode project and simulator.
  - `generate-swiftui-view.md` – plan and implement new SwiftUI view.
  - `run-ios-tests.md` – execute unit and UI tests via `xcodebuild` or `fastlane`.
- Add `/generate-tests` command that delegates to test specialists (web, mobile, API).
- Provide issue management examples:
  - `/triage-issue` – orchestrates reproduction, prioritization, and assignment.
  - `/review-pr` – analyzes diffs, tests, and documentation updates.
- Update `Examples/commands/README.md` to list commands and registration instructions.

### 2. Specialist Library Expansion
- Add `swiftui-architect.md` for SwiftUI and Combine architectures.
- Add `ci-cd-pipeline-engineer.md` to design GitHub Actions/Fastlane workflows.
- Optionally add `android-ui-expert.md` for Jetpack Compose parity.
- Review whether `playwright-test-engineer.md` and `playwright-visual-developer.md` should merge into a unified `playwright-testing-specialist.md` or receive clearer differentiation.
- Document triggers, outputs, and test expectations for each specialist.

### 3. Orchestrator Updates
- Clarify roles of `master-orchestrator`, `fullstack-feature-orchestrator`, and `wave-execution-orchestrator`; merge or document selection guidelines.
- Create `mobile-feature-orchestrator.md` to coordinate mobile specialists with backend APIs.
- Ensure orchestrators delegate work to specialists instead of implementing steps directly.
- Document `parallel-controller.md` interactions and update `master-orchestrator` to explicitly leverage the Task tool.

### 4. MCP Tool Strategy
- Expose an `mcp-registry` lookup tool so agents can discover MCP servers during scaffolding.
- Preload commonly used MCP servers:
  - `sequential`, `context7`
  - Mobile tooling: `xcodebuild`, `fastlane`, `simctl`
  - Package registries: `npm`, `swift-package-index`, `cocoapods`
  - UI libraries: `shadcn-components`, `shadcn-themes`
  - Collaboration: `github-issues`, `slack`, `jira`
  - Infrastructure: `terraform`, `gcloud`, `azure-cli`, `kubectl`
- Consider additional tools like Figma, Slack, or Jira for broader workflows.

### 5. Documentation & Onboarding
- Enhance `Examples/commands/TEMPLATE-command.md` with session-context guidance and CLI registration comments.
- Update `Examples/agents/specialists/TEMPLATE-agent.md` to mention optional parameters such as `project-type` or `framework`.
- Provide a top-level doc illustrating how `mac setup` and `mac init` install curated agents and commands.
- Tag agents and commands with supported platforms to avoid redundancy.
- Move outdated or niche agents/commands to an `Examples/legacy` folder to keep defaults concise.

### 6. Testing & Validation
- Expand CLI tests (`tests/cli.cli.spec.js`) to cover new commands.
- Add template validation tests (`/validate-templates`) for newly added specialists and commands.
- Provide sample Playwright scripts demonstrating dev vs CI testing workflows.
- Run `npm test` and `playwright test` for both web and mobile examples where possible.

### 7. Packaging for `mac setup` / `mac init`
- Define default bundles of orchestrators, specialists, and commands:
  - Base web/backend set – `/implement-feature`, `/generate-tests`, `/review-pr`, `/triage-issue`
  - Mobile-enhanced set – adds `/ios-init`, `/run-ios-tests`, and `swiftui-architect`
  - Fullstack advanced set – includes all specialists plus infrastructure tooling
- Document how these bundles are selected and how users can customize them.

## Next Steps
1. Rename command template and add README updates.
2. Introduce SwiftUI specialist and iOS command examples.
3. Draft `mobile-feature-orchestrator.md` and clarify orchestrator documentation.
4. Wire up `mcp-registry` and preload additional MCP tools.
5. Expand tests and ensure `npm test` passes.
