/**
 * Computer Use Tool — Coordinate Scaling
 *
 * Handles transformation between screen coordinates and API coordinates.
 * The Anthropic API constrains images to max 1568px on the longest edge
 * and ~1.15 megapixels total. We must scale screenshots down and scale
 * Claude's coordinates back up to match the real screen.
 *
 * Ref: https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
 *      (section: "Handle coordinate scaling for higher resolutions")
 *
 * Built from scratch by Dek1MillionToken. No @ant/* dependencies.
 */

import type { DisplayConfig } from './types.js'

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum pixels on the longest edge (API constraint) */
const MAX_LONG_EDGE = 1568

/** Maximum total pixels (~1.15 megapixels) */
const MAX_TOTAL_PIXELS = 1_150_000

// ── Scale Factor ─────────────────────────────────────────────────────────────

/**
 * Calculate the scale factor needed to meet API constraints.
 * Returns a value between 0 and 1. If 1.0, no scaling needed.
 *
 * Matches the official Python implementation:
 * ```python
 * long_edge_scale = 1568 / long_edge
 * total_pixels_scale = math.sqrt(1_150_000 / total_pixels)
 * return min(1.0, long_edge_scale, total_pixels_scale)
 * ```
 */
export function getScaleFactor(width: number, height: number): number {
  const longEdge = Math.max(width, height)
  const totalPixels = width * height

  const longEdgeScale = MAX_LONG_EDGE / longEdge
  const totalPixelsScale = Math.sqrt(MAX_TOTAL_PIXELS / totalPixels)

  return Math.min(1.0, longEdgeScale, totalPixelsScale)
}

/**
 * Get the scaled dimensions for the API.
 * Returns the width/height that should be sent to Claude.
 */
export function getScaledDimensions(
  screenWidth: number,
  screenHeight: number,
): { width: number; height: number; scaleFactor: number } {
  const scaleFactor = getScaleFactor(screenWidth, screenHeight)
  return {
    width: Math.round(screenWidth * scaleFactor),
    height: Math.round(screenHeight * scaleFactor),
    scaleFactor,
  }
}

// ── Coordinate Transformation ────────────────────────────────────────────────

/**
 * Scale coordinates from API space (what Claude sees) back to screen space.
 * Claude sends coordinates based on the scaled screenshot.
 * We need to convert them to actual screen coordinates for mouse actions.
 *
 * Example: Screen is 1920x1080, scaled to 1024x576 (scale=0.533)
 *   Claude clicks at (512, 288) → actual screen position (960, 540)
 */
export function scaleToScreen(
  x: number,
  y: number,
  scaleFactor: number,
): { x: number; y: number } {
  return {
    x: Math.round(x / scaleFactor),
    y: Math.round(y / scaleFactor),
  }
}

/**
 * Scale coordinates from screen space to API space.
 * Used when we need to report positions back to Claude.
 */
export function scaleToApi(
  x: number,
  y: number,
  scaleFactor: number,
): { x: number; y: number } {
  return {
    x: Math.round(x * scaleFactor),
    y: Math.round(y * scaleFactor),
  }
}

// ── Display Config Builder ───────────────────────────────────────────────────

/**
 * Build a DisplayConfig from raw screen dimensions.
 * This is the main entry point — call once at startup.
 */
export function buildDisplayConfig(
  screenWidth: number,
  screenHeight: number,
): DisplayConfig {
  const { width, height, scaleFactor } = getScaledDimensions(
    screenWidth,
    screenHeight,
  )
  return {
    screenWidth,
    screenHeight,
    scaleFactor,
    apiWidth: width,
    apiHeight: height,
  }
}
