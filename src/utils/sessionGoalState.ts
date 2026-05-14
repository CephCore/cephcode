import { join } from 'path'
import { getSessionId } from '../bootstrap/state.js'
import { getCwd } from './cwd.js'
import { pathExists } from './file.js'
import { mkdir, readFile, unlink, writeFile } from 'fs/promises'

/**
 * Persistent session goal state.
 *
 * Goal is set via /goal command:
 *   - Stored in AppState for the status line display
 *   - Synced to this module singleton for system prompt injection
 *   - Persisted to disk so it survives /clear, /compact, and session restarts
 *
 * Persistence path: ~/.claude/projects/<slug>/sessions/<sessionId>/goal.json
 */

let currentGoal: string | null = null
let restored = false
let persistencePath: string | null = null

function getGoalFilePath(): string {
  if (persistencePath) return persistencePath
  const sessionId = getSessionId()
  const cwd = getCwd()
  const slug = Buffer.from(cwd).toString('base64url').slice(0, 32)
  persistencePath = join(
    process.env.HOME || process.env.USERPROFILE || '/tmp',
    '.claude', 'projects', slug, 'sessions', sessionId, 'goal.json',
  )
  return persistencePath
}

async function tryRestore(): Promise<void> {
  if (restored) return
  restored = true
  try {
    const filePath = getGoalFilePath()
    const exists = await pathExists(filePath)
    if (!exists) return
    const raw = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as { goal?: string }
    if (parsed.goal) {
      currentGoal = parsed.goal
    }
  } catch {
    // Non-fatal — goal stays null
  }
}

export function getSessionGoal(): string | null {
  return currentGoal
}

/**
 * Synchronous version for use in non-async contexts (e.g. system prompt builder).
 * Lazily triggers async restore on first call; subsequent calls use cached value.
 * The async restore races the first prompt — if not yet complete, returns null
 * for the first turn, then the restored value for subsequent turns.
 */
export function getSessionGoalSync(): string | null {
  if (!restored) {
    tryRestore()
  }
  return currentGoal
}

export function setSessionGoal(goal: string | null): void {
  currentGoal = goal
  restored = true // don't re-restore after explicit set
  persistGoal(goal).catch(() => {})
}

async function persistGoal(goal: string | null): Promise<void> {
  try {
    const filePath = getGoalFilePath()
    if (goal === null) {
      try { await unlink(filePath) } catch { /* ENOENT ok */ }
    } else {
      await mkdir(join(filePath, '..'), { recursive: true })
      await writeFile(filePath, JSON.stringify({ goal }), 'utf-8')
    }
  } catch {
    // Persistence failures are non-fatal — goal still works in-memory
  }
}
