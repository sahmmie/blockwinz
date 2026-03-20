import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class WaitlistDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to join the waitlist',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
