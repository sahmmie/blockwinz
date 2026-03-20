// useGameResult.ts
import { BaseFairLogicGenerateForGameDto } from '@/shared/types/core';
import { useState, useEffect } from 'react';

export type GameResultFunction<T, U extends BaseFairLogicGenerateForGameDto> = (
  request: U,
) => Promise<T>;

function useGameResult<T, U extends BaseFairLogicGenerateForGameDto>(
  gameFunction: GameResultFunction<T, U>,
  inputs: U,
): T | undefined {
  const [result, setResult] = useState<T>();

  useEffect(() => {
    let isCancelled = false;

    const fetchResult = async () => {
      try {
        const newResult = await gameFunction(inputs);
        if (!isCancelled) {
          setResult(newResult);
        }
      } catch {
        if (!isCancelled) {
          setResult(undefined);
        }
      }
    };

    fetchResult();

    return () => {
      isCancelled = true;
    };
  }, [gameFunction, inputs]);

  return result;
}

export default useGameResult;
