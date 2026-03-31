import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FallbackExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    this.logger.error(
      exception instanceof Error ? exception.message : 'Unexpected error occurred',
    );

    return response.status(500).json({
      errorMessage: exception.message
        ? exception.message
        : 'Unexpected error occured',
      createdBy: 'FallbackExceptionFilter',
      status: 500,
    });
  }
}
