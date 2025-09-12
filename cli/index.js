#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const packageJson = require('../package.json');

program
  .name('multiagent-claude')
  .description('CLI tool for managing Claude Code multi-agent environment')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize multi-agent environment')
  .option('--memory-only', 'Initialize with memory focus (claude-code-init-memory-prompt.md)')
  .option('--with-docs', 'Initialize with documentation import (claude-code-init-with-docs-import.md)')
  .option('--prompt-only', 'Only output the prompt without executing')
  .option('--minimal', 'Minimal setup for CI/CD environments (skip interactive prompts)')
  .action((options) => {
    const initCommand = require('./commands/init');
    initCommand.execute(options);
  });

program
  .command('add-memory')
  .description('Add memory system to existing setup')
  .option('--prompt-only', 'Only output the prompt without executing')
  .action((options) => {
    const addMemoryCommand = require('./commands/add-memory');
    addMemoryCommand.execute(options);
  });

program
  .command('openai')
  .description('OpenAI/ChatGPT compatibility features')
  .argument('[subcommand]', 'Subcommand: init, bundle, sync, convert-agent')
  .argument('[args...]', 'Additional arguments for subcommand')
  .action(async (subcommand, args = [], options) => {
    const { default: openaiCommand } = await import('./commands/openai/index.js');
    await openaiCommand([subcommand, ...args]);
  });

program
  .command('agent')
  .description('Manage agents')
  .argument('<action>', 'Action to perform: create, list, add, edit, deploy, test, diff, sync')
  .argument('[name]', 'Agent name (required for some actions)')
  .action((action, name, options) => {
    const agentCommand = require('./commands/agent');
    agentCommand.execute(action, name, options);
  });

program
  .command('command')
  .description('Manage commands')
  .argument('<action>', 'Action to perform: create, list, add')
  .argument('[name]', 'Command name (required for some actions)')
  .action((action, name, options) => {
    const commandCommand = require('./commands/command');
    commandCommand.execute(action, name, options);
  });

program
  .command('memory')
  .description('Manage memory system')
  .argument('<action>', 'Action to perform: status, inspect, add-pattern, add-decision, search, cleanup, export, import, validate, report, learn, sync, update-from-commit')
  .argument('[args...]', 'Additional arguments for the action')
  .option('--type <type>', 'Memory type (patterns, decisions, project)')
  .option('--query <query>', 'Search query')
  .option('--file <file>', 'File path for import/export')
  .option('--from-session', 'Learn from current session')
  .option('--from-git-history', 'Learn from git history')
  .option('--from-diff <range>', 'Learn from git diff range')
  .option('--from-pr <number>', 'Create decision from PR')
  .option('--commit <sha>', 'Commit SHA for updates')
  .option('--output <path>', 'Output path for reports')
  .action((action, args, options) => {
    const memoryCommand = require('./commands/memory');
    memoryCommand.execute(action, args, options);
  });

program
  .command('setup')
  .description('Interactive setup wizard')
  .option('--skip-prompts', 'Skip interactive prompts (for testing)')
  .option('--variant <type>', 'Variant type (base, standard, memory-only, with-docs)')
  .option('--agents <list>', 'Comma-separated list of agents to include')
  .action((options) => {
    const setupCommand = require('./commands/setup');
    // Convert commander options to args array for backward compatibility
    const args = [];
    if (options.skipPrompts) args.push('--skip-prompts');
    if (options.variant) args.push('--variant', options.variant);
    if (options.agents) args.push('--agents', options.agents);
    setupCommand.execute(args);
  });

program
  .command('playwright')
  .description('Manage Playwright testing')
  .argument('<action>', 'Action to perform: init, generate-tests, add-visual-tests, setup-ci')
  .action((action, options) => {
    const playwrightCommand = require('./commands/playwright');
    playwrightCommand.execute(action, options);
  });

program
  .command('add')
  .description('Add features to existing project')
  .argument('<feature>', 'Feature to add: ci-cd, testing, web-testing, all-testing, both, all')
  .action((feature) => {
    const addCommand = require('./commands/add');
    addCommand.execute(feature);
  });

