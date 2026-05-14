import type { ToolUseContext } from '../../Tool.js'
import type {
  LocalJSXCommandContext,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import { getSessionGoal, setSessionGoal } from '../../utils/sessionGoalState.js'
import { getSettings_DEPRECATED } from '../../utils/settings/settings.js'

/**
 * /goal command — sets a session goal that is shown in the footer status line.
 *
 * Usage:
 *   /goal              — show current goal
 *   /goal <text>       — set goal
 *   /goal clear        — remove goal
 *   /goal ""           — remove goal
 */
export async function call(
  onDone: LocalJSXCommandOnDone,
  context: ToolUseContext & LocalJSXCommandContext,
  args: string,
): Promise<null> {
  const trimmed = args?.trim() ?? ''

  // Check if hooks are disabled — goal turn tracking depends on hooks for
  // counting, and a missing hook can cause the indicator to hang instead of
  // resolving. Show a clear message rather than silently stalling.
  if (trimmed) {
    const settings = getSettings_DEPRECATED()
    if (settings.disableAllHooks || settings.allowManagedHooksOnly) {
      onDone(
        `Goal '${trimmed}' cannot be tracked: hooks are disabled (${settings.disableAllHooks ? 'disableAllHooks' : 'allowManagedHooksOnly'}). Goal-based turn tracking requires hooks to be enabled.`,
        { display: 'system' },
      )
      return null
    }
  }

  const state = context.getAppState()

  // Show current goal with stats
  if (!trimmed) {
    const currentGoal = state.sessionGoal
    if (currentGoal) {
      const elapsed = state.sessionGoalStartTime
        ? Math.floor((Date.now() - state.sessionGoalStartTime) / 1000)
        : 0
      const turns = state.sessionGoalTurnCount ?? 0
      const elapsedStr = elapsed > 0
        ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
        : '0s'
      onDone(
        `Goal: ${currentGoal}\nElapsed: ${elapsedStr} · Turns: ${turns}`,
        { display: 'system' },
      )
    } else {
      onDone('No goal set. Usage: /goal <text> —or— /goal clear', { display: 'system' })
    }
    return null
  }

  // Clear goal
  if (trimmed.toLowerCase() === 'clear') {
    context.setAppState(prev => ({
      ...prev,
      sessionGoal: undefined,
      sessionGoalStartTime: undefined,
      sessionGoalTurnCount: undefined,
    }))
    setSessionGoal(null)

    onDone('Session goal cleared.', { display: 'system' })
    return null
  }

  // Set goal
  context.setAppState(prev => ({
    ...prev,
    sessionGoal: trimmed,
    sessionGoalStartTime: Date.now(),
    sessionGoalTurnCount: 0,
    standaloneAgentContext: prev.standaloneAgentContext
      ? { ...prev.standaloneAgentContext }
      : undefined,
  }))
  setSessionGoal(trimmed) // sync to singleton so system prompt can read it

  onDone(`Goal set: ${trimmed}`, { display: 'system' })
  return null
}
