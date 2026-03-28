/** Thrown when a Socket.IO ack returns `success: false` (preserves optional HTTP-style `code`). */
export class WsAckError extends Error {
  readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'WsAckError';
    this.code = code;
  }
}

export function isWsAckError(e: unknown): e is WsAckError {
  return e instanceof WsAckError;
}
