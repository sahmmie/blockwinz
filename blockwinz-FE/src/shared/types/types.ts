import { BaseBetRequest, BaseBetResponse, GameState } from "@/shared/types/core"
import { GameCategoryEnum, GameTypeEnum, MultiplayerGameTypeEnum } from "../enums/gameType.enum"

export type ExtendedGameState<
    T extends GameState,
    R extends BaseBetRequest,
    S extends BaseBetResponse
> = T &
    S &
    R & {
        onBetRequest: (currState: T & S & R) => Partial<R>
        onBetResult: (currState: T & S & R, res: S) => void
        onAnimFinish: (currState: T & S & R, res: S) => void
    }

export type PartialEGS<
    T extends GameState,
    R extends BaseBetRequest,
    S extends BaseBetResponse
> = Partial<ExtendedGameState<T, R, S>>

export interface UseGameStateProps<
    T extends GameState,
    R extends BaseBetRequest,
    S extends BaseBetResponse
> {
    initialState?: PartialEGS<T, R, S>
    betEndpoint: string
    onBetRequest: (currState: T & S & R) => Partial<R>
    onBetResult: (currState: T & S & R, res: S) => void
    onAnimFinish?: (currState: T & S & R, res: S) => void
}

export type StateUpdater<T> = (prevState: T) => T

export type GameInfo = {
    id: GameTypeEnum | MultiplayerGameTypeEnum
    name: string
    category: GameCategoryEnum
    icon: string
    link: string
    image: string
    description: string
    comingSoon?: boolean
    releasedAt?: Date
}

export interface GameItemI {
    game: GameTypeEnum;
    addedAt: Date;
}

export interface FavouriteI {
    user: string;
    games: GameItemI[];
    createdAt?: Date;
    updatedAt?: Date;
}
