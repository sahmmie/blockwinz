import { Howl, HowlOptions } from 'howler';
import { useMemo } from 'react';

import sfxDiceThrow from '../../../assets/dice-audio/dice_throw.mp3';
import sfxDiceWin from '../../../assets/dice-audio/dice_score.mp3';
import diceRollChange from '../../../assets/dice-audio/dice-roll-change.mp3';
import sfxBet from '../../../assets/general-audio/click-sound.mp3';

type SoundName = 'bet' | 'diceThrow' | 'diceWin' | 'diceRollChange';

interface Sounds {
  [key: string]: Howl;
}

const createSound = (src: string, options?: HowlOptions): Howl =>
  new Howl({ src, ...options });

export const useSound = () => {
  const sounds: Sounds = useMemo(
    () => ({
      bet: createSound(sfxBet),
      diceThrow: createSound(sfxDiceThrow, {
        src: [sfxDiceThrow],
        volume: 0.5,
      }),
      diceWin: createSound(sfxDiceWin, {
        src: [sfxDiceWin],
        volume: 0.5,
      }),
      diceRollChange: createSound(diceRollChange),
    }),
    [],
  );

  const play = (soundName: SoundName, isMuted: boolean = false): void => {
    if (isMuted) return;

    if (!sounds[soundName]) return;

    sounds[soundName].play();
  };

  const playAudioSequence = async (isMuted: boolean) => {
    if (isMuted) return;

    const playAudio = async (soundName: SoundName) => {
      await new Promise<void>(resolve => {
        const sound = sounds[soundName];
        sound.on('end', () => resolve());
        sound.play();
      });
    };

    await playAudio('bet');
    await playAudio('diceThrow');
  };

  return { play, playAudioSequence };
};
