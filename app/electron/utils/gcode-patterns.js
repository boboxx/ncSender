/**
 * Centralized G-code pattern matching utilities
 *
 * This module provides consistent pattern matching for G-code commands
 * across the application and plugins.
 */

/**
 * Pattern to match M6 tool change commands
 *
 * Matches:
 * - M6 T1, M6 T01, M06 T1 (with spaces)
 * - M6T1, M06T1 (no space)
 * - T1 M6, T1 M06 (T before M6 with space)
 * - T1M6, T2M6 (T before M6 without space)
 *
 * Does NOT match:
 * - M60, M61, M600 (other M-codes)
 * - M6R2 (M6 with other letter codes)
 *
 * Capture groups:
 * - Group 1: Tool number from M6 T# format
 * - Group 2: Tool number from T# M6 format
 */
const M6_PATTERN = /(?:^|[^A-Z])M0*6(?:\s*T0*(\d+)|(?=[^0-9T])|$)|(?:^|[^A-Z])T0*(\d+)\s*M0*6(?:[^0-9]|$)/i;

/**
 * Parse M6 tool change command and extract tool number
 *
 * @param {string} command - The G-code command to parse
 * @returns {Object|null} Object with { toolNumber, matched } or null if no match
 *
 * @example
 * parseM6Command('M6 T2')  // { toolNumber: 2, matched: true }
 * parseM6Command('T2M6')   // { toolNumber: 2, matched: true }
 * parseM6Command('M6')     // { toolNumber: null, matched: true }
 * parseM6Command('M60')    // null
 */
export function parseM6Command(command) {
  if (!command || typeof command !== 'string') {
    return null;
  }

  const normalizedCommand = command.trim().toUpperCase();
  const match = normalizedCommand.match(M6_PATTERN);

  if (!match) {
    return null;
  }

  // Extract tool number from either capture group
  const toolNumberStr = match[1] || match[2];
  const toolNumber = toolNumberStr ? parseInt(toolNumberStr, 10) : null;

  return {
    toolNumber: Number.isFinite(toolNumber) ? toolNumber : null,
    matched: true
  };
}

/**
 * Check if a command is an M6 tool change command
 *
 * @param {string} command - The G-code command to check
 * @returns {boolean} True if command is M6, false otherwise
 *
 * @example
 * isM6Command('M6 T2')  // true
 * isM6Command('M60')    // false
 */
export function isM6Command(command) {
  if (!command || typeof command !== 'string') {
    return false;
  }

  return M6_PATTERN.test(command.trim().toUpperCase());
}

/**
 * Get the M6 pattern regex for direct use
 * Use parseM6Command() instead when possible
 *
 * @returns {RegExp} The M6 pattern regex
 */
export function getM6Pattern() {
  return M6_PATTERN;
}

/**
 * Check if M6 command is for the same tool as currently loaded
 *
 * @param {string} command - The G-code command to check
 * @param {number} currentTool - The currently loaded tool number
 * @returns {Object} Object with { isSameTool, toolNumber, matched }
 *
 * @example
 * checkSameToolChange('M6 T2', 2)  // { isSameTool: true, toolNumber: 2, matched: true }
 * checkSameToolChange('M6 T3', 2)  // { isSameTool: false, toolNumber: 3, matched: true }
 * checkSameToolChange('G0 X10', 2) // { isSameTool: false, toolNumber: null, matched: false }
 */
export function checkSameToolChange(command, currentTool) {
  const parsed = parseM6Command(command);

  if (!parsed?.matched || parsed.toolNumber === null) {
    return { isSameTool: false, toolNumber: null, matched: false };
  }

  return {
    isSameTool: parsed.toolNumber === currentTool,
    toolNumber: parsed.toolNumber,
    matched: true
  };
}
