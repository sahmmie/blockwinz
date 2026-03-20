import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from 'src/shared/dtos/user.dto';
import { IsEnum } from 'class-validator';
import { CHAIN, Currency } from '@blockwinz/shared';

export class WalletDto {
  @ApiPropertyOptional({ description: 'Wallet ID' })
  @IsOptional()
  _id?: string;

  @ApiProperty({ description: 'Owner of the wallet' })
  @IsString()
  user: string | UserDto;

  @ApiProperty({ description: 'Wallet address' })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Encrypted private key (stored securely)',
  })
  @IsOptional()
  @IsString()
  privateKey?: string;

  @ApiPropertyOptional({ description: 'Wallet public key' })
  @IsOptional()
  @IsString()
  publicKey?: string;

  @ApiProperty({ description: 'Wallet currency' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ description: 'Blockchain chain used by wallet' })
  @IsEnum(CHAIN)
  chain: CHAIN;

  // 🪙 Real on-chain balance from RPC
  @ApiProperty({ description: 'Actual balance fetched from the blockchain' })
  @IsNumber()
  onChainBalance: number;

  // 🧮 App-computed balance (after gameplay and transactions)
  @ApiProperty({ description: 'Balance tracked internally in the app' })
  @IsNumber()
  appBalance: number;

  // 🔒 Pending withdrawals
  @ApiProperty({
    description:
      'Amount currently locked for pending withdrawals (Negative value)',
  })
  @IsNumber()
  pendingWithdrawal: number;

  // 🎮 Locked in active bets
  @ApiProperty({
    description: 'Amount currently locked in active bets (Negative value)',
  })
  @IsNumber()
  lockedInBets: number;

  // 👀 Virtual: appBalance - pendingWithdrawal - lockedInBets
  @ApiPropertyOptional({
    description:
      'Available balance after removing pending withdrawals and locked bets',
  })
  @IsOptional()
  @IsNumber()
  availableBalance?: number;

  // 📅 Sync timestamp
  @ApiProperty({ description: 'Last blockchain sync timestamp' })
  @IsDate()
  syncedAt: Date;

  @ApiPropertyOptional({ description: 'Wallet creation timestamp' })
  @IsOptional()
  @IsDate()
  createdAt?: string;

  @ApiPropertyOptional({ description: 'Wallet last updated timestamp' })
  @IsOptional()
  @IsDate()
  updatedAt?: string;
}
