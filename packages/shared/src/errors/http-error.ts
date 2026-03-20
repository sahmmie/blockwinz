export type HttpErrorInit = {
  statusCode: number;
  code?: string;
  message: string;
  details?: unknown;
};

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(init: HttpErrorInit) {
    super(init.message);
    this.name = 'HttpError';
    this.statusCode = init.statusCode;
    this.code = init.code;
    this.details = init.details;
  }
}
