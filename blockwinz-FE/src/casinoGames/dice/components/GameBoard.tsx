import MultiplierChanceInput from '@/components/MultiplierChanceInput/MultiplierChanceInput';
import { TagGroup } from '@/components/TagGroup';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useDiceGameContext } from '../context/DiceGameContext';
import CustomSlider from '@/components/DiceSlider';
import DiceBox from './DiceBox';
import CustomInput from '@/components/CustomInput/CustomInput';
import RollSwapIcon from '../../../assets/icons/rollswap-icon.svg';
import { Button } from '@/components/ui/button';
import { useSound } from '../hooks/useSound';
import { useSettingsStore } from '@/hooks/useSettings';

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
    result,
    isSuccess,
    isRollOver,
    rollOverBet,
    handleSliderChange,
    toggleRollOver,
  } = useDiceGameContext();
  const { play } = useSound();
  const { settings } = useSettingsStore();

  const renderTagResults = () => (
    <Box alignSelf={'flex-end'}>
      <TagGroup tags={tagResults} duration={animSpeed / 1000} />
    </Box>
  );

  const label = (): JSX.Element => {
    return (
      <>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          color={'#D9D9D9'}
          mb={'-2px'}>
          <Box fontSize={'18px'} fontWeight={'500'} lineHeight={'30px'}>
            <Text>{isRollOver ? 'Roll Over' : 'Roll Under'}</Text>
          </Box>
        </Box>
      </>
    );
  };

  const endElement = () => {
    return (
      <>
        <Button bg={'none'} onClick={toggleRollOver}>
          <img
            src={RollSwapIcon}
            alt='Multiplier Icon'
            style={{ width: '20px', height: '20px' }}
          />
        </Button>
      </>
    );
  };

  const playSound = () => {
    play('diceRollChange', settings.isMuted);
  };

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
          px={{ base: '16px', md: '32px' }}
          fontSize={'40px'}
          h={'100%'}
          w={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          flex={1}
          flexDirection={'column'}>
          <Box
            position={'relative'}
            w={'100%'}
            h={'100%'}
            mt={{ base: '100px', md: '60' }}>
            <DiceBox
              animSpeed={animSpeed}
              diceResult={result}
              successResult={isSuccess}
            />
            <CustomSlider
              onValueChangeEnd={playSound}
              value={[rollOverBet]}
              defaultValue={[50]}
              isRollOver={isRollOver}
              readOnly={isLoading}
              onChange={e =>
                handleSliderChange(
                  (e.target as unknown as { value: number }).value,
                )
              }
            />
          </Box>
        </Box>

        <Box
          px={{ base: '16px', md: '0' }}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'flex-start'}
          mt={{ base: '64px', md: '16px' }}
          mb={{ base: '0', md: '32px' }}
          gap={{ base: '8px', md: '20px' }}>
          <MultiplierChanceInput
            disabled={isLoading}
            error={errors.multiplier}
            name='multiplier'
            value={multiplier}
            setValue={setMultiplier}
            handleBlur={() => handleBlur('multiplier')}
          />
          <CustomInput
            name={'rollOverBet'}
            type='number'
            value={rollOverBet?.toFixed(2)}
            disabled={isLoading}
            readOnly={true}
            w={'100%'}
            fieldProps={{ label: label() }}
            inputGroupProps={{
              bg: '#423547',
              endElement: endElement(),
            }}
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
