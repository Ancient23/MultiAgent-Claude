# ADR-008: Fix Init Command File Creation Issues

## Status
Accepted

## Context
The `mac init` command was not creating agent and role files despite reporting success. Investigation revealed:
1. Claude was being invoked with `--print` flag which only shows output without executing
2. No real-time feedback during Claude execution causing perceived "hanging"
3. No verification of actual file creation after Claude execution
4. Enhanced prompt for queued items was being built but not properly displayed

## Decision
We have implemented the following fixes:

### 1. Removed `--print` Flag from Claude Execution
```javascript
// Before:
execSync(`claude --print < ${tempFile}`, { stdio: 'inherit' });

// After:
execSync(`claude < ${tempFile}`, { stdio: 'inherit' });
```

### 2. Added Real-Time Output Display
- Set `stdio: 'inherit'` to show Claude's output as it works
- Added visual separators and progress indicators
- Shows Claude's actual responses during execution

### 3. Enhanced File Creation Verification
- Detailed verification of each queued item
- Shows success/failure count for agents, roles, and AGENTS.md
- Provides actionable feedback when files aren't created
- Suggests fallback to `--prompt-only` mode if needed

### 4. Improved User Experience
- Clear indication when building enhanced prompts
- Visual progress during Claude execution
- Detailed verification report after completion
- Better error messages and recovery suggestions

## Consequences

### Positive
- Claude actually creates files now (removed --print flag)
- Users see real-time progress instead of apparent hanging
- Clear feedback on what was/wasn't created
- Better debugging when creation fails

### Negative
- Slightly longer execution time (actual file creation vs just printing)
- More verbose output (but more informative)

## Implementation Files
- `cli/commands/init.js`:
  - Lines 216-240: Removed --print, added real-time output
  - Lines 247-318: Enhanced verification with detailed reporting
  - Lines 133-136: Added progress indicators
  - Lines 143-146: Debug output for enhanced prompt building

## Related Issues
- Users reported init "hanging" with no feedback
- Agents and roles not being created despite success message
- No indication of what Claude is doing during execution

## Testing Notes
- Test with `mac setup` followed by `mac init` 
- Verify agents/roles are actually created
- Check that Claude's output is visible during execution
- Confirm verification reports accurate counts