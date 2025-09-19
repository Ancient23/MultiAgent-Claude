---
description: "Visual UI development iteration using Playwright MCP for screenshot comparison and responsive testing"
argument-hint: "[mock-file-path] [--viewport mobile|desktop|tablet] [--threshold 0.05] [--iterations 3]"
allowed-tools: ["Read", "Write", "Bash", "Edit", "MultiEdit", "playwright_navigate", "playwright_screenshot", "playwright_set_viewport", "playwright_evaluate"]
model: "sonnet"
---

# /visual-iterate

## Variables

- **USER_PROMPT**: `$ARGUMENTS` - Mock file path and visual iteration requirements
- **$ARGUMENTS**: Parsed command arguments including mock path, viewport options, and iteration settings
- **OUTPUT_DIR**: `.claude/visual-iterations/` - Directory for baseline and iteration screenshots
- **SESSION_ID**: Generated from `getSessionId('visual_iterate_[timestamp]')` - Unique session identifier
- **CONTEXT_FILE**: `.claude/tasks/context_session_${SESSION_ID}.md` - Session context tracking
- **MOCK_FILE**: Extracted from arguments - Target design mock for comparison
- **BASE_URL**: `http://localhost:3000` - Development server URL
- **THRESHOLD**: `0.05` (5%) - Visual difference threshold for success
- **MAX_ITERATIONS**: `3` - Maximum iteration attempts
- **VIEWPORTS**: Default responsive breakpoints for testing

## Instructions

This command implements visual UI development iteration using Playwright MCP tools for:

1. **Baseline Capture**: Screenshot current implementation state
2. **Mock Comparison**: Compare against provided design mock
3. **Iterative Improvement**: Make code changes and re-capture
4. **Responsive Testing**: Validate across multiple viewport sizes
5. **Convergence Validation**: Ensure visual difference below threshold

### Prerequisites
- Playwright MCP server available and configured
- Development server running at BASE_URL
- Mock file exists in `.claude/mocks/` directory
- Visual iteration output directory exists

### Decision Points
- If mock file missing: Create placeholder and alert user
- If development server unreachable: Alert and provide setup instructions
- If threshold not met after MAX_ITERATIONS: Provide detailed analysis
- If responsive test fails: Focus on specific breakpoint issues

## Workflow

1. **Initialize Visual Session**
   - If no context_session_${SESSION_ID}.md exists:
     - Create new session context file
     - Document visual objectives from USER_PROMPT
     - Set up OUTPUT_DIR structure
   - STOP and alert user if Playwright MCP unavailable

2. **Validate Prerequisites**
   - Check if BASE_URL is accessible using playwright_navigate
   - Verify MOCK_FILE exists in `.claude/mocks/` directory
   - Create OUTPUT_DIR if missing
   - If critical dependencies missing:
     - Document issues in context
     - Provide setup instructions to user

3. **Capture Initial Baseline**
   - Navigate to BASE_URL using playwright_navigate
   - Set default viewport (1920x1080) using playwright_set_viewport
   - Capture baseline screenshot to `${OUTPUT_DIR}/baseline-${SESSION_ID}.png`
   - Document baseline metrics in context

4. **Analyze Mock Comparison**
   - Read and analyze MOCK_FILE
   - Identify key visual differences:
     - Layout discrepancies
     - Color variations
     - Typography differences
     - Component spacing issues
   - Document improvement priorities

5. **Execute Iteration Loop**
   - For iteration 1 to MAX_ITERATIONS:
     - Identify specific code changes needed
     - Make targeted improvements using Edit/MultiEdit tools
     - Navigate to refresh view using playwright_navigate
     - Capture iteration screenshot to `${OUTPUT_DIR}/iteration-${iteration}-${SESSION_ID}.png`
     - Evaluate visual difference percentage
     - If difference < THRESHOLD: Break loop (Success)
     - Update context with iteration progress

6. **Responsive Testing Validation**
   - For each viewport in [mobile: 375x667, tablet: 768x1024, desktop: 1920x1080]:
     - Set viewport using playwright_set_viewport
     - Navigate and capture screenshot
     - Compare against responsive mock (if available)
     - Document responsive issues
   - Generate responsive compatibility report

## Report

