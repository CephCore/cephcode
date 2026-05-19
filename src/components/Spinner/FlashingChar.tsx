import type * as React from 'react';
import { Text, useTheme } from '../../ink.js';
import { getTheme, type Theme } from '../../utils/theme.js';
import { interpolateColor, parseRGB, toRGBColor } from './utils.js';

type Props = {
  char: string;
  flashOpacity: number;
  messageColor: keyof Theme;
  shimmerColor: keyof Theme;
};

export function FlashingChar({ char, flashOpacity, messageColor, shimmerColor }: Props): React.ReactNode {
  const [themeName] = useTheme();
  const theme = getTheme(themeName);

  const baseColorStr = theme[messageColor];
  const shimmerColorStr = theme[shimmerColor];

  const baseRGB = baseColorStr ? parseRGB(baseColorStr) : null;
  const shimmerRGB = shimmerColorStr ? parseRGB(shimmerColorStr) : null;

  if (baseRGB && shimmerRGB) {
    // Quantize to 4 steps to reduce VS Code terminal rendering glitches
    // from frequent color changes. Smooth interpolation at 60fps triggers
    // costly GPU re-composition in VS Code's webview-backed terminal.
    const quantized = Math.round(flashOpacity * 4) / 4;
    const interpolated = interpolateColor(baseRGB, shimmerRGB, quantized);
    return <Text color={toRGBColor(interpolated)}>{char}</Text>;
  }

  // Fallback for ANSI themes: binary switch
  const shouldUseShimmer = flashOpacity > 0.5;
  return <Text color={shouldUseShimmer ? shimmerColor : messageColor}>{char}</Text>;
}
