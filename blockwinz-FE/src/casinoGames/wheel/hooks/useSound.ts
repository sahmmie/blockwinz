import { useMemo } from 'react'
import { Howl, HowlOptions } from 'howler'

import startBetSound from '@/assets/general-audio/click-sound.mp3'
import wheelSpinSound from '@/assets/wheel-audio/wheel-spin-audio.mp3'
import wheelResultSound from '@/assets/wheel-audio/wheel-result-audio.mp3'

export type SoundName = 'startBet' | 'spin' | 'result'

interface Sounds {
  [key: string]: Howl
}

const createSound = (src: string, options?: HowlOptions): Howl => {
  const opts: HowlOptions = { src: [src], ...(options || {}) }
  return new Howl(opts)
}

export const useSound = () => {
  const sounds: Sounds = useMemo(
    () => ({
      startBet: createSound(startBetSound),
      spin: createSound(wheelSpinSound), // placeholder
      result: createSound(wheelResultSound), // placeholder
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

  const stop = (soundName: SoundName) => {
    const sound = sounds[soundName]
    if (sound && !Array.isArray(sound)) {
      sound.stop()
    }
  }

  return { play, stop }
}
