import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Box, GridItem } from '@chakra-ui/react';

import bombImg from 'assets/icons/mines-images/mine-bomb.png';
import diamondImg from 'assets/icons/mines-images/mine-diamond.png';

import useGameResult from '../../hooks/useGameResult';
import BaseInputs from '../BaseInputs';
import { minesOptions } from '../../constants';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import { generateMinesResult } from '@/shared/utils/fairLogic';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import {
  parseFairnessUrlSearch,
  patchFairnessUrlParams,
  PF_KEYS,
} from '../../fairnessUrlParams';

const getTileImage = (isMine: boolean) => (isMine ? bombImg : diamondImg);

interface Tile {
  isMine: boolean;
}

const BOARD_SIZE = 5;

const MineTile: React.FC<{
  content: React.ReactNode;
}> = ({ content }) => {
  return (
    <GridItem
      borderRadius={8}
      display='flex'
      alignItems='center'
      justifyContent='center'>
      {content}
    </GridItem>
  );
};

const MinesResult: React.FC = () => {
  const { baseInputs } = useGameInputsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseFairnessUrlSearch(searchParams),
    [searchParams],
  );
  const [mines, setMines] = useState(3);

  useEffect(() => {
    if (parsed.mines != null) setMines(parsed.mines);
  }, [parsed.mines]);

  const result = useGameResult(generateMinesResult, { ...baseInputs, mines });

  const handleMineDropdownChange = (value: string) => {
    const n = Number(value);
    setMines(n);
    setSearchParams(
      prev => patchFairnessUrlParams(prev, { [PF_KEYS.MINES]: n }),
      { replace: true },
    );
  };

  const tiles: Tile[] = Array(25)
    .fill(null)
    .map((_, index) => ({
      isMine: result?.includes(index) || false,
    }));

  return (
    <>
      <Box p={4}>
        <Grid templateColumns={`repeat(${BOARD_SIZE}, 1fr)`} gap={2}>
          {tiles.map((tile, index) => (
            <MineTile
              key={index}
              content={
                <img
                  src={getTileImage(tile.isMine)}
                  alt={tile.isMine ? 'Mine' : 'Diamond'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              }
            />
          ))}
        </Grid>
      </Box>
      <Box>
        <DropdownAlt
          label='Mines'
          options={minesOptions}
          handleChange={handleMineDropdownChange}
          selected={mines.toString()}
          placeholder={'Select Mines Count'}
        />
      </Box>
      <BaseInputs />
    </>
  );
};

export default MinesResult;
