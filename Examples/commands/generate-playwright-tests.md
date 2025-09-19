---
description: "Generate comprehensive Playwright test suites for E2E, visual regression, accessibility, and form validation testing"
argument-hint: "[scope] [--include-visual] [--include-a11y] [--include-performance]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "WebSearch", "WebFetch"]
model: "sonnet"
---

# /generate-playwright-tests

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - The test scope description and any additional context provided by the user
- **$ARGUMENTS**: Parsed command arguments including scope description, flags, and options
- **OUTPUT_DIR**: `.claude/doc/` - Directory for agent plan outputs and documentation
- **SESSION_ID**: Generated from `getSessionId('playwright_tests_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **PLAN_FILE**: `.claude/doc/playwright-test-engineer-[task]-[timestamp].md` - Agent-generated plan location
- **TEST_SCOPE**: Extracted from USER_PROMPT - Specific features/flows to test
- **TEST_TYPES**: Array of test types based on flags - E2E, visual, accessibility, performance
- **APP_STRUCTURE**: Discovered from codebase analysis - Routes, components, critical paths
- **EXISTING_TESTS**: Found test files and patterns - Current test coverage assessment

## Instructions

This command template implements the research-plan-execute pattern for comprehensive Playwright test generation:

1. **Initialization**: Create session context with test objectives and application analysis
2. **Research Phase**: Deploy playwright-test-engineer to analyze app structure and create test strategy
3. **Planning Phase**: Agent documents comprehensive test implementation plan
4. **Review Phase**: Main system reads and validates the test plan
5. **Execution Phase**: Main system generates test files, page objects, and CI configuration
6. **Verification Phase**: Validate test syntax, run initial tests, and document patterns

### Prerequisites
- Playwright must be installed or will be configured during execution
- Application must be accessible for testing (localhost or deployed)
- Session context file exists before agent deployment
- Access to codebase for structure analysis

### Decision Points
- If no TEST_SCOPE provided: Analyze entire application for critical paths
- If --include-visual flag: Generate visual regression tests with baselines
- If --include-a11y flag: Include accessibility compliance tests
- If --include-performance flag: Add performance and loading tests
- If existing tests found: Extend rather than replace
- If critical errors occur: Stop and request user intervention

## Workflow

1. **Initialize Session Context**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document test objectives from USER_PROMPT
     - Analyze application structure and routes
     - Identify existing test patterns
   - STOP and alert user if session creation fails

2. **Analyze Application Structure**
   - Scan codebase for routes and components
   - Identify critical user flows
   - Check existing test files and coverage
   - Document findings in context file
   - If analysis incomplete: Request additional context

3. **Deploy Playwright Test Engineer**
   - Invoke Task tool with playwright-test-engineer agent
   - Pass session context, TEST_SCOPE, and TEST_TYPES
   - Include application structure analysis
   - Wait for agent to complete comprehensive test plan
   - If agent fails: Retry with simplified scope

4. **Review Test Plan**
   - Read agent-generated plan from PLAN_FILE
   - Validate test coverage against objectives
   - Check for missing critical paths
   - Verify test type requirements met
   - If issues found: Request user approval for modifications

5. **Generate Test Implementation**
   - For each test suite in plan:
     - Create test files with proper structure
     - Generate page object models
     - Set up test data and fixtures
     - Configure Playwright settings
   - Update or create playwright.config.ts
   - Set up CI/CD integration if requested

6. **Setup and Verification**
   - Install Playwright if not present
   - Run initial test syntax validation
   - Execute baseline test run
   - Generate visual test baselines if applicable
   - Document test patterns in memory system

## Report

```markdown
# Command Execution Report: /generate-playwright-tests

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]

## Test Objectives
${USER_PROMPT}

## Application Analysis
- **Routes Discovered**: [count]
- **Critical Paths Identified**: [list]
- **Existing Test Coverage**: [percentage]
- **Test Types Generated**: ${TEST_TYPES}

## Agent Plans Generated
- ${PLAN_FILE}
- Test Strategy: [comprehensive/focused/minimal]

## Implementation Summary
### Test Files Created
- [test_file_path] - [test description and coverage]
- tests/e2e/[feature].spec.ts - [E2E test coverage]
- tests/visual/[component].spec.ts - [Visual regression tests]
- tests/accessibility/[page].spec.ts - [A11y compliance tests]

### Page Objects Created
- page-objects/[PageName].ts - [page interaction patterns]

### Configuration Files
- playwright.config.ts - [Playwright configuration]
- .github/workflows/playwright.yml - [CI integration]

