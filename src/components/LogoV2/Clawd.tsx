import type * as React from 'react';
import { Box, Text } from '../../ink.js';

export type SquidPose = 'default' | 'look-left' | 'look-right' | 'arms-up';

type Props = {
  pose?: SquidPose;
};

type Segments = {
  r0: string;
  r1: string;
  r2L: string;
  r2R: string;
  r3L: string;
  r3R: string;
  r4: string;
  r5: string;
};

const EYE_EMPTY = '   ';

const PUPIL_BY_POSE: Record<SquidPose, string> = {
  default: ' ■ ',
  'look-left': '■  ',
  'look-right': '  ■',
  'arms-up': ' ■ ',
};

const TENTACLES = '▗▞▜ ▟▛ ▙▚▖';

const POSES: Record<SquidPose, Segments> = {
  default: {
    r0: '  ▄▄▄▄▄  ',
    r1: '███████',
    r2L: '██',
    r2R: '██',
    r3L: '██',
    r3R: '██',
    r4: '███████',
    r5: TENTACLES,
  },
  'look-left': {
    r0: '  ▄▄▄▄▄  ',
    r1: '███████',
    r2L: '██',
    r2R: '██',
    r3L: '██',
    r3R: '██',
    r4: '███████',
    r5: TENTACLES,
  },
  'look-right': {
    r0: '  ▄▄▄▄▄  ',
    r1: '███████',
    r2L: '██',
    r2R: '██',
    r3L: '██',
    r3R: '██',
    r4: '███████',
    r5: TENTACLES,
  },
  'arms-up': {
    r0: '▗ ▄▄▄ ▖ ',
    r1: '███████',
    r2L: '██',
    r2R: '██',
    r3L: '██',
    r3R: '██',
    r4: '███████',
    r5: TENTACLES,
  },
};

export function Clawd({ pose = 'default' }: Props = {}): React.ReactNode {
  const p = POSES[pose];

  const bodyRow = (children: React.ReactNode) => (
    <Text>
      <Text color="clawd_body">{'▐'}</Text>
      {children}
      <Text color="clawd_body">{'▌'}</Text>
    </Text>
  );

  const bodyFill = (value: string) => (
    <Text color="clawd_body" backgroundColor="clawd_body">
      {value}
    </Text>
  );

  const eyeGap = (value: string) => (
    <Text color="clawd_eye" backgroundColor="clawd_background">
      {value}
    </Text>
  );

  const eyeRow = (L: string, R: string, eyeContent: string) =>
    bodyRow(
      <>
        {bodyFill(L)}
        {eyeGap(eyeContent)}
        {bodyFill(R)}
      </>,
    );

  return (
    <Box flexDirection="column">
      <Text color="clawd_body">{p.r0}</Text>

      {bodyRow(bodyFill(p.r1))}

      {eyeRow(p.r2L, p.r2R, EYE_EMPTY)}
      {eyeRow(p.r3L, p.r3R, PUPIL_BY_POSE[pose])}

      {bodyRow(bodyFill(p.r4))}

      <Text color="clawd_body">{p.r5}</Text>
    </Box>
  );
}
