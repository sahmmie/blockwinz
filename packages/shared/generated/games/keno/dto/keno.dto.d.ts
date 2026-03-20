import { ValidatorConstraintInterface } from 'class-validator';
import { KenoGameStatus, KenoRisk } from '../enums/keno.enums';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
export declare class UniqueArrayValidator implements ValidatorConstraintInterface {
    validate(value: any[]): boolean;
    defaultMessage(): string;
}
export declare class KenoBetRequestDto extends SpecificGameRequestDto {
    selectedNumbers: number[];
    risk: KenoRisk;
}
export declare class KenoBetResponseDto {
    status: KenoGameStatus;
    multiplier: number;
    result: number[];
    hits: number;
}
export declare class KenoGameDto extends BaseGameDto {
    multiplier: number;
    selectedNumbers: number[];
    resultNumbers: number[];
    risk: KenoRisk;
}
//# sourceMappingURL=keno.dto.d.ts.map