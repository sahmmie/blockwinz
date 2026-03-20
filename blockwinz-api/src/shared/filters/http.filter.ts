import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { get } from 'lodash';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse(),
      statusCode = exception.getStatus();

    return response.status(statusCode).json({
      errorMessage: get(exception, 'response.message', exception.message),
      createdBy: 'HttpExceptionFilter',
      status: statusCode,
    });
  }
}
