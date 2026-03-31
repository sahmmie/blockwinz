import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PosthogService } from 'src/posthog/posthog.service';

@Catch()
@Injectable()
export class FallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FallbackExceptionFilter.name);

  constructor(private readonly posthogService: PosthogService) {}

  /**
   * Captures unexpected HTTP errors and returns a normalized 500 response.
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const distinctId = String(request?.['posthogDistinctId'] ?? '');
    const message =
      exception instanceof Error
        ? exception.message
        : 'Unexpected error occurred';

    this.posthogService.capture(
      'server_error_reported',
      distinctId || 'anonymous',
      {
        method: request?.method,
        path: request?.url,
        scope: FallbackExceptionFilter.name,
        message,
      },
    );

    this.logger.error(message);

    return response.status(500).json({
      errorMessage: exception.message
        ? exception.message
        : 'Unexpected error occured',
      createdBy: 'FallbackExceptionFilter',
      status: 500,
    });
  }
}
