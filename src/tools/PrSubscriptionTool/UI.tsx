import type React from 'react';
import { jsonParse } from '../../utils/slowOperations.js';
import type { SubscribeOutput, UnsubscribeOutput } from './PrSubscriptionTool.js';

export function renderSubscribeToolUseMessage(input: Record<string, unknown>): React.ReactNode {
  const url = typeof input.pr_url === 'string' ? input.pr_url : 'unknown';
  return `subscribe to PR: ${url}`;
}

export function renderUnsubscribeToolUseMessage(input: Record<string, unknown>): React.ReactNode {
  const url = typeof input.pr_url === 'string' ? input.pr_url : 'unknown';
  return `unsubscribe from PR: ${url}`;
}

export function renderSubscribeToolResultMessage(
  content: SubscribeOutput | string,
  _progressMessages: unknown,
  { verbose: _verbose }: { verbose: boolean },
): React.ReactNode {
  const result: SubscribeOutput = typeof content === 'string' ? jsonParse(content) : content;

  if (result.prUrl) {
    return result.success
      ? `subscribed to ${result.prUrl} — events will arrive as user messages`
      : `failed to subscribe: ${result.error || 'unknown error'}`;
  }
  return null;
}

export function renderUnsubscribeToolResultMessage(
  content: UnsubscribeOutput | string,
  _progressMessages: unknown,
  { verbose: _verbose }: { verbose: boolean },
): React.ReactNode {
  const result: UnsubscribeOutput = typeof content === 'string' ? jsonParse(content) : content;

  if (result.prUrl) {
    return result.success
      ? `unsubscribed from ${result.prUrl}`
      : `failed to unsubscribe: ${result.error || 'unknown error'}`;
  }
  return null;
}