// MCP Setup
program
  .command('mcp')
  .description('Manage MCP servers')
  .argument('[action]', 'action to perform: add, serve, add-from-claude-desktop')
  .argument('[server]', 'specific server to add (playwright/filesystem/github)')
  .action(async (action, server) => {
    const mcpCommands = require('./commands/mcp');
    
    if (!action || action === 'add') {
      // Default to add if no action specified
      await mcpCommands.setupMCP(server || action);
    } else if (action === 'serve') {
      await mcpCommands.serveMCP();
    } else if (action === 'add-from-claude-desktop') {
      await mcpCommands.addFromClaudeDesktop();
    } else {
      // If action is actually a server name, add it
      await mcpCommands.setupMCP(action);
    }
  });

// Orchestration
program
  .command('orchestrate')
  .description('Start orchestrated multi-agent workflow')
  .option('--mode <mode>', 'orchestration mode: auto, parallel, sequential, meta')
  .action(async (options) => {
    const { orchestrate } = require('./commands/orchestrate');
    await orchestrate(options);
  });

// Parallel Execution
program
  .command('parallel')
  .description('Deploy agents in parallel')
  .action(async () => {
    const { deployParallel } = require('./commands/parallel');
    await deployParallel();
  });

// Verification
program
  .command('verify')
  .description('Create verification agent for current task')
  .action(async () => {
    const { createVerificationAgent } = require('./commands/verify');
    await createVerificationAgent();
  });

// Git Worktrees
program
  .command('worktree')
  .description('Setup git worktrees for parallel development')
  .argument('<features...>', 'feature names')
  .action(async (features) => {
    const { setupWorktrees } = require('./commands/worktree');
    await setupWorktrees(features);
  });

// Wave Execution Pattern
program
  .command('wave-execute')
  .description('Execute tasks using the 7-wave systematic pattern')
  .action(async () => {
    const { executeWavePattern } = require('./commands/wave-execute');
    await executeWavePattern();
  });

// Prompt System Management
program
  .command('prompt')
  .description('Manage prompt system')
  .argument('<action>', 'Action: list, show, validate, test, export, cache-stats, cache-clear')
  .argument('[name]', 'Workflow name (for show, test, export)')
  .option('--preview', 'Show preview of composed prompt (for test)')
  .option('--output <path>', 'Output path (for test, export)')
  .option('--cicd', 'Enable CI/CD in test context')
  .option('--testing', 'Enable testing in test context')
  .option('--docs', 'Enable docs in test context')
  .action(async (action, name, options) => {
    const promptCommands = require('./commands/prompt');
    
    switch (action) {
      case 'list':
        await promptCommands.list();
        break;
      case 'show':
        await promptCommands.show(name);
        break;
      case 'validate':
        await promptCommands.validate();
        break;
      case 'test':
        await promptCommands.test(name, options);
        break;
      case 'export':
        await promptCommands.export(name, options.output);
        break;
      case 'cache-stats':
        await promptCommands.cacheStats();
        break;
      case 'cache-clear':
        await promptCommands.cacheClear();
        break;
      default:
        console.error(`Unknown action: ${action}`);
        console.log('Available actions: list, show, validate, test, export, cache-stats, cache-clear');
    }
  });

program
  .command('lop')
  .description('Manage Lower Order Prompts (LOPs)')
  .argument('<action>', 'Action to perform: validate, create, list, execute')
  .argument('[file]', 'LOP file path (for validate/execute)')
  .action(async (action, file) => {
    const lopCommand = require('./commands/lop');
    
    switch (action) {
      case 'validate':
        if (!file) {
          console.error('Error: File path required for validation');
          process.exit(1);
        }
        await lopCommand.validate(file);
        break;
      case 'create':
        await lopCommand.create();
        break;
      case 'list':
        await lopCommand.list();
        break;
      case 'execute':
        if (!file) {
          console.error('Error: File path required for execution');
          process.exit(1);
        }
        await lopCommand.execute(file);
        break;
      default:
        console.error(`Unknown action: ${action}`);
        console.log('Available actions: validate, create, list, execute');
    }
  });

// Visual Development Commands
program
  .command('visual-setup')
  .description('Setup visual development environment with Playwright MCP')
  .action(async () => {
    try {
      const { setupVisualDevelopment } = require('./commands/mcp-setup');
      await setupVisualDevelopment();
    } catch (error) {
      console.error('Error setting up visual development:', error.message);
      process.exit(1);
    }
  });

