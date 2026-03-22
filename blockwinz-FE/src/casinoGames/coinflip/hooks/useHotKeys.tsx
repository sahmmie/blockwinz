import { useEffect } from 'react'
import { useGameControlsContext } from './gameControlsContext'
import { useSettingsStore } from '@/hooks/useSettings'
import { HotkeyConfigs } from '@/shared/types/core'
import { baseHotkeyConfigs } from '@/shared/constants/hotkeys'

export const useHotKeys = () => {
  const { setHotKeysConfig, setIsHotKeysEnabled } = useSettingsStore()
  const {
    betAmount,
    isLoading,
    isSpinning,
    startBetting,
    doubleBetAmount,
    halveBetAmount,
    increaseCoins,
    decreaseCoins,
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
      title: 'Decrease coin count',
      hotkeyLabel: 'a',
      hotKeyValue: 'a',
      onKeyActive: () => decreaseCoins(),
    },
    increaseTarget: {
      title: 'Increase coin count',
      hotkeyLabel: 'd',
      hotKeyValue: 'd',
      onKeyActive: () => increaseCoins(),
    },
  }

  useEffect(() => {
    setIsHotKeysEnabled(!isLoading || isSpinning)
  }, [isLoading])

  useEffect(() => {
    setHotKeysConfig(hotkeyConfig)
  }, [betAmount])

  return hotkeyConfig
}
