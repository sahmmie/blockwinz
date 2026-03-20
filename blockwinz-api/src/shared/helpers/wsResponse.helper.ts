export class WsResponse<T = any> {
  public readonly success: boolean;
  public readonly code: number;
  public readonly data: T;
  public readonly message: string;
  public readonly timestamp: string;

  constructor(
    data: T,
    code: number = 200,
    message: string = 'Success',
    success: boolean = true,
  ) {
    this.success = success;
    this.code = code;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success', code = 200) {
    return new WsResponse(data, code, message, true).toObject();
  }

  static error<T = null>(message = 'Error', code = 400, data: T = null as T) {
    return new WsResponse(data, code, message, false).toObject();
  }

  static validationError<T = any>(
    errors: T,
    message = 'Validation failed',
    code = 422,
  ) {
    return new WsResponse(errors, code, message, false).toObject();
  }

  static notFound<T = null>(
    message = 'Resource not found',
    data: T = null as T,
  ) {
    return new WsResponse(data, 404, message, false).toObject();
  }

  static unauthorized<T = null>(message = 'Unauthorized', data: T = null as T) {
    return new WsResponse(data, 401, message, false).toObject();
  }

  static forbidden<T = null>(message = 'Forbidden', data: T = null as T) {
    return new WsResponse(data, 403, message, false).toObject();
  }

  static fromException(exception: any) {
    if (exception.getError) {
      const error = exception.getError();
      if (typeof error === 'object' && error.code && error.message) {
        return new WsResponse(
          null,
          error.code,
          error.message,
          false,
        ).toObject();
      }
    }
    return WsResponse.error('Internal server error', 500);
  }

  toObject(): {
    success: boolean;
    code: number;
    data: T;
    message: string;
    timestamp: string;
  } {
    return {
      success: this.success,
      code: this.code,
      data: this.data,
      message: this.message,
      timestamp: this.timestamp,
    };
  }

  toJSON(): string {
    return JSON.stringify(this.toObject());
  }
}
