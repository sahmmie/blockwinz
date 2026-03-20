import { useEffect, useRef, useState } from 'react'
import { useLimboGameContext } from '../context/LimboGameContext'

interface LimboBoxState {
  displayValue: number
  textColor: string
  shouldAnimate: boolean
}

export const useLimboBox = (): LimboBoxState => {
  const { resultMultiplier, isBetWon, animSpeed, addNewTagResult } = useLimboGameContext()
  const [state, setState] = useState<LimboBoxState>({
    displayValue: 1.0,
    textColor: 'white',
    shouldAnimate: false,
  })
  const prevResultMultiplier = useRef(resultMultiplier)

  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      displayValue: 1.0,
      textColor: 'white',
      shouldAnimate: false,
    }))
  }

  const startAnimation = () => {
    setState((prevState) => ({
      ...prevState,
      displayValue: parseFloat(resultMultiplier),
      shouldAnimate: true,
    }))
  }

  const updateFinalState = () => {
    setState((prevState) => ({
      ...prevState,
      textColor: isBetWon ? '#56B925' : '#F43B51',
      shouldAnimate: false,
    }))
  }

  const handleMultiplierChange = () => {
    resetState()
    addNewTagResult(parseFloat(resultMultiplier), isBetWon)
    startAnimation()

    setTimeout(() => {
      updateFinalState()

      prevResultMultiplier.current = resultMultiplier
    }, animSpeed)
  }

  useEffect(() => {
    if (resultMultiplier !== undefined) {
      return handleMultiplierChange()
    }
  }, [resultMultiplier])

  return state
}
