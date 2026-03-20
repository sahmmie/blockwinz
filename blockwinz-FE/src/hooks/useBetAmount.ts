import { useValidation } from './useValidation'
import { useEffect } from 'react'
import useWalletState from './useWalletState'
import { betAmountValidationSchema } from '@/shared/constants/validation'
import { createMaxAmountValidationSchema } from '@/shared/utils/common'
import { Currency } from '@blockwinz/shared'

export const useBetAmount = (betAmount: string) => {
  const { selectedBalance } = useWalletState()
  const { errors, handleBlur, validateField } = useValidation({
    values: { betAmount },
    validationSchema: betAmountValidationSchema(selectedBalance?.availableBalance || 0),
    validateOnChange: true,
  })

  useEffect(() => {
    validateField('betAmount')
  }, [selectedBalance?.availableBalance, betAmount])

  return {
    betAmountErrors: errors,
    betAmountHandleBlur: handleBlur,
  }
}

export const useProfitAmount = (profitAmount: string) => {
  const { selectedBalance } = useWalletState()
  const schema = createMaxAmountValidationSchema(
    selectedBalance?.currency as Currency,
    'profit',
  )
  const { errors, handleBlur } = useValidation({
    values: { profit: profitAmount },
    validationSchema: schema,
    validateOnChange: true,
  })
  return {
    profitAmountErrors: errors,
    profitAmountHandleBlur: handleBlur,
  }
}
