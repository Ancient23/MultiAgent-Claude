// Vercel Preview Detection Utility for MultiAgent-Claude
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');
// Node.js 18+ has built-in fetch support

const execAsync = promisify(exec);

class VercelPreviewDetector {
  constructor(config = {}) {
    this.githubToken = config.githubToken || process.env.GITHUB_TOKEN;
    this.vercelToken = config.vercelToken || process.env.VERCEL_TOKEN;
    this.waitTimeout = config.waitTimeout || 300000; // 5 minutes default
    this.retryInterval = config.retryInterval || 5000; // 5 seconds
    this.debug = config.debug || false;
  }

  log(message, level = 'info') {
    if (!this.debug && level === 'debug') return;
    
    const prefix = {
      info: chalk.blue('ℹ'),
      success: chalk.green('✓'),
      warning: chalk.yellow('⚠'),
      error: chalk.red('✗'),
      debug: chalk.gray('🔍')
    };
    
    console.log(`${prefix[level] || ''} ${message}`);
  }

  async detectFromPR(owner, repo, prNumber) {
    try {
      this.log(`Detecting Vercel deployment for PR #${prNumber}...`, 'info');
      
      // First, try to get deployment from GitHub deployments API
      const deployment = await this.getGitHubDeployment(owner, repo, prNumber);
      if (deployment) {
        this.log(`Found deployment via GitHub API: ${deployment}`, 'success');
        return deployment;
      }
      
      // Fallback to checking PR comments for Vercel bot
      const vercelUrl = await this.getVercelUrlFromComments(owner, repo, prNumber);
      if (vercelUrl) {
        this.log(`Found Vercel preview URL in comments: ${vercelUrl}`, 'success');
        return vercelUrl;
      }
      
      // Check deployment statuses
      const statusUrl = await this.getDeploymentFromStatuses(owner, repo, prNumber);
      if (statusUrl) {
        this.log(`Found deployment in commit statuses: ${statusUrl}`, 'success');
        return statusUrl;
      }
      
      this.log('No Vercel deployment found for this PR', 'warning');
      return null;
    } catch (error) {
      this.log(`Error detecting deployment: ${error.message}`, 'error');
      throw error;
    }
  }

  async getGitHubDeployment(owner, repo, prNumber) {
    try {
      // Get PR details to find the head SHA
      const prCmd = `gh api repos/${owner}/${repo}/pulls/${prNumber}`;
      const { stdout: prData } = await execAsync(prCmd);
      const pr = JSON.parse(prData);
      const sha = pr.head.sha;
      
      this.log(`Checking deployments for SHA: ${sha}`, 'debug');
      
      // Get deployments for this SHA
      const deploymentsCmd = `gh api repos/${owner}/${repo}/deployments?sha=${sha}`;
      const { stdout: deploymentsData } = await execAsync(deploymentsCmd);
      const deployments = JSON.parse(deploymentsData);
      
      if (deployments.length > 0) {
        // Get the latest deployment
        const latestDeployment = deployments[0];
        
        // Get deployment statuses
        const statusCmd = `gh api repos/${owner}/${repo}/deployments/${latestDeployment.id}/statuses`;
        const { stdout: statusData } = await execAsync(statusCmd);
        const statuses = JSON.parse(statusData);
        
        if (statuses.length > 0 && statuses[0].target_url) {
          return statuses[0].target_url;
        }
      }
      
      return null;
    } catch (error) {
      this.log(`GitHub deployment check failed: ${error.message}`, 'debug');
      return null;
    }
  }

