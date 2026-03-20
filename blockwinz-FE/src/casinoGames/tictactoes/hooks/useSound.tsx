import { useMemo } from 'react';
import { Howl, HowlOptions } from 'howler';

import startBetSound from '../../../assets/general-audio/click-sound.mp3';
import cashoutSound from '../../../assets/general-audio/click-sound.mp3';
import tileClick from '../../../assets/tictactoe-audio/cell-click-alt.mp3';
import tileClickAI from '../../../assets/tictactoe-audio/cell-click-ai.mp3';
import betWinSound from '../../../assets/tictactoe-audio/win-sound.mp3'
import { useSettingsStore } from '@/hooks/useSettings';

type SoundName = 'tileClick' | 'startBet' | 'cashout' | 'tileClickAI' | 'betWin';

interface Sounds {
  [key: string]: Howl;
}

const createSound = (src: string, options?: HowlOptions): Howl =>
  new Howl({ src, ...options });

export const useSound = () => {
  const {
    settings: { isMuted },
  } = useSettingsStore();

  const sounds: Sounds = useMemo(
    () => ({
      startBet: createSound(startBetSound),
      cashout: createSound(cashoutSound),
      tileClick: createSound(tileClick),
      tileClickAI: createSound(tileClickAI),
      betWin: createSound(betWinSound),
    }),
    [],
  );

  const play = (soundName: SoundName): void => {
    if (isMuted) {
      return;
    }
    if (sounds[soundName]) {
      sounds[soundName].play();
    }
  };

  return { play };
};
