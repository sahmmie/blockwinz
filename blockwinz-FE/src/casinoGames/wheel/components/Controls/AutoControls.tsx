import CustomInput from "@/components/CustomInput/CustomInput"
import { useGameControlsContext } from "../../hooks/gameControlsContext"

export const AutoControls = () => {
  const { isLoading, numberOfBets, handleNumberOfBetsChange } = useGameControlsContext()

  return (
    <>
      <CustomInput
        disabled={isLoading}
        value={numberOfBets.toString()}
        onChange={(e) => handleNumberOfBetsChange(parseInt(e.target.value))}
      />
    </>
  )
}
