import React, { useEffect, useState } from 'react'
import { Box, Flex, Image } from '@chakra-ui/react'
import { BsPercent } from 'react-icons/bs'
import { keyframes } from '@emotion/react'
import CustomInput from '@/components/CustomInput/CustomInput'
import { useIsMobile } from '@/hooks/useIsMobile'
import { wheelMuls } from '@/casinoGames/wheel/wheelMuls'
import { useGameControlsContext } from '../../hooks/gameControlsContext'
import useWalletState from '@/hooks/useWalletState'
import { currencyIconMap } from '@/shared/utils/gameMaps'

interface HoverInfoProps {
  multiplier: number
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`

const fadeInMob = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5) translateY(-2px);
  }
  to {
    opacity: 1;
    transform: scale(0.5) translateY(0);
  }
`

const fadeOutMob = keyframes`
  from {
    opacity: 1;
    transform: scale(0.5) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.5) translateY(-2px);
  }
`

const HoverInfo: React.FC<HoverInfoProps> = ({ multiplier }) => {
  const { betAmount, risk, segments } = useGameControlsContext()
  const {
    selectedBalance,
  } = useWalletState()
  const isMobile = useIsMobile()

  const [isVisible, setIsVisible] = useState(true)

  const bA = parseFloat(betAmount)
  const profit = multiplier * bA - bA

  // Calculate how many times this multiplier occurs
  const occurrences = wheelMuls[risk][segments].muls.filter(mul => mul === multiplier).length
  const totalSegments = segments
  const chance = ((occurrences / totalSegments) * 100).toFixed(2)

  const fi = isMobile ? fadeInMob : fadeIn
  const fo = isMobile ? fadeOutMob : fadeOut

  const scl = isMobile ? 0.5 : 1
  useEffect(() => {
    setIsVisible(true)
    return () => {
      setIsVisible(false)
    }
  }, [])

  return (
    <Box
      position='absolute'
      top={isMobile ? '-70px' : '-80px'}
      zIndex={10}
      bg='bodyBg.bgHover'
      border='1px solid'
      borderColor={'bodyBg.bg2hover'}
      borderRadius='lg'
      padding='8px'
      minWidth='500px'
      textAlign='center'
      animation={`${isVisible ? fi : fo} 0.5s`}
      transform={`scale(${scl})`}
    >
      <Flex gap={4} direction='row' alignItems='center' justifyContent='center'>
        <CustomInput
          title='Profit'
          value={profit.toFixed(2)}
          inputGroupProps={{
            endElement: (
              <Box>
                <Image
                  src={currencyIconMap[selectedBalance?.currency || 'bwz']}
                  alt='currency'
                  width={'16px'}
                  height={'16px'}
                />
              </Box>
            ),
          }}
          readOnly
        />
        <CustomInput
          title='Chance'
          value={`${chance}%`}
          inputGroupProps={{
            endElement: (
              <Box>
                <BsPercent color='#FFFFFF' />
              </Box>
            ),
          }}
          readOnly
        />
      </Flex>
    </Box>
  )
}

export default HoverInfo

