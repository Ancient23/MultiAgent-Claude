# /implement Command

**Trigger**: `/implement [type|plan] [path/options]`

**Purpose**: Execute implementation plans directly in current context as the main agent

## Help Mode

If command includes `-h` or `--help`, display this help information and exit:

```
/implement --help
/implement -h
```

### Quick Usage Examples

**Execute CI Testing Immediately:**
```
/implement ci-testing
```
→ Creates context session, loads CI testing LOP, executes all phases

**Implement from Plan:**
```
/implement plan .ai/memory/implementation-plans/my-plan.md
```
→ Reads plan directly, executes step by step

**Add Tests to Plan:**
```
/implement plan refactor.md --with-ci-tests
/implement plan feature.md --with-visual-tests
```
→ Executes plan then adds comprehensive tests

**Output-Only (Don't Execute):**
```
/implement ci-testing --output-only
```
→ Generates prompt file without executing

**Custom LOP:**
```
/implement custom --lop my-feature.yaml --priority HIGH
```
→ Uses custom LOP with overrides

### Available Types
- `ci-testing` - CI-compatible Playwright testing
- `visual-dev` - Local visual development with MCP
- `plan [path]` - Direct from markdown plan
- `custom --lop [path]` - Custom LOP file

### Options
- `--output-only` - Generate prompt without executing
- `--with-ci-tests` - Add CI testing phase
- `--with-visual-tests` - Add visual testing phase
- `--with-all-tests` - Add both test types
- `--priority [HIGH|MEDIUM|LOW]` - Override priority
- `--minimal` - Essential phases only
- `-h, --help` - Show this help

## Default Behavior: Direct Execution

By default, this command EXECUTES implementations immediately in the current context:
- Creates context session file automatically
- Acts as the main orchestrating agent
- Implements the plan step by step
- No need to copy prompts to another session

## Command Modes

### 1. LOP-Based Implementation (Default: Execute)
```
/implement ci-testing
/implement visual-dev
/implement custom --lop my-feature.yaml
```
→ Creates context session → Loads LOP → Executes immediately

### 2. Plan-Based Implementation (Direct from Markdown)
```
/implement plan .ai/memory/implementation-plans/setup-init-browser-automation-plan.md
/implement plan visual-feature-plan.md --with-ci-tests
/implement plan refactor-plan.md --with-visual-tests
```
→ Creates context session → Reads plan → Executes with optional test generation

### 3. Output-Only Mode (Generate Prompt File)
```
/implement ci-testing --output-only
/implement visual-dev --save-prompt
/implement plan my-plan.md --generate-prompt
```
→ Generates prompt file → Saves to .claude/prompts/generated/ → Does NOT execute

## Execution Workflow

When you receive this command, follow these steps:

### Phase 1: Parse Command

```javascript
const mode = determineMode(command);
// 'lop-execute' | 'plan-execute' | 'output-only'

const options = parseOptions(command);
// { withCiTests, withVisualTests, outputOnly, lopPath, planPath }
```

### Phase 2: Create Context Session (Unless Output-Only)

```javascript
if (!options.outputOnly) {
  const sessionId = `${Date.now()}_${type}`;
  const sessionPath = `.claude/tasks/context_session_${sessionId}.md`;
  
  createContextSession({
    path: sessionPath,
    type: type,
    objectives: extractObjectives(source),
    status: 'Active'
  });
}
```

### Phase 3: Load Source

#### For LOP-based:
```javascript
const lopPath = determineLOPPath(type);
const lop = yaml.load(fs.readFileSync(lopPath));
const prompt = processLOPThroughHOP(lop);
```

#### For Plan-based:
```javascript
const plan = fs.readFileSync(planPath, 'utf8');
const implementation = {
  plan: plan,
  additionalTests: options.withCiTests || options.withVisualTests
};
```

### Phase 4: Add Optional Tests

If `--with-ci-tests`:
```javascript
addPhase({
  name: 'CI Test Implementation',
  tasks: [
    'Create tests/cli-playwright.spec.js',
    'Setup visual regression tests',
    'Configure GitHub Actions workflow',
    'Implement test utilities'
  ],
  agents: ['cli-test-engineer', 'playwright-test-engineer']
});
```

If `--with-visual-tests`:
```javascript
addPhase({
  name: 'Visual Test Implementation',
  tasks: [
    'Setup Playwright MCP',
    'Create visual comparison tools',
    'Implement iteration workflow',
    'Configure mock directories'
  ],
  agents: ['playwright-visual-developer']
});
```

### Phase 5: Execute or Output

#### Direct Execution (Default):
```javascript
// You are now the main agent
console.log('Starting implementation as main agent...');

// Update context session
updateContextSession('Phase 1 starting...');

// Execute each phase
for (const phase of implementation.phases) {
  console.log(`Executing: ${phase.name}`);
  
  // Deploy agents if specified
  if (phase.agents) {
    deployAgents(phase.agents);
  }
  
  // Execute tasks
  for (const task of phase.tasks) {
    executeTask(task);
    updateContextSession(`Completed: ${task}`);
  }
  
  // Mark phase complete
  updateContextSession(`Phase complete: ${phase.name}`);
}
```

#### Output-Only Mode:
```javascript
const outputPath = `.claude/prompts/generated/${type}-${timestamp}.md`;
fs.writeFileSync(outputPath, generatedPrompt);
console.log(`Prompt saved to: ${outputPath}`);
```

## Implementation Types

### CI Testing (`/implement ci-testing`)
- Creates comprehensive CI-compatible testing
- GitHub Actions workflows
- Visual regression with baselines
- No MCP required

### Visual Development (`/implement visual-dev`)
- Local browser iteration setup
- Playwright MCP integration
- Mock comparison workflow
- < 5% difference achievement

### Custom (`/implement custom --lop [path]`)
- Any valid LOP file
- Full validation before execution
- Custom agent deployment

### Plan (`/implement plan [path]`)
- Direct implementation from markdown plans
- No LOP/HOP processing needed
- Optional test addition

## Command Options

### Execution Control
- `--output-only` | `--save-prompt` | `--generate-prompt`: Don't execute, just generate
- `--dry-run`: Show what would be done without executing

### Test Addition
- `--with-ci-tests`: Add CI testing phase
- `--with-visual-tests`: Add visual testing phase
- `--with-all-tests`: Add both test types

### Customization
- `--lop [path]`: Use custom LOP file
- `--priority [HIGH|MEDIUM|LOW]`: Override priority
- `--minimal`: Reduce to essential phases only
- `--agents [names...]`: Include specific agents
- `--mcp [servers...]`: Add MCP servers

## Context Session Management

The command automatically manages context sessions:

```markdown
# Session Context: [Implementation Name]

**Session ID**: [timestamp]_[type]
**Date**: [ISO Date]
**Type**: implementation
**Status**: Active

## Objectives
[From plan or LOP]

## Current State
Wave 0: Initialization ✓
Wave 1: [Current phase]

## Files Modified
[List of changed files]

## Next Steps
[Upcoming tasks]
```

## Examples

### Execute CI Testing Immediately
```
/implement ci-testing
```
You: Create context session, load CI testing LOP, execute all phases

### Implement Plan with CI Tests
```
/implement plan .ai/memory/implementation-plans/refactor-plan.md --with-ci-tests
```
You: Read plan, add CI testing phase, execute everything

### Generate Prompt Only
```
/implement visual-dev --output-only
```
You: Generate prompt file, don't execute

### Custom LOP with Visual Tests
```
/implement custom --lop my-feature.yaml --with-visual-tests
```
You: Load custom LOP, add visual testing, execute

## Error Handling

- **Missing plan/LOP**: Suggest available options
- **Invalid path**: Show correct path format
- **Validation failure**: Display specific errors
- **Missing dependencies**: List required setup

## Success Criteria

When executing (default mode):
- ✅ Context session created and maintained
- ✅ All phases executed in order
- ✅ Agents deployed as specified
- ✅ Files created/modified as needed
- ✅ Tests passing (if applicable)
- ✅ Memory system updated
- ✅ Session marked complete

When outputting (--output-only):
- ✅ Valid prompt generated
- ✅ Saved to correct location
- ✅ Ready for manual execution

## Integration Notes

This command integrates with:
- LOP system (`mac lop execute` equivalent)
- Context session management
- Agent deployment system
- Memory system updates
- Test frameworks

## Direct Execution Checklist

When executing directly, ensure:
1. Create context session FIRST
2. Update session after EACH significant action
3. Deploy agents when specified
4. Execute ALL tasks (no stubs)
5. Run tests if generated
6. Update memory system
7. Mark session complete

## Help Display Logic

When command contains `-h` or `--help`:

```javascript
if (command.includes('-h') || command.includes('--help')) {
  displayHelp();
  return; // EXIT without executing
}

function displayHelp() {
  // Display the Quick Usage Examples section above
  // Show Available Types
  // Show Options
  // Do NOT execute any implementation
}
```

**IMPORTANT**: When help is requested, ONLY display help information and exit. Do not execute any implementation.