```markdown
# Visual Iteration Report: /visual-iterate

## Session Information
- **Session ID**: ${SESSION_ID}
- **Start Time**: [ISO timestamp]
- **End Time**: [ISO timestamp]
- **Status**: [Success|Failed|Partial]
- **Target Mock**: ${MOCK_FILE}

## Objectives
${USER_PROMPT}

## Visual Iteration Results
### Baseline Metrics
- **Initial Screenshot**: `${OUTPUT_DIR}/baseline-${SESSION_ID}.png`
- **Mock File**: `${MOCK_FILE}`
- **Initial Difference**: [percentage]%

### Iteration Progress
- **Iteration 1**: [difference]% - [improvements made]
- **Iteration 2**: [difference]% - [improvements made]
- **Iteration 3**: [difference]% - [improvements made]
- **Final Difference**: [percentage]%

## Implementation Summary
### Code Changes Made
- [file_path:line_numbers] - [visual improvement description]

### Screenshots Generated
- `baseline-${SESSION_ID}.png` - Initial state
- `iteration-1-${SESSION_ID}.png` - First improvement
- `iteration-2-${SESSION_ID}.png` - Second improvement
- `iteration-3-${SESSION_ID}.png` - Final state

### Playwright Commands Executed
- `playwright_navigate(${BASE_URL})` - [success/failure]
- `playwright_screenshot(...)` - [count] screenshots captured
- `playwright_set_viewport(...)` - [viewports] tested

## Responsive Testing Results
- **Mobile (375x667)**: [pass/fail] - [issues if any]
- **Tablet (768x1024)**: [pass/fail] - [issues if any]
- **Desktop (1920x1080)**: [pass/fail] - [issues if any]

## Verification Results
- **Threshold Met**: [Yes/No] (Target: ${THRESHOLD}%)
- **Visual Convergence**: [Yes/No]
- **Responsive Compatibility**: [Yes/No]
- **Performance Impact**: [metrics if applicable]

## Next Steps
[Recommended actions for further visual improvements]

## Archived Resources
- **Screenshots**: `${OUTPUT_DIR}/archive/session-${SESSION_ID}/`
- **Context**: `.ai/memory/sessions/archive/context_session_${SESSION_ID}.md`
```

## Control Flow Patterns

### Conditionals
```yaml
- If MOCK_FILE missing:
    Create placeholder mock
    Alert user for design input
  Else:
    Proceed with comparison

- If BASE_URL unreachable:
    Provide server setup instructions
    Wait for user confirmation
  Else:
    Continue with screenshot capture

- If visual difference < THRESHOLD:
    Mark as success
    Skip remaining iterations
  Else:
    Continue to next iteration

- If MAX_ITERATIONS reached:
    Generate detailed analysis report
    Recommend manual review
  Else:
    Provide success confirmation
```

### Iteration Loops
```yaml
- For iteration in range(1, MAX_ITERATIONS + 1):
    Identify visual gaps
    Make code improvements
    Capture new screenshot
    Calculate difference percentage
    Update context with progress

- For viewport in [mobile, tablet, desktop]:
    Set viewport dimensions
    Navigate and capture
    Compare with responsive mock
    Document compatibility issues

- For each identified improvement area:
    Make targeted code change
    Validate visual impact
    Document change effectiveness
```

### Parallel Orchestration
```yaml
- When multiple components need updates:
    parallel_improvements:
      - Header component styling
      - Main content layout
      - Footer positioning
    synchronization_point: "All components updated"

- When responsive issues span breakpoints:
    parallel_viewport_testing:
      - Mobile optimization
      - Tablet layout fixes
      - Desktop enhancement
    convergence_point: "All viewports validated"
```

## Error Handling

### Recoverable Errors
- Playwright navigation timeout: Retry with extended timeout
- Screenshot capture failure: Retry with different selector
- Mock file format issues: Provide format guidance
- Minor visual difference calculation errors: Recalculate with adjusted parameters

### Critical Errors
- Playwright MCP server unavailable: STOP and alert user
- Development server not running: STOP and provide setup instructions
- Output directory write permissions: STOP and request access resolution
- Context session corruption: STOP and request recovery

## Anti-Patterns to Avoid

❌ **Making changes without capturing baseline**
❌ **Skipping responsive testing validation**
❌ **Ignoring mock file format requirements**
❌ **Exceeding iteration limits without analysis**
❌ **Hardcoding viewport dimensions**

## Usage Examples

```bash
# Basic visual iteration
/visual-iterate "dashboard-layout.png"

# With specific viewport focus
/visual-iterate "mobile-nav.png" --viewport mobile

# Custom threshold and iterations
/visual-iterate "hero-section.png" --threshold 0.03 --iterations 5

# Multiple viewport testing
/visual-iterate "responsive-grid.png" --viewport all --threshold 0.02
```

## Related Commands
- `/implement` - Direct plan execution for visual changes
- `/playwright-test` - Comprehensive visual regression testing
- `/ui-audit` - Visual design system compliance
- `/responsive-test` - Multi-device compatibility validation