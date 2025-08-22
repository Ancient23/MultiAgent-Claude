# Context Session File Patterns - Correct Usage

## Command Templates

Commands are executed by the main Claude instance which has access to the session helper functions.

### Creating Context Files
```yaml
# Correct pattern for commands creating files:
actions:
  - Generate session ID: getSessionId('command_name')
  - Create/update .claude/tasks/context_session_${sessionId}.md
output: .claude/tasks/context_session_${sessionId}.md
```

### Reading Context Files
```yaml
# Commands reading existing context:
actions:
  - Find existing context: getCurrentContextSession('.claude/tasks')
  - Read content: readCurrentContext('.claude/tasks')
```

### Passing Context to Agents
```javascript
// When invoking agents, pass the actual file path:
invoke_agent(
  agent: "specialist-name",
  context: contextFilePath, // Actual path from getCurrentContextSession()
  task: "...",
  expect_output: ".claude/doc/..."
)
```

## Agent Templates

Agents are static markdown templates that cannot execute code or know session IDs.

### Reading Context Files
```markdown
## Core Workflow
1. Check .claude/tasks/ for the most recent context_session_*.md file for full context
```

Agents MUST use:
- Wildcard patterns: `context_session_*.md`
- Discovery instructions: "Check .claude/tasks/ for the most recent..."
- Never use: `context_session_[session_id].md` (they can't know the ID)

## Key Differences

| Action | Commands | Agents |
|--------|----------|--------|
| Creating files | Use `${sessionId}` from getSessionId() | N/A - agents don't create context files |
| Reading files | Use getCurrentContextSession() or wildcards | Use wildcards and "most recent" pattern |
| Knowing session ID | Yes - via getSessionId() | No - must discover via wildcards |

## Examples

### ✅ CORRECT Command Creating Context
```yaml
- Generate session ID: getSessionId('wave')
- Create .claude/tasks/context_session_${sessionId}.md
```

### ✅ CORRECT Agent Reading Context
```markdown
1. Check .claude/tasks/ for the most recent context_session_*.md file
```

### ❌ WRONG Agent Pattern
```markdown
1. Read .claude/tasks/context_session_[session_id].md  # Agent can't know the ID!
```

## Implementation Notes

1. The session-helper.js module provides:
   - `getSessionId(suffix)` - Gets Claude session ID or generates one
   - `getCurrentContextSession(dir)` - Finds most recent context file
   - `readCurrentContext(dir)` - Reads and parses context file

2. Commands use these functions when executed by Claude
3. Agents use wildcard patterns that Claude interprets when reading the template