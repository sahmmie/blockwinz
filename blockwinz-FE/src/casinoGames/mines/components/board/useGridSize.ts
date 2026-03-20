import { useBreakpointValue, useMediaQuery } from '@chakra-ui/react'
import useParentSize from './useParentSize'
import { useIsMobile } from '@/hooks/useIsMobile'

export const useGridSize = () => {
  const isMobile = useIsMobile()

  const { parentRef, width, height } = useParentSize()

  const baseSize = Math.min(width, height)

  const [isLargerThan1400, isLargerThan1220, isLargerThan1600] = useMediaQuery([
    "(min-width: 1400px)",
    "(min-width: 1220px)",
    "(min-width: 1600px)",
  ], { fallback: [true, true, true], ssr: true });

  let gridSize = useBreakpointValue({
    base: '80%',
    md: `${baseSize / 1.2}px`,
    xl: `${baseSize / 1.3}px`,
    '2xl': `${baseSize / 1.2}px`,
  })

  gridSize = isMobile ? '80%' : gridSize

  const normalHeight = parseFloat(Math.min(100, 100 + (width / height) * 25).toFixed(1))
  const onOverlapHeight = parseFloat(Math.min(100, 100 + width / height).toFixed(1))

  const heightPercentage = isLargerThan1600
    ? 100
    : isLargerThan1220 && !isLargerThan1400
      ? onOverlapHeight
      : normalHeight

  return {
    gridSize,
    parentRef,
    heightPercentage,
  }
}
