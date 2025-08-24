# Agent Templates

MultiAgent-Claude distinguishes between **orchestrators** that coordinate work and **specialists** that provide deep domain plans. All agents operate in a research-only mode and output implementation plans to `.claude/doc/`. For OpenAI platforms, each specialist also has a corresponding role file in `.chatgpt/roles`.

## Orchestrators

| Agent | Purpose | Trigger Keywords |
|-------|---------|-----------------|
| `code-review-orchestrator` | Coordinates multi‑angle code reviews before merge or deploy | `code review`, `audit` |
| `fullstack-feature-orchestrator` | Manages end‑to‑end feature delivery across frontend and backend | `fullstack feature`, `frontend + backend` |
| `infrastructure-migration-architect` | Plans large‑scale infrastructure transitions | `infrastructure migration`, `re‑architecture` |
| `issue-triage-orchestrator` | Leads systematic bug investigation and resolution | `bug triage`, `performance issue` |
| `master-orchestrator` | Analyzes tasks and selects execution strategy | `task analysis`, `strategy` |
| `parallel-controller` | Oversees parallel agent execution with dependency control | `parallel tasks`, `concurrency` |
| `wave-execution-orchestrator` | Runs the 7‑wave workflow for complex efforts | `7-wave`, `multi‑phase` |

## Specialists

| Agent | Expertise | Trigger Keywords |
|-------|-----------|-----------------|
| `ai-agent-architect` | Designs AI agent systems and MCP servers | `LangChain`, `agent orchestration` |
| `aws-backend-architect` | Architects AWS backend services | `AWS architecture`, `serverless` |
| `aws-deployment-specialist` | Troubleshoots and optimizes AWS deployments | `Terraform`, `CloudFormation` |
| `backend-api-frontend-integrator` | Aligns APIs with frontend consumers | `API integration`, `frontend↔backend` |
| `codebase-truth-analyzer` | Compares code and documentation for drift | `documentation alignment` |
| `cpp-plugin-api-expert` | Guides C++ game engine plugin development | `C++ plugin`, `engine API` |
| `documentation-architect` | Plans comprehensive project documentation | `documentation`, `docs planning` |
| `frontend-ui-expert` | Provides React/Next.js UI guidance | `React 19`, `Tailwind`, `Shadcn` |
| `implementation-verifier` | Validates that execution matches the plan | `plan adherence`, `verification` |
| `multimodal-ai-specialist` | Plans vision‑language and RAG features | `CLIP`, `LLaVA`, `RAG` |
| `playwright-test-engineer` | Designs Playwright test suites | `E2E tests`, `visual regression` |
| `playwright-visual-developer` | Iterates on UI using Playwright MCP | `visual iteration`, `Playwright MCP` |
| `ui-design-auditor` | Audits UX/UI and suggests improvements | `design audit`, `UX best practices` |
| `vercel-deployment-troubleshooter` | Diagnoses Vercel build and runtime errors | `Vercel`, `deployment issues` |
| `TEMPLATE-agent` | Starter spec for creating new specialists | `custom agent`, `template` |

Refer to each markdown file for full instructions. Use orchestrators when coordination across multiple specialists is required; otherwise invoke the specialist that matches the domain.
