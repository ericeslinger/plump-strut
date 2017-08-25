import * as SocketIO from 'socket.io';
import {
  ChannelRequest,
  StrutServer,
  SingletonRequest,
  AuthenticationRequest,
  TestKeyAuthenticationRequest,
  TestResponse,
  AuthenticationResponse,
} from './dataTypes';

function test(
  msg: TestKeyAuthenticationRequest,
  server: StrutServer,
): Promise<TestResponse> {
  const response: any = {
    response: 'testkey',
  };
  return server.services.tokenStore
    .tokenToUser(msg.key)
    .then(v => {
      if (!!v) {
        response.you = v;
        response.auth = true;
        response.token = msg.key;
        if (server.extensions['loginExtras']) {
          return server.extensions
            ['loginExtras'](v)
            .then(r => (response.included = r));
        }
      } else {
        response.auth = false;
      }
    })
    .then(() => response);
}

export function authenticationChannelDispatch(
  msg: AuthenticationRequest,
  server: StrutServer,
): Promise<AuthenticationResponse> {
  if (msg.request === 'startauth') {
    msg.client.join(msg.nonce);
    // this nonce expires in five minutes.
    // setTimeout(() => msg.client.leave(msg.nonce), 5 * 60 * 1000);
    return Promise.resolve({
      response: msg.request,
      types: server.config.authTypes.map(v => {
        return {
          name: v.name,
          iconUrl: v.iconUrl,
          url: `${server.baseUrl()}${server.config
            .authRoot}?method=${v.name}&nonce=${msg.nonce}`,
        };
      }),
    });
  } else if (msg.request === 'testkey') {
    return test(msg, server);
  } else {
    return Promise.resolve<AuthenticationResponse>({
      response: 'invalidRequest',
    });
  }
}
