/**
 * Computer Use Tool — Type Definitions
 *
 * Built from scratch by Dek1MillionToken.
 * Based on Anthropic's official Computer Use API spec:
 * https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
 *
 * No @ant/* dependencies. Pure TypeScript.
 */

// ── Actions ─────────────────────────────────────────────────────────────────

/** All actions supported by the Computer Use Tool (superset of all versions) */
export type ComputerAction =
  // Basic actions (all versions)
  | 'screenshot'
  | 'left_click'
  | 'type'
  | 'key'
  | 'mouse_move'
  // Enhanced actions (computer_20250124+)
  | 'scroll'
  | 'left_click_drag'
  | 'right_click'
  | 'middle_click'
  | 'double_click'
  | 'triple_click'
  | 'left_mouse_down'
  | 'left_mouse_up'
  | 'hold_key'
  | 'wait'
  | 'cursor_position'
  // Enhanced actions (computer_20251124+)
  | 'zoom'

// ── Tool Input ──────────────────────────────────────────────────────────────

/** Input shape that Claude sends when requesting a computer action */
export interface ComputerToolInput {
  /** The action to perform */
  action: ComputerAction

  /** [x, y] screen coordinates for click/move actions */
  coordinate?: [number, number]

  /** Text to type (for "type" action) */
  text?: string

  /** Key or key combination to press, e.g. "ctrl+s", "enter" (for "key" action) */
  key?: string

  /** Duration in seconds (for "hold_key" action) */
  duration?: number

  /** Scroll direction (for "scroll" action) */
  scroll_direction?: 'up' | 'down' | 'left' | 'right'

  /** Number of scroll clicks (for "scroll" action) */
  scroll_amount?: number

  /** Starting coordinate for drag (for "left_click_drag" action) */
  start_coordinate?: [number, number]

  /** Region to zoom into [x1, y1, x2, y2] (for "zoom" action) */
  region?: [number, number, number, number]
}

// ── Tool Result ─────────────────────────────────────────────────────────────

/** A single content block in the tool result */
export type ComputerToolResultBlock =
  | {
      type: 'image'
      source: {
        type: 'base64'
        media_type: 'image/jpeg' | 'image/png'
        data: string
      }
    }
  | {
      type: 'text'
      text: string
    }

// ── Display ─────────────────────────────────────────────────────────────────

/** Information about a display/monitor */
export interface DisplayInfo {
  id: number
  width: number
  height: number
  scaleFactor: number
  isPrimary: boolean
}

/** Display configuration used for coordinate scaling */
export interface DisplayConfig {
  /** Physical screen width in pixels */
  screenWidth: number
  /** Physical screen height in pixels */
  screenHeight: number
  /** Scale factor for coordinate transformation */
  scaleFactor: number
  /** Scaled width sent to API (max 1568px long edge) */
  apiWidth: number
  /** Scaled height sent to API */
  apiHeight: number
}

// ── Executor Interface ──────────────────────────────────────────────────────

/** The executor interface — platform-specific implementations */
export interface ComputerExecutor {
  /** Capture a screenshot → base64 JPEG */
  screenshot(): Promise<{ base64: string; width: number; height: number }>

  /** Click at coordinates */
  click(x: number, y: number, button?: 'left' | 'right' | 'middle', count?: number): Promise<void>

  /** Type text */
  type(text: string): Promise<void>

  /** Press key or key combination */
  key(keySequence: string): Promise<void>

  /** Hold key for duration */
  holdKey(keySequence: string, durationMs: number): Promise<void>

  /** Move mouse to coordinates */
  moveMouse(x: number, y: number): Promise<void>

  /** Scroll at position */
  scroll(x: number, y: number, direction: 'up' | 'down' | 'left' | 'right', amount: number): Promise<void>

  /** Drag from one position to another */
  drag(from: { x: number; y: number }, to: { x: number; y: number }): Promise<void>

  /** Mouse button down */
  mouseDown(): Promise<void>

  /** Mouse button up */
  mouseUp(): Promise<void>

  /** Get current cursor position */
  getCursorPosition(): Promise<{ x: number; y: number }>

  /** Get display info */
  getDisplayInfo(): Promise<DisplayInfo[]>

  /** Read clipboard */
  readClipboard(): Promise<string>

  /** Write to clipboard */
  writeClipboard(text: string): Promise<void>
}

// ── Mode ────────────────────────────────────────────────────────────────────

/** Which mode the computer use tool is operating in */
export type ComputerUseMode = 'anthropic' | 'generic'
