import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import { Plump, Model, Oracle } from 'plump';
import { BaseController } from './base';

export interface StrutConfig {
  models?: typeof Model[];
  apiRoot: string;
  apiProtocol: 'http' | 'https';
  authTypes: any[];
}

export class StrutServer<T> {
  public hapi: Hapi.Server;
  public io: SocketIO.Server;


  constructor(public plump: Plump, public oracle: Oracle<T>, public config: StrutConfig) {
    this.hapi = new Hapi.Server();
  }

  start() {
    return Promise.resolve()
    .then(() => {
      return Promise.all((this.config.models || this.plump.getTypes()).map((t) => {
        return this.hapi.register(
          new BaseController(this.plump, t).plugin as Hapi.PluginFunction<{}>,
            { routes: { prefix: `${this.config.apiRoot}/${t.type}` } }
        );
      }));
    }).then(() => {
      this.hapi.ext('onPreAuth', (request, reply) => {
        request.connection.info.protocol = this.config.apiProtocol;
        return reply.continue();
      });
    })
    .then(() => {
      this.io = SocketIO(this.hapi.listener);
    });
  }

}
