import { useMemo } from 'react'
import { Howl, HowlOptions } from 'howler'

import startBetSound from '../../../assets/general-audio/click-sound.mp3'
import bombRevealSound from '../../../assets/mines-audio/mine-explosion.mp3'
import gemRevelSound from '../../../assets/mines-audio/mine-gem-reveal.mp3'
import cashoutSound from '../../../assets/mines-audio/mine-cashout.mp3'
import tileClick from '../../../assets/mines-audio/mine-click.mp3'

import { useSettingsStore } from '@/hooks/useSettings'

type SoundName = 'startBet' | 'cashout' | 'tileClick' | 'gemReveal' | 'bombReveal';

interface Sounds {
  [key: string]: Howl
}

const createSound = (src: string, options?: HowlOptions): Howl => new Howl({ src, ...options })

export const useSound = () => {
  const {
    settings: { isMuted },
  } = useSettingsStore()

  const sounds: Sounds = useMemo(
    () => ({
      startBet: createSound(startBetSound),
      cashout: createSound(cashoutSound),
      tileClick: createSound(tileClick),
      gemReveal: createSound(gemRevelSound),
      bombReveal: createSound(bombRevealSound),
    }),
    []
  )

  const play = (soundName: SoundName): void => {
    if (isMuted) {
      return
    }
    if (sounds[soundName]) {
      sounds[soundName].play()
    }
  }

  return { play }
}
