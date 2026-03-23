import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { GameRenderer } from './GameRenderer';
import { BetStatus } from '@/shared/types/core';

export type CoinFlipOutcomeGameCanvasProps = {
  coins: number;
  min: number;
  coinType: number;
} & (
  | { verified: false }
  | {
      verified: true;
      results: number[];
      multiplier: number;
      isWin: boolean;
    }
);

/**
 * Same Pixi layout as the main game. `verified: false` shows the default / preset coin layout;
 * `verified: true` replays a resolved round via `get()`.
 */
export function CoinFlipOutcomeGameCanvas(props: CoinFlipOutcomeGameCanvasProps) {
  const { coins, min, coinType } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const isVerified = props.verified;
  const vResults = isVerified ? props.results : null;
  const vMultiplier = isVerified ? props.multiplier : null;
  const vIsWin = isVerified ? props.isWin : null;

  const verifyKey = isVerified
    ? `${vResults!.join(',')}|${vMultiplier}|${String(vIsWin)}`
    : 'preview';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const renderer = new GameRenderer(coins, min, coinType);
    renderer.setTurbo(true);
    let cancelled = false;

    const ready = renderer.setContainer(el).then(() => {
      if (cancelled) return;
      if (
        isVerified &&
        vResults != null &&
        vMultiplier != null &&
        vIsWin != null
      ) {
        renderer.get(
          vResults,
          vMultiplier,
          vIsWin ? BetStatus.WIN : BetStatus.LOSE,
        );
      }
    });

    return () => {
      cancelled = true;
      void ready.finally(() => {
        renderer.destroy();
      });
    };
  }, [
    coins,
    min,
    coinType,
    isVerified,
    verifyKey,
    vResults,
    vMultiplier,
    vIsWin,
  ]);

  return (
    <Box
      className='renderbox'
      position='relative'
      w='100%'
      aspectRatio={4 / 3}>
      <Box ref={containerRef} w='100%' h='100%' />
    </Box>
  );
}
