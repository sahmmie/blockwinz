import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from '@nestjs/class-validator';
import { RollDiceDto } from '../dtos/dice.dto';

@ValidatorConstraint({ async: false })
export class RollOverBetValidator implements ValidatorConstraintInterface {
  validate(rollOverBet: number, args: ValidationArguments) {
    const { direction } = args.object as RollDiceDto;

    if (direction === 'over') {
      return rollOverBet >= 2 && rollOverBet <= 99.99;
    } else if (direction === 'under') {
      return rollOverBet >= 0.01 && rollOverBet <= 98;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const { direction } = args.object as RollDiceDto;

    if (direction === 'over') {
      return 'For OVER direction, Roll Over Bet must be between 2 and 99.99';
    } else if (direction === 'under') {
      return 'For UNDER direction, Roll Under Bet must be between 0.01 and 98';
    }

    return 'Invalid roll over bet value';
  }
}

export function IsRollOverBetValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RollOverBetValidator,
    });
  };
}
