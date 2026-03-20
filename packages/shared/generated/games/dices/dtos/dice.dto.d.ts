import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { DiceGameStatus, RollDirection } from '../enums/dice.enums';
import { Currency } from '@blockwinz/shared';
export declare class RollDiceDto extends SpecificGameRequestDto {
    rollOverBet: number;
    direction: RollDirection;
}
export declare class RollDiceWithGameTokenDto extends RollDiceDto {
    betAmount: number;
    currency: Currency;
    rollOverBet: number;
    direction: RollDirection;
}
export declare class DicesRoundEndDto {
    betResultStatus: DiceGameStatus;
    result: number;
    target: number;
    totalWinAmount: number;
    multiplier: number;
}
//# sourceMappingURL=dice.dto.d.ts.map