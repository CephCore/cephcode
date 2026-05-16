import { z } from 'zod/v4';
import type { Tool } from '../../Tool.js';
import { buildTool, type ToolDef } from '../../Tool.js';
import { isAgentSwarmsEnabled } from '../../utils/agentSwarmsEnabled.js';
import { lazySchema } from '../../utils/lazySchema.js';
import { jsonStringify } from '../../utils/slowOperations.js';
import { sendShutdownRequestToMailbox } from '../../utils/teammateMailbox.js';
import { REQUEST_SHUTDOWN_TOOL_NAME } from './constants.js';
import { getPrompt } from './prompt.js';
import { renderToolResultMessage, renderToolUseMessage } from './UI.js';

const inputSchema = lazySchema(() =>
  z.strictObject({
    target: z.string().describe('Name of the teammate to request shutdown from.'),
    reason: z.string().optional().describe('Optional explanation for why shutdown is being requested.'),
  }),
);
type InputSchema = ReturnType<typeof inputSchema>;

export type Output = {
  success: boolean;
  target: string;
  requestId?: string;
  error?: string;
};

export type Input = z.infer<InputSchema>;

export const RequestShutdownTool: Tool<InputSchema, Output> = buildTool({
  name: REQUEST_SHUTDOWN_TOOL_NAME,
  searchHint: 'request a teammate to shut down gracefully',
  maxResultSizeChars: 10_000,
  shouldDefer: true,

  userFacingName() {
    return '';
  },

  get inputSchema(): InputSchema {
    return inputSchema();
  },

  isEnabled() {
    return isAgentSwarmsEnabled();
  },

  async description() {
    return 'Request a teammate to gracefully shut down';
  },

  async prompt() {
    return getPrompt();
  },

  mapToolResultToToolResultBlockParam(data, toolUseID) {
    return {
      tool_use_id: toolUseID,
      type: 'tool_result' as const,
      content: [
        {
          type: 'text' as const,
          text: jsonStringify(data),
        },
      ],
    };
  },

  async call(input, context) {
    const { target, reason } = input;
    const appState = context.getAppState();
    const teamName = appState.teamContext?.teamName;

    if (!teamName) {
      return {
        data: {
          success: false,
          target,
          error: 'Not in a team context. Call TeamCreate first to create a team.',
        },
      };
    }

    // Validate that the target teammate exists in the team context
    const teammate = Object.values(appState.teamContext?.teammates || {}).find(
      t => t.name.toLowerCase() === target.toLowerCase(),
    );
    if (!teammate) {
      return {
        data: {
          success: false,
          target,
          error: `Teammate "${target}" not found in team "${teamName}". Active teammates: ${
            Object.values(appState.teamContext?.teammates || {})
              .map(t => t.name)
              .filter(n => n !== 'team-lead')
              .join(', ') || 'none'
          }`,
        },
      };
    }

    try {
      const result = await sendShutdownRequestToMailbox(target, teamName, reason);

      return {
        data: {
          success: true,
          target: result.target,
          requestId: result.requestId,
        },
      };
    } catch (error) {
      return {
        data: {
          success: false,
          target,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },

  renderToolUseMessage,
  renderToolResultMessage,
} satisfies ToolDef<InputSchema, Output>);
