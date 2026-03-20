import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { currencyData } from 'src/shared/constants/currency.constant';
import { Currency } from 'src/shared/enums/currencies.enum';

export function MinWithdrawalAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'minWithdrawalAmount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const currency = (args.object as any).currency as Currency;
          if (!currency || !currencyData[currency]) return false;
          return Number(value) >= currencyData[currency].minWithdrawalAmount;
        },
        defaultMessage(args: ValidationArguments) {
          const currency = (args.object as any).currency as Currency;
          if (!currency || !currencyData[currency]) return 'Invalid currency';
          return `Minimum withdrawal amount for ${currency} is ${currencyData[currency].minWithdrawalAmount}`;
        },
      },
    });
  };
}
