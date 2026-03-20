import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/transaction.enums';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { CHAIN, Currency } from 'src/shared/enums/currencies.enum';
import { WithdrawalDto } from 'src/withdrawal/dtos/withdrawal.dto';

export class TransactionDto {
  @ApiProperty({ description: 'ID of the transaction' })
  @IsString()
  _id?: string;

  @ApiProperty({ description: 'User ID associated with the transaction' })
  @IsString()
  user: string;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Status of the transaction',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ description: 'Amount of the transaction currency' })
  @IsNumber()
  transactionAmount: number;

  @ApiPropertyOptional({ description: 'Fulfillment date of the transaction' })
  @IsOptional()
  @IsDate()
  fulfillmentDate?: Date;

  @ApiPropertyOptional({
    description: 'Game ID associated with the transaction',
  })
  @IsOptional()
  @IsString()
  game?: string;

  @ApiPropertyOptional({
    description: 'Game model associated with the transaction',
    enum: DbGameSchema,
  })
  @IsOptional()
  @IsEnum(DbGameSchema)
  gameModel?: DbGameSchema;

  @ApiPropertyOptional({
    description: 'Metadata associated with the transaction',
  })
  @IsOptional()
  @IsObject()
  metadata: any;

  @ApiPropertyOptional({
    description: 'Indicates if the transaction is on chain',
  })
  @IsOptional()
  @IsBoolean()
  onChain: boolean;

  @ApiProperty({ description: 'Timestamp of when the transaction was created' })
  createdAt?: Date;

  @ApiProperty({
    description: 'Timestamp of when the transaction was last updated',
  })
  updatedAt?: Date;

  @ApiPropertyOptional({ description: 'Transaction ID (optional)' })
  @IsOptional()
  @IsString()
  txid?: string;

  @ApiPropertyOptional({ description: 'Blockchain chain type ' })
  @IsEnum(CHAIN)
  @IsOptional()
  chain: CHAIN;

  @ApiPropertyOptional({ description: 'Currency type' })
  @IsEnum(Currency)
  @IsOptional()
  currency: Currency;

  @ApiPropertyOptional({ description: 'Withdrawal ID if applicable' })
  @IsOptional()
  @IsString()
  withdrawal?: string | WithdrawalDto;

  @ApiPropertyOptional({ description: 'Version key (optional)' })
  @IsOptional()
  @IsString()
  __v?: string;
}
