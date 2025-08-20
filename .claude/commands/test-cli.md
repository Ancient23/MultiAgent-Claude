# /test-cli Command

## Command Definition

```yaml
---
command: "/test-cli"
category: "Quality Assurance"
purpose: "Create and execute comprehensive tests for all CLI functionality and command workflows"
pattern: "research → plan → execute"
agents: ["cli-test-engineer", "prompt-engineer-specialist"]
---
```

## Command Overview

This command creates and executes comprehensive test suites for the MultiAgent-Claude CLI, ensuring all commands work correctly, handle errors gracefully, and provide proper user feedback.

## Usage

```bash
# Run complete CLI test suite
/test-cli

# Test specific CLI command
/test-cli --command "agent create"

# Test with coverage reporting
/test-cli --coverage

# Test error scenarios only
/test-cli --error-scenarios

# Generate test files only (no execution)
/test-cli --generate-only
```

## Examples

```bash
# Example 1: Complete test suite
/test-cli
# Runs all CLI tests including unit, integration, and error scenarios

# Example 2: Agent command testing
/test-cli --command "agent"
# Tests all agent-related CLI commands (create, list, deploy, add)

# Example 3: Error handling validation
/test-cli --error-scenarios --verbose
# Tests error handling with detailed output
```

## Execution Flow

### Phase 1: Test Planning & Design
```yaml
step: "Delegate to CLI Testing Specialist"
primary_agent: "cli-test-engineer"
secondary_agent: "prompt-engineer-specialist"
purpose: "Create comprehensive CLI test plan and specifications"
actions:
  - Analyze CLI structure in cli/ directory
  - Review package.json scripts and entry points
  - Identify all CLI commands and workflows
  - Design unit, integration, and E2E test scenarios
  - Plan error handling and edge case testing
  - Create test infrastructure specifications
output: ".claude/doc/cli-testing-[timestamp].md"
mcp_tools:
  - context7 (CLI testing frameworks)
  - playwright (CLI interaction testing)
  - sequential (complex workflow analysis)
```

### Phase 2: Test Infrastructure Setup
```yaml
step: "Main System Reviews Test Plan"
handler: "main-system"
actions:
  - Read test plan from .claude/doc/
  - Parse test requirements and specifications
  - Set up test environment
  - Install testing dependencies if needed
  - Prepare test data and fixtures
validation:
  - Test dependencies are available
  - CLI is accessible for testing
  - Test environment is isolated
  - Required permissions are available
```

### Phase 3: Test Implementation
```yaml
step: "Create and Execute CLI Tests"
handler: "main-system"
input: "Test plan from .claude/doc/"
actions:
  - Generate test files based on specifications
  - Create unit tests for individual commands
  - Implement integration tests for workflows
  - Add error scenario and edge case tests
  - Execute test suite with reporting
  - Generate coverage metrics
tools: [Write, MultiEdit, Bash, Read]
test_categories:
  - Command parsing and validation tests
  - Workflow integration tests
  - Error handling and recovery tests
  - Performance and reliability tests
```

### Phase 4: Test Execution & Reporting
```yaml
step: "Execute Tests and Generate Reports"
handler: "main-system"
actions:
  - Run unit test suite
  - Execute integration tests
  - Validate error scenarios
  - Generate test coverage report
  - Create performance benchmarks
  - Document test results
tools: [Bash, Write]
reporting:
  - Test execution summary
  - Coverage percentage by command
  - Failed test details with debugging info
  - Performance metrics and benchmarks
```

### Phase 5: Results Analysis & Documentation
```yaml
step: "Analyze Results and Update Documentation"
handler: "main-system"
actions:
  - Analyze test results and coverage
  - Identify gaps and improvements needed
  - Update test documentation
  - Log testing completion
  - Archive test plan and results
```

## Test Categories

### Unit Tests
- **Command Parsing**: Argument and option validation
- **Function Logic**: Individual function behavior testing
- **Configuration**: Settings and config file handling
- **Utilities**: Helper function validation

### Integration Tests
- **Command Workflows**: Multi-step command sequences
- **File Operations**: File creation, modification, validation
- **Agent Interactions**: Agent creation and management flows
- **Memory Operations**: Memory system integration testing

