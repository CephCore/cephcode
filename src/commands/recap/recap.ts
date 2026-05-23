import { REFERENCE_MARK } from '../../constants/figures.js';
import { generateAwaySummary } from '../../services/awaySummary.js';
import type { LocalCommandCall } from '../../types/command.js';
import type { Message } from '../../types/message.js';

export const call: LocalCommandCall = async (_args, context) => {
  const messages = context.messages;

  // Need at least a few turns to have something meaningful to recap
  const userTurns = messages.filter((m: Message) => m.type === 'user' && !m.isMeta && !m.isCompactSummary);
  if (userTurns.length < 1) {
    return { type: 'text', value: 'Nothing to recap yet — start a conversation first.' };
  }

  const controller = new AbortController();
  const text = await generateAwaySummary(messages, controller.signal);

  if (text === null) {
    return { type: 'text', value: 'Could not generate a recap right now. Try again in a moment.' };
  }

  return { type: 'text', value: `${REFERENCE_MARK} recap: ${text}` };
};
