/**
 * Background session CLI — Wraps sessionManager with CLI-compatible signatures.
 *
 * Called from cli.tsx for commands: ps, logs, attach, kill, --bg, --background
 */

import {
  listSessionsCommand,
  attachCommand,
  logsCommand,
  stopCommand,
  bgFlagHandler as createBgSession,
} from './sessionManager.js'

export async function psHandler(args: string[]): Promise<void> {
  await listSessionsCommand()
}

export async function logsHandler(sessionId?: string): Promise<void> {
  await logsCommand(sessionId)
}

export async function attachHandler(sessionId?: string): Promise<void> {
  await attachCommand(sessionId)
}

export async function killHandler(sessionId?: string): Promise<void> {
  await stopCommand(sessionId)
}

export async function handleBgFlag(args: string[]): Promise<void> {
  // Parse --bg flag: prompt comes after the flag
  const bgIndex = args.findIndex(a => a === '--bg' || a === '--background')
  let prompt = ''
  let agent: string | undefined
  let model: string | undefined
  let permissionMode: string | undefined

  // Collect args after --bg as the prompt, checking for other flags
  const trailing = args.slice(bgIndex + 1)
  const nonFlagArgs: string[] = []

  for (let i = 0; i < trailing.length; i++) {
    const arg = trailing[i]
    if (arg === '--agent' && trailing[i + 1]) {
      agent = trailing[++i]
    } else if (arg === '--model' && trailing[i + 1]) {
      model = trailing[++i]
    } else if (arg === '--permission-mode' && trailing[i + 1]) {
      permissionMode = trailing[++i]
    } else {
      nonFlagArgs.push(arg!)
    }
  }

  prompt = nonFlagArgs.join(' ') || '(interactive)'

  const id = await createBgSession(prompt, agent, model, permissionMode)
  // createBgSession already prints the formatted output
}
