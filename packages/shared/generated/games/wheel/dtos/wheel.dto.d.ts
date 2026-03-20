import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import { CommonGameRequestDto, SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
export declare class SpinWheelDto extends SpecificGameRequestDto {
    segments: number;
    risk: string;
    stopOnProfit?: number;
    stopOnLoss?: number;
    increaseBy?: number;
    decreaseBy?: number;
    isManualMode?: boolean;
    isTurboMode?: boolean;
    multiplier: number;
    totalWinAmount: number;
}
export declare class SpinWheelResponseDto extends CommonGameRequestDto {
    risk: string;
    segments: number;
    multiplier: number;
    totalWinAmount: number;
}
export declare class WheelDto extends BaseGameDto {
    segments: number;
    risk: string;
    stopOnProfit?: number;
    stopOnLoss?: number;
    increaseBy?: number;
    decreaseBy?: number;
    isManualMode?: boolean;
    isTurboMode?: boolean;
}
//# sourceMappingURL=wheel.dto.d.ts.map