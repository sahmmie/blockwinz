import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    console.log(exception);

    return response.status(500).json({
      errorMessage: exception.message
        ? exception.message
        : 'Unexpected error occured',
      createdBy: 'FallbackExceptionFilter',
      status: 500,
    });
  }
}
