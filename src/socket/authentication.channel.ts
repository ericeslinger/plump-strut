import {
  AuthenticationChannelMessage,
  AuthenticationChannelResponse,
  Response,
} from './messageInterfaces';
import { StrutServer } from '../server';

export function dispatch(msg: AuthenticationChannelMessage, server: StrutServer): Promise<AuthenticationChannelResponse> {
  if (msg.request === 'list') {
    return Promise.resolve({
      response: msg.request,
      types: server.config.authTypes,
    });
  } else if (msg.request === 'testkey') {
    return server.oracle.keyService.test(msg.key)
    .then((v) => {
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
