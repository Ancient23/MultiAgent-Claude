# Setup/Init Refactoring Implementation Plan

## Objective
Refactor `mac setup` and `mac init` commands to use intelligent, context-aware initialization leveraging the framework's own specialized agents.

## Current Issues
1. `setup.js` creates files directly (lines 601-1048) - should only collect config
2. `init.js` has variable scoping bug (line 95 references undefined `hasQueuedItems`)
3. Boilerplate templates instead of intelligent generation
4. Poor separation of concerns between setup and init

## Implementation Steps

### Step 1: Refactor setup.js
**File**: `cli/commands/setup.js`

#### Remove these functions entirely:
- Lines 601-686: `createCodexRole()` 
- Lines 687-777: `createCustomAgent()`
- Lines 779-918: `parseAGENTSmd()`, `mergeAGENTSmdSections()`, `rebuildAGENTSmd()`
- Lines 920-1048: `createAGENTSmd()`

#### Simplify setupEnvironment function (lines 1050-1235):
```javascript
function setupEnvironment(variant, agents, mcpServers, ciOptions = {}, playwrightOptions = {}, 
                          projectType = 'Unknown', projectAnalysis = null, 
                          customAgentsToCreate = [], codexRolesToCreate = [], 
                          agentsMdAction = 'skip') {
  
  // Create directory structure only
  const dirs = [
    '.claude', '.claude/agents', '.claude/commands', '.claude/tasks', '.claude/doc',
    '.ai/memory', '.ai/memory/patterns', '.ai/memory/decisions',
    '.chatgpt', '.chatgpt/roles'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Save complete configuration
  const config = {
    variant,
    agents,
    mcpServers,
    ciOptions,
    playwrightOptions,
    projectType,
    projectAnalysis: projectAnalysis ? {
      monorepo: projectAnalysis.monorepo,
      packageCount: projectAnalysis.packages.length,
      packages: projectAnalysis.packages,
      technologies: Array.from(projectAnalysis.technologies),
      frameworks: Array.from(projectAnalysis.frameworks),
      features: Array.from(projectAnalysis.features)
    } : null,
    queuedForCreation: {
      customAgents: customAgentsToCreate || [],
      codexRoles: codexRolesToCreate || [],
      agentsMd: agentsMdAction || 'skip',
      needsProcessing: (customAgentsToCreate?.length > 0) || 
                       (codexRolesToCreate?.length > 0) ||
                       (agentsMdAction && agentsMdAction !== 'skip')
    },
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('.claude/config.json', JSON.stringify(config, null, 2));
  
  console.log(chalk.green('✓ Configuration saved to .claude/config.json'));
  
  // Display what will be created during init
  if (config.queuedForCreation.needsProcessing) {
    console.log(chalk.yellow('\n📋 Queued for intelligent creation during init:'));
    if (customAgentsToCreate.length > 0) {
      console.log(chalk.gray(`  • ${customAgentsToCreate.length} custom agents`));
      customAgentsToCreate.forEach(agent => 
        console.log(chalk.gray(`    - ${agent}`))
      );
    }
    if (codexRolesToCreate.length > 0) {
      console.log(chalk.gray(`  • ${codexRolesToCreate.length} ChatGPT/Codex roles`));
    }
    if (agentsMdAction !== 'skip') {
      console.log(chalk.gray(`  • AGENTS.md (${agentsMdAction})`));
    }
  }
  
  // Do NOT create any files here - just configuration
}
```

### Step 2: Fix init.js
**File**: `cli/commands/init.js`

#### Fix variable scoping (move lines 189-196 before line 95):
```javascript
async function execute(options) {
  const workflow = await getWorkflow(options);
  
  console.log(chalk.blue(`\n🚀 Initializing Multi-Agent Claude Environment`));
  console.log(chalk.gray(`Using workflow: ${workflow}\n`));
  
  // MOVE THESE DECLARATIONS HERE (before any use)
  let hasQueuedItems = false;
  let queuedAgents = [];
  let queuedRoles = [];
  let agentsMdAction = 'skip';
  let projectType = 'Unknown';
  let projectAnalysis = null;
  
  // Check for setup config with queued items
  const configPath = path.join(process.cwd(), '.claude', 'config.json');
  
  if (fs.existsSync(configPath)) {
    // ... rest of config loading
  }
  
  // ... rest of function
}
```

