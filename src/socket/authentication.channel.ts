import {
  AuthenticationChannelMessage,
  AuthenticationChannelResponse,
  Response,
} from './messageInterfaces';
import { StrutServer } from '../server';

export function dispatch(msg: AuthenticationChannelMessage, server: StrutServer): Promise<Response> {
  if (msg.request === 'list') {
    return Promise.resolve({
      response: 'list',
      types: server.config.authTypes,
    });
  } else if (msg.request === 'testkey') {
    return server.oracle.keyService.test(msg.key)
    .then((v) => {
      return {
        response: 'testkey',
        auth: v,
      };
    });
  } else {
    return Promise.resolve({
      response: 'invalidRequest',
    });
  }
}
