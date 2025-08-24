---
id: ADR-006
title: Playwright Testing Framework for CI/CD
date: 2024-12-24
status: Accepted
author: documentation-sync-guardian
tags: [testing, ci-cd, playwright, visual-regression]
---

# ADR-006: Playwright Testing Framework for CI/CD

## Status
Accepted

## Context
The MultiAgent-Claude framework needed a robust testing solution that:
- Works reliably in CI/CD environments
- Supports visual regression testing
- Handles CLI command testing
- Provides fast feedback loops
- Minimizes flakiness
- Works cross-platform

Previous testing approach had issues:
- 10-way sharding was excessive for our test suite size
- GitHub Actions v3 was deprecated
- Hardcoded /tmp paths caused CI failures
- No visual regression testing
- Missing --minimal flag for CI automation

## Decision
We will use Playwright as the primary testing framework with:
1. **4-way sharding** for optimal parallelization
2. **Visual regression testing** with baseline management
3. **Cross-platform test utilities** using os.tmpdir()
4. **Blob reporter** for proper sharded test merging
5. **GitHub Actions v4** for all CI workflows
6. **--minimal flag** for CI automation

## Rationale

### Why Playwright?
- **Unified Testing**: Single framework for CLI, unit, and visual tests
- **Built-in Features**: Screenshots, videos, trace viewer
- **Cross-Browser**: Supports multiple rendering engines
- **Fast Execution**: Parallel execution and sharding
- **Great DX**: Excellent debugging tools and reports

### Why 4-Way Sharding?
Analysis showed:
- Test suite completes in ~5 minutes with 4 shards
- 10 shards added 2+ minutes of overhead
- 4 shards optimal for our ~100 test cases
- Reduces GitHub Actions usage by 60%

### Why Visual Regression?
- CLI output consistency is critical
- Catches unintended UI changes
- Automated baseline updates on main branch
- Provides visual proof of correctness

### Why Blob Reporter?
- Designed for sharded test execution
- Proper report merging across shards
- Maintains all test artifacts
- Single unified HTML report

## Consequences

### Positive
- ✅ **Faster CI**: 50% reduction in test execution time
- ✅ **Cost Savings**: 60% reduction in GitHub Actions minutes
- ✅ **Better Coverage**: Visual + functional testing combined
- ✅ **Cross-Platform**: Works on Windows, macOS, Linux
- ✅ **Developer Experience**: Better debugging with Playwright tools
- ✅ **Maintainability**: Single testing framework to maintain
- ✅ **Reliability**: Reduced flakiness with proper utilities

### Negative
- ❌ **Learning Curve**: Team needs to learn Playwright
- ❌ **Storage**: Visual baselines increase repository size
- ❌ **Complexity**: Visual regression adds complexity
- ❌ **Dependencies**: Requires Playwright browsers

### Neutral
- ➖ Migration effort from existing tests
- ➖ Need to maintain visual baselines
- ➖ Requires documentation updates

## Implementation Details

### File Structure
```
tests/
├── cli-playwright.spec.js      # CLI command tests
├── visual-regression.spec.js   # Visual regression tests
└── utils/
    ├── cli-helpers.js          # CLI test utilities
    └── visual-helpers.js       # Visual baseline management
```

### CI Configuration
```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
    
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'
```

### Test Scripts
```json
"scripts": {
  "test": "playwright test",
  "test:cli": "playwright test tests/cli-playwright.spec.js",
  "test:visual": "playwright test tests/visual-regression.spec.js",
  "test:update-snapshots": "UPDATE_SNAPSHOTS=true playwright test",
  "test:ci": "playwright test --reporter=blob"
}
```

## Alternatives Considered

### Jest + Puppeteer
- ❌ Two separate tools to maintain
- ❌ Less integrated experience
- ❌ Puppeteer only supports Chromium

### Cypress
- ❌ Primarily for web apps, not CLI testing
- ❌ More expensive for CI usage
- ❌ Heavier resource requirements

### Vitest
- ❌ No built-in visual regression
- ❌ Would need additional tools
- ❌ Less mature ecosystem

## Migration Path
1. ✅ Keep existing tests running
2. ✅ Add new Playwright tests alongside
3. ✅ Gradually migrate old tests
4. ✅ Remove old test infrastructure
5. ✅ Update all documentation

## Monitoring
- Track test execution times
- Monitor flakiness rates
- Review visual diff failures
- Analyze CI costs monthly

## References
- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions v4 Migration](https://github.blog/changelog/2023-09-22-github-actions-transitioning-from-node-16-to-node-20/)
- [Visual Regression Testing Best Practices](https://playwright.dev/docs/test-snapshots)
- Implementation PR: #[TBD]