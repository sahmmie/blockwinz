import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { WsResponse } from '../helpers/wsResponse.helper';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    // Create response using your WsResponse class
    const response = WsResponse.fromException(exception);

    client.emit('exception', response);
  }
}
