// Context bar renderer — pure ANSI (no Ink/React). Produces a horizontal
// segmented bar where each color-coded segment represents a category's
// proportion of the total context window.

import chalk from 'chalk';

/** A single segment in the context bar */
export interface BarSegment {
  tokens: number;
  colorHex: string;
  label?: string;
}

/**
 * Maps theme color keys to hex values for the default dark theme.
 * Used by `/context` to render category-colored bars without Ink.
 */
export const THEME_COLOR_TO_HEX: Record<string, string> = {
  promptBorder: '#999999',
  inactive: '#666666',
  inactiveShimmer: '#8E8E8E',
  cyan_FOR_SUBAGENTS_ONLY: '#0891B2',
  permission: '#5769F7',
  claude: '#D77757',
  warning: '#966C1E',
  purple_FOR_SUBAGENTS_ONLY: '#9333EA',
  green_FOR_SUBAGENTS_ONLY: '#16A34A',
  blue_FOR_SUBAGENTS_ONLY: '#2563EB',
  red_FOR_SUBAGENTS_ONLY: '#DC2626',
  yellow_FOR_SUBAGENTS_ONLY: '#CA8A04',
  orange_FOR_SUBAGENTS_ONLY: '#EA580C',
  pink_FOR_SUBAGENTS_ONLY: '#DB2777',
};

const FREE_COLOR = '#2A2A2A';

/**
 * Unicode block characters for fractional-width rendering.
 * Index = number of eighths filled (0..8).
 */
const FRACTIONS = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

/**
 * Render a horizontal segmented bar using ANSI colors.
 *
 * @param segments  Ordered segments — each gets a proportional slice.
 * @param width     Total character width of the bar (default 20).
 * @returns         ANSI-colored string like "███▉██░░░░░░"
 */
export function renderSegmentedBar(segments: BarSegment[], width: number = 20): string {
  if (segments.length === 0) return chalk.dim('·').repeat(width);

  const totalTokens = segments.reduce((s, seg) => s + seg.tokens, 0);
  if (totalTokens <= 0) return chalk.dim('·'.repeat(width));

  const chars: string[] = [];
  let cursor = 0; // fractional position in [0, width)

  for (const seg of segments) {
    const end = cursor + (seg.tokens / totalTokens) * width;
    const startInt = Math.floor(cursor);
    const endInt = Math.floor(end);
    const frac = end - endInt; // fractional part [0, 1)

    // Fill full blocks
    const fullCount = endInt - startInt;
    for (let i = 0; i < fullCount; i++) {
      chars.push(chalk.hex(seg.colorHex)('█'));
    }

    // Partial block (if not already at an integer boundary)
    if (frac > 0.001 && endInt < width) {
      const fracIndex = Math.round(frac * 8);
      chars.push(chalk.hex(seg.colorHex)(FRACTIONS[Math.min(fracIndex, 8)]));
    }

    cursor = end;
  }

  // Pad remaining width with free space
  while (chars.length < width) {
    chars.push(chalk.hex(FREE_COLOR)('░'));
  }

  // Truncate if we overfilled (rounding can cause one extra char)
  if (chars.length > width) {
    // Remove last char — rounding overshoot
    chars.length = width;
  }

  return chars.join('');
}

/**
 * Render a compact 2-segment bar: used vs free. Used portion is colored
 * by usage level (teal → blue → amber → red).
 */
export function renderUsageBar(usedPct: number, width: number = 10): string {
  const safePct = Math.min(100, Math.max(0, usedPct));
  const filledWidth = (safePct / 100) * width;
  const fullBlocks = Math.floor(filledWidth);
  const frac = filledWidth - fullBlocks;

  let color: string;
  if (safePct > 90) color = '#FF0055';
  else if (safePct > 75) color = '#FFCC00';
  else if (safePct > 50) color = '#00CCFF';
  else color = '#00FFCC';

  const chars: string[] = [];
  for (let i = 0; i < fullBlocks; i++) {
    chars.push(chalk.hex(color)('█'));
  }
  if (fullBlocks < width) {
    const fi = Math.round(frac * 8);
    if (fi > 0) {
      chars.push(chalk.hex(color)(FRACTIONS[Math.min(fi, 8)]));
    }
    // pad remaining
    while (chars.length < width) {
      chars.push(chalk.hex(FREE_COLOR)('░'));
    }
  }

  return chars.join('');
}
