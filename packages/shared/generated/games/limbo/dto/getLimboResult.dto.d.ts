import { LimboGameStatus } from '../enums/limbo.enums';
import { CommonGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
export declare class GetLimboResultRequestDto extends CommonGameRequestDto {
    multiplier: number;
}
export declare class GetLimboResultResponseDto {
    result: number;
    betResultStatus: LimboGameStatus;
    totalWinAmount: number;
}
export declare class LimboGameDto extends BaseGameDto {
    betResultStatus: LimboGameStatus;
}
//# sourceMappingURL=getLimboResult.dto.d.ts.map