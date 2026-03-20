import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CreditFreeBwzDtoReq {
  @ApiProperty({ description: 'Username to send BWZ to' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Amount of BWZ to send (max 10000)' })
  @IsNotEmpty()
  @IsNumber()
  @Max(10000, {
    message: 'Amount must be less than or equal to 10000',
    always: true,
  })
  amount: number;

  @ApiProperty({ description: 'Wallet address to send BWZ to' })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;
}

export class CreditFreeBwzDto {
  username: string;
  sendHistory: Array<{
    amount: number;
    timestamp: Date;
    signature: string;
    walletAddress: string;
  }>;
  totalSent: number;
  createdAt: Date;
  updatedAt: Date;
}
