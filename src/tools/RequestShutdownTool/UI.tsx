import type React from 'react';
import { jsonParse } from '../../utils/slowOperations.js';
import type { Output } from './RequestShutdownTool.js';

export function renderToolUseMessage(input: Record<string, unknown>): React.ReactNode {
  const target = typeof input.target === 'string' ? input.target : 'teammate';
  return `request shutdown: ${target}`;
}

export function renderToolResultMessage(
  content: Output | string,
  _progressMessages: unknown,
  { verbose: _verbose }: { verbose: boolean },
): React.ReactNode {
  const result: Output = typeof content === 'string' ? jsonParse(content) : content;

  if ('success' in result && 'target' in result) {
    if (result.success) {
      return `sent shutdown request to ${result.target}${result.requestId ? ` (${result.requestId})` : ''}`;
    }
    return `failed to send shutdown request to ${result.target}${result.error ? `: ${result.error}` : ''}`;
  }

  return null;
}