#### Enhance executeWithClaude function:
```javascript
function executeWithClaude(prompt, config) {
  try {
    // ... existing Claude check code ...
    
    let enhancedPrompt = prompt;
    
    if (config?.queuedForCreation?.needsProcessing) {
      enhancedPrompt += `\n\n## 🤖 Intelligent Creation Phase\n\n`;
      enhancedPrompt += `**IMPORTANT**: Use the framework's own specialized agent patterns for intelligent creation.\n\n`;
      
      // Include full project analysis
      if (config.projectAnalysis) {
        enhancedPrompt += `### Project Analysis\n`;
        enhancedPrompt += `\`\`\`json\n${JSON.stringify(config.projectAnalysis, null, 2)}\n\`\`\`\n\n`;
      }
      
      // Custom agents using agent-factory
      if (config.queuedForCreation.customAgents?.length > 0) {
        enhancedPrompt += `### Custom Agents to Create\n`;
        enhancedPrompt += `Use **agent-factory** patterns (from .claude/agents/agent-factory.md) to create:\n\n`;
        
        config.queuedForCreation.customAgents.forEach(agent => {
          enhancedPrompt += `#### ${agent}\n`;
          enhancedPrompt += `1. Analyze the domain: "${agent.replace(/-/g, ' ')}"\n`;
          enhancedPrompt += `2. Identify appropriate MCP tools for this domain\n`;
          enhancedPrompt += `3. Create specialized workflows based on project structure\n`;
          enhancedPrompt += `4. Apply agent-factory quality standards\n`;
          enhancedPrompt += `5. Save to .claude/agents/${agent}.md\n\n`;
        });
      }
      
      // AGENTS.md using codex-configuration-expert
      if (config.queuedForCreation.agentsMd !== 'skip') {
        enhancedPrompt += `### AGENTS.md Configuration\n`;
        enhancedPrompt += `Use **codex-configuration-expert** patterns (from .claude/agents/codex-configuration-expert.md):\n\n`;
        
        if (config.queuedForCreation.agentsMd === 'merge' && fs.existsSync('AGENTS.md')) {
          enhancedPrompt += `**Action: Intelligent Merge**\n`;
          enhancedPrompt += `1. Read and parse existing AGENTS.md\n`;
          enhancedPrompt += `2. Preserve all custom sections and user content\n`;
          enhancedPrompt += `3. Add/update Memory System Navigation section\n`;
          enhancedPrompt += `4. Update project overview with detected technologies\n`;
          enhancedPrompt += `5. Add role guidelines for configured agents\n`;
          enhancedPrompt += `6. Optimize for Codex 192k context window\n\n`;
        } else {
          enhancedPrompt += `**Action: Create New**\n`;
          enhancedPrompt += `1. Create comprehensive AGENTS.md following codex-configuration-expert template\n`;
          enhancedPrompt += `2. Include all detected technologies and frameworks\n`;
          enhancedPrompt += `3. Add complete Memory System Navigation section\n`;
          enhancedPrompt += `4. Create role guidelines for each agent\n`;
          enhancedPrompt += `5. Include testing procedures from package.json\n`;
          enhancedPrompt += `6. Optimize structure for Codex comprehension\n\n`;
        }
      }
      
      // ChatGPT roles using role-instruction-engineer
      if (config.queuedForCreation.codexRoles?.length > 0) {
        enhancedPrompt += `### ChatGPT/Codex Roles\n`;
        enhancedPrompt += `Use **role-instruction-engineer** patterns (from .claude/agents/role-instruction-engineer.md):\n\n`;
        
        config.queuedForCreation.codexRoles.forEach(role => {
          enhancedPrompt += `#### .chatgpt/roles/${role}.md\n`;
          enhancedPrompt += `1. Extract essential capabilities from agent\n`;
          enhancedPrompt += `2. Compress to <1500 characters\n`;
          enhancedPrompt += `3. Include workflow, principles, output format\n`;
          enhancedPrompt += `4. Optimize for ChatGPT Projects feature\n\n`;
        });
        
        enhancedPrompt += `Also create:\n`;
        enhancedPrompt += `- .chatgpt/roles/manifest.json with all roles\n`;
        enhancedPrompt += `- .chatgpt/AGENTS.md combining all roles\n\n`;
      }
      
      enhancedPrompt += `### Quality Standards\n`;
      enhancedPrompt += `- NO BOILERPLATE: Each agent must be context-aware and project-specific\n`;
      enhancedPrompt += `- Use actual project structure and dependencies to inform creation\n`;
      enhancedPrompt += `- Apply framework's own patterns (meta-development principle)\n`;
      enhancedPrompt += `- Ensure all created files are immediately usable\n`;
    }
    
    // ... rest of execution
  } catch (error) {
    console.error(chalk.red('Error executing with Claude:'), error.message);
    return false;
  }
}
```

### Step 3: Create Intelligent YAML Components

#### Create: `prompts/templates/intelligent-agent-creation.yml`
```yaml
name: intelligent-agent-creation
version: 1.0.0
description: Intelligent agent creation using framework patterns
category: templates
tags: [agents, intelligent, context-aware]

