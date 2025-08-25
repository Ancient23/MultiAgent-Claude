// Visual Comparison Utilities for MultiAgent-Claude
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Note: These packages need to be installed via npm
let sharp, pixelmatch, PNG;

try {
  sharp = require('sharp');
  pixelmatch = require('pixelmatch');
  PNG = require('pngjs').PNG;
} catch (error) {
  // Packages not installed yet - will be installed when visual:setup is run
}

class VisualComparer {
  constructor(config = {}) {
    this.threshold = config.threshold || 0.05; // 5% default
    this.config = config;
  }

  async compareImages(actualPath, expectedPath, options = {}) {
    if (!PNG || !pixelmatch) {
      throw new Error('Visual comparison packages not installed. Run: npm install sharp pixelmatch pngjs');
    }
    
    try {
      const actual = PNG.sync.read(await fs.promises.readFile(actualPath));
      const expected = PNG.sync.read(await fs.promises.readFile(expectedPath));
      
      const { width, height } = actual;
      
      // Check dimensions match
      if (width !== expected.width || height !== expected.height) {
        throw new Error(`Image dimensions don't match: ${width}x${height} vs ${expected.width}x${expected.height}`);
      }
      
      const diff = new PNG({ width, height });
      
      const numDiffPixels = pixelmatch(
        actual.data,
        expected.data,
        diff.data,
        width,
        height,
        {
          threshold: options.threshold || this.threshold,
          includeAA: options.includeAA !== false,
          alpha: options.alpha || 0.1,
          aaColor: [255, 255, 0], // Yellow for anti-aliasing
          diffColor: options.diffColor || [255, 0, 0], // Red for differences
          diffColorAlt: [0, 255, 0], // Green for alt differences
          diffMask: options.diffMask !== false
        }
      );
      
      const percentage = (numDiffPixels / (width * height)) * 100;
      
      // Save diff image
      const diffPath = actualPath.replace('.png', '-diff.png');
      await fs.promises.writeFile(diffPath, PNG.sync.write(diff));
      
      return {
        percentage: percentage.toFixed(2),
        pixelsDiff: numDiffPixels,
        totalPixels: width * height,
        diffPath,
        passed: percentage <= (this.threshold * 100),
        dimensions: { width, height }
      };
    } catch (error) {
      throw new Error(`Image comparison failed: ${error.message}`);
    }
  }
  
