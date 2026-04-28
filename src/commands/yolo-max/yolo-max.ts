import * as React from 'react';
import { YoloModePicker } from '../../components/YoloModePicker.js';
import type { LocalJSXCommandCall } from '../../types/command.js';

export const call: LocalJSXCommandCall = async (onDone, context) => {
  return React.createElement(YoloModePicker, { onDone, defaultTier: 'yoloMax' });
};
