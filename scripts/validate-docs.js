#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates internal links, file references, and consistency across MultiAgent-Claude docs
 */

const fs = require('fs');
const path = require('path');

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.resolve(__dirname, '..');
  }

  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.errors.push(`File does not exist: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for internal markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+\.md[^)]*)\)/g;
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      const [fullMatch, linkText, linkPath] = match;
      
      // Convert relative path to absolute
      const resolvedPath = path.resolve(path.dirname(filePath), linkPath);
      
      if (!fs.existsSync(resolvedPath)) {
        this.errors.push(`Broken link in ${filePath}: ${linkPath} -> ${resolvedPath}`);
      }
    }

    // Check for file path references (Examples/, .claude/, etc.)
    const pathPattern = /(Examples\/[^)\s]+|\.claude\/[^)\s]+)/g;
    while ((match = pathPattern.exec(content)) !== null) {
      const referencedPath = match[1];
      const fullPath = path.join(this.projectRoot, referencedPath);
      
      if (!fs.existsSync(fullPath)) {
        this.warnings.push(`Potentially broken path reference in ${filePath}: ${referencedPath}`);
      }
    }

    return true;
  }

  validateTerminology(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for inconsistent terminology
    const inconsistencies = [
      { old: 'research-only', preferred: 'research-plan-execute' },
      { old: 'specialist agent', preferred: 'specialist' },
      { old: 'orchestrator agent', preferred: 'orchestrator' }
    ];

    inconsistencies.forEach(({ old, preferred }) => {
      if (content.includes(old)) {
        this.warnings.push(`Terminology inconsistency in ${filePath}: Found "${old}", prefer "${preferred}"`);
      }
    });
  }

  run() {
    console.log('🔍 MultiAgent-Claude Documentation Validator\n');

    // Primary documentation files
    const primaryDocs = [
      'README.md',
      'CLAUDE.md',
      'Examples/agents/README.md',
      'Examples/commands/README.md'
    ];

    primaryDocs.forEach(doc => {
      const fullPath = path.join(this.projectRoot, doc);
      console.log(`Validating ${doc}...`);
      
      if (this.validateFile(fullPath)) {
        this.validateTerminology(fullPath);
      }
    });

    // Results
    console.log('\n📊 Validation Results:');
    console.log(`✅ Files checked: ${primaryDocs.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('🚨 ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All documentation checks passed!');
    }

    return this.errors.length === 0;
  }
}

// Run validation
const validator = new DocumentationValidator();
const success = validator.run();
process.exit(success ? 0 : 1);