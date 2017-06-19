import {
  AuthenticationRequest,
  AuthenticationResponse,
  Response,
} from './messageInterfaces';
import { StrutServer } from '../server';
import * as SocketIO from 'socket.io';

export function dispatch(
  msg: AuthenticationRequest,
  server: StrutServer,
): Promise<AuthenticationResponse> {
  if (msg.request === 'startauth') {
    msg.client.join(msg.nonce);
    return Promise.resolve({
      response: msg.request,
      types: server.config.authTypes.map(v => {
        return {
          name: v.name,
          iconUrl: v.iconUrl,
          url: `${server.baseUrl()}/${server.config.authRoot}`,
        };
      }),
    });
  } else if (msg.request === 'testkey') {
    return server.oracle.keyService.test(msg.key).then(v => {
      return {
        response: msg.request,
        auth: v,
      };
    });
  } else {
    return Promise.resolve({
      response: 'invalidRequest',
    });
  }
}
