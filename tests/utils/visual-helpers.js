const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const zlib = require('zlib');

class VisualBaselineManager {
  constructor(options = {}) {
    this.baselineDir = options.baselineDir || path.join(process.cwd(), '.playwright', 'baseline');
    this.testMode = options.testMode || false; // Add testMode support
    this.updateMode = (process.env.UPDATE_SNAPSHOTS === 'true' || options.updateBaselines || false) && !this.testMode;
    this.ciMode = process.env.CI === 'true';
    this.diffThreshold = options.diffThreshold || 0.01; // 1% difference threshold
    this.compressionEnabled = options.compression !== false; // Enable by default
    this.maxBaselineSize = options.maxBaselineSize || 100 * 1024 * 1024; // 100MB default
    this.tempFiles = new Set(); // Track temporary files for cleanup
    
    // Setup cleanup on process exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => { this.cleanup(); process.exit(); });
    process.on('SIGTERM', () => { this.cleanup(); process.exit(); });
  }
  
  async ensureBaselineDirectory() {
    await fs.mkdir(this.baselineDir, { recursive: true });
  }
  
  // Cleanup temporary files
  cleanup() {
    for (const tempFile of this.tempFiles) {
      try {
        require('fs').unlinkSync(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    this.tempFiles.clear();
  }
  
  // Add file to cleanup list
  addTempFile(filepath) {
    this.tempFiles.add(filepath);
  }
  
  // Remove file from cleanup list
  removeTempFile(filepath) {
    this.tempFiles.delete(filepath);
  }
  
  // Compress buffer if compression is enabled and beneficial
  async maybeCompress(buffer) {
    if (!this.compressionEnabled || buffer.length < 1024) {
      // Don't compress small files
      return { compressed: false, data: buffer };
    }
    
    try {
      const gzip = promisify(zlib.gzip);
      const compressed = await gzip(buffer);
      
      // Only use compression if it saves significant space
      if (compressed.length < buffer.length * 0.9) {
        return { compressed: true, data: compressed };
      } else {
        return { compressed: false, data: buffer };
      }
    } catch (error) {
      // Fall back to uncompressed on error
      return { compressed: false, data: buffer };
    }
  }
  
  // Decompress buffer if needed
  async maybeDecompress(buffer, isCompressed) {
    if (!isCompressed) {
      return buffer;
    }
    
    try {
      const gunzip = promisify(zlib.gunzip);
      return await gunzip(buffer);
    } catch (error) {
      throw new Error(`Failed to decompress baseline data: ${error.message}`);
    }
  }
  
  // Check and enforce storage limits
  async checkStorageLimits() {
    try {
      const files = await fs.readdir(this.baselineDir);
      let totalSize = 0;
      
      for (const file of files) {
        if (file.endsWith('.png')) {
          const filepath = path.join(this.baselineDir, file);
          const stats = await fs.stat(filepath);
          totalSize += stats.size;
        }
      }
      
      if (totalSize > this.maxBaselineSize) {
        console.warn(`Warning: Baseline storage (${Math.round(totalSize / 1024 / 1024)}MB) exceeds limit (${Math.round(this.maxBaselineSize / 1024 / 1024)}MB)`);
        
        // Clean up old baselines automatically
        const removed = await this.removeOutdatedBaselines(7 * 24 * 60 * 60 * 1000); // 7 days
        if (removed > 0) {
          console.log(`Cleaned up ${removed} old baseline files`);
        }
      }
    } catch (error) {
      // Don't fail on storage limit check errors
      console.warn(`Could not check storage limits: ${error.message}`);
    }
  }
  
  async getBaselinePath(name) {
    // Sanitize name for cross-platform compatibility
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.baselineDir, `${sanitizedName}.png`);
  }
  
  async getBaseline(name) {
    const baselinePath = await this.getBaselinePath(name);
    
    // In test mode, always try to read the baseline
    // In update mode (but not test mode), return null to force new baseline
    if (this.updateMode && !this.testMode) {
      // In update mode, return null to force new baseline
      return null;
    }
    
    try {
      const buffer = await fs.readFile(baselinePath);
      
      // Check if the baseline is compressed
      const metadataPath = baselinePath.replace('.png', '.json');
      let isCompressed = false;
      
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        isCompressed = metadata.compressed || false;
      } catch (error) {
        // If metadata is missing or corrupted, assume uncompressed
        // This provides backward compatibility
      }
      
      // Decompress if needed
      return await this.maybeDecompress(buffer, isCompressed);
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
    
    // Check storage limits before saving
    await this.checkStorageLimits();
    
    const baselinePath = await this.getBaselinePath(name);
    
    // Optionally compress the buffer
    const { compressed, data } = await this.maybeCompress(buffer);
    await fs.writeFile(baselinePath, data);
    
    // Also save metadata
    const metadataPath = baselinePath.replace('.png', '.json');
    const metadata = {
      name,
      timestamp: new Date().toISOString(),
      originalSize: buffer.length,
      compressedSize: data.length,
      compressed,
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