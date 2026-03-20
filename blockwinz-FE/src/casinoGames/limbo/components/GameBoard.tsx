import MultiplierChanceInput from '@/components/MultiplierChanceInput/MultiplierChanceInput';
import { TagGroup } from '@/components/TagGroup';
import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import LimboBox from './LimboBox';
import { useLimboGameContext } from '../context/LimboGameContext';

interface GameBoardProps {}

const GameBoard: FunctionComponent<GameBoardProps> = () => {
  const {
    animSpeed,
    multiplier,
    chance,
    setMultiplier,
    setChance,
    handleBlur,
    isLoading,
    errors,
    tagResults,
  } = useLimboGameContext();

  const renderTagResults = () => (
    <Box alignSelf={'flex-end'}>
      <TagGroup tags={tagResults} duration={animSpeed / 1000} />
    </Box>
  );

  return (
    <>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        pt={'16px'}
        justifyContent={'center'}
        h={'100%'}>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'right'}
          pr={{ md: '32px', base: '16px' }}
          h={{ base: '40px', md: 'auto' }}>
          {renderTagResults()}
        </Box>

        <Box
          pt={{ base: '28px', md: '0px' }}
          h={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}>
          <LimboBox />
        </Box>

        <Box
          px={{ base: '48px', md: '0px' }}
          display={'flex'}
          justifyContent={{ base: 'center', md: 'space-between' }}
          alignItems={'flex-start'}
          mt={{ base: '28px', md: '16px' }}
          mb={{ base: '0px', md: '32px' }}
          gap={{ base: '32px', md: '40px' }}>
          <MultiplierChanceInput
            disabled={isLoading}
            error={errors.multiplier}
            name='multiplier'
            value={multiplier}
            setValue={setMultiplier}
            handleBlur={() => handleBlur('multiplier')}
          />
          <MultiplierChanceInput
            disabled={isLoading}
            error={errors.chance}
            name='chance'
            value={chance}
            setValue={setChance}
            handleBlur={() => handleBlur('chance')}
          />
        </Box>
      </Box>
    </>
  );
};

export default GameBoard;
