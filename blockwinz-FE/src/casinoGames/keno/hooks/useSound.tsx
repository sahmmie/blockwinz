import { Howl, HowlOptions } from 'howler';
import { useMemo } from 'react';

import sfxOnBetClick from 'assets/general-audio/click-sound.mp3';
import sfxAutoPick from 'assets/keno-audio/keno-select-sound.mp3';
import sfxTileSelect from 'assets/keno-audio/keno-select-sound.mp3';
import sfxScore from 'assets/keno-audio/keno-score-sound.mp3';
import sfxGemReveal from 'assets/keno-audio/keno-gen-reveal-sound.mp3';

import sfxTileReveal from 'assets/general-audio/click-sound.mp3';
import { useSettingsStore } from '@/hooks/useSettings';

type SoundName =
  | 'autoPick'
  | 'onBetClick'
  | 'score'
  | 'gemReveal'
  | 'tileReveal'
  | 'tileSelect';

interface Sounds {
  [key: string]: Howl;
}

const createSound = (src: string, options?: HowlOptions): Howl =>
  new Howl({ src, ...options });

export const useSound = () => {
    const {
      settings: { isMuted },
    } = useSettingsStore()
    
  const sounds: Sounds = useMemo(
    () => ({
      autoPick: createSound(sfxAutoPick),
      onBetClick: createSound(sfxOnBetClick),
      score: createSound(sfxScore),
      gemReveal: createSound(sfxGemReveal),
      tileReveal: createSound(sfxTileReveal),
      tileSelect: createSound(sfxTileSelect),
    }),
    [],
  );

  const play = (soundName: SoundName): void => {
    if (!sounds[soundName] || isMuted) return;

    sounds[soundName].play();
  };

  const playAudioSequence = async (soundName: SoundName) => {
    const playAudio = async (soundName: SoundName) => {
      await new Promise<void>(resolve => {
        const sound = sounds[soundName];
        sound.on('end', () => resolve());
        sound.play();
      });
    };

    await playAudio(soundName);
  };

  return { play, playAudioSequence };
};
