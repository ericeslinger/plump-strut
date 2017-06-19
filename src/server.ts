import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import * as Bell from 'bell';
import { Plump, Model, Oracle } from 'plump';
import { BaseController } from './base';
import { dispatch } from './socket/channels';
import { configureAuth, AuthenticationStrategy } from './authentication';
import ulid from 'ulid';

export interface StrutConfig {
  models?: typeof Model[];
  apiRoot: string;
  apiProtocol: 'http' | 'https';
  authTypes: AuthenticationStrategy[];
  apiPort: number;
  authRoot: string;
}

const defaultSettings: StrutConfig = {
  apiRoot: '/api',
  authTypes: [],
  apiPort: 3000,
  authRoot: '/auth',
  apiProtocol: 'https'
};

export class StrutServer {
  public hapi: Hapi.Server;
  public io: SocketIO.Server;
  public config: StrutConfig;

  constructor(
    public plump: Plump,
    public oracle: Oracle,
    conf: Partial<StrutConfig>
  ) {
    this.hapi = new Hapi.Server();
    this.config = Object.assign({}, defaultSettings, conf);
  }

  initialize() {
    return Promise.resolve()
      .then(() => {
        this.hapi.connection({ port: this.config.apiPort });
        return this.hapi.register(Bell);
      })
      .then(() => {
        this.hapi.state('authNonce', {
          ttl: null,
          isSecure: false,
          isHttpOnly: false,
          encoding: 'base64json',
          clearInvalid: false, // remove invalid cookies
          strictHeader: true // don't allow violations of RFC 6265
        });
        return Promise.all(
          (this.config.models || this.plump.getTypes()).map(t => {
            return this.hapi.register(
              new BaseController(this.plump, t)
                .plugin as Hapi.PluginFunction<{}>,
              { routes: { prefix: `${this.config.apiRoot}/${t.type}` } }
            );
          })
        );
      })
      .then(() =>
        this.hapi.register(configureAuth(this) as Hapi.PluginFunction<{}>, {
          routes: { prefix: this.config.authRoot }
        })
      )
      .then(() => {
        this.hapi.ext('onPreAuth', (request, reply) => {
          request.connection.info.protocol = this.config.apiProtocol;
          return reply.continue();
        });
      })
      .then(() => {
        this.io = SocketIO(this.hapi.listener);
        dispatch(this);
      });
  }

  baseUrl() {
    const start = `${this.config.apiProtocol}://${this.config.apiRoot}`;
    if (this.config.apiPort) {
      return `${start}:${this.config.apiPort}`;
    } else {
      return `${start}`;
    }
  }

  start() {
    return this.hapi.start();
  }
}
