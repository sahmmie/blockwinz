import { useMemo } from 'react'
import { Howl, HowlOptions } from 'howler'

import startBetSound from '@/assets/general-audio/click-sound.mp3'
import score1Sound from '@/assets/plinko-audio/plinko-1.mp3'
import score2Sound from '@/assets/plinko-audio/plinko-1.mp3'
import score3Sound from '@/assets/plinko-audio/plinko-2.mp3'
import score4Sound from '@/assets/plinko-audio/plinko-3.mp3'
import score5Sound from '@/assets/plinko-audio/plinko-4.mp3'
import score6Sound from '@/assets/plinko-audio/plinko-5.mp3'
import score7Sound from '@/assets/plinko-audio/plinko-6.mp3'

export type SoundName = 'startBet' | 'score'

interface Sounds {
  [key: string]: Howl | Howl[]
}

const createSound = (src: string | string[], options?: HowlOptions): Howl | Howl[] =>
  Array.isArray(src)
    ? src.map((s) => new Howl({ src: [s], ...options }))
    : new Howl({ src: [src], ...options })

export const useSound = () => {
  const sounds: Sounds = useMemo(
    () => ({
      startBet: createSound(startBetSound),
      score: createSound([
        score1Sound,
        score2Sound,
        score3Sound,
        score4Sound,
        score5Sound,
        score6Sound,
        score7Sound,
      ]),
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
