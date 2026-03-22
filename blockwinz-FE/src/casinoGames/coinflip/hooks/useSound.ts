import { useMemo } from 'react'
import { Howl, HowlOptions } from 'howler'

import startBetSound from '@/assets/general-audio/click-sound.mp3'

export type SoundName = 'startBet'

interface Sounds {
  [key: string]: Howl
}

const createSound = (src: string, options?: HowlOptions): Howl => new Howl({ src: [src], ...options })

export const useSound = () => {
  const sounds: Sounds = useMemo(
    () => ({
      startBet: createSound(startBetSound),
    }),
    []
  )

  const play = (soundName: SoundName, isMute: boolean = false, i?: number): void => {
    if (isMute) return
    const sound = sounds[soundName]
    if (!sound) return

    if (Array.isArray(sound) && i !== undefined) {
      sound[i]?.play()
    } else if (!Array.isArray(sound)) {
      sound.play()
    }
  }

  return { play }
}
