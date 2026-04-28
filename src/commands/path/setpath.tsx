import chalk from 'chalk'
import figures from 'figures'
import React from 'react'
import { getCwdState } from '../../bootstrap/state.js'
import { setCwd } from '../../utils/Shell.js'
import type { LocalJSXCommandContext } from '../../commands.js'
import { MessageResponse } from '../../components/MessageResponse.js'
import { Box, Text } from '../../ink.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'
import { existsSync } from 'fs'
import { resolve } from 'path'

export async function call(
  onDone: LocalJSXCommandOnDone,
  context: LocalJSXCommandContext,
  args?: string,
): Promise<React.ReactNode> {
  const targetPath = (args ?? '').trim()

  if (!targetPath) {
    const currentCwd = getCwdState()
    onDone(`Current working directory: ${chalk.bold(currentCwd)}`)
    return null
  }

  const resolvedPath = resolve(targetPath)

  // Check if directory exists
  if (!existsSync(resolvedPath)) {
    const message = `Directory not found: ${chalk.bold(resolvedPath)}`
    return (
      <MessageResponse>
        <Text>{message}</Text>
      </MessageResponse>
    )
  }

  // Check if it's actually a directory
  const stats = await import('fs').then(fs => fs.promises.stat(resolvedPath))
  if (!stats.isDirectory()) {
    const message = `Path is not a directory: ${chalk.bold(resolvedPath)}`
    return (
      <MessageResponse>
        <Text>{message}</Text>
      </MessageResponse>
    )
  }

  const previousCwd = getCwdState()

  // Set the new working directory using setCwd which resolves symlinks
  setCwd(resolvedPath)

  const message = `Working directory changed from ${chalk.bold(previousCwd)} to ${chalk.bold(resolvedPath)}`
  onDone(message)

  return (
    <MessageResponse>
      <Text>{message}</Text>
    </MessageResponse>
  )
}