### Commands Executed
- `npm install @playwright/test` - [installation status]
- `npx playwright install` - [browser installation]
- `npx playwright test --reporter=html` - [initial test run]

## Test Coverage Results
- **E2E Tests**: [count] tests covering [features]
- **Visual Tests**: [count] baselines created
- **Accessibility Tests**: [count] pages validated
- **Performance Tests**: [count] benchmarks established

## Verification Results
- Test Syntax Valid: [Yes/No]
- Initial Test Run: [pass/fail counts]
- Visual Baselines Generated: [Yes/No]
- CI Pipeline Configured: [Yes/No]

## Quality Metrics
- Test Execution Time: [duration]
- Code Coverage: [percentage if applicable]
- Accessibility Score: [score if tested]
- Performance Baseline: [metrics if tested]

## Next Steps
- Run full test suite: `npx playwright test`
- Update visual baselines: `npx playwright test --update-snapshots`
- Configure test data: [specific recommendations]
- Schedule regular test execution

## Archived Resources
- Context: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
- Plan: `.ai/memory/sessions/archive/${PLAN_FILE}`
- Test Patterns: `.ai/memory/patterns/testing/playwright-[timestamp].md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If TEST_SCOPE provided:
    Focus test generation on specified features
  Else:
    Analyze entire application for comprehensive coverage

- If --include-visual flag:
    Generate visual regression tests
    Set up screenshot comparison
  Else:
    Skip visual testing components

- If --include-a11y flag:
    Install axe-playwright
    Generate accessibility test suites
  Else:
    Skip accessibility testing

- If existing tests found:
    Extend and enhance current test suite
  Else:
    Create complete new test infrastructure

- If Playwright not installed:
    Install and configure Playwright
    Set up browser dependencies
  Else:
    Use existing Playwright configuration
```

### Iteration Loops
```yaml
- For each route in APP_STRUCTURE:
    Analyze user interactions
    Generate appropriate test coverage
    Create page object if needed

- For each test_type in TEST_TYPES:
    Create test suite directory
    Generate test files
    Configure specific test settings

- For each critical_path in user_flows:
    Create E2E test scenario
    Add error handling tests
    Include edge case coverage

- For each page_object in page_models:
    Generate locator definitions
    Create action methods
    Add assertion helpers
```

### Parallel Orchestration
```yaml
- When multiple test types requested:
    test_types: [e2e, visual, accessibility, performance]
    parallel_generation:
      - Generate E2E tests for critical paths
      - Create visual regression baselines
      - Set up accessibility compliance tests
      - Configure performance benchmarks
    synchronization_point: "All test types complete"

- When large application scope:
    parallel_analysis:
      - Route discovery and mapping
      - Component interaction analysis
      - User flow identification
      - Test data requirements
    consolidation: "Unified test strategy"
```

## Error Handling

### Recoverable Errors
- Playwright not installed: Install automatically with proper configuration
- Missing test directories: Create directory structure as needed
- Browser dependencies missing: Run `npx playwright install`
- Existing conflicting tests: Merge or rename to avoid conflicts
- Application not accessible: Provide fallback mock scenarios

### Critical Errors
- Agent deployment failure: STOP and alert user with diagnostic information
- Session context corruption: STOP and request recovery with backup
- Invalid application structure: STOP and request manual route definition
- Playwright installation failure: STOP and provide manual installation steps
- Test plan conflicts: STOP and request user resolution

## Anti-Patterns to Avoid

❌ **Generating tests without understanding application structure**
❌ **Creating brittle selectors without data-testid attributes**
❌ **Skipping page object pattern for maintainability**
❌ **Ignoring async operations and proper waiting**
❌ **Not including accessibility testing in modern applications**
❌ **Hardcoding test data instead of using fixtures**
❌ **Creating interdependent tests that break in isolation**
❌ **Not setting up CI/CD integration for automated testing**

## Usage Examples

```bash
# Generate comprehensive tests for checkout flow
/generate-playwright-tests "checkout flow" --include-visual --include-a11y

# Create full application test suite
/generate-playwright-tests "entire application" --include-performance

# Focus on authentication with accessibility
/generate-playwright-tests "user authentication" --include-a11y

# Visual regression testing for UI components
/generate-playwright-tests "component library" --include-visual

# Using existing plan
/generate-playwright-tests --plan .claude/doc/playwright-test-engineer-auth-20240918.md
```

## Related Commands
- `/orchestrate` - Multi-agent orchestration for complex test strategies
- `/wave-execute` - Seven-phase systematic test implementation
- `/implement` - Direct execution of test plans
- `/validate-templates` - Validate generated test file quality