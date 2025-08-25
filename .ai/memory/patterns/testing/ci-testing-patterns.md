---
source: playwright-ci-implementation
created_by: documentation-sync-guardian
created_at: 2024-12-24T14:30:00Z
version: 1.0
status: proven
confidence: high
---

# CI-Compatible Playwright Testing Patterns

## Overview
Successful patterns for implementing CI-compatible Playwright testing with visual regression, cross-platform support, and optimal performance.

## Core Patterns

### 1. 4-Way Sharding Strategy
**Pattern**: Use 4-way sharding instead of excessive parallelization
```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
```
**Benefits**:
- Optimal balance between speed and resource usage
- Reduces CI costs while maintaining fast feedback
- Prevents resource exhaustion on GitHub Actions runners

### 2. Directory Creation at Init Start
**Pattern**: Create all directories immediately in init command
```javascript
const dirsToCreate = [
  '.claude', '.claude/agents', '.claude/commands',
  '.claude/tasks', '.claude/doc',
  '.ai/memory', '.ai/memory/patterns',
  '.ai/memory/decisions'
];
dirsToCreate.forEach(dir => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});
```
**Benefits**:
- Ensures directories exist before any operations
- Prevents race conditions in CI environments
- Simplifies error handling

### 3. Minimal Flag for CI
**Pattern**: Implement --minimal flag to skip interactive prompts
```javascript
if (options.minimal) {
  // Skip all prompts, create minimal setup
  // Perfect for CI/CD environments
}
```
**Benefits**:
- Enables fully automated testing
- Prevents CI hanging on prompts
- Faster test execution

### 4. Cross-Platform Test Utilities
**Pattern**: Use os.tmpdir() for temporary directories
```javascript
const tmpBase = os.tmpdir();
const testDir = path.join(tmpBase, `test-${Date.now()}`);
```
**Benefits**:
- Works on Windows, macOS, and Linux
- Prevents hardcoded /tmp issues
- Automatic cleanup by OS

### 5. Visual Baseline Management
**Pattern**: Separate baseline update job in CI
```yaml
update-baselines:
  if: github.ref == 'refs/heads/main' && success()
  steps:
    - run: UPDATE_SNAPSHOTS=true npx playwright test
```
**Benefits**:
- Automatically maintains baselines
- Prevents drift over time
- Clear update strategy

### 6. Blob Reporter for Sharding
**Pattern**: Use blob reporter with merge step
```yaml
- run: npx playwright test --reporter=blob
# Later merge all reports
- run: npx playwright merge-reports all-blob-reports
```
**Benefits**:
- Proper report merging across shards
- Single unified test report
- Preserves all test artifacts

### 7. Test Helper Classes
**Pattern**: Encapsulate test utilities in classes
```javascript
class CLITestHelper {
  async createTestDirectory() { }
  async runCommand(cmd) { }
  async verifyFileExists(path) { }
  async cleanupAll() { }
}
```
**Benefits**:
- Reusable test infrastructure
- Consistent error handling
- Simplified test writing

### 8. Failure-Only Documentation
**Pattern**: Only document patterns when tests fail
```yaml
if: github.ref == 'refs/heads/main' && failure()
steps:
  - run: Document failure patterns
```
**Benefits**:
- Reduces commit noise
- Focuses on actual issues
- Prevents daily duplicate commits

## Anti-Patterns to Avoid

### ❌ Over-Sharding
- Don't use 10+ shards for small test suites
- Causes excessive overhead and resource waste

### ❌ Hardcoded Paths
- Never use hardcoded /tmp or C:\temp
- Always use os.tmpdir() or relative paths

### ❌ Missing Cleanup
- Always cleanup test directories
- Use try/finally blocks for guaranteed cleanup

### ❌ Interactive Commands in CI
- Never run commands that require user input
- Always provide flags to skip prompts

### ❌ Synchronous File Operations
- Use async fs operations for better performance
- Prevents blocking in test execution

## Performance Optimizations

### Parallel Test Execution
- Run independent tests concurrently
- Use beforeAll/afterAll sparingly
- Isolate test environments

### Smart Caching
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```
- Cache dependencies between runs
- Cache Playwright browsers
- Cache visual baselines

### Timeout Management
```javascript
timeout: options.timeout || 30000  // 30s default
```
- Set reasonable timeouts
- Increase for complex operations
- Fail fast on hanging tests

## Success Metrics

- **Test Execution Time**: < 5 minutes total
- **Flakiness Rate**: < 1% of runs
- **Coverage**: > 80% of CLI commands
- **Visual Regression**: 100% baseline coverage
- **Cross-Platform**: Works on all major OS

## Implementation Checklist

- [ ] 4-way sharding configured
- [ ] Blob reporter with merge step
- [ ] Visual baseline management
- [ ] Cross-platform test utilities
- [ ] --minimal flag for CI
- [ ] Cleanup in all scenarios
- [ ] Proper error handling
- [ ] Documentation patterns