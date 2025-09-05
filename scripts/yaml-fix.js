#!/usr/bin/env node
/**
 * Quick fix for YAML parsing errors in Examples sections
 */

const fs = require('fs');
const glob = require('glob');

function fixYAMLExamples() {
  const agentFiles = glob.sync('Examples/agents/**/*.md', {
    ignore: ['**/README.md', '**/TEMPLATE-*.md']
  });

  let fixedCount = 0;

  for (const file of agentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Fix YAML frontmatter Examples section indentation
    const fixedContent = content
      // Fix Examples array with proper indentation
      .replace(/^Examples:\n\s*- <example>/gm, 'Examples:\n  - <example>')
      .replace(/^\s{6}Context:/gm, '      Context:')
      .replace(/^\s{6}user:/gm, '      user:')
      .replace(/^\s{6}assistant:/gm, '      assistant:')
      .replace(/^\s{6}<commentary>/gm, '      <commentary>')
      .replace(/^\s{6}<\/commentary>/gm, '      </commentary>')
      .replace(/^\s{6}<\/example>/gm, '      </example>')
      // Fix some variations
      .replace(/^Examples:\n- <example>/gm, 'Examples:\n  - <example>')
      .replace(/^\s{2}Context:/gm, '      Context:')
      .replace(/^\s{2}user:/gm, '      user:')
      .replace(/^\s{2}assistant:/gm, '      assistant:')
      .replace(/^\s{2}<commentary>/gm, '      <commentary>')
      .replace(/^\s{2}<\/commentary>/gm, '      </commentary>')
      .replace(/^\s{2}<\/example>/gm, '      </example>');

    if (content !== fixedContent) {
      fs.writeFileSync(file, fixedContent);
      fixedCount++;
      console.log(`✅ Fixed YAML in ${file}`);
    }
  }

  console.log(`📊 Fixed YAML in ${fixedCount} files`);
  return fixedCount;
}

if (require.main === module) {
  fixedCount = fixYAMLExamples();
  console.log(`\n🎉 YAML fix completed! Fixed ${fixedCount} files.`);
}

module.exports = { fixYAMLExamples };