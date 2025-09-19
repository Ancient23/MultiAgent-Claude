---
description: "Create and execute comprehensive tests for all CLI functionality and command workflows"
argument-hint: "[--command <cmd>] [--coverage] [--error-scenarios] [--generate-only]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "Task", "Grep", "Glob"]
model: "sonnet"
---

# /test-cli

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Command-line arguments specifying test scope and options
- **$ARGUMENTS**: Parsed flags including --command, --coverage, --error-scenarios, --generate-only
- **OUTPUT_DIR**: `.claude/tests/cli/` - Directory for generated test files
- **REPORT_DIR**: `.claude/doc/` - Directory for test reports and plans
- **TEST_COMMAND**: Specific CLI command to test (if --command specified)
- **COVERAGE_FLAG**: Boolean indicating whether to generate coverage reports
- **SESSION_ID**: Generated from `getSessionId('test_cli_[timestamp]')`

## Instructions

This command creates and executes comprehensive test suites for the MultiAgent-Claude CLI:

1. **Analysis Phase**: Analyze CLI structure and identify test requirements
2. **Planning Phase**: Deploy cli-test-engineer agent to create test plan
3. **Generation Phase**: Generate test files based on specifications
4. **Execution Phase**: Run tests with appropriate framework
5. **Reporting Phase**: Generate coverage and performance reports

### Prerequisites
- Node.js environment with test framework (Jest/Vitest/Playwright)
- CLI source code in `cli/` directory
- Write access to `.claude/tests/` directory

### Decision Points
- If --generate-only: Skip execution phase
- If --command specified: Focus tests on single command
- If --coverage: Include coverage reporting tools
- If test failures detected: Continue but mark as failed

## Workflow

1. **Initialize Test Environment**
   - If no .claude/tests/cli/ directory exists:
     - Create test directory structure
     - Set up test configuration
   - STOP and alert if CLI source not found

2. **Analyze CLI Structure**
   - For each file in cli/commands/:
     - Parse command implementation
     - Identify required test scenarios
   - If --command specified:
     - Filter to specific command only

3. **Deploy Test Planning Agent**
   - Invoke Task tool with cli-test-engineer:
     - Pass CLI structure analysis
     - Include USER_PROMPT requirements
   - Wait for test plan completion
   - Read plan from .claude/doc/cli-testing-*.md

4. **Generate Test Files**
   - For each test category in plan:
     - Create appropriate test file
     - Add test cases from specifications
     - Include error scenarios if --error-scenarios
   - Validate generated tests compile

5. **Execute Test Suite**
   - If --generate-only flag:
     - Skip to step 6
   - For each test file generated:
     - Run test with appropriate framework
     - Collect results and metrics
     - Continue even if failures occur

6. **Generate Reports**
   - Create test execution summary
   - If --coverage flag:
     - Generate coverage report
     - Calculate coverage percentage
   - Archive test results to REPORT_DIR

## Report

```markdown
# CLI Test Execution Report

## Summary
- **Session ID**: ${SESSION_ID}
- **Test Date**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Coverage**: ${COVERAGE_PERCENTAGE}%

## Test Scope
- Commands Tested: ${TEST_COMMAND || "All"}
- Error Scenarios: ${ERROR_SCENARIOS ? "Included" : "Excluded"}
- Coverage Analysis: ${COVERAGE_FLAG ? "Enabled" : "Disabled"}

## Test Results
### Unit Tests
- Total: [count]
- Passed: [count]
- Failed: [count]
- Skipped: [count]

### Integration Tests
- Total: [count]
- Passed: [count]
- Failed: [count]

### Error Scenarios
- Total: [count]
- Handled Correctly: [count]
- Failed Handling: [count]

## Failed Tests Details
[List of failed tests with error messages]

## Coverage Metrics
- Line Coverage: [percentage]%
- Branch Coverage: [percentage]%
- Function Coverage: [percentage]%
- Statement Coverage: [percentage]%

## Performance Metrics
- Total Execution Time: [duration]
- Average Test Duration: [duration]
- Memory Usage: [MB]

## Generated Files
- Test Files: ${OUTPUT_DIR}[list]
- Coverage Report: ${REPORT_DIR}coverage.html
- Test Plan: ${REPORT_DIR}cli-testing-*.md

## Recommendations
[Suggested improvements based on results]
```

## Control Flow Patterns

### Conditionals
```yaml
- If --generate-only provided:
    Generate test files
    Skip execution
  Else:
    Generate and execute tests

- If --command specified:
    Filter tests to single command
  Else:
    Test all CLI commands

- If --coverage requested:
    Enable coverage instrumentation
    Generate coverage reports
  Else:
    Run tests without coverage
```

### Iteration Loops
```yaml
- For each CLI command in cli/commands/:
    Analyze command structure
    Generate unit tests
    Generate integration tests

- For each test scenario in plan:
    Create test case
    Add assertions
    Include error handling

- For each test file generated:
    Execute with test runner
    Collect results
    Update report
```

### Parallel Orchestration
```yaml
- When multiple test categories exist:
    test_categories: [unit, integration, error, performance]
    parallel_execution:
      - Run all categories simultaneously
      - Collect results independently
      - Merge into unified report

- When testing multiple commands:
    parallel_commands:
      - Test each command in parallel
      - Aggregate results
      - Generate combined coverage
    synchronization: "Wait for all test completions"
```

## Error Handling

### Test Generation Errors
- Missing CLI source: Alert user and provide path guidance
- Invalid command specified: List available commands
- Template parsing failure: Fall back to basic test structure

### Test Execution Errors
- Test framework missing: Suggest installation command
- Test failures: Continue execution, mark as failed
- Timeout errors: Skip remaining tests in category

### Reporting Errors
- Coverage tool failure: Generate basic pass/fail report
- Report generation failure: Output raw test results
- File write errors: Display results to console

## Usage Examples

```bash
# Complete test suite with coverage
/test-cli --coverage

# Test specific command
/test-cli --command "agent create"

# Generate tests without execution
/test-cli --generate-only

# Focus on error handling
/test-cli --error-scenarios

# Comprehensive testing
/test-cli --coverage --error-scenarios
```

## Test Categories

### Unit Tests
- Command parsing and validation
- Option handling and defaults
- Configuration loading
- Utility function behavior

### Integration Tests
- Multi-command workflows
- File system operations
- Agent management flows
- Memory system integration

### Error Scenarios
- Invalid arguments
- Missing dependencies
- Permission issues
- Network failures

### Performance Tests
- Execution time benchmarks
- Memory consumption
- Concurrent operations
- Large dataset handling

## Related Commands
- `/validate-templates` - Validate generated templates
- `/sync-docs` - Update documentation with test results
- `/generate-agent` - Test agent creation functionality