import { Howl, HowlOptions } from 'howler'
import { useCallback, useMemo } from 'react'

import clickSound from '../../../assets/general-audio/click-sound.mp3'
import calcSound from '../../../assets/limbo-audio/calc-sound.mp3'
import scoreSound from '../../../assets/limbo-audio/score-sound.mp3'

type SoundName = 'click' | 'calc' | 'score'

interface Sounds {
  [key: string]: Howl
}

const createSound = (src: string, options?: HowlOptions): Howl => new Howl({ src, ...options })

export const useSound = () => {
  const sounds: Sounds = useMemo(
    () => ({
      click: createSound(clickSound),
      calc: createSound(calcSound),
      score: createSound(scoreSound),
    }),
    []
  )

  const play = useCallback(
    (soundName: SoundName, muted: boolean = false): Promise<void> => {
      return new Promise((resolve) => {
        if (muted || !sounds[soundName]) {
          resolve()
          return
        }
        const sound = sounds[soundName]
        const soundId = sound.play()
        sound.once(
          'end',
          () => {
            resolve()
          },
          soundId
        )
      })
    },
    [sounds]
  )

  const chainPlay = useCallback(
    async (soundNames: SoundName[], muted: boolean = false): Promise<void> => {
      for (const soundName of soundNames) {
        await play(soundName, muted)
      }
    },
    [play]
  )

  return { play, chainPlay }
}
