import * as SocketIO from 'socket.io';
import { StrutServer } from '../index';
import {
  SingletonRequest,
  RequestHandler,
  ChannelRequest,
} from './messageInterfaces';
import { dispatch as authChannel } from './authentication.channel';

function singletonDispatch(
  handler: RequestHandler,
  msg: SingletonRequest & ChannelRequest,
  strut: StrutServer,
) {
  return handler(msg, strut).then(r => {
    msg.client.emit(msg.responseKey, r);
  });
}

export function dispatch(s: StrutServer) {
  s.services.io.on('connection', client => {
    client.on('auth', msg => {
      const request = Object.assign({}, msg, { client: client });
      singletonDispatch(authChannel, request, s);
    });
  });
}
