import { FC } from 'react'

import FloatGameResult from './FloatGameResult'
import BaseInputs from '../BaseInputs'
import useGameResult from '../../hooks/useGameResult'
import { useGameInputsContext } from '../../hooks/useGameInputsContext'
import { generateLimboResult } from '@/shared/utils/fairLogic'

const LimboResult: FC = () => {
  const { baseInputs } = useGameInputsContext()
  const result = useGameResult(generateLimboResult, baseInputs)

  return (
    <>
      <FloatGameResult result={result} />
      <BaseInputs />
    </>
  )
}

export default LimboResult
