import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from '@nestjs/class-validator';
export declare class RollOverBetValidator implements ValidatorConstraintInterface {
    validate(rollOverBet: number, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): "For OVER direction, Roll Over Bet must be between 2 and 99.99" | "For UNDER direction, Roll Under Bet must be between 0.01 and 98" | "Invalid roll over bet value";
}
export declare function IsRollOverBetValid(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
//# sourceMappingURL=validations.d.ts.map