program
  .command('visual-compare')
  .description('Compare images and generate visual diff reports')
  .argument('[actual]', 'Path to actual image')
  .argument('[expected]', 'Path to expected/mock image')
  .option('--report <session>', 'Generate report for a session directory')
  .option('--threshold <value>', 'Difference threshold (0-1, default: 0.05)')
  .action(async (actual, expected, options) => {
    try {
      const { VisualComparer } = require('./utils/visual-compare');
      const comparer = new VisualComparer({ threshold: parseFloat(options.threshold) || 0.05 });
      
      if (options.report) {
        const report = await comparer.generateReport(options.report);
        console.log(`Report generated: ${report.reportPath}`);
        console.log(`Final difference: ${report.finalResult?.percentage || 'N/A'}%`);
      } else if (actual && expected) {
        const result = await comparer.compareImages(actual, expected);
        console.log(`Difference: ${result.percentage}%`);
        console.log(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
        console.log(`Diff saved to: ${result.diffPath}`);
      } else {
        console.log('Usage: mac visual-compare <actual> <expected>');
        console.log('   or: mac visual-compare --report <session-directory>');
      }
    } catch (error) {
      console.error('Visual comparison error:', error.message);
      process.exit(1);
    }
  });

program
  .command('visual-report')
  .description('Generate visual comparison report for a session')
  .argument('<session>', 'Session directory path')
  .action(async (session) => {
    try {
      const { VisualComparer } = require('./utils/visual-compare');
      const comparer = new VisualComparer();
      const report = await comparer.generateReport(session);
      console.log(`Report generated: ${report.reportPath}`);
      console.log(`Final difference: ${report.finalResult?.percentage || 'N/A'}%`);
      console.log(`Status: ${report.finalResult?.passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error('Report generation error:', error.message);
      process.exit(1);
    }
  });

// Visual CI Commands
program
  .command('visual:ci-setup')
  .description('Configure visual testing for CI/CD environments')
  .action(async () => {
    try {
      const { setupCommand } = require('./commands/visual-ci');
      await setupCommand();
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('visual:detect-url')
  .description('Test deployment URL detection locally')
  .action(async () => {
    try {
      const { detectUrlCommand } = require('./commands/visual-ci');
      await detectUrlCommand();
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('visual:ci-status')
  .description('Show visual CI configuration status')
  .action(async () => {
    try {
      const { statusCommand } = require('./commands/visual-ci');
      await statusCommand();
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Agent/Role Conversion Commands
program
  .command('convert-agent')
  .description('Convert agents between Claude and ChatGPT formats')
  .argument('<source>', 'Source platform: claude or chatgpt')
  .argument('<target>', 'Target platform: claude or chatgpt')
  .argument('<file>', 'Agent/role file to convert')
  .option('--output <path>', 'Output path (default: auto-generated)')
  .option('--batch', 'Convert all files in directory')
  .action(async (source, target, file, options) => {
    try {
      const { AgentRoleConverter } = require('./commands/convert-agent');
      const converter = new AgentRoleConverter();
      
      if (options.batch) {
        await converter.batchConvert(file, source, target);
      } else {
        const content = require('fs').readFileSync(file, 'utf8');
        const agent = { content, name: require('path').basename(file) };
        
        let result;
        if (source === 'claude' && target === 'chatgpt') {
          result = converter.claudeToChatGPT(agent);
        } else if (source === 'chatgpt' && target === 'claude') {
          result = converter.chatGPTToClaude(agent);
        } else {
          throw new Error('Invalid source/target combination');
        }
        
        const outputPath = options.output || `./${result.name}`;
        require('fs').writeFileSync(outputPath, result.content);
        console.log(`Converted: ${outputPath}`);
      }
    } catch (error) {
      console.error('Conversion error:', error.message);
      process.exit(1);
    }
  });

// Validation Commands
program
  .command('validate')
  .description('Validate agents, templates, and conversions')
  .argument('<type>', 'Type: agent, all, conversion, yaml')
  .argument('[path]', 'File or directory path')
  .action(async (type, path) => {
    try {
      const { AgentValidator } = require('./commands/validate-agents');
      const validator = new AgentValidator();
      
      switch (type) {
        case 'agent':
          if (!path) {
            console.error('Path required for agent validation');
            process.exit(1);
          }
          const result = validator.validateAgent(path);
          console.log(`Valid: ${result.valid ? '✅' : '❌'}`);
          console.log(`Score: ${result.score}/100`);
          if (result.errors.length > 0) {
            console.log('Errors:', result.errors);
          }
          if (result.warnings.length > 0) {
            console.log('Warnings:', result.warnings);
          }
          break;
          
        case 'all':
          const dirs = [
            './Examples/agents',
            './Examples/agents/specialists',
            './Examples/roles'
          ];
          dirs.forEach(dir => {
            if (require('fs').existsSync(dir)) {
              console.log(`Validating ${dir}...`);
              validator.validateDirectory(dir);
            }
          });
          const report = validator.generateReport();
          console.log(`Total: ${report.summary.total}`);
          console.log(`Valid: ${report.summary.valid}`);
          console.log(`Average Score: ${report.summary.averageScore.toFixed(1)}/100`);
          break;
          
        case 'conversion':
          if (!path) {
            console.error('Path required for conversion test');
            process.exit(1);
          }
          const conversionResult = await validator.testConversion(path);
          console.log(`Success: ${conversionResult.success ? '✅' : '❌'}`);
          if (conversionResult.success) {
            console.log(`Information Preserved: ${conversionResult.preserved ? '✅' : '⚠️'}`);
          }
          break;
          
        case 'yaml':
          if (!path) {
            console.error('Path required for YAML validation');
            process.exit(1);
          }
          const yamlResult = validator.validateYAMLTemplate(path);
          console.log(`Valid: ${yamlResult.valid ? '✅' : '❌'}`);
          if (!yamlResult.valid) {
            console.log('Errors:', yamlResult.errors);
          }
          break;
          
        default:
          console.error(`Unknown validation type: ${type}`);
          console.log('Available types: agent, all, conversion, yaml');
      }
    } catch (error) {
      console.error('Validation error:', error.message);
      process.exit(1);
    }
  });

// Evolution Tracking Commands
program
  .command('evolution')
  .description('Track and analyze agent/template evolution')
  .argument('<action>', 'Action: track, report, learn, compare')
  .argument('[path]', 'File path (for track, compare)')
  .option('--from <version>', 'From version (for compare)')
  .option('--to <version>', 'To version (for compare)')
  .action(async (action, path, options) => {
    try {
      const { EvolutionTracker } = require('./commands/evolution-tracker');
      const tracker = new EvolutionTracker();
      
      switch (action) {
        case 'track':
          if (!path) {
            console.error('Path required for tracking');
            process.exit(1);
          }
          const version = await tracker.trackVersion(path);
          console.log(`Tracked version ${version.version} for ${version.name}`);
          break;
          
        case 'report':
          const report = tracker.generateEvolutionReport();
          console.log('Evolution Report:');
          console.log(`Total Agents: ${report.summary.totalAgents}`);
          console.log(`Total Versions: ${report.summary.totalVersions}`);
          console.log(`Average Quality: ${report.summary.averageQuality.toFixed(1)}/100`);
          console.log(`Quality Trend: ${report.summary.qualityTrend}`);
          break;
          
        case 'learn':
          const patterns = await tracker.learnFromEvolution();
          console.log(`Learned ${patterns.length} patterns from evolution`);
          patterns.forEach(p => {
            console.log(`- ${p.pattern}: ${p.description}`);
          });
          break;
          
        case 'compare':
          if (!path || !options.from || !options.to) {
            console.error('Path and versions required for comparison');
            process.exit(1);
          }
          const diff = tracker.compareVersions(path, options.from, options.to);
          console.log(`Changes from ${options.from} to ${options.to}:`);
          console.log(diff);
          break;
          
        default:
          console.error(`Unknown action: ${action}`);
          console.log('Available actions: track, report, learn, compare');
      }
    } catch (error) {
      console.error('Evolution tracking error:', error.message);
      process.exit(1);
    }
  });

// Metrics Dashboard Commands
program
  .command('metrics')
  .description('Collect and display quality metrics')
  .argument('<action>', 'Action: collect, show, html, watch')
  .option('--output <path>', 'Output path for HTML report')
  .action(async (action, options) => {
    try {
      const { MetricsDashboard } = require('./commands/metrics-dashboard');
      const dashboard = new MetricsDashboard();
      
      switch (action) {
        case 'collect':
          const metrics = await dashboard.collectMetrics();
          console.log(`Collected metrics for ${Object.keys(metrics.agents).length} agents`);
          break;
          
        case 'show':
          await dashboard.loadMetrics();
          const display = dashboard.displayMetrics();
          console.log(display);
          break;
          
        case 'html':
          const htmlPath = await dashboard.generateHTML(options.output);
          console.log(`HTML report generated: ${htmlPath}`);
          break;
          
        case 'watch':
          console.log('Starting metrics watcher (updates every 30 seconds)...');
          setInterval(async () => {
            await dashboard.collectMetrics();
            console.clear();
            console.log(dashboard.displayMetrics());
          }, 30000);
          // Initial display
          await dashboard.collectMetrics();
          console.log(dashboard.displayMetrics());
          break;
          
        default:
          console.error(`Unknown action: ${action}`);
          console.log('Available actions: collect, show, html, watch');
      }
    } catch (error) {
      console.error('Metrics error:', error.message);
      process.exit(1);
    }
  });

// Sync Service Commands
program
  .command('sync')
  .description('Bidirectional sync service for agents and roles')
  .argument('<action>', 'Action: start, status, sync, resolve, clear')
  .argument('[args...]', 'Additional arguments')
  .option('--strategy <strategy>', 'Conflict strategy: manual, newest, claude, chatgpt')
  .action(async (action, args = [], options) => {
    try {
      const { SyncService } = require('./commands/sync-service');
      const service = new SyncService({
        conflictStrategy: options.strategy || 'manual'
      });
      
      switch (action) {
        case 'start':
          await service.start();
          console.log('Sync service started. Press Ctrl+C to stop.');
          process.on('SIGINT', () => {
            service.stop();
            process.exit(0);
          });
          break;
          
        case 'status':
          await service.loadSyncState();
          const status = service.getStatus();
          console.log('Sync Service Status:');
          console.log(`Last Sync: ${status.lastSync || 'Never'}`);
          console.log(`Pending: ${status.pending}`);
          console.log(`Conflicts: ${status.conflicts}`);
          console.log(`Errors: ${status.errors}`);
          console.log(`Synced: ${status.synced}`);
          break;
          
        case 'sync':
          const results = await service.performSync();
          console.log('Sync results:', results);
          break;
          
        case 'resolve':
          const [name, choice] = args;
          if (!name || !choice) {
            console.error('Usage: mac sync resolve <name> <claude|chatgpt|skip>');
            process.exit(1);
          }
          await service.loadSyncState();
          const success = await service.resolveConflictManual(name, choice);
          if (success) {
            await service.saveSyncState();
            console.log(`Conflict resolved for ${name}`);
          }
          break;
          
        case 'clear':
          await service.loadSyncState();
          if (args[0] === 'errors') {
            service.clearErrors();
          } else if (args[0] === 'conflicts') {
            service.clearConflicts();
          } else {
            service.clearErrors();
            service.clearConflicts();
          }
          await service.saveSyncState();
          console.log('Cleared successfully');
          break;
          
        default:
          console.error(`Unknown action: ${action}`);
          console.log('Available actions: start, status, sync, resolve, clear');
      }
    } catch (error) {
      console.error('Sync error:', error.message);
      process.exit(1);
    }
  });

// Sync Dashboard Command
program
  .command('sync-dashboard')
  .description('Start web-based sync monitoring dashboard')
  .argument('[port]', 'Port number (default: 8080)')
  .action(async (port) => {
    try {
      const { SyncDashboard } = require('./commands/sync-dashboard');
      const dashboard = new SyncDashboard(parseInt(port) || 8080);
      await dashboard.start();
      
      process.on('SIGINT', () => {
        console.log('\nShutting down dashboard...');
        dashboard.stop();
        process.exit(0);
      });
    } catch (error) {
      console.error('Dashboard error:', error.message);
      process.exit(1);
    }
  });

program.parse();