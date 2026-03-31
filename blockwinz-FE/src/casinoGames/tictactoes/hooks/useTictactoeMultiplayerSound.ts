import { Howl } from 'howler';
import { useCallback, useMemo } from 'react';

import sfxOwnMove from '@/assets/tictactoe-audio/cell-click-sound.mp3';
import sfxOpponentMove from '@/assets/tictactoe-audio/cell-click-ai.mp3';
import sfxWin from '@/assets/tictactoe-audio/win-sound.mp3';
import { useSettingsStore } from '@/hooks/useSettings';

export function useTictactoeMultiplayerSound() {
  const sounds = useMemo(
    () => ({
      own: new Howl({ src: [sfxOwnMove], volume: 0.55 }),
      opponent: new Howl({ src: [sfxOpponentMove], volume: 0.55 }),
      win: new Howl({ src: [sfxWin], volume: 0.55 }),
    }),
    [],
  );

  const playOwnMove = useCallback(() => {
    if (useSettingsStore.getState().settings.isMuted) return;
    sounds.own.play();
  }, [sounds]);

  const playOpponentMove = useCallback(() => {
    if (useSettingsStore.getState().settings.isMuted) return;
    sounds.opponent.play();
  }, [sounds]);

  const playWin = useCallback(() => {
    if (useSettingsStore.getState().settings.isMuted) return;
    sounds.win.play();
  }, [sounds]);

  return { playOwnMove, playOpponentMove, playWin };
}
