import { TicTacToeMultiplier, TicTacToeStatus } from '../enums/tictactoe.enums';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import { Currency } from '@blockwinz/shared';
export declare class TicTacToeStartReqDto {
    betAmount: number;
    currency: Currency;
    multiplier: TicTacToeMultiplier;
    isTurboMode: any;
}
export declare class TicTacToeMoveDto {
    move: {
        row: number;
        column: number;
    };
}
export declare class TicTacToeMoveResponseDto {
    board: string[][];
    move: {
        row: number;
        column: number;
    };
    betResultStatus: TicTacToeStatus;
    currentTurn: string | null;
}
export declare class TicTacToeDto extends BaseGameDto {
    multiplier: any;
    board: string[][];
    betResultStatus: TicTacToeStatus;
    currentTurn: 'X' | 'O' | null;
    userIs: string;
    aiIs: string;
}
//# sourceMappingURL=tictactoe.dto.d.ts.map