variables:
  agent_dir: ".claude/agents"
  use_agent_factory: true
  use_codex_expert: true
  use_role_engineer: true

content: |
  ## Intelligent Agent Creation
  
  ### Using Framework's Own Patterns
  
  The framework will use its own specialized agents to create new agents:
  
  1. **agent-factory** (.claude/agents/agent-factory.md):
     - Analyzes domain requirements
     - Selects appropriate MCP tools
     - Creates specialized workflows
     - Applies quality standards
  
  2. **codex-configuration-expert** (.claude/agents/codex-configuration-expert.md):
     - Optimizes AGENTS.md structure
     - Configures for 192k token window
     - Includes testing procedures
     - Creates role guidelines
  
  3. **role-instruction-engineer** (.claude/agents/role-instruction-engineer.md):
     - Compresses agents to <1500 chars
     - Preserves essential capabilities
     - Creates ChatGPT-compatible roles
     - Generates manifest files
  
  ### Creation Process
  
  For each custom agent in config.queuedForCreation.customAgents:
  1. Parse agent name to extract domain
  2. Analyze project for domain-specific needs
  3. Apply agent-factory template patterns
  4. Create at ${agent_dir}/[agent-name].md
  
  For AGENTS.md (if action != 'skip'):
  1. Apply codex-configuration-expert patterns
  2. ${config.queuedForCreation.agentsMd === 'merge' ? 'Merge intelligently' : 'Create new'}
  3. Include memory system navigation
  4. Add detected technologies
  
  For each role in config.queuedForCreation.codexRoles:
  1. Apply role-instruction-engineer patterns
  2. Compress to <1500 characters
  3. Save to .chatgpt/roles/[role-name].md
  4. Update manifest.json
```

### Step 4: Update Workflow
**File**: `prompts/workflows/init-full.yml`

Add to conditional section:
```yaml
conditional:
  - if: "config.queuedForCreation.needsProcessing"
    then:
      - templates/intelligent-agent-creation
  # ... existing conditionals
```

## Testing Checklist
- [ ] setup.js only creates config, no files
- [ ] init.js reads config correctly
- [ ] Variable scoping bug fixed
- [ ] Enhanced prompt includes all context
- [ ] Claude receives agent-factory instructions
- [ ] Claude receives codex-expert instructions
- [ ] Claude receives role-engineer instructions
- [ ] No boilerplate templates used
- [ ] AGENTS.md merge preserves custom content
- [ ] ChatGPT roles properly compressed

## Success Criteria
1. Zero file creation in setup.js
2. All creation happens intelligently in init via Claude
3. Created agents are context-aware, not boilerplate
4. AGENTS.md optimized for Codex
5. ChatGPT roles under 1500 characters
6. Framework uses its own patterns (meta-development)