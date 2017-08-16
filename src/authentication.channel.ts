import * as SocketIO from 'socket.io';
import {
  ChannelRequest,
  StrutServer,
  SingletonRequest,
  AuthenticationRequest,
  AuthenticationResponse,
} from './dataTypes';

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
    return server.services.tokenStore.tokenToUser(msg.key).then(v => {
      if (!!v && server.extensions['loginExtras']) {
        return server.extensions['loginExtras'](v).then(extras => {
          return {
            response: msg.request,
            auth: true,
            you: v,
            included: extras,
          };
        });
      } else if (!!v && !server.extensions['loginExtras']) {
        return {
          response: msg.request,
          you: v,
          auth: true,
        };
      } else {
        return {
          response: msg.request,
          auth: false,
        };
      }
    });
  } else {
    return Promise.resolve<AuthenticationResponse>({
      response: 'invalidRequest',
    });
  }
}
