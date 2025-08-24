const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class VisualBaselineManager {
  constructor(options = {}) {
    this.baselineDir = options.baselineDir || path.join(process.cwd(), '.playwright', 'baseline');
    this.updateMode = process.env.UPDATE_SNAPSHOTS === 'true' || options.updateBaselines || false;
    this.ciMode = process.env.CI === 'true';
    this.diffThreshold = options.diffThreshold || 0.01; // 1% difference threshold
  }
  
  async ensureBaselineDirectory() {
    await fs.mkdir(this.baselineDir, { recursive: true });
  }
  
  async getBaselinePath(name) {
    // Sanitize name for cross-platform compatibility
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.baselineDir, `${sanitizedName}.png`);
  }
  
  async getBaseline(name) {
    const baselinePath = await this.getBaselinePath(name);
    
    if (this.updateMode) {
      // In update mode, return null to force new baseline
      return null;
    }
    
    try {
      const buffer = await fs.readFile(baselinePath);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Baseline doesn't exist
        return null;
      }
      throw error;
    }
  }
  
  async saveBaseline(name, buffer) {
    await this.ensureBaselineDirectory();
    const baselinePath = await this.getBaselinePath(name);
    await fs.writeFile(baselinePath, buffer);
    
    // Also save metadata
    const metadataPath = baselinePath.replace('.png', '.json');
    const metadata = {
      name,
      timestamp: new Date().toISOString(),
      size: buffer.length,
      hash: crypto.createHash('md5').update(buffer).digest('hex'),
      updateMode: this.updateMode,
      ci: this.ciMode
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }
  
  async compareSnapshots(actual, baseline, options = {}) {
    if (!baseline) {
      // No baseline exists, save the actual as new baseline
      return {
        match: false,
        reason: 'no_baseline',
        shouldUpdate: true
      };
    }
    
    // Simple byte comparison for basic testing
    // In production, use a library like pixelmatch or looks-same
    const actualHash = crypto.createHash('md5').update(actual).digest('hex');
    const baselineHash = crypto.createHash('md5').update(baseline).digest('hex');
    
    if (actualHash === baselineHash) {
      return {
        match: true,
        difference: 0
      };
    }
    
    // For more sophisticated comparison, calculate pixel difference
    // This is a simplified version - real implementation would use pixelmatch
    const sizeDiff = Math.abs(actual.length - baseline.length) / baseline.length;
    
    if (sizeDiff > this.diffThreshold) {
      return {
        match: false,
        difference: sizeDiff,
        reason: 'size_mismatch',
        actualSize: actual.length,
        baselineSize: baseline.length
      };
    }
    
    // If sizes are similar but hashes differ, it's likely a small visual change
    return {
      match: false,
      difference: sizeDiff,
      reason: 'content_mismatch',
      actualHash,
      baselineHash
    };
  }
  
  async getDiffPath(name) {
    const diffDir = path.join(process.cwd(), 'test-results', 'visual-diffs');
    await fs.mkdir(diffDir, { recursive: true });
    
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(diffDir, `${sanitizedName}-diff.png`);
  }
  
  async saveDiff(name, diffBuffer) {
    const diffPath = await this.getDiffPath(name);
    await fs.writeFile(diffPath, diffBuffer);
    return diffPath;
  }
  
  async cleanupDiffs() {
    const diffDir = path.join(process.cwd(), 'test-results', 'visual-diffs');
    try {
      await fs.rm(diffDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
  }
  
  async listBaselines() {
    try {
      const files = await fs.readdir(this.baselineDir);
      return files
        .filter(f => f.endsWith('.png'))
        .map(f => f.replace('.png', ''));
    } catch {
      return [];
    }
  }
  
  async getBaselineMetadata(name) {
    const baselinePath = await this.getBaselinePath(name);
    const metadataPath = baselinePath.replace('.png', '.json');
    
    try {
      const content = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  
  async removeBaseline(name) {
    const baselinePath = await this.getBaselinePath(name);
    const metadataPath = baselinePath.replace('.png', '.json');
    
    try {
      await fs.unlink(baselinePath);
      await fs.unlink(metadataPath);
      return true;
    } catch {
      return false;
    }
  }
  
  async removeOutdatedBaselines(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    const baselines = await this.listBaselines();
    const now = Date.now();
    let removed = 0;
    
    for (const baseline of baselines) {
      const metadata = await this.getBaselineMetadata(baseline);
      if (metadata && metadata.timestamp) {
        const age = now - new Date(metadata.timestamp).getTime();
        if (age > maxAge) {
          if (await this.removeBaseline(baseline)) {
            removed++;
          }
        }
      }
    }
    
    return removed;
  }
  
  // Helper for CI to check if baselines need updating
  async needsBaselineUpdate(name) {
    const metadata = await this.getBaselineMetadata(name);
    
    if (!metadata) {
      return true; // No baseline exists
    }
    
    // Check if baseline is too old (7 days)
    const age = Date.now() - new Date(metadata.timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    
    return age > maxAge;
  }
  
  // Generate HTML report for visual differences
  async generateDiffReport(results) {
    const reportPath = path.join(process.cwd(), 'test-results', 'visual-report.html');
    const reportDir = path.dirname(reportPath);
    await fs.mkdir(reportDir, { recursive: true });
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Regression Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .result { border: 1px solid #ddd; margin: 20px 0; padding: 15px; }
    .pass { background: #e7f5e7; }
    .fail { background: #ffe7e7; }
    .info { color: #666; font-size: 0.9em; }
    .images { display: flex; gap: 20px; margin-top: 10px; }
    .image-container { flex: 1; }
    .image-container img { max-width: 100%; border: 1px solid #ccc; }
    .label { font-weight: bold; margin-bottom: 5px; }
  </style>
</head>
<body>
  <h1>Visual Regression Test Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <p>Total Tests: ${results.length}</p>
  <p>Passed: ${results.filter(r => r.passed).length}</p>
  <p>Failed: ${results.filter(r => !r.passed).length}</p>
  
  ${results.map(result => `
    <div class="result ${result.passed ? 'pass' : 'fail'}">
      <h2>${result.name}</h2>
      <p>Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}</p>
      ${result.reason ? `<p class="info">Reason: ${result.reason}</p>` : ''}
      ${result.difference ? `<p class="info">Difference: ${(result.difference * 100).toFixed(2)}%</p>` : ''}
      
      ${result.images ? `
        <div class="images">
          ${result.images.baseline ? `
            <div class="image-container">
              <div class="label">Baseline</div>
              <img src="${result.images.baseline}" alt="Baseline">
            </div>
          ` : ''}
          ${result.images.actual ? `
            <div class="image-container">
              <div class="label">Actual</div>
              <img src="${result.images.actual}" alt="Actual">
            </div>
          ` : ''}
          ${result.images.diff ? `
            <div class="image-container">
              <div class="label">Difference</div>
              <img src="${result.images.diff}" alt="Difference">
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
    
    await fs.writeFile(reportPath, html);
    return reportPath;
  }
}

module.exports = { VisualBaselineManager };