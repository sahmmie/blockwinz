import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_KEY = 'withdrawal-key';
export const IdempotencyKey = () => SetMetadata(IDEMPOTENCY_KEY, true);
