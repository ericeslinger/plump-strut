import * as SocketIO from 'socket.io';
import { StrutServer } from '../dataTypes';
import {
  SingletonRequest,
  AuthenticationRequest,
  TestKeyAuthenticationRequest,
  StartAuthenticationRequest,
  StartResponse,
  TestResponse,
  AuthenticationResponse,
  SocketDispatch,
  ResponseEnvelope,
  AuthenticatedSocket,
} from './dataTypes';

import { ChannelRequest } from './dataTypes';

function test(
  msg: TestKeyAuthenticationRequest,
  server: StrutServer,
): Promise<ResponseEnvelope<TestResponse>> {
  return server.services.tokenStore
    .tokenToUser(msg.key)
    .then(v => {
      if (!!v) {
        msg.client.user = v;
        msg.client.join('authenticated');
        console.log('authenticated user');
        return {
          response: 'testkey',
          you: v,
          auth: true,
          token: msg.key,
        };
      } else {
        return {
          response: 'testkey',
          auth: false,
        };
      }
    })
    .then((response: TestResponse) => {
      if (response.auth === true && server.extensions['loginExtras']) {
        return server.extensions['loginExtras'](response.you).then(r => {
          return Object.assign(response, { included: r });
        });
      }
    })
    .then((response: TestResponse) => {
      return {
        broadcast: false,
        key: msg.responseKey,
        msg: response,
      };
    });
}

function start(
  msg: StartAuthenticationRequest,
  server: StrutServer,
): ResponseEnvelope<StartResponse> {
  msg.client.join(msg.nonce);
  return {
    key: msg.nonce,
    broadcast: false,
    msg: {
      response: 'startauth',
      types: server.config.authTypes.map(v => {
        return {
          name: v.name,
          iconUrl: v.iconUrl,
          url: `${server.baseUrl()}${server.config
            .authRoot}?method=${v.name}&nonce=${msg.nonce}`,
        };
      }),
    },
  };
}

export const AuthenticationChannel: SocketDispatch = {
  auth: (msg: AuthenticationRequest, strut: StrutServer) => {
    return Promise.resolve().then<
      ResponseEnvelope<AuthenticationResponse>
    >(() => {
      if (msg.request === 'startauth') {
        return start(msg, strut);
      } else if (msg.request === 'testkey') {
        return test(msg, strut);
      } else {
        return {
          broadcast: false,
          key: 'error',
          msg: {
            response: 'invalidRequest',
          },
        };
      }
    });
  },
};
