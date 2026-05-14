// Past tense verbs for turn completion messages
// These verbs work naturally with "for [duration]" (e.g., "Worked for 5s")

import { getSpinnerVerbs, SPINNER_VERBS as SPINNER_VERBS_DEFAULT } from './spinnerVerbs.js'

/**
 * Derive a past-tense verb from a present-participle verb (ending in -ing).
 * Falls back to the original verb if it doesn't end in -ing.
 */
function toPastTense(verb: string): string {
  if (verb.endsWith('ing')) {
    // Apply English past-tense rules.
    // -ing → -ed (e.g., "Cooking" → "Cooked")
    // -ning → -nned for CVC patterns (e.g., "Planning" → "Planned")
    // Simple rule: if double-consonant + ing, keep double consonant + ed
    // For simplicity, just strip "ing" and add "ed"
    const stem = verb.slice(0, -3)
    // Check for double-letter patterns (e.g., stopping → stopped)
    if (stem.length >= 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      return stem + 'ed'
    }
    return stem + 'ed'
  }
  if (verb.endsWith('e')) return verb + 'd'
  if (verb.endsWith('ed')) return verb // already past tense
  return verb + 'ed'
}

/**
 * Returns the list of turn-completion verbs.
 * When custom spinnerVerbs are configured, derives past-tense forms from them
 * so that user-configured verbs appear everywhere.
 * Falls back to the hardcoded TURN_COMPLETION_VERBS when using defaults.
 */
export function getTurnCompletionVerbs(): string[] {
  const verbs = getSpinnerVerbs()
  // Only derive from spinner verbs if the user has custom verbs configured
  // (the default list is the same built-in list, so we'd just duplicate work)
  const defaultVerbs = new Set(SPINNER_VERBS_DEFAULT)
  const hasCustomVerbs = verbs.some(v => !defaultVerbs.has(v))

  if (hasCustomVerbs) {
    return verbs.map(toPastTense)
  }
  return TURN_COMPLETION_VERBS
}

export const TURN_COMPLETION_VERBS = [
  'Baked',
  'Brewed',
  'Churned',
  'Cogitated',
  'Cooked',
  'Crunched',
  'Sautéed',
  'Worked',
]
