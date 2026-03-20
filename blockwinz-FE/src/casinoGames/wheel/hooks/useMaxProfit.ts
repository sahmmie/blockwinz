import { useValidation } from '@/hooks/useValidation'
import useWalletState from '@/hooks/useWalletState'
import { maxProfitValidationSchema } from '@/shared/constants/validation'
import { Currency } from '@blockwinz/shared'
import { useEffect } from 'react'

export const useMaxProfit = (betAmount: number, multiplier: number) => {
  const { selectedBalance } = useWalletState()
  const { errors, handleBlur, validateForm } = useValidation({
    values: { betAmount },
    validationSchema: maxProfitValidationSchema(selectedBalance?.currency as Currency, multiplier),
    validateOnChange: true,
  })

  useEffect(() => {
    validateForm()
  }, [betAmount, multiplier])

  return {
    maxProfitErrors: errors,
    maxProfitHandleBlur: handleBlur,
  }
}
