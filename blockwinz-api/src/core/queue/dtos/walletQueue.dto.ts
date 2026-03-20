import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from 'src/transaction/dtos/transaction.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Currency } from '@blockwinz/shared';
export class WalletQueueDto {
  @ApiProperty() user: UserRequestI;
  @ApiProperty() amount: number;
  @ApiProperty() transaction: TransactionDto;
  @ApiProperty() currency: Currency;
}
