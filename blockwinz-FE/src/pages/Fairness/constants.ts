import { originalGamesInfo } from "@/shared/constants/originalGamesInfo.constant"
import { GameTypeEnum, MultiplayerGameTypeEnum } from "@blockwinz/shared"

export const minesOptions = Array.from({ length: 24 }, (_, index) => ({
  value: (index + 1).toString(),
  label: (index + 1).toString(),
}))

export const gameOptions: {
  value: GameTypeEnum | MultiplayerGameTypeEnum
  label: string
}[] = [
    { value: originalGamesInfo.DiceGame.id, label: originalGamesInfo.DiceGame.name },
    { value: originalGamesInfo.MinesGame.id, label: originalGamesInfo.MinesGame.name },
    { value: originalGamesInfo.LimboGame.id, label: originalGamesInfo.LimboGame.name },
    { value: originalGamesInfo.KenoGame.id, label: originalGamesInfo.KenoGame.name },
    { value: originalGamesInfo.PlinkoGame.id, label: originalGamesInfo.PlinkoGame.name },
    { value: originalGamesInfo.WheelGame.id, label: originalGamesInfo.WheelGame.name },
  ]
