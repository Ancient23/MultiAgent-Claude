# Agent Context Reading Pattern

## The Problem

Agents are markdown templates that describe what they should do, but they don't have actual code execution capability. When an agent template says "Check .claude/tasks/context_session_[session_id].md", it **cannot know the actual session_id** because:

1. Agents are invoked by the parent Claude instance via the Task tool
2. The session ID is determined at runtime by Claude
3. Agents don't have access to environment variables or the session helper functions

## The Solution

Agents should use a **discovery pattern** to find context files:

### ❌ Wrong Pattern (Cannot Work)
```markdown
## Core Workflow
1. Check if .claude/tasks/context_session_[session_id].md exists for full context
```

The agent has no way to know what `[session_id]` actually is!

### ✅ Correct Pattern (Works)
```markdown
## Core Workflow
1. Check .claude/tasks/ for the most recent context_session_*.md file for full context
```

This tells the parent Claude to look for ANY context_session file, which it can find.

## How It Works in Practice

When Claude executes an agent via the Task tool:

1. **Claude reads the agent template** from `.claude/agents/` or `Examples/agents/`

2. **Claude interprets the instruction** "Check .claude/tasks/ for the most recent context_session_*.md file"

3. **Claude uses its file reading tools** to:
   - List files in `.claude/tasks/`
   - Find files matching `context_session_*.md`
   - Read the most recent one based on modification time

4. **Claude incorporates the context** into the agent's working memory

5. **Agent proceeds with its task** using the context information

## Implementation in Agent Templates

All agent templates should follow this pattern:

```markdown
## Core Workflow
1. Check .claude/tasks/ for the most recent context_session_*.md file for full context
2. [Rest of workflow steps...]

## Rules
- Before doing any work, check .claude/tasks/ for any context_session_*.md files
- [Other rules...]
```

## Why Not Use Specific Session IDs?

While the orchestrating Claude instance knows the session ID (via `getSessionId()`), this information cannot be passed to agent templates because:

1. **Templates are static** - They're markdown files, not executable code
2. **No variable substitution** - The Task tool doesn't replace placeholders
3. **Agents run in isolation** - They don't share environment with the parent

## Best Practices for Agents

### DO ✅
- Look for "the most recent context_session_*.md file"
- Check if any context_session files exist before reading
- Handle cases where no context exists gracefully
- Read from `.claude/tasks/` directory

### DON'T ❌
- Reference specific session IDs like `context_session_[session_id].md`
- Assume a context file always exists
- Try to generate or determine session IDs
- Hard-code any session identifiers

## For Claude (Parent Instance)

When Claude is orchestrating and calling agents:

1. **Create context with specific ID**: Use `getSessionId()` from session-helper
2. **Write to specific file**: `context_session_${sessionId}.md`
3. **Let agents discover**: They'll find it via wildcard search

Example:
```javascript
const { getSessionId } = require('./cli/lib/session-helper');
const sessionId = getSessionId('task_type');
const contextPath = `.claude/tasks/context_session_${sessionId}.md`;
// Create context file...

// Then invoke agent - it will find the context via wildcard search
```

## Testing

To verify agents can find context:

1. Create a context session file with any ID
2. Invoke an agent via Task tool
3. Agent should find and use the context
4. Check agent's output references the context

## Summary

- **Agents use wildcards** (`context_session_*.md`) because they can't know specific IDs
- **Parent Claude uses specific IDs** when creating files
- **Discovery pattern** allows agents to find the right context
- **Most recent file** is used when multiple contexts exist

This pattern ensures agents can always find their context regardless of how the session was created or what ID was used.