import { useContext } from 'react'
import { GameControlsContext } from './GameControlsContextDefinition'

export const useGameControls = () => {
    const context = useContext(GameControlsContext)
    if (!context) {
        throw new Error('useGameControls must be used within a GameControlsProvider')
    }
    return context
}