  async getVercelUrlFromComments(owner, repo, prNumber) {
    try {
      const cmd = `gh api repos/${owner}/${repo}/issues/${prNumber}/comments`;
      const { stdout } = await execAsync(cmd);
      const comments = JSON.parse(stdout);
      
      // Look for Vercel bot comments
      const vercelComment = comments.find(comment => {
        return (
          comment.user.login === 'vercel[bot]' ||
          comment.user.login === 'vercel-bot' ||
          comment.body.includes('deployed to Vercel') ||
          comment.body.includes('Preview:') ||
          comment.body.includes('vercel.app')
        );
      });
      
      if (vercelComment) {
        // Extract URL from comment body
        const urlMatch = vercelComment.body.match(/https?:\/\/[^\s\)]+\.vercel\.app/);
        if (urlMatch) {
          return urlMatch[0];
        }
      }
      
      return null;
    } catch (error) {
      this.log(`Comment check failed: ${error.message}`, 'debug');
      return null;
    }
  }

  async getDeploymentFromStatuses(owner, repo, prNumber) {
    try {
      // Get PR details
      const prCmd = `gh api repos/${owner}/${repo}/pulls/${prNumber}`;
      const { stdout: prData } = await execAsync(prCmd);
      const pr = JSON.parse(prData);
      const sha = pr.head.sha;
      
      // Get commit statuses
      const statusCmd = `gh api repos/${owner}/${repo}/commits/${sha}/statuses`;
      const { stdout: statusData } = await execAsync(statusCmd);
      const statuses = JSON.parse(statusData);
      
      // Look for Vercel deployment status
      const vercelStatus = statuses.find(status => {
        return (
          status.context.includes('vercel') ||
          status.context.includes('deploy') ||
          (status.target_url && status.target_url.includes('vercel.app'))
        );
      });
      
      if (vercelStatus && vercelStatus.target_url) {
        return vercelStatus.target_url;
      }
      
      return null;
    } catch (error) {
      this.log(`Status check failed: ${error.message}`, 'debug');
      return null;
    }
  }

  async waitForDeployment(url, options = {}) {
    const timeout = options.timeout || this.waitTimeout;
    const interval = options.retryInterval || this.retryInterval;
    const startTime = Date.now();
    
    this.log(`Waiting for deployment to be ready: ${url}`, 'info');
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          timeout: 5000,
          headers: {
            'User-Agent': 'MultiAgent-Claude/1.0'
          }
        });
        
        if (response.ok) {
          this.log('Deployment is ready!', 'success');
          return {
            ready: true,
            url,
            responseTime: Date.now() - startTime
          };
        }
        
        this.log(`Deployment not ready (${response.status}), retrying...`, 'debug');
      } catch (error) {
        this.log(`Connection failed, retrying: ${error.message}`, 'debug');
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    this.log('Deployment wait timeout exceeded', 'warning');
    return {
      ready: false,
      url,
      responseTime: Date.now() - startTime
    };
  }

  async detectFromEnvironment() {
    // Check various environment variables that might contain the deployment URL
    const envVars = [
      'DEPLOYMENT_URL',
      'VERCEL_URL',
      'VISUAL_TEST_URL',
      'BASE_URL',
      'CI_PULL_REQUEST_URL',
      'GITHUB_PR_DEPLOYMENT_URL'
    ];
    
    for (const varName of envVars) {
      const url = process.env[varName];
      if (url && url.startsWith('http')) {
        this.log(`Found deployment URL in ${varName}: ${url}`, 'success');
        return url;
      }
    }
    
    // Check if we're in a GitHub Actions context
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      const owner = process.env.GITHUB_REPOSITORY_OWNER;
      const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
      const prNumber = process.env.GITHUB_REF?.match(/pull\/(\d+)/)?.[1];
      
      if (owner && repo && prNumber) {
        return await this.detectFromPR(owner, repo, prNumber);
      }
    }
    
    return null;
  }

  async getDeploymentInfo(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'MultiAgent-Claude/1.0'
        }
      });
      
      return {
        url,
        ready: response.ok,
        status: response.status,
        headers: {
          server: response.headers.get('server'),
          'x-vercel-deployment-url': response.headers.get('x-vercel-deployment-url'),
          'x-vercel-id': response.headers.get('x-vercel-id')
        }
      };
    } catch (error) {
      return {
        url,
        ready: false,
        error: error.message
      };
    }
  }

  // CLI entry point
  async runCLI() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      console.log(chalk.blue('\n🔍 Vercel Preview Detection Utility\n'));
      console.log('Usage:');
      console.log('  vercel-preview detect <owner> <repo> <pr>  Detect preview URL for PR');
      console.log('  vercel-preview wait <url>                   Wait for deployment to be ready');
      console.log('  vercel-preview info <url>                   Get deployment information');
      console.log('  vercel-preview auto                         Auto-detect from environment\n');
      console.log('Options:');
      console.log('  --debug              Show debug output');
      console.log('  --timeout <ms>       Wait timeout (default: 300000)');
      console.log('  --interval <ms>      Retry interval (default: 5000)\n');
      console.log('Examples:');
      console.log('  node vercel-preview.js detect vercel next.js 12345');
      console.log('  node vercel-preview.js wait https://my-app.vercel.app');
      console.log('  node vercel-preview.js auto --debug\n');
      process.exit(0);
    }
    
    const command = args[0];
    const debug = args.includes('--debug');
    const timeoutIndex = args.indexOf('--timeout');
    const intervalIndex = args.indexOf('--interval');
    
    const detector = new VercelPreviewDetector({
      debug,
      waitTimeout: timeoutIndex !== -1 ? parseInt(args[timeoutIndex + 1]) : undefined,
      retryInterval: intervalIndex !== -1 ? parseInt(args[intervalIndex + 1]) : undefined
    });
    
    try {
      switch (command) {
        case 'detect': {
          if (args.length < 4) {
            console.error(chalk.red('Error: Please provide owner, repo, and PR number'));
            process.exit(1);
          }
          const url = await detector.detectFromPR(args[1], args[2], args[3]);
          if (url) {
            console.log(chalk.green(`\n✅ Preview URL: ${url}`));
            process.exit(0);
          } else {
            console.log(chalk.yellow('\n⚠️  No preview URL found'));
            process.exit(1);
          }
          break;
        }
        
        case 'wait': {
          if (args.length < 2) {
            console.error(chalk.red('Error: Please provide a URL to wait for'));
            process.exit(1);
          }
          const result = await detector.waitForDeployment(args[1]);
          if (result.ready) {
            console.log(chalk.green(`\n✅ Deployment ready in ${result.responseTime}ms`));
            process.exit(0);
          } else {
            console.log(chalk.red('\n❌ Deployment wait timeout'));
            process.exit(1);
          }
          break;
        }
        
        case 'info': {
          if (args.length < 2) {
            console.error(chalk.red('Error: Please provide a URL'));
            process.exit(1);
          }
          const info = await detector.getDeploymentInfo(args[1]);
          console.log(chalk.blue('\n📊 Deployment Information:'));
          console.log(JSON.stringify(info, null, 2));
          process.exit(info.ready ? 0 : 1);
          break;
        }
        
        case 'auto': {
          const url = await detector.detectFromEnvironment();
          if (url) {
            console.log(chalk.green(`\n✅ Auto-detected URL: ${url}`));
            
            // Also wait for it to be ready
            const result = await detector.waitForDeployment(url);
            if (result.ready) {
              console.log(chalk.green(`✅ Deployment ready!`));
              // Output the URL for GitHub Actions to capture
              console.log(`::set-output name=url::${url}`);
              process.exit(0);
            } else {
              console.log(chalk.yellow('⚠️  Deployment not ready, but URL detected'));
              console.log(`::set-output name=url::${url}`);
              process.exit(0);
            }
          } else {
            console.log(chalk.yellow('\n⚠️  No deployment URL auto-detected'));
            process.exit(1);
          }
          break;
        }
        
        default:
          console.error(chalk.red(`Unknown command: ${command}`));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      if (debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// Export for use in other modules
module.exports = { VercelPreviewDetector };

// Allow direct CLI execution
if (require.main === module) {
  const detector = new VercelPreviewDetector();
  detector.runCLI().catch(error => {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  });
}