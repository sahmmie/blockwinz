import { useEffect } from 'react'
import { useGameControlsContext } from './gameControlsContext'
import { useSettingsStore } from '@/hooks/useSettings'
import { HotkeyConfigs } from '@/shared/types/core'

const baseHotkeyConfigs: HotkeyConfigs = {
  placeBet: {
    title: 'Place bet',
    hotkeyLabel: 'Enter',
    hotKeyValue: 'enter',
    onKeyActive: () => {},
  },
  doubleBet: {
    title: 'Double bet',
    hotkeyLabel: '2',
    hotKeyValue: '2',
    onKeyActive: () => {},
  },
  halveBet: {
    title: 'Halve bet',
    hotkeyLabel: '1',
    hotKeyValue: '1',
    onKeyActive: () => {},
  },
}

export const useHotKeys = () => {
  const { setHotKeysConfig, setIsHotKeysEnabled } = useSettingsStore()
  const {
    mode,
    isAutoBetting,
    betAmount,
    isLoading,
    startBetting,
    doubleBetAmount,
    halveBetAmount,
    increaseRow,
    decreaseRow,
  } = useGameControlsContext()

  const hotkeyConfig: HotkeyConfigs = {
    placeBet: {
      title: baseHotkeyConfigs.placeBet!.title,
      hotkeyLabel: baseHotkeyConfigs.placeBet!.hotkeyLabel,
      hotKeyValue: baseHotkeyConfigs.placeBet!.hotKeyValue,
      onKeyActive: startBetting,
    },
    doubleBet: {
      title: baseHotkeyConfigs.doubleBet!.title,
      hotkeyLabel: baseHotkeyConfigs.doubleBet!.hotkeyLabel,
      hotKeyValue: baseHotkeyConfigs.doubleBet!.hotKeyValue,
      onKeyActive: doubleBetAmount,
    },
    halveBet: {
      title: baseHotkeyConfigs.halveBet!.title,
      hotkeyLabel: baseHotkeyConfigs.halveBet!.hotkeyLabel,
      hotKeyValue: baseHotkeyConfigs.halveBet!.hotKeyValue,
      onKeyActive: halveBetAmount,
    },
    decreaseTarget: {
      title: 'Decrease rows',
      hotkeyLabel: 'a',
      hotKeyValue: 'a',
      onKeyActive: () => decreaseRow(),
    },
    increaseTarget: {
      title: 'Increase rows',
      hotkeyLabel: 'd',
      hotKeyValue: 'd',
      onKeyActive: () => increaseRow(),
    },
  }

  useEffect(() => {
    setIsHotKeysEnabled(!isLoading)
  }, [isLoading])

  useEffect(() => {
    setHotKeysConfig(hotkeyConfig)
  }, [betAmount, mode, isAutoBetting])

  return hotkeyConfig
}
