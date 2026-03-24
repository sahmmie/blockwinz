import { Grid, GridItem, Heading } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { BORDER_COLOR, HOVER_COLOR, oColor, xColor } from '../constants';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import { MpPhase } from '../types';
import { toaster } from '@/components/ui/toaster';

interface TictactoeBoxProps {}

const TictactoeBox: FunctionComponent<TictactoeBoxProps> = () => {
  const animSpeed = 500;
  const { state, actions } = useTictactoeGameContext();
  const { cells, hasEnded, isActiveGame, mpPhase } = state;
  const { handleSelectCell } = actions;

  const selectCell = (cell: string, index: number) => {
    if (!isActiveGame()) {
      const title =
        mpPhase === MpPhase.Lobby
          ? 'Waiting for an opponent to join'
          : 'Use Quick match or join a lobby from the panel';
      return toaster.create({
        title,
        type: 'info',
      });
    }
    if (hasEnded() && isActiveGame()) {
      return toaster.create({
        title: 'Game has ended',
        type: 'error',
      });
    }

    if (!hasEnded() && !cell && isActiveGame()) {
      handleSelectCell(index);
      return;
    }
  };

  return (
    <>
      <Grid
        templateColumns='repeat(3, 1fr)'
        gap={0}
        width='100%'
        aspectRatio={1}
        height={{ base: '300px', md: '100%' }}
        borderRadius='md'
        overflow='hidden'>
        {cells.map((cell, index) => (
          <GridItem
            key={index}
            aspectRatio='1'
            display='flex'
            alignItems='center'
            justifyContent='center'
            borderRightWidth={index % 3 !== 2 ? '6px' : 0}
            borderBottomWidth={index < 6 ? '6px' : 0}
            borderColor={BORDER_COLOR}
            onClick={() => selectCell(cell, index)}
            cursor={!hasEnded() && !cell ? 'pointer' : 'default'}
            _hover={{
              bg: !hasEnded() && !cell ? HOVER_COLOR : undefined,
            }}
            transition={`background-color ${animSpeed}ms ease-in-out`}>
            <Heading
              fontWeight={600}
              fontSize='100px'
              color={cell === 'X' ? xColor : oColor}
              opacity={cell ? 1 : 0}
              transition={`opacity ${animSpeed}ms ease-in-out`}>
              {cell}
            </Heading>
          </GridItem>
        ))}
      </Grid>
    </>
  );
};

export default TictactoeBox;
