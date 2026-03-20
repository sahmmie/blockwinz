import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseMessageDto {
  @ApiProperty() @IsString() message: string;
  @ApiProperty() @IsString() status: string;
}
