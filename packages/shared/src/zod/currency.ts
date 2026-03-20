import { z } from 'zod';
import { Currency } from '../enums/currencies';

export const currencySchema = z.nativeEnum(Currency);
