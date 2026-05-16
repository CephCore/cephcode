import { describe, expect, test } from 'bun:test';
import { posixPathToWindowsPath, windowsPathToPosixPath } from './windowsPaths.js';

describe('windowsPaths', () => {
  test('windowsPathToPosixPath converts drive letter paths', () => {
    expect(windowsPathToPosixPath('C:\\Users\\test')).toBe('/c/Users/test');
  });

  test('windowsPathToPosixPath handles UNC paths', () => {
    expect(windowsPathToPosixPath('\\\\server\\share')).toBe('//server/share');
  });

  test('posixPathToWindowsPath converts back', () => {
    expect(posixPathToWindowsPath('/c/Users/test')).toBe('C:\\Users\\test');
  });

  test('posixPathToWindowsPath handles UNC paths', () => {
    expect(posixPathToWindowsPath('//server/share')).toBe('\\\\server\\share');
  });
});
