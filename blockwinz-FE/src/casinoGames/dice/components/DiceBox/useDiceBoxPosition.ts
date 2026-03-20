import { useCallback, useEffect, useRef, useState } from 'react'


const PARENT_PADDING = 75 // Total padding of the parent (left + right)

const calculateAdjustedPosition = (
  diceResult: number,
  boxWidth: number,
  parentWidth: number
): number => {
  const pinEnd = parentWidth - boxWidth / 2 - PARENT_PADDING / 2
  return pinEnd - (1 - diceResult / 100) * (parentWidth - PARENT_PADDING)
}

export const useDiceBoxPosition = (diceResult: number, animSpeed: number) => {
  const [animate, setAnimate] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const previousDiceResult = useRef(diceResult)
  const [boxDimensions, setBoxDimensions] = useState({ width: 0, height: 0 })
  const [parentDimensions, setParentDimensions] = useState({ width: 0, height: 0 })

  const updateDimensions = useCallback(() => {
    if (boxRef.current && boxRef.current.parentElement) {
      setBoxDimensions({
        width: boxRef.current.offsetWidth,
        height: boxRef.current.offsetHeight,
      })
      setParentDimensions({
        width: boxRef.current.parentElement.offsetWidth,
        height: boxRef.current.parentElement.offsetHeight,
      })
    }
  }, [])

  useEffect(() => {
    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (boxRef.current && boxRef.current.parentElement) {
      resizeObserver.observe(boxRef.current.parentElement)
    }

    return () => resizeObserver.disconnect()
  }, [updateDimensions])

  useEffect(() => {
    const shouldAnimate = diceResult !== previousDiceResult.current
    setAnimate(shouldAnimate)
    previousDiceResult.current = diceResult
  }, [diceResult])

  const leftPosition = calculateAdjustedPosition(
    diceResult,
    boxDimensions.width,
    parentDimensions.width
  )
  const bottomOffset = parentDimensions.height + boxDimensions.height / 2

  return {
    boxRef,
    animationStyles: {
      left: `${leftPosition}px`,
      bottom: `${bottomOffset}px`,
      opacity: diceResult !== -1 ? 1 : 0,
      transition: animate ? `left ${animSpeed}ms ease` : 'none',
      animation: animate ? `${'scaleUp'} ${animSpeed}ms ease-in-out` : 'none',
    },
  }
}
