import * as SocketIO from 'socket.io';
import { StrutServer } from '../index';
import { SingletonRequest, RequestHandler, ChannelRequest } from './messageInterfaces';
import { dispatch as authChannel } from './authentication.channel';

function singletonDispatch(handler: RequestHandler, msg: SingletonRequest & ChannelRequest, client: SocketIO.Client, strut: StrutServer) {
  return handler(msg, strut)
  .then((r) => {
    client.emit(msg.responseKey, r);
  });
}

export function dispatch(s: StrutServer) {
  s.io.on('connection', (client) => {
    client.on('auth', (msg) => {
      singletonDispatch(authChannel, msg, client, s);
    });
  });
}
