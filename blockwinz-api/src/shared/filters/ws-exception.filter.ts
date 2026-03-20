import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { WsResponse } from '../helpers/wsResponse.helper';

// Must not use bare @Catch(): global filters run in order such that this would
// handle HttpException too; switchToWs().getClient() is then the Express req,
// so client.emit() never sends an HTTP body (login errors appear to hang).
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const response = WsResponse.fromException(exception);
    client.emit('exception', response);
  }
}
