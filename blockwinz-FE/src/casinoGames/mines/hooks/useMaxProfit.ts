import { useValidation } from "@/hooks/useValidation"
import useWalletState from "@/hooks/useWalletState"
import { maxProfitValidationSchema } from "@/shared/constants/validation"
import { Currency } from "@/shared/enums/currency.enum"
import { calculateWinMultiplier } from "@/shared/utils/common"
import { useEffect } from "react"

export const useMaxProfit = (betAmount: number, minesCount: number, openedMines: number) => {
    const { selectedBalance } = useWalletState()

    const multiplier = calculateWinMultiplier(openedMines < 1 ? 1 : openedMines, minesCount)
    const { errors, handleBlur, validateForm } = useValidation({
        values: { betAmount },
        validationSchema: maxProfitValidationSchema(selectedBalance?.currency as Currency, multiplier),
        validateOnChange: true,
    })

    useEffect(() => {
        validateForm()
    }, [betAmount, multiplier, openedMines])

    return {
        maxProfitErrors: errors,
        maxProfitHandleBlur: handleBlur,
    }
}