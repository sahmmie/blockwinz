import React, { useMemo } from 'react'
import { HStack, Tag, TagLabel } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameControlsContext } from '../../hooks/gameControlsContext'

const AnimatedTag = motion.create(Tag.Root)

/** Oldest → newest (left → right), same ordering as Dice `TagGroup` / `useGameState.tagResults`. */
export const PreviousResults: React.FC = () => {
  const { prevResults } = useGameControlsContext()
  const chronological = useMemo(
    () => [...prevResults].reverse(),
    [prevResults],
  )

  return (
    <HStack
      position='absolute'
      top='0'
      right='12px'
      alignItems='center'
      justifyContent='flex-end'
      flexWrap='wrap'
      gap='0.25rem'
      maxW='calc(100% - 24px)'
      rowGap='0.25rem'>
      <AnimatePresence initial={false} mode='popLayout'>
        {chronological.map((result) => (
          <AnimatedTag
            key={result.uid}
            bgColor={result.clr}
            size='md'
            borderRadius='md'
            minW='3rem'
            justifyContent='center'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.2,
              ease: [0.1, 0.1, 0.1, 0.1],
            }}
            layout>
            <TagLabel color={result.fontClr} fontWeight='bold'>
              {`${result.value.toFixed(2)}x`}
            </TagLabel>
          </AnimatedTag>
        ))}
      </AnimatePresence>
    </HStack>
  )
}