  async generateReport(sessionPath) {
    try {
      const sessionFile = path.join(sessionPath, 'session.json');
      if (!fs.existsSync(sessionFile)) {
        throw new Error(`Session file not found: ${sessionFile}`);
      }
      
      const sessionData = JSON.parse(
        await fs.promises.readFile(sessionFile, 'utf8')
      );
      
      const files = await fs.promises.readdir(sessionPath);
      const imageIterations = files.filter(f => f.endsWith('.png') && f.startsWith('iteration-'));
      
      // Sort iterations by number
      imageIterations.sort((a, b) => {
        const numA = parseInt(a.match(/iteration-(\d+)/)?.[1] || 0);
        const numB = parseInt(b.match(/iteration-(\d+)/)?.[1] || 0);
        return numA - numB;
      });
      
      const report = {
        session: sessionData,
        iterations: imageIterations.length,
        comparisons: [],
        finalResult: null,
        improvements: []
      };
      
      // Compare each iteration with the previous
      for (let i = 1; i < imageIterations.length; i++) {
        const prev = path.join(sessionPath, imageIterations[i - 1]);
        const curr = path.join(sessionPath, imageIterations[i]);
        
        try {
          const comparison = await this.compareImages(prev, curr);
          report.comparisons.push({
            from: imageIterations[i - 1],
            to: imageIterations[i],
            iteration: i,
            ...comparison
          });
          
          // Track improvements
          if (i > 1 && report.comparisons[i - 2]) {
            const prevDiff = parseFloat(report.comparisons[i - 2].percentage);
            const currDiff = parseFloat(comparison.percentage);
            if (currDiff < prevDiff) {
              report.improvements.push({
                iteration: i,
                improvement: (prevDiff - currDiff).toFixed(2),
                from: prevDiff.toFixed(2),
                to: currDiff.toFixed(2)
              });
            }
          }
        } catch (error) {
          console.error(chalk.yellow(`Warning: Failed to compare iteration ${i}: ${error.message}`));
        }
      }
      
      // Compare final with mock
      if (imageIterations.length > 0 && sessionData.mockPath && fs.existsSync(sessionData.mockPath)) {
        const final = path.join(sessionPath, imageIterations[imageIterations.length - 1]);
        try {
          report.finalResult = await this.compareImages(final, sessionData.mockPath);
          report.finalResult.iterationNumber = imageIterations.length;
        } catch (error) {
          console.error(chalk.yellow(`Warning: Failed to compare with mock: ${error.message}`));
        }
      }
      
      // Generate markdown report
      const reportMd = this.generateMarkdownReport(report);
      const reportName = `${sessionData.componentName || 'component'}-${sessionData.sessionId || Date.now()}-report.md`;
      const reportPath = path.join('.claude/visual-reports', reportName);
      
      // Ensure reports directory exists
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      await fs.promises.writeFile(reportPath, reportMd);
      
      return {
        ...report,
        reportPath
      };
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
  
  generateMarkdownReport(report) {
    const timestamp = new Date().toISOString();
    const status = report.finalResult?.passed ? '✅ PASSED' : '❌ FAILED';
    const threshold = (this.threshold * 100).toFixed(1);
    
    return `# Visual Iteration Report

**Session ID**: ${report.session.sessionId || 'Unknown'}
**Component**: ${report.session.componentName || 'Unknown'}
**Generated**: ${timestamp}
**Status**: ${status}

## Summary
- Total Iterations: ${report.iterations}
- Final Difference: ${report.finalResult?.percentage || 'N/A'}%
- Threshold: ${threshold}%
- Improvements: ${report.improvements.length}
- Session Duration: ${this.calculateDuration(report.session)}

## Iteration Progress
${report.comparisons.length > 0 ? report.comparisons.map((comp, i) => `
### Iteration ${comp.iteration}
- **Difference**: ${comp.percentage}%
- **Pixels Changed**: ${comp.pixelsDiff.toLocaleString()} / ${comp.totalPixels.toLocaleString()}
- **Status**: ${comp.passed ? '✅ Within threshold' : '❌ Exceeds threshold'}
- **Dimensions**: ${comp.dimensions.width}x${comp.dimensions.height}
${comp.diffPath ? `- **[View Diff](${comp.diffPath})** ` : ''}
`).join('\n') : 'No iteration comparisons available'}

## Improvement Tracking
${report.improvements.length > 0 ? report.improvements.map(imp => `
- **Iteration ${imp.iteration}**: Improved by ${imp.improvement}% (${imp.from}% → ${imp.to}%)
`).join('') : 'No improvements tracked between iterations'}

## Final Comparison with Mock
${report.finalResult ? `
- **Final Difference**: ${report.finalResult.percentage}%
- **Status**: ${report.finalResult.passed ? '✅ PASSED' : '❌ FAILED'}
- **Pixels Different**: ${report.finalResult.pixelsDiff.toLocaleString()} of ${report.finalResult.totalPixels.toLocaleString()}
- **Dimensions**: ${report.finalResult.dimensions.width}x${report.finalResult.dimensions.height}
${report.finalResult.diffPath ? `- **[View Final Diff](${report.finalResult.diffPath})** ` : ''}
` : 'No mock comparison available (mock file not found or not specified)'}

## Recommendations
${this.generateRecommendations(report)}

## Session Details
- **Start Time**: ${report.session.startTime || 'Unknown'}
- **End Time**: ${report.session.endTime || 'In Progress'}
- **Status**: ${report.session.status || 'Unknown'}
- **Viewport**: ${report.session.viewport || 'Default'}
${report.session.mockPath ? `- **Mock Path**: ${report.session.mockPath}` : ''}

---
*Generated by MultiAgent-Claude Visual Development System*
`;
  }
  
  calculateDuration(session) {
    if (!session.startTime) return 'Unknown';
    
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    const duration = end - start;
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }
  
  generateRecommendations(report) {
    const recommendations = [];
    const threshold = this.threshold * 100;
    
    if (!report.finalResult) {
      recommendations.push('- ⚠️ No final comparison with mock available. Ensure mock file exists.');
      return recommendations.join('\n');
    }
    
    const finalDiff = parseFloat(report.finalResult.percentage);
    
    if (report.finalResult.passed) {
      recommendations.push(`- ✅ Excellent! Visual match achieved within ${threshold}% threshold.`);
      if (finalDiff < 1) {
        recommendations.push('- 🎯 Near-perfect match! Differences likely due to anti-aliasing.');
      }
    } else {
      if (finalDiff > 50) {
        recommendations.push('- 🔴 Major layout differences detected. Review component structure and dimensions.');
        recommendations.push('- 💡 Check if the mock and implementation use the same viewport size.');
      } else if (finalDiff > 20) {
        recommendations.push('- 🟠 Significant styling differences. Check colors, fonts, and spacing.');
        recommendations.push('- 💡 Use browser DevTools to compare computed styles.');
      } else if (finalDiff > 10) {
        recommendations.push('- 🟡 Moderate differences. Fine-tune padding, margins, and borders.');
        recommendations.push('- 💡 Pay attention to box-sizing and border-box calculations.');
      } else {
        recommendations.push('- 🟢 Close to threshold. Minor adjustments needed:');
        recommendations.push('  - Check anti-aliasing on text and borders');
        recommendations.push('  - Verify exact color values (#hex codes)');
        recommendations.push('  - Ensure pixel-perfect alignment');
      }
    }
    
    // Iteration-based recommendations
    if (report.iterations > 10) {
      recommendations.push('- ⚠️ Many iterations needed. Consider breaking down the component.');
    }
    
    if (report.improvements.length === 0 && report.iterations > 3) {
      recommendations.push('- ⚠️ No improvements between iterations. Try a different approach.');
    }
    
    if (report.improvements.length > 0) {
      const totalImprovement = report.improvements.reduce((sum, imp) => sum + parseFloat(imp.improvement), 0);
      recommendations.push(`- 📈 Total improvement across iterations: ${totalImprovement.toFixed(2)}%`);
    }
    
    return recommendations.join('\n');
  }
  
  // CLI entry point for npm run visual:compare
  async runComparison() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      console.log(chalk.blue('\n📊 Visual Comparison Utility\n'));
      console.log('Usage:');
      console.log('  visual:compare <actual> <expected>     Compare two images');
      console.log('  visual:compare --report <session-dir>  Generate session report');
      console.log('  visual:compare --help                  Show this help\n');
      console.log('Options:');
      console.log('  --threshold <value>  Set difference threshold (0-1, default: 0.05)');
      console.log('  --output <path>      Save diff image to specific path\n');
      console.log('Examples:');
      console.log('  npm run visual:compare screenshot.png mock.png');
      console.log('  npm run visual:compare --report .claude/visual-sessions/12345');
      console.log('  npm run visual:compare actual.png expected.png --threshold 0.1\n');
      process.exit(0);
    }
    
    // Report generation mode
    if (args[0] === '--report' && args[1]) {
      try {
        console.log(chalk.blue('📊 Generating visual comparison report...'));
        const report = await this.generateReport(args[1]);
        console.log(chalk.green(`✅ Report generated: ${report.reportPath}`));
        console.log(chalk.gray(`   Final Difference: ${report.finalResult?.percentage || 'N/A'}%`));
        console.log(chalk.gray(`   Status: ${report.finalResult?.passed ? '✅ PASSED' : '❌ FAILED'}`));
        process.exit(report.finalResult?.passed ? 0 : 1);
      } catch (error) {
        console.error(chalk.red(`❌ Report generation failed: ${error.message}`));
        process.exit(1);
      }
      return;
    }
    
    // Image comparison mode
    if (args.length < 2) {
      console.error(chalk.red('Error: Please provide two image paths to compare'));
      console.log(chalk.gray('Usage: visual:compare <actual> <expected>'));
      process.exit(1);
    }
    
    try {
      // Parse threshold option
      let threshold = this.threshold;
      const thresholdIndex = args.indexOf('--threshold');
      if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
        threshold = parseFloat(args[thresholdIndex + 1]);
      }
      
      console.log(chalk.blue('🔍 Comparing images...'));
      const result = await this.compareImages(args[0], args[1], { threshold });
      
      console.log(chalk.blue('\n📊 Comparison Result:'));
      console.log(chalk.gray(`   Difference: ${result.percentage}%`));
      console.log(chalk.gray(`   Pixels Different: ${result.pixelsDiff.toLocaleString()} / ${result.totalPixels.toLocaleString()}`));
      console.log(chalk.gray(`   Dimensions: ${result.dimensions.width}x${result.dimensions.height}`));
      console.log(chalk.gray(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`));
      console.log(chalk.gray(`   Diff saved to: ${result.diffPath}`));
      
      process.exit(result.passed ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`❌ Comparison failed: ${error.message}`));
      if (error.message.includes('not installed')) {
        console.log(chalk.yellow('\nℹ️  Run the following to install required packages:'));
        console.log(chalk.cyan('   npm install --save-dev sharp pixelmatch pngjs'));
      }
      process.exit(1);
    }
  }
}

// Export for use in other modules
module.exports = { VisualComparer };

// Allow direct CLI execution
if (require.main === module) {
  const comparer = new VisualComparer();
  comparer.runComparison().catch(error => {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  });
}