---
source: claude-code
created_by: assistant
created_at: 2025-01-25T10:00:00Z
version: 1.0
status: active
---

# Implementation Plan: Enable URL Configuration and Vercel Preview Detection for Visual CI Testing

## Overview
Implement a system that allows projects to either provide a URL for visual CI testing or automatically detect Vercel preview deployments.

## Key Findings from Research
1. **Current State**: The `playwright-web-tests.yml` workflow uses `BASE_URL` from secrets or defaults to `localhost:3000`
2. **Visual comparison utilities** exist in `cli/utils/visual-compare.js` for local development
3. **CI testing patterns** are documented with 4-way sharding and blob reporter
4. **No current Vercel integration** for automatic preview URL detection

## Implementation Plan

### Phase 1: Environment Configuration Enhancement
1. **Update workflow template** (`templates/workflows/playwright-web-tests.yml`):
   - Add `VERCEL_TOKEN` secret support
   - Add `DEPLOYMENT_URL` environment variable
   - Add automatic Vercel preview detection step
   - Add fallback URL resolution logic

2. **Create Vercel detection utility** (`cli/utils/vercel-preview.js`):
   - Detect if PR has Vercel deployment
   - Extract preview URL from GitHub API
   - Validate URL accessibility
   - Return deployment information

### Phase 2: CLI Integration
1. **Enhance init command** to prompt for deployment strategy:
   - Manual URL configuration
   - Vercel automatic detection
   - Custom deployment provider

2. **Add deployment configuration** to project setup:
   - Store deployment preferences in `.claude/config/deployment.json`
   - Support multiple deployment targets
   - Include visual testing URL patterns

### Phase 3: GitHub Actions Workflow Updates
1. **Add deployment detection job**:
   ```yaml
   detect-deployment:
     runs-on: ubuntu-latest
     outputs:
       url: ${{ steps.detect.outputs.url }}
     steps:
       - Detect Vercel deployment via GitHub API
       - Check deployment status comments
       - Extract preview URL
       - Validate URL is accessible
   ```

2. **Update test job** to use detected URL:
   - Pass deployment URL to Playwright tests
   - Configure BASE_URL dynamically
   - Support both preview and production URLs

### Phase 4: Vercel Integration
1. **Create Vercel integration module**:
   - Check for Vercel bot comments on PR
   - Parse deployment URLs from comments
   - Monitor deployment status
   - Wait for deployment to be ready

2. **Add retry logic** for deployment readiness:
   - Poll deployment URL until ready
   - Timeout after configurable period
   - Fall back to manual URL if needed

### Phase 5: Visual Testing Integration
1. **Update visual comparison workflow**:
   - Use deployment URL for screenshot capture
   - Support multiple viewport testing against live URL
   - Compare with baseline images

2. **Add CI-specific visual commands**:
   - `mac visual:ci-setup` - Configure CI visual testing
   - `mac visual:detect-url` - Test URL detection locally
   - Support environment-specific baselines

### Phase 6: Documentation and Templates
1. **Create setup documentation**:
   - How to configure Vercel integration
   - Manual URL configuration guide
   - Troubleshooting deployment detection

2. **Add example configurations**:
   - Vercel project setup
   - GitHub secrets configuration
   - Visual testing with deployment URLs

## Files to Create/Modify

### New Files
- `/cli/utils/vercel-preview.js` - Vercel preview detection utility
- `/cli/commands/visual-ci.js` - CI visual testing commands
- `/templates/config/deployment.json` - Deployment configuration template
- `/.ai/memory/patterns/deployment-detection-pattern.md` - Document the pattern

### Files to Modify
- `/templates/workflows/playwright-web-tests.yml` - Add deployment detection
- `/cli/commands/init.js` - Add deployment configuration prompts
- `/cli/commands/add.js` - Support adding deployment config to existing projects
- `/CLAUDE.md` - Document deployment detection capabilities

## Configuration Schema
```json
{
  "deployment": {
    "provider": "vercel|custom|manual",
    "autoDetect": true,
    "vercel": {
      "projectName": "string",
      "teamId": "string (optional)"
    },
    "fallbackUrl": "http://localhost:3000",
    "waitTimeout": 300000,
    "retryInterval": 5000
  },
  "visualTesting": {
    "enableOnCI": true,
    "viewports": ["mobile", "desktop"],
    "threshold": 0.05
  }
}
```

## Environment Variables
- `VERCEL_TOKEN` - For API access (optional)
- `DEPLOYMENT_URL` - Manual override
- `VISUAL_TEST_URL` - Specific URL for visual tests
- `GITHUB_TOKEN` - Already available in Actions

## Success Criteria
1. ✅ Automatic detection of Vercel preview URLs from PR comments
2. ✅ Manual URL configuration option
3. ✅ Visual tests run against deployment URL
4. ✅ Fallback to localhost if no deployment found
5. ✅ Clear documentation and examples
6. ✅ Works with existing 4-way sharding strategy

## Testing Plan
1. Test with actual Vercel deployment
2. Test manual URL configuration
3. Test fallback scenarios
4. Verify visual comparison against live URLs
5. Test timeout and retry logic

## Implementation Priority
1. **High**: Vercel detection utility and workflow updates
2. **High**: CLI integration for configuration
3. **Medium**: Visual testing integration
4. **Low**: Documentation and examples

This implementation will enable seamless visual testing on CI against actual deployments while maintaining flexibility for different deployment strategies.