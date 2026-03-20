import { Box, Image } from '@chakra-ui/react'
import React from 'react'

interface CustomSliderThumbProps {
  imgSrc: string
}

const CustomSliderThumb: React.FC<CustomSliderThumbProps> = ({ imgSrc }) => {
  return (
    <Box
      position='relative'
      width='36px'
      height='36px'
      bg='buttonSecondary.bg2'
      borderRadius='8px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      boxShadow='md'
    >
      <Image src={imgSrc} alt='Slider Thumb' />
    </Box>
  )
}

export default CustomSliderThumb
