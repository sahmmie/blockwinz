import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      throw new BadRequestException('Password is required');
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(value)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
      );
    }

    return value;
  }
}
