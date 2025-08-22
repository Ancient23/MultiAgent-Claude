# Session ID System Documentation

## Overview

The MultiAgent-Claude framework uses Claude session IDs (not timestamps) to track context and maintain continuity across agent invocations. This ensures all artifacts are properly linked to their originating Claude conversation.

## Session ID Format

- **With Claude**: `[claude_session_id]_[suffix]` (e.g., `claude_abc123def456_wave`)
- **Fallback**: `[generated_hex_id]_[suffix]` (e.g., `a1b2c3d4e5f6_test`)
- **Never**: Timestamp formats like `20250122_103045_init` (deprecated)

## For CLI Commands

Commands should use the session helper to generate IDs:

```javascript
const { getSessionId } = require('../lib/session-helper');

// In command implementation
const sessionId = getSessionId('command_type');
const contextPath = path.join('.claude/tasks', `context_session_${sessionId}.md`);
```

## For Agents

Agents should read the current context using helper functions:

```javascript
const { readCurrentContext } = require('./cli/lib/session-helper');

// In agent code
const context = readCurrentContext();
if (context) {
  console.log(`Working with session: ${context.sessionId}`);
  console.log(`Status: ${context.status}`);
  // Use context.content for the full markdown
} else {
  console.log('No context session found, starting fresh');
}
```

## Environment Variables

The system checks these environment variables in order:
1. `CLAUDE_SESSION_ID` - Primary Claude session identifier
2. `ANTHROPIC_SESSION_ID` - Alternative Anthropic identifier
3. `CLAUDE_CONVERSATION_ID` - Legacy conversation ID
4. `CLAUDE_CONV_ID` - Short form conversation ID

## File Naming Convention

Context session files follow this pattern:
- Location: `.claude/tasks/`
- Filename: `context_session_[session_id].md`
- Example: `context_session_claude_abc123def456_wave.md`

## Session Discovery

When the specific session ID is unknown, agents use this fallback logic:
1. Try to get current session ID from environment
2. Look for specific file: `context_session_${sessionId}.md`
3. If not found, find most recent `context_session_*.md` file
4. Return null if no context sessions exist

## Testing

Run these tests to verify the system:

```bash
# Test session helper functions
node /tmp/test_session_ids.js

# Test context reading
node /tmp/test_context_reading.js

# Test real-world scenarios
node /tmp/test_real_scenario.js

# Run full test suite
npm test
```

## Migration from Timestamps

The system automatically rejects old timestamp-based IDs:
- Old format: `20250122_103045_init` ❌
- New format: `claude_abc123_init` ✅

The `isValidSessionId()` function returns `false` for timestamp formats.

## Best Practices

1. **Commands**: Always use `getSessionId()` when creating new sessions
2. **Agents**: Use `readCurrentContext()` to access session information
3. **Never hardcode**: Don't hardcode session IDs or use timestamps
4. **Environment aware**: Check for `CLAUDE_SESSION_ID` in environment
5. **Graceful fallback**: Handle cases where no context exists

## API Reference

### `getSessionId(suffix?: string): string`
Generate or retrieve the current session ID with optional suffix.

### `getCurrentContextSession(tasksDir?: string): string|null`
Find the path to the current context session file.

### `readCurrentContext(tasksDir?: string): object|null`
Read and parse the current context session with metadata.

### `isValidSessionId(sessionId: string): boolean`
Check if a session ID follows the correct format (not timestamp).

### `formatSessionId(sessionId: string): string`
Format a session ID for display (truncates long IDs).

## Troubleshooting

### Issue: Old timestamp files still exist
**Solution**: These are ignored by the validation system. They can be safely deleted.

### Issue: Multiple sessions in `.claude/tasks/`
**Solution**: The system uses the current session ID first, then falls back to most recent.

### Issue: No CLAUDE_SESSION_ID available
**Solution**: System generates a unique hex ID as fallback. This is normal for local testing.

### Issue: Agents can't find context
**Solution**: Ensure agents use `readCurrentContext()` helper, not manual file searching.