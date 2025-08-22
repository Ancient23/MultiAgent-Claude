/**
 * Session Helper Module
 * Manages Claude session ID detection and generation for context_session files
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Get Claude session ID from various sources
 * @param {string} suffix - Optional suffix to append to session ID
 * @returns {string} The session ID with optional suffix
 */
function getSessionId(suffix = '') {
  // Try multiple possible sources for Claude session ID
  const claudeSessionId = 
    process.env.CLAUDE_SESSION_ID || 
    process.env.ANTHROPIC_SESSION_ID ||
    process.env.CLAUDE_CONVERSATION_ID ||
    process.env.CLAUDE_CONV_ID ||
    detectFromClaudeContext() ||
    detectFromActiveSession();
  
  if (claudeSessionId) {
    return suffix ? `${claudeSessionId}_${suffix}` : claudeSessionId;
  }
  
  // Fallback: generate unique ID (not timestamp)
  const uniqueId = crypto.randomBytes(8).toString('hex');
  console.warn(`⚠️  No Claude session ID found. Using generated ID: ${uniqueId}`);
  return suffix ? `${uniqueId}_${suffix}` : uniqueId;
}

/**
 * Attempt to detect session ID from Claude context files
 * @returns {string|null} Detected session ID or null
 */
function detectFromClaudeContext() {
  try {
    // Check for existing context session files
    const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
    if (!fs.existsSync(tasksDir)) {
      return null;
    }
    
    // Look for the most recent context_session file
    const files = fs.readdirSync(tasksDir)
      .filter(f => f.startsWith('context_session_') && f.endsWith('.md'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(tasksDir, a));
        const statB = fs.statSync(path.join(tasksDir, b));
        return statB.mtime - statA.mtime;
      });
    
    if (files.length > 0) {
      // Extract session ID from filename
      const match = files[0].match(/context_session_([^_]+)(?:_|\.)/);
      if (match && match[1]) {
        // Only return if it's not a timestamp format (YYYYMMDD_HHMMSS)
        if (!/^\d{8}_\d{6}/.test(match[1]) && !/^\d{4}-\d{2}-\d{2}/.test(match[1])) {
          return match[1];
        }
      }
    }
  } catch (error) {
    // Silently fail and return null
  }
  return null;
}

/**
 * Attempt to detect active Claude session from environment or process
 * @returns {string|null} Detected session ID or null
 */
function detectFromActiveSession() {
  // Check if running within Claude Code environment
  if (process.env.CLAUDE_CODE_SESSION) {
    return process.env.CLAUDE_CODE_SESSION;
  }
  
  // Check for Claude-specific environment markers
  if (process.env.ANTHROPIC_ENV) {
    // Extract session from Anthropic environment if available
    const match = process.env.ANTHROPIC_ENV.match(/session:([a-f0-9]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Format session ID for display
 * @param {string} sessionId - The session ID to format
 * @returns {string} Formatted session ID
 */
function formatSessionId(sessionId) {
  if (!sessionId) return 'no-session';
  
  // Truncate long session IDs for display
  if (sessionId.length > 16) {
    return `${sessionId.substring(0, 8)}...${sessionId.substring(sessionId.length - 4)}`;
  }
  return sessionId;
}

/**
 * Validate session ID format
 * @param {string} sessionId - The session ID to validate
 * @returns {boolean} True if valid format
 */
function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // Check if it's NOT a timestamp format (which we're moving away from)
  if (/^\d{8}_\d{6}/.test(sessionId) || /^\d{4}-\d{2}-\d{2}/.test(sessionId)) {
    return false;
  }
  
  // Valid session IDs should be alphanumeric with possible underscores/hyphens
  return /^[a-zA-Z0-9_-]+$/.test(sessionId);
}

/**
 * Get session metadata
 * @param {string} sessionId - The session ID
 * @returns {object} Session metadata
 */
function getSessionMetadata(sessionId) {
  return {
    id: sessionId,
    format: isValidSessionId(sessionId) ? 'claude_session' : 'generated',
    created: new Date().toISOString(),
    source: detectSource(sessionId)
  };
}

/**
 * Detect the source of a session ID
 * @param {string} sessionId - The session ID
 * @returns {string} Source of the session ID
 */
function detectSource(sessionId) {
  if (process.env.CLAUDE_SESSION_ID === sessionId) {
    return 'CLAUDE_SESSION_ID env';
  }
  if (process.env.ANTHROPIC_SESSION_ID === sessionId) {
    return 'ANTHROPIC_SESSION_ID env';
  }
  if (process.env.CLAUDE_CONVERSATION_ID === sessionId) {
    return 'CLAUDE_CONVERSATION_ID env';
  }
  if (detectFromClaudeContext() === sessionId) {
    return 'context_files';
  }
  if (sessionId && sessionId.length === 16) {
    return 'generated';
  }
  return 'unknown';
}

module.exports = {
  getSessionId,
  formatSessionId,
  isValidSessionId,
  getSessionMetadata,
  detectFromClaudeContext,
  detectFromActiveSession
};