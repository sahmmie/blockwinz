import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
export declare class GetPlinkoResultRequestDto extends SpecificGameRequestDto {
    rows: number;
    risk: string;
}
export declare class GetPlinkoResultResponseDto {
    results: number[];
    multiplier: number;
    winAmount: number;
}
//# sourceMappingURL=plinko.dto.d.ts.map