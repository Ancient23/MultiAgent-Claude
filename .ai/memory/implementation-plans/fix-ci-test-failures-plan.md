# Fix CI Test Failures - Complete Implementation Plan

**Created**: 2024-12-24  
**Status**: Ready for Implementation  
**Priority**: Critical  
**Scope**: Fix all CI test failures with proper implementation

## Executive Summary

CI tests are failing due to two main issues:
1. Visual regression tests have platform-specific snapshot names (darwin) but CI runs on Linux
2. CLI tests use non-existent command flags (--skip-prompts, --variant, --agents)

This plan implements proper fixes: platform-agnostic snapshots and full CLI flag support.

## Root Cause Analysis

### Issue 1: Visual Regression Platform Mismatch
- **Current State**: Snapshots named `*-unit-tests-darwin.png`
- **CI Environment**: Ubuntu Linux expects `*-unit-tests-linux.png`
- **Impact**: All 11 visual tests fail in CI

### Issue 2: Missing CLI Flags
- **Tests Expect**: `setup --variant base --skip-prompts --agents playwright-test-engineer`
- **Reality**: setup.js is fully interactive with no CLI flag support
- **Impact**: 6+ CLI tests fail

## Implementation Strategy

### Part A: Platform-Agnostic Visual Snapshots

#### 1. Modify Playwright Configuration
```javascript
// playwright.config.js
export default defineConfig({
  use: {
    // Force consistent snapshot names across platforms
    snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  },
  expect: {
    // Remove platform suffix from snapshot names
    toHaveScreenshot: {
      // Don't include platform in filename
      stylePath: ['tests/visual-regression.spec.js'],
    },
  },
});
```

#### 2. Update Visual Tests
```javascript
// tests/visual-regression.spec.js
// Change all toHaveScreenshot calls to remove platform-specific names
await expect(page).toHaveScreenshot('cli-help-output.png', {
  fullPage: true,
  animations: 'disabled',
  // Remove platform from name
  stylePath: undefined,
});
```

#### 3. Rename Existing Snapshots
```bash
# Remove -darwin suffix from all snapshots
for file in tests/visual-regression.spec.js-snapshots/*-darwin.png; do
  newname="${file%-unit-tests-darwin.png}.png"
  mv "$file" "$newname"
done
```

### Part B: Implement CLI Flag Support

#### 1. Update setup.js Command
```javascript
// cli/commands/setup.js
const { program } = require('commander');

async function execute(options = {}) {
  // Support both interactive and non-interactive modes
  const skipPrompts = options.skipPrompts || false;
  const variant = options.variant || null;
  const agents = options.agents || [];
  
  if (skipPrompts) {
    // Non-interactive mode for testing
    return setupEnvironment(
      variant || 'base',
      agents,
      [], // mcpServers
      {}, // ciOptions
      {}, // playwrightOptions
      'Unknown',
      null,
      [],
      [],
      'skip'
    );
  }
  
  // Existing interactive code...
}

// Add CLI argument parsing
function parseArgs(args) {
  const options = {};
  
  if (args.includes('--skip-prompts')) {
    options.skipPrompts = true;
  }
  
  const variantIndex = args.indexOf('--variant');
  if (variantIndex !== -1 && args[variantIndex + 1]) {
    options.variant = args[variantIndex + 1];
  }
  
  const agentsIndex = args.indexOf('--agents');
  if (agentsIndex !== -1 && args[agentsIndex + 1]) {
    options.agents = args[agentsIndex + 1].split(',');
  }
  
  return options;
}

module.exports = { 
  execute: (args) => execute(parseArgs(args || [])) 
};
```

#### 2. Update CLI Tests
```javascript
// tests/cli-playwright.spec.js
test('setup command creates minimal structure', async () => {
  // This should now work with the implemented flags
  const result = await cliHelper.runCommand('setup --variant base --skip-prompts');
  
  expect(result.success).toBe(true);
  expect(result.stdout).toContain('Configuration saved');
  
  // Verify only .claude directory created
  const dirs = await cliHelper.listDirectory();
  expect(dirs).toContain('.claude');
  
  // No other directories should exist
  const otherDirs = dirs.filter(d => !d.startsWith('.'));
  expect(otherDirs.length).toBe(0);
});
```

### Part C: Fix Visual Baseline Management Test

#### Update visual-helpers.js
```javascript
// tests/utils/visual-helpers.js
class VisualBaselineManager {
  constructor(options = {}) {
    this.baselineDir = options.baselineDir || path.join(process.cwd(), '.playwright', 'baseline');
    // Don't return null in update mode for the management test
    this.updateMode = process.env.UPDATE_SNAPSHOTS === 'true' && !options.testMode;
    this.ciMode = process.env.CI === 'true';
    this.diffThreshold = options.diffThreshold || 0.01;
  }
  
  async getBaseline(name) {
    const baselinePath = await this.getBaselinePath(name);
    
    // Allow retrieval in test mode even during updates
    if (this.updateMode && !this.testMode) {
      return null;
    }
    
    try {
      const buffer = await fs.readFile(baselinePath);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
}
```

#### Update the baseline management test
```javascript
// tests/visual-regression.spec.js
test('visual baseline management', async ({ page }) => {
  // Use testMode to avoid update mode issues
  const visualManager = new VisualBaselineManager({ testMode: true });
  const testName = 'test-baseline-management';
  
  // Rest of test...
});
```

## Implementation Steps

### Phase 1: Fix Visual Snapshots (30 min)
1. Update playwright.config.js to use platform-agnostic paths
2. Rename all existing snapshot files to remove `-unit-tests-darwin` suffix
3. Update visual-regression.spec.js if needed for snapshot names
4. Test locally to ensure snapshots work

### Phase 2: Implement CLI Flags (45 min)
1. Add argument parsing to cli/commands/setup.js
2. Implement --skip-prompts flag
3. Implement --variant flag
4. Implement --agents flag
5. Update setupEnvironment to handle non-interactive mode
6. Test CLI commands work with flags

### Phase 3: Fix Remaining Issues (15 min)
1. Fix visual baseline management test
2. Ensure all tests pass locally
3. Commit renamed snapshots
4. Push and verify CI passes

## Files to Modify

### High Priority
1. **cli/commands/setup.js** - Add CLI flag support (~100 lines)
2. **tests/visual-regression.spec.js-snapshots/*.png** - Rename 11 files
3. **playwright.config.js** - Add snapshot configuration

### Medium Priority
4. **tests/utils/visual-helpers.js** - Fix update mode handling
5. **tests/visual-regression.spec.js** - Update baseline management test

### Low Priority (if needed)
6. **tests/cli-playwright.spec.js** - Verify tests work with new flags

## Testing Checklist

- [ ] Run `npm test` locally - all tests pass
- [ ] Visual snapshots work without platform suffix
- [ ] CLI commands work with --skip-prompts flag
- [ ] CLI commands work with --variant flag
- [ ] CLI commands work with --agents flag
- [ ] Push to CI and verify all shards pass
- [ ] No flaky tests
- [ ] Visual regression tests pass on Linux CI

## Success Criteria

1. **All CI tests passing** (0 failures across 4 shards)
2. **Visual tests platform-agnostic** (same snapshots work on macOS and Linux)
3. **CLI fully testable** (non-interactive mode works)
4. **No test skips needed** (all tests actually run and pass)
5. **Clean implementation** (no hacks or workarounds)

## Risk Mitigation

- **Snapshot compatibility**: Test on both macOS and Linux before committing
- **CLI backwards compatibility**: Ensure interactive mode still works
- **Test flakiness**: Add proper timeouts and error handling
- **Git conflicts**: Rename files carefully to preserve history

## Rollback Plan

If issues occur:
1. Revert cli/commands/setup.js changes
2. Restore original snapshot names
3. Mark problematic tests as .skip temporarily
4. Fix issues and retry

## Long-term Benefits

1. **Reliable CI**: No more platform-specific failures
2. **Testable CLI**: All commands can be tested automatically
3. **Maintainable tests**: Clear structure and no workarounds
4. **Developer experience**: Tests work the same locally and in CI
5. **Future-proof**: Easy to add more CLI flags as needed