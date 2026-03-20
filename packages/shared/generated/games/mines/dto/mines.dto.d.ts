import { MinesGameStatus } from '../enums/mines.enums';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import { Currency } from '@blockwinz/shared';
export declare class StartMineDto extends SpecificGameRequestDto {
    minesCount: number;
}
export declare class MinesResponseDto {
    _id?: string;
    id?: string;
    user?: string;
    minesResult: any[];
    nextWinMultiplier: number;
    currency: Currency;
    selected: number[];
    betAmount: number;
    createdAt: Date;
    betResultStatus: MinesGameStatus;
    minesCount: number;
    multiplier: number;
    totalWinAmount: number;
}
export declare class RevealMineDto {
    position: number;
}
export declare class MinesAutoBetDto extends SpecificGameRequestDto {
    minesCount: number;
    selected: number[];
}
export declare class MinesGameDto extends BaseGameDto {
    betResultStatus: MinesGameStatus;
    minesCount: number;
    selected: number[];
    minesResult: number[];
}
//# sourceMappingURL=mines.dto.d.ts.map