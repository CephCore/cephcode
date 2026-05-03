import * as React from 'react'
import { Box, Text } from 'ink'
import { detectCapabilities, formatCapabilitiesAsContext } from '../../utils/capabilities.js'
import type { LocalJSXCommandCall } from '../../types/command.js'

export const call: LocalJSXCommandCall = async (_onDone) => {
  const capabilities = await detectCapabilities()
  const output = formatCapabilitiesAsContext(capabilities)

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        🚀 System Capabilities
      </Text>
      <Text> </Text>
      <Text>
        This machine has the following tools and capabilities available:
      </Text>
      <Text> </Text>
      <Text>{output}</Text>
      <Text> </Text>
      <Text dimColor>
        This information is automatically prepended to conversation context,
        so Lulu knows what tools are available on this machine.
      </Text>
    </Box>
  )
}
