import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailQueueDto {
  @ApiProperty()
  @IsEmail()
  to: string;
  @ApiProperty() subject: string;
  @ApiProperty() html: string;
}
