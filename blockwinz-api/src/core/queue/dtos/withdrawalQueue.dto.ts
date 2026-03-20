import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from 'src/transaction/dtos/transaction.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { WithdrawalDto } from 'src/withdrawal/dtos/withdrawal.dto';

export class WithdrawalQueueDto {
  @ApiProperty() user: UserRequestI;
  @ApiProperty() transaction: TransactionDto;
  @ApiProperty() withdrawal: WithdrawalDto;
}
