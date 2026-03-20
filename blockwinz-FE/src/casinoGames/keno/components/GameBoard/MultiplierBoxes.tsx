import { Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BsPercent } from 'react-icons/bs';
import { useKenoGameContext } from '../../context/KenoGameContext';
import useWalletState from '@/hooks/useWalletState';
import {
  kenoChances,
  kenoData as kenoPayouts,
} from '../../constants/constants';
import CustomInput from '@/components/CustomInput/CustomInput';
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LuChartLine } from 'react-icons/lu';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { Currency } from '@blockwinz/shared';
import GoldCoinIcon from 'assets/icons/gold-coin-icon.svg';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';

export type KenoRisk = 'classic' | 'low' | 'medium' | 'high';

interface KenoBoxProps {
  selectedNumbers: number;
  risk: KenoRisk;
}

const MultiplierBoxes: React.FC<KenoBoxProps> = ({
  selectedNumbers,
  risk = 'classic',
}) => {
  const { betAmount } = useKenoGameContext();

  const { selectedBalance } = useWalletState();

  const isMobile = useBreakpointValue({ base: true, lg: false, md: false });

  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const ROUNDING_DECIMALS = selectedBalance.decimals || DEFAULT_ROUNDING_DECIMALS;

  const renderMultiplierBoxes = () => {
    const boxes = [];
    for (let i = 0; i <= selectedNumbers; i++) {
      boxes.push(
        <Box
          key={`multiplier-${i}`}
          flex='1'
          h={isMobile ? '24px' : '45px'}
          bg='#CCCCCD1A'
          borderRadius='md'
          display='flex'
          alignItems='center'
          justifyContent='center'
          color='white'
          mx={isMobile ? '2px' : '6px'}>
          <Text fontSize={isMobile ? '0.8rem' : '1rem'}>
            x{kenoPayouts[risk][selectedNumbers][i]}
          </Text>
        </Box>,
      );
    }
    return boxes;
  };

  const renderValueBoxes = () => {
    const boxes = [];
    for (let i = 0; i <= selectedNumbers; i++) {
      const multiplier = kenoPayouts[risk][selectedNumbers][i] || 0;
      const profit = (multiplier * betAmount - betAmount).toFixed(
        ROUNDING_DECIMALS,
      );
      const isOpen = hoveredBox === i;

      boxes.push(
        <PopoverRoot key={`value-${i}`} open={isOpen}>
          <PopoverTrigger asChild>
            <Box
              flex='1'
              h={isMobile ? '32px' : '48px'}
              bg={isOpen ? '#CCCCCD1A' : '#545463'}
              borderRadius='md'
              display='flex'
              alignItems='center'
              justifyContent='center'
              color='white'
              mx={isMobile ? '-3px' : '6px'}
              cursor='pointer'
              onMouseEnter={() => setHoveredBox(i)}
              onMouseLeave={() => setHoveredBox(null)}>
              <Text
                fontSize={isMobile ? '0.8rem' : '1rem'}
                mr={{ md: '-4px', lg: '2px' }}>
                {`x${i}`}
              </Text>
              <img
                src={GoldCoinIcon}
                alt='Currency Icon'
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </PopoverTrigger>
          <PopoverContent
            width='100%'
            bg='#545463'
            border='1px solid'
            borderColor={'#CCCCCD1A'}
            onMouseEnter={() => setHoveredBox(i)}
            onMouseLeave={() => setHoveredBox(null)}>
            <PopoverBody>
              <Flex
                gap={4}
                direction={isMobile ? 'column' : 'row'}
                alignItems={'center'}>
                <CustomInput
                  title='Multiplier'
                  value={multiplier.toFixed(2)}
                  inputGroupProps={{
                    endElement: (
                      <Box pr='8px'>
                        <LuChartLine color='#FFFFFF' />
                      </Box>
                    ),
                  }}
                  disabled
                />
                <CustomInput
                  title='Profit'
                  value={profit}
                  disabled
                  inputGroupProps={{
                    endElement: (
                      <img
                        src={
                          currencyIconMap[selectedBalance?.currency as Currency]
                        }
                        width={20}
                        height={20}
                        alt='currency'
                      />
                    ),
                  }}
                />
                <CustomInput
                  title='Chance'
                  value={kenoChances[selectedNumbers][i].toLocaleString(
                    'fullwide',
                    {
                      useGrouping: false,
                      maximumFractionDigits: 2,
                    },
                  )}
                  inputGroupProps={{
                    endElement: (
                      <Box pr='8px'>
                        <BsPercent color='#FFFFFF' />
                      </Box>
                    ),
                  }}
                  disabled
                />
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>,
      );
    }
    return boxes;
  };

  return (
    <Box maxWidth={'756px'} width={'100%'}>
      <Flex
        wrap='nowrap'
        justify='space-between'
        mb={4}
        mx={isMobile ? '-0px' : '-6px'}>
        {renderMultiplierBoxes()}
      </Flex>
      <Box borderRadius='md' maxWidth={'100%'} width={'100%'}>
        <Flex
          wrap='nowrap'
          justify='space-between'
          mx={isMobile ? '0' : '-6px'}>
          {renderValueBoxes()}
        </Flex>
      </Box>
    </Box>
  );
};

export default MultiplierBoxes;
