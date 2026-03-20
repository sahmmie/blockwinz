import { useEffect } from 'react'
import { useGameControlsContext } from './gameControlsContext'
import { useSettingsStore } from '@/hooks/useSettings'
import { HotkeyConfigs } from '@/shared/types/core'
import { baseHotkeyConfigs } from '@/shared/constants/hotkeys'

export const useHotKeys = () => {
  const { setHotKeysConfig, setIsHotKeysEnabled } = useSettingsStore()
  const {
    mode,
    isAutoBetting,
    betAmount,
    isLoading,
    isSpinning,
    startBetting,
    doubleBetAmount,
    halveBetAmount,
    increaseSegments,
    decreaseSegments,
  } = useGameControlsContext()

  const hotkeyConfig: HotkeyConfigs = {
    placeBet: {
      ...baseHotkeyConfigs.placeBet,
      onKeyActive: startBetting,
    },
    doubleBet: {
      ...baseHotkeyConfigs.doubleBet,
      onKeyActive: doubleBetAmount,
    },
    halveBet: {
      ...baseHotkeyConfigs.halveBet,
      onKeyActive: halveBetAmount,
    },
    decreaseTarget: {
      title: 'Decrease segments',
      hotkeyLabel: 'a',
      hotKeyValue: 'a',
      onKeyActive: () => decreaseSegments(),
    },
    increaseTarget: {
      title: 'Increase segments',
      hotkeyLabel: 'd',
      hotKeyValue: 'd',
      onKeyActive: () => increaseSegments(),
    },
  }

  useEffect(() => {
    setIsHotKeysEnabled(!isLoading || isSpinning)
  }, [isLoading])

  useEffect(() => {
    setHotKeysConfig(hotkeyConfig)
  }, [betAmount, mode, isAutoBetting])

  return hotkeyConfig
}
