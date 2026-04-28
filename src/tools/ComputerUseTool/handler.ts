/**
 * Computer Use Tool — Action Handler
 *
 * The central dispatcher: receives action requests from Claude,
 * routes them to the correct input/screenshot function, and returns results.
 *
 * This handler is shared between both Anthropic mode and Generic mode.
 *
 * Built from scratch by Dek1MillionToken. No @ant/* dependencies.
 */

import type {
  ComputerToolInput,
  ComputerToolResultBlock,
  DisplayConfig,
} from './types.js'
import { captureScreenshot } from './screenshot.js'
import {
  clickAt,
  moveMouse,
  typeText,
  pressKey,
  holdKey,
  scrollAt,
  drag,
  mouseDown,
  mouseUp,
  getCursorPosition,
  readClipboard,
  writeClipboard,
} from './input.js'
import { scaleToScreen } from './scaling.js'
import { logForDebugging } from '../../utils/debug.js'

// ── Main Handler ─────────────────────────────────────────────────────────────

/**
 * Handle a computer action request from Claude.
 *
 * @param input - The action request (action, coordinate, text, etc.)
 * @param config - Display configuration for coordinate scaling
 * @returns Array of result blocks (image for screenshot, text for others)
 */
export async function handleComputerAction(
  input: ComputerToolInput,
  config: DisplayConfig,
): Promise<ComputerToolResultBlock[]> {
  logForDebugging(
    `[ComputerUse] handleAction: ${input.action}` +
      (input.coordinate ? ` at (${input.coordinate.join(',')})` : '') +
      (input.text ? ` text="${input.text.substring(0, 30)}"` : '') +
      (input.key ? ` key="${input.key}"` : ''),
  )

  try {
    switch (input.action) {
      // ── Screenshot ──────────────────────────────────────────────
      case 'screenshot': {
        const result = await captureScreenshot()
        return [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: result.base64,
            },
          },
        ]
      }

      // ── Mouse Click ─────────────────────────────────────────────
      case 'left_click': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await clickAt(x, y, 'left', 1)
        return textResult(`Clicked at (${x}, ${y})`)
      }

      case 'right_click': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await clickAt(x, y, 'right', 1)
        return textResult(`Right-clicked at (${x}, ${y})`)
      }

      case 'middle_click': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await clickAt(x, y, 'middle', 1)
        return textResult(`Middle-clicked at (${x}, ${y})`)
      }

      case 'double_click': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await clickAt(x, y, 'left', 2)
        return textResult(`Double-clicked at (${x}, ${y})`)
      }

      case 'triple_click': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await clickAt(x, y, 'left', 3)
        return textResult(`Triple-clicked at (${x}, ${y})`)
      }

      // ── Mouse Move ──────────────────────────────────────────────
      case 'mouse_move': {
        const [x, y] = scaleCoord(input.coordinate, config)
        await moveMouse(x, y)
        return textResult(`Moved mouse to (${x}, ${y})`)
      }

      // ── Mouse Down/Up ───────────────────────────────────────────
      case 'left_mouse_down': {
        if (input.coordinate) {
          const [x, y] = scaleCoord(input.coordinate, config)
          await moveMouse(x, y)
        }
        await mouseDown()
        return textResult('Mouse button pressed down')
      }

      case 'left_mouse_up': {
        if (input.coordinate) {
          const [x, y] = scaleCoord(input.coordinate, config)
          await moveMouse(x, y)
        }
        await mouseUp()
        return textResult('Mouse button released')
      }

      // ── Drag ────────────────────────────────────────────────────
      case 'left_click_drag': {
        const startCoord = input.start_coordinate ?? input.coordinate
        if (!startCoord || !input.coordinate) {
          return textResult('Error: drag requires start_coordinate and coordinate')
        }
        const from = scaleToScreen(startCoord[0]!, startCoord[1]!, config.scaleFactor)
        const to = scaleToScreen(input.coordinate[0]!, input.coordinate[1]!, config.scaleFactor)
        await drag(from, to)
        return textResult(`Dragged from (${from.x}, ${from.y}) to (${to.x}, ${to.y})`)
      }

      // ── Keyboard ────────────────────────────────────────────────
      case 'type': {
        if (!input.text) {
          return textResult('Error: type action requires text')
        }
        await typeText(input.text)
        return textResult(`Typed "${input.text.substring(0, 50)}${input.text.length > 50 ? '...' : ''}"`)
      }

      case 'key': {
        const keyCombo = input.key
        if (!keyCombo) {
          return textResult('Error: key action requires key')
        }
        await pressKey(keyCombo)
        return textResult(`Pressed key: ${keyCombo}`)
      }

      case 'hold_key': {
        const heldKey = input.key
        const duration = (input.duration ?? 1) * 1000 // seconds → ms
        if (!heldKey) {
          return textResult('Error: hold_key action requires key')
        }
        await holdKey(heldKey, duration)
        return textResult(`Held key "${heldKey}" for ${input.duration ?? 1}s`)
      }

      // ── Scroll ──────────────────────────────────────────────────
      case 'scroll': {
        const [sx, sy] = input.coordinate
          ? scaleCoord(input.coordinate, config)
          : [config.screenWidth / 2, config.screenHeight / 2]
        const direction = input.scroll_direction ?? 'down'
        const amount = input.scroll_amount ?? 3
        await scrollAt(sx, sy, direction, amount)
        return textResult(`Scrolled ${direction} by ${amount} at (${sx}, ${sy})`)
      }

      // ── Wait ────────────────────────────────────────────────────
      case 'wait': {
        const waitMs = (input.duration ?? 1) * 1000
        await new Promise(resolve => setTimeout(resolve, waitMs))
        return textResult(`Waited ${input.duration ?? 1} seconds`)
      }
      
      // ── Info ────────────────────────────────────────────────────
      case 'cursor_position': {
        const pos = await getCursorPosition()
        // Scale back to API-space
        const apiX = Math.round(pos.x / config.scaleFactor)
        const apiY = Math.round(pos.y / config.scaleFactor)
        return textResult(`Cursor position: (${apiX}, ${apiY})`)
      }

      // ── Zoom ────────────────────────────────────────────────────
      case 'zoom': {
        // Zoom captures a region at full resolution
        // For now, we just take a full screenshot (TODO: implement region capture)
        const result = await captureScreenshot()
        return [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: result.base64,
            },
          },
        ]
      }

      default:
        return textResult(`Unknown action: ${input.action}`)
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    logForDebugging(`[ComputerUse] Action failed: ${errMsg}`)
    return textResult(`Error: ${errMsg}`)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Scale API coordinates to screen coordinates, with validation */
function scaleCoord(
  coordinate: [number, number] | undefined,
  config: DisplayConfig,
): [number, number] {
  if (!coordinate) {
    throw new Error('coordinate is required for this action')
  }
  const { x, y } = scaleToScreen(coordinate[0]!, coordinate[1]!, config.scaleFactor)
  return [x, y]
}

/** Helper to create a text result block */
function textResult(text: string): ComputerToolResultBlock[] {
  return [{ type: 'text', text }]
}
