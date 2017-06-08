import { AuthenticationChannelMessage } from './messageInterfaces';
import { StrutServer } from '../server';


export function dispatch(msg: AuthenticationChannelMessage, server: StrutServer): Promise<any> {
  return Promise.resolve()
  .then(() => {
    if (msg.request === 'list') {
      return {
        response: 'list',
        types: server.config.authTypes,
      }
    } else if (msg.request === 'testkey') {
      return server.oracle.testKey(msg.key);
    }
  });
}
