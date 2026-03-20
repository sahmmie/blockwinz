import { WsException } from '@nestjs/websockets';

export class WsExceptionWithCode extends WsException {
  constructor(
    message: string,
    public code?: number,
  ) {
    super({ message, code: code || 500, success: false });
  }
}
