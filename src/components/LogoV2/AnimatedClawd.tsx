import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box } from '../../ink.js';
import { getInitialSettings } from '../../utils/settings/settings.js';
import { Clawd, type SquidPose } from './Clawd.js';

type Frame = {
  pose: SquidPose;
  offset: number;
};

/** Hold a pose for n frames. */
function hold(pose: SquidPose, offset: number, frames: number): Frame[] {
  return Array.from({ length: frames }, () => ({ pose, offset }));
}

// Clawd is 6 rows tall:
//
//   ▄▄▄▄▄
// ▐███████▌
// ▐██   ██▌
// ▐██ ■ ██▌
// ▐███████▌
// ▗▞▜ ▟▛ ▙▚▖
//
// offset = 0 normal
// offset = 1 crouch/dip down, bottom row clips inside fixed-height container

const JUMP_WAVE: readonly Frame[] = [
  ...hold('default', 1, 2),
  ...hold('arms-up', 0, 3),
  ...hold('default', 0, 1),
  ...hold('default', 1, 2),
  ...hold('arms-up', 0, 3),
  ...hold('default', 0, 1),
];

const LOOK_AROUND: readonly Frame[] = [
  ...hold('look-right', 0, 5),
  ...hold('look-left', 0, 5),
  ...hold('default', 0, 1),
];

const CLICK_ANIMATIONS: readonly (readonly Frame[])[] = [JUMP_WAVE, LOOK_AROUND];

const IDLE: Frame = {
  pose: 'default',
  offset: 0,
};

const FRAME_MS = 60;
const CLAWD_HEIGHT = 6;

const incrementFrame = (i: number) => i + 1;

export function AnimatedClawd(): React.ReactNode {
  const { pose, bounceOffset, onClick } = useClawdAnimation();

  return (
    <Box height={CLAWD_HEIGHT} flexDirection="column" onClick={onClick}>
      <Box marginTop={bounceOffset} flexShrink={0}>
        <Clawd pose={pose} />
      </Box>
    </Box>
  );
}

function useClawdAnimation(): {
  pose: SquidPose;
  bounceOffset: number;
  onClick: () => void;
} {
  const [reducedMotion] = useState(() => getInitialSettings().prefersReducedMotion ?? false);

  const [frameIndex, setFrameIndex] = useState(-1);
  const sequenceRef = useRef<readonly Frame[]>(JUMP_WAVE);

  const onClick = () => {
    if (reducedMotion || frameIndex !== -1) return;

    sequenceRef.current = CLICK_ANIMATIONS[Math.floor(Math.random() * CLICK_ANIMATIONS.length)]!;

    setFrameIndex(0);
  };

  useEffect(() => {
    if (frameIndex === -1) return;

    if (frameIndex >= sequenceRef.current.length) {
      setFrameIndex(-1);
      return;
    }

    const timer = setTimeout(setFrameIndex, FRAME_MS, incrementFrame);
    return () => clearTimeout(timer);
  }, [frameIndex]);

  const seq = sequenceRef.current;

  const current = frameIndex >= 0 && frameIndex < seq.length ? seq[frameIndex]! : IDLE;

  return {
    pose: current.pose,
    bounceOffset: current.offset,
    onClick,
  };
}
