# ADR: Visual Development with Playwright MCP

**Date**: 2025-01-24
**Status**: Accepted
**Context**: Local visual development for pixel-perfect UI implementation

## Decision

We will implement a local visual development system using Playwright MCP for real-time browser control and iteration, enabling Claude Code to achieve pixel-perfect UI matching with design mocks.

## Context

The need arose for a system that allows Claude Code to:
1. Visually iterate on UI components to match design mocks
2. Achieve < 5% visual difference threshold
3. Test responsive designs across viewports
4. Document iteration history and improvements

## Considered Options

### Option 1: CI-Only Visual Testing
- **Pros**: Automated, consistent environment
- **Cons**: No real-time iteration, slow feedback loop
- **Decision**: Rejected for primary development, kept for regression

### Option 2: Static Screenshot Comparison
- **Pros**: Simple implementation
- **Cons**: No interaction capability, manual process
- **Decision**: Rejected due to lack of automation

### Option 3: Playwright MCP Integration (Selected)
- **Pros**: Real-time control, automated iteration, direct CSS injection
- **Cons**: Requires local MCP server
- **Decision**: Selected for optimal developer experience

## Implementation Details

### Architecture Components

1. **MCP Integration**
   - Playwright MCP server for browser control
   - Direct access to DOM manipulation
   - Screenshot capture capabilities

2. **Visual Comparison Engine**
   - pixelmatch for pixel-level comparison
   - sharp for image processing
   - Configurable threshold (default 5%)

3. **Directory Structure**
   ```
   .claude/
   ├── mocks/           # Design references
   ├── visual-iterations/   # Progress tracking
   ├── visual-sessions/     # Session management
   └── visual-reports/      # Comparison reports
   ```

4. **Workflow Commands**
   - `/visual-iterate` - Main iteration command
   - `mac visual-setup` - Environment setup
   - `mac visual-compare` - Image comparison
   - `mac visual-report` - Report generation

### Technology Choices

#### pixelmatch for Comparison
- **Reason**: Lightweight, accurate pixel comparison
- **Alternatives**: Resemble.js (heavier), looks-same (less accurate)
- **Benefits**: Fast, configurable threshold, anti-aliasing support

#### sharp for Image Processing
- **Reason**: High-performance Node.js image processing
- **Alternatives**: jimp (slower), canvas (complex setup)
- **Benefits**: Fast, comprehensive format support

#### Playwright MCP for Browser Control
- **Reason**: Native MCP integration, comprehensive API
- **Alternatives**: Puppeteer (no MCP), Selenium (complex)
- **Benefits**: Direct Claude Code integration, reliable

## Consequences

### Positive
- ✅ Enables pixel-perfect UI development
- ✅ Reduces iteration time from hours to minutes
- ✅ Provides measurable quality metrics
- ✅ Documents all iteration attempts
- ✅ Supports responsive design testing
- ✅ Integrates seamlessly with existing CLI

### Negative
- ❌ Requires local development environment
- ❌ Depends on MCP server availability
- ❌ Adds dependencies (sharp, pixelmatch, pngjs)
- ❌ Not suitable for CI/CD pipelines

### Neutral
- 🔄 Requires design mocks in specific format
- 🔄 Learning curve for visual iteration workflow
- 🔄 Additional storage for screenshots

## Success Metrics

1. **Efficiency**: < 5 iterations to achieve match
2. **Accuracy**: < 5% visual difference achievable
3. **Speed**: < 10 minutes per component
4. **Coverage**: All viewports testable
5. **Documentation**: Automatic report generation

## Migration Path

### From Manual Development
1. Install visual dependencies
2. Run `mac visual-setup`
3. Add design mocks
4. Use `/visual-iterate` command

### From Existing Visual Testing
1. Convert existing baselines to mocks
2. Update test scripts to use new utilities
3. Integrate with existing CI/CD

## Security Considerations

- No sensitive data in screenshots
- Local-only execution (no cloud services)
- Configurable dev server URL
- No automatic uploads

## Maintenance

### Regular Tasks
- Clean old iteration sessions (7 days)
- Update baselines when designs change
- Monitor storage usage
- Update dependencies quarterly

### Upgrade Path
- pixelmatch: Follow major versions
- sharp: Update for security patches
- Playwright: Stay within MCP compatibility

## Related Decisions

- [ADR: MCP Server Integration](./adr-mcp-integration.md)
- [ADR: Testing Framework Selection](./adr-testing-framework.md)
- [ADR: CLI Architecture](./adr-cli-architecture.md)

## References

- [Playwright MCP Documentation](https://github.com/playwright/mcp)
- [pixelmatch Algorithm](https://github.com/mapbox/pixelmatch)
- [Visual Regression Best Practices](https://playwright.dev/docs/test-snapshots)

## Review Notes

- Reviewed by: System Architect
- Approved: 2025-01-24
- Next Review: Q2 2025

## Appendix

### Sample Configuration
```json
{
  "iterationGoal": 0.05,
  "maxIterations": 10,
  "defaultViewports": {
    "mobile": { "width": 375, "height": 667 },
    "tablet": { "width": 768, "height": 1024 },
    "desktop": { "width": 1920, "height": 1080 }
  }
}
```

### Performance Benchmarks
- Image comparison: ~50ms per image pair
- Screenshot capture: ~200ms per capture
- CSS injection: ~10ms per operation
- Report generation: ~100ms per session