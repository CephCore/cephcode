import { basename } from 'path';
import type * as React from 'react';
import { useIdeConnectionStatus } from '../hooks/useIdeConnectionStatus.js';
import type { IDESelection } from '../hooks/useIdeSelection.js';
import { Box, Text } from '../ink.js';
import type { MCPServerConnection } from '../services/mcp/types.js';

type IdeStatusIndicatorProps = {
  ideSelection: IDESelection | undefined;
  mcpClients?: MCPServerConnection[];
};

export function IdeStatusIndicator({ ideSelection, mcpClients }: IdeStatusIndicatorProps): React.ReactNode {
  const { status: ideStatus } = useIdeConnectionStatus(mcpClients);

  // Check if we should show the IDE selection indicator
  const shouldShowIdeSelection =
    ideStatus === 'connected' && (ideSelection?.filePath || (ideSelection?.text && ideSelection.lineCount > 0));

  if (ideStatus === null || !shouldShowIdeSelection || !ideSelection) {
    return null;
  }

  if (ideSelection.text && ideSelection.lineCount > 0) {
    return (
      <Box width="100%" flexDirection="row" justifyContent="flex-end" key="selection-indicator">
        <Text color="ide" wrap="truncate">
          ⧉ {ideSelection.lineCount} {ideSelection.lineCount === 1 ? 'line' : 'lines'} selected
        </Text>
      </Box>
    );
  }

  if (ideSelection.filePath) {
    return (
      <Box width="100%" flexDirection="row" justifyContent="flex-end" key="selection-indicator">
        <Text color="ide" wrap="truncate">
          ⧉ In {basename(ideSelection.filePath)}
        </Text>
      </Box>
    );
  }
}
