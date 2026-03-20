import { HotkeyConfig } from '../types/core'

export const baseHotkeyConfigs: Record<string, HotkeyConfig> = {
  placeBet: {
    title: 'Place Bet',
    hotkeyLabel: 'Space',
    hotKeyValue: 'space',
    onKeyActive: () => {},
  },
  doubleBet: {
    title: 'Double Bet',
    hotkeyLabel: 'W',
    hotKeyValue: 'w',
    onKeyActive: () => {},
  },
  halveBet: {
    title: 'Halve Bet',
    hotkeyLabel: 'S',
    hotKeyValue: 's',
    onKeyActive: () => {},
  },
} as const 