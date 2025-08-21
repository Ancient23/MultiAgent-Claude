import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('MultiAgent Integration', () => {
  test('MCP configuration exists', () => {
    const mcpPath = '.mcp.json';
    expect(fs.existsSync(mcpPath)).toBeTruthy();
    
    const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    expect(config.mcpServers).toBeDefined();
  });
  
  test('orchestration directory exists', () => {
    const orchestrationDir = '.claude/orchestration';
    expect(fs.existsSync(orchestrationDir)).toBeTruthy();
  });
  
  test('visual directories exist', () => {
    const dirs = [
      '.claude/mocks',
      '.claude/visual-iterations',
      '.playwright/baseline'
    ];
    
    dirs.forEach(dir => {
      expect(fs.existsSync(dir)).toBeTruthy();
    });
  });
});