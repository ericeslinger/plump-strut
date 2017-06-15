import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import * as Bell from 'bell';
import { Plump, Model, Oracle } from 'plump';
import { BaseController } from './base';
import { dispatch } from './socket/channels';
import { configureAuth, AuthenticationType } from './authentication';

export interface StrutConfig {
  models?: typeof Model[];
  apiRoot: string;
  apiProtocol: 'http' | 'https';
  authTypes: AuthenticationType[];
  apiPort: number;
  authRoot: string;
}

export class StrutServer {
  public hapi: Hapi.Server;
  public io: SocketIO.Server;


  constructor(public plump: Plump, public oracle: Oracle, public config: StrutConfig) {
    this.hapi = new Hapi.Server();
  }

  initialize() {
    return Promise.resolve()
    .then(() => {
      this.hapi.connection({ port: this.config.apiPort });
      return this.hapi.register(Bell);
    }).then(() => {
      this.hapi.state('authNonce', {
        ttl: null,
        isSecure: true,
        isHttpOnly: true,
        encoding: 'base64json',
        clearInvalid: false, // remove invalid cookies
        strictHeader: true // don't allow violations of RFC 6265
      });
      return Promise.all((this.config.models || this.plump.getTypes()).map((t) => {
        return this.hapi.register(
          new BaseController(this.plump, t).plugin as Hapi.PluginFunction<{}>,
            { routes: { prefix: `${this.config.apiRoot}/${t.type}` } }
        );
      }));
    })
    .then(() => this.hapi.register(configureAuth(this.config) as Hapi.PluginFunction<{}>, { routes: { prefix: this.config.authRoot } }))
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

  start() {
    return this.hapi.start();
  }

}
