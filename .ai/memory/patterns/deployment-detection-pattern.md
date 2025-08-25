---
source: vercel-preview-implementation
created_by: assistant
created_at: 2025-01-25T10:00:00Z
version: 1.0
status: proven
confidence: high
---

# Deployment URL Detection Pattern for Visual CI Testing

## Overview
Pattern for automatically detecting deployment URLs (Vercel or custom) in CI/CD pipelines to enable visual regression testing against live deployments instead of localhost.

## Core Pattern

### 1. Multi-Source Detection Strategy
**Pattern**: Check multiple sources in priority order
```javascript
// Priority order:
1. Manual override (DEPLOYMENT_URL env var)
2. GitHub secrets (BASE_URL, VISUAL_TEST_URL)
3. Vercel preview detection (PR comments, deployments API)
4. Fallback to localhost
```

**Benefits**:
- Flexibility for different deployment strategies
- Graceful fallback when detection fails
- Support for both automatic and manual configuration

### 2. GitHub Actions Job Separation
**Pattern**: Separate deployment detection into its own job
```yaml
jobs:
  detect-deployment:
    runs-on: ubuntu-latest
    outputs:
      url: ${{ steps.detect.outputs.url }}
    steps:
      # Detection logic here
  
  test:
    needs: [detect-deployment]
    env:
      BASE_URL: ${{ needs.detect-deployment.outputs.url }}
```

**Benefits**:
- Clean separation of concerns
- Reusable detection logic
- Parallel test execution with shared URL

### 3. Vercel Bot Comment Parsing
**Pattern**: Parse Vercel bot comments for preview URLs
```javascript
const vercelComment = comments.find(comment => 
  comment.user.login === 'vercel[bot]' ||
  comment.body.includes('vercel.app')
);
const urlMatch = vercelComment?.body.match(/https?:\/\/[^\s\)]+\.vercel\.app/);
```

**Benefits**:
- Works without Vercel API token
- Reliable detection method
- Supports multiple Vercel configurations

### 4. Deployment Readiness Checking
**Pattern**: Poll deployment URL until ready
```bash
MAX_ATTEMPTS=60
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "^[23]"; then
    echo "Deployment ready!"
    exit 0
  fi
  sleep 5
done
```

**Benefits**:
- Prevents test failures from not-ready deployments
- Configurable timeout and retry intervals
- Clear feedback on deployment status

### 5. Configuration Schema
**Pattern**: Structured deployment configuration
```json
{
  "deployment": {
    "provider": "vercel|custom|manual",
    "autoDetect": true,
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

**Benefits**:
- Consistent configuration across projects
- Easy to understand and modify
- Supports multiple providers

## Implementation Checklist

### Required Files
- [ ] `/cli/utils/vercel-preview.js` - Detection utility
- [ ] `/cli/commands/visual-ci.js` - CLI commands
- [ ] `/templates/config/deployment.json` - Config template
- [ ] Updated `playwright-web-tests.yml` workflow

### GitHub Secrets
- [ ] `VERCEL_TOKEN` (optional, for API access)
- [ ] `DEPLOYMENT_URL` (manual override)
- [ ] `BASE_URL` (fallback URL)

### CLI Commands
- [ ] `mac visual:ci-setup` - Interactive configuration
- [ ] `mac visual:detect-url` - Test detection locally
- [ ] `mac visual:ci-status` - Show configuration

## Anti-Patterns to Avoid

### ❌ Hardcoding URLs
- Never hardcode deployment URLs in workflows
- Always use environment variables or detection

### ❌ Ignoring Deployment Readiness
- Don't start tests immediately after deployment
- Always wait for deployment to be accessible

### ❌ Single Detection Method
- Don't rely on only one detection method
- Implement fallback strategies

### ❌ Missing Error Handling
- Always handle detection failures gracefully
- Provide clear error messages

## Success Metrics

- **Detection Rate**: > 95% for Vercel deployments
- **Wait Time**: < 60 seconds average
- **Fallback Usage**: < 5% of runs
- **Configuration Time**: < 5 minutes setup

## Usage Examples

### Basic Setup
```bash
# Configure deployment detection
mac visual:ci-setup

# Test detection locally
mac visual:detect-url
```

### GitHub Actions Integration
```yaml
env:
  BASE_URL: ${{ needs.detect-deployment.outputs.url }}
  IS_VERCEL_PREVIEW: ${{ needs.detect-deployment.outputs.detected }}
```

### Manual Override
```yaml
env:
  DEPLOYMENT_URL: https://my-app-preview.vercel.app
```

## Troubleshooting

### No URL Detected
1. Check if Vercel bot has commented on PR
2. Verify GitHub token permissions
3. Check deployment status in GitHub UI
4. Use manual override as fallback

### Deployment Not Ready
1. Increase wait timeout
2. Check deployment logs
3. Verify deployment is successful
4. Test URL manually

### Wrong URL Detected
1. Check for multiple deployments
2. Verify regex patterns
3. Use manual override
4. Check provider configuration