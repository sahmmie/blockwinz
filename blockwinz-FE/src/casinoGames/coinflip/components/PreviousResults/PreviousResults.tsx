import React from 'react'
import { Tag, TagLabel, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameControlsContext } from '../../hooks/gameControlsContext'

const AnimatedTag = motion.create(Tag.Root)

export const PreviousResults: React.FC = () => {
  const { prevResults } = useGameControlsContext()

  return (
    <VStack position='absolute' top='0' right='12px' alignItems='center' gap='0.25rem'>
      <AnimatePresence initial={false} mode='popLayout'>
        {prevResults.map((result) => (
          <AnimatedTag
            key={result.uid}
            bgColor={result.clr}
            size='md'
            borderRadius='md'
            width='3rem'
            justifyContent='center'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.2,
              ease: [0.1, 0.1, 0.1, 0.1],
            }}
            layout
          >
            <TagLabel color={result.fontClr} fontWeight='bold'>
              {`${result.value.toFixed(2)}x`}
            </TagLabel>
          </AnimatedTag>
        ))}
      </AnimatePresence>
    </VStack>
  )
}