### Error Scenario Tests
- **Invalid Arguments**: Malformed command testing
- **Missing Dependencies**: Missing file and directory handling
- **Permission Issues**: Access control and permission validation
- **Network Failures**: External dependency failure simulation

### Performance Tests
- **Execution Time**: Command completion time measurement
- **Memory Usage**: Memory consumption monitoring
- **Concurrent Operations**: Multiple command execution testing
- **Large Scale**: Testing with large datasets

## CLI Testing Framework

### Test Structure
```
.claude/tests/cli/
├── unit/
│   ├── commands/        # Individual command tests
│   ├── utilities/       # Helper function tests
│   └── config/         # Configuration tests
├── integration/
│   ├── workflows/      # Multi-command workflows
│   ├── file-ops/       # File operation tests
│   └── agent-mgmt/     # Agent management tests
├── error-scenarios/
│   ├── invalid-input/  # Invalid input handling
│   ├── missing-deps/   # Missing dependency tests
│   └── permissions/    # Permission error tests
├── performance/
│   ├── benchmarks/     # Performance benchmarks
│   └── stress/         # Stress testing
└── fixtures/
    ├── test-data/      # Test data files
    └── mock-configs/   # Mock configuration files
```

### Testing Tools
- **Jest/Vitest**: Unit and integration testing framework
- **Playwright**: CLI interaction and E2E testing
- **Sinon**: Mocking and stubbing for isolated testing
- **nyc/c8**: Code coverage measurement

## Test Specifications

### Command Testing Requirements
- [ ] All CLI commands have unit tests
- [ ] Command parsing validates arguments correctly
- [ ] Help text is accurate and complete
- [ ] Exit codes are appropriate for each scenario

### Workflow Testing Requirements
- [ ] Multi-step workflows execute correctly
- [ ] File generation produces expected results
- [ ] Error recovery works as designed
- [ ] State persistence functions properly

### Error Handling Requirements
- [ ] Invalid input produces helpful error messages
- [ ] Missing dependencies are detected and reported
- [ ] Permission issues are handled gracefully
- [ ] Network failures don't cause crashes

## Success Criteria

### Test Coverage
- [ ] Minimum 90% code coverage across all CLI modules
- [ ] All public CLI commands have comprehensive tests
- [ ] Critical error scenarios are covered
- [ ] Performance benchmarks established

### Quality Metrics
- [ ] All tests pass consistently
- [ ] No memory leaks detected
- [ ] Performance within acceptable limits
- [ ] Error messages are user-friendly

### Documentation
- [ ] Test procedures documented
- [ ] Coverage reports generated
- [ ] Performance benchmarks recorded
- [ ] Known issues documented

## Error Handling

### Test Execution Failures
- Continue testing despite individual test failures
- Collect all failures for comprehensive reporting
- Provide debugging information for failed tests
- Generate partial results if complete execution fails

### Environment Issues
- Validate test environment before execution
- Handle missing dependencies gracefully
- Provide setup instructions for test requirements
- Fall back to subset testing if full environment unavailable

### Coverage Reporting Failures
- Generate basic coverage metrics if detailed reporting fails
- Provide manual coverage estimation procedures
- Document coverage gaps for manual validation

## Integration with CI/CD

### Automated Testing
- Can be integrated into GitHub Actions workflows
- Supports automated test execution on commits
- Provides test result reporting in PRs
- Enables continuous quality monitoring

### Quality Gates
- Enforce minimum coverage requirements
- Block deployments on test failures
- Generate quality metrics for monitoring
- Integrate with existing quality assurance processes

## Output Format

### Test Report Structure
```markdown
# CLI Test Report
## Summary
- Tests Executed: [count]
- Passed: [count]
- Failed: [count]
- Coverage: [percentage]

## Detailed Results
### Unit Tests
[Individual test results]

### Integration Tests
[Workflow test results]

### Error Scenarios
[Error handling test results]

## Performance Metrics
[Benchmark results]

## Recommendations
[Improvement suggestions]
```

## Related Commands
- `/validate-templates` - Validate CLI-generated templates
- `/generate-agent` - Test agent creation CLI functionality
- `/sync-docs` - Update documentation with test results