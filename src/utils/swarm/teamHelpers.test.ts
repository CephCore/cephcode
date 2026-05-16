/**
 * Tests for teamHelpers.ts — team file management utilities.
 */

import { describe, expect, test } from 'bun:test';
import { sanitizeAgentName, sanitizeName } from './teamHelpers.js';

describe('teamHelpers', () => {
  describe('sanitizeName', () => {
    test('lowercases input', () => {
      expect(sanitizeName('MyTeam')).toBe('myteam');
    });

    test('replaces non-alphanumeric with hyphens', () => {
      expect(sanitizeName('My Team!')).toBe('my-team-');
    });

    test('handles complex names', () => {
      expect(sanitizeName('Auth & Security Team')).toBe('auth---security-team');
    });
  });

  describe('sanitizeAgentName', () => {
    test('replaces @ with -', () => {
      expect(sanitizeAgentName('researcher@auth-team')).toBe('researcher-auth-team');
    });

    test('handles names without @', () => {
      expect(sanitizeAgentName('researcher')).toBe('researcher');
    });
  });
});
