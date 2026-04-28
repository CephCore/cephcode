import * as React from 'react'
import { Text } from '../../ink.js'
import { useSetAppState } from '../../state/AppState.js'
import { clearBetasCaches } from '../../utils/betas.js'
import { getSystemContext } from '../../context.js'
import { clearToolSchemaCache } from '../../utils/toolSchemaCache.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { isEnvTruthy } from '../../utils/envUtils.js'

function EnableComputerComponent({ onDone }: { onDone: (result?: string) => void }) {
  const setAppState = useSetAppState()
  
  React.useEffect(() => {
    if (!isEnvTruthy(process.env.ENABLE_COMPUTER_USE)) {
        process.env.ENABLE_COMPUTER_USE = '1'
        clearBetasCaches()
        clearToolSchemaCache()
        getSystemContext.cache.clear?.()
        setAppState(prev => ({ ...prev, computerUseEnabled: true }))
    }
    
    const timer = setTimeout(() => {
        onDone('Computer Use enabled')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onDone, setAppState])

  return (
    <Text>
      {'\n'} Computer Use has been enabled! 🖥️🚀{'\n'}
      The model now has access to your screen and input.
    </Text>
  )
}

export const call: LocalJSXCommandCall = async (onDone) => {
  return <EnableComputerComponent onDone={onDone} />
}
