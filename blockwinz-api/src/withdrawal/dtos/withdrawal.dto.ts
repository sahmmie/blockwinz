import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from 'src/shared/enums/currencies.enum';
import { WithdrawalStatus } from 'src/shared/enums/withdrawalStatus.enum';
import { ApprovalType } from 'src/shared/enums/approvalType.enum';
import { MinWithdrawalAmount } from 'src/shared/validators/minWithdrawalAmount.validator';

export class WithdrawalDto {
  @IsNotEmpty()
  @IsString()
  _id?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @MinWithdrawalAmount({
    message: 'Amount is below the minimum for the selected currency',
  })
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  approvedAt?: Date;

  @IsOptional()
  @IsString()
  rejectedBy?: string;

  @IsOptional()
  rejectedAt?: Date;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  processedAt: Date;

  @IsOptional()
  @IsString()
  transactionHash: string;

  @IsOptional()
  @IsEnum(ApprovalType)
  approvalType: ApprovalType;

  @IsOptional()
  @IsString()
  error?: string;
}

export class WithdrawalDtoRequest {
  @IsNotEmpty()
  @IsNumber()
  @MinWithdrawalAmount({
    message: 'Amount is below the minimum for the selected currency',
  })
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;
}
