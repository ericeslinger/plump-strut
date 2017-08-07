import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import * as Bell from 'bell';
import * as bearer from 'hapi-auth-bearer-token';
import * as mergeOptions from 'merge-options';
import { Plump, Model, TerminalStore } from 'plump';
import {
  TokenService,
  RouteOptions,
  RouteGenerator,
  StrutConfig,
  StrutServices,
  AuthenticationStrategy,
  StrutServer,
} from './dataTypes';

import { configureAuth } from './authentication';
import { dispatch } from './socket.channel';
import { base } from './base';
import { joi } from './joi';
import { authorize } from './authorize';
import { handle } from './handle';
import { plugin } from './plugin';

const defaultSettings: StrutConfig = {
  apiRoot: '/api',
  authTypes: [],
  apiPort: 3000,
  authRoot: '/auth',
  hostName: 'localhost',
  apiProtocol: 'https',
  routeOptions: {},
  defaultRouteGenerator: [base, joi, authorize, handle],
  routeGenerators: {},
};

export class Strut implements StrutServer {
  public config: StrutConfig;

  constructor(
    plump: Plump,
    conf: Partial<StrutConfig>,
    public services: StrutServices = {},
  ) {
    this.services.hapi = new Hapi.Server();
    this.services.plump = plump;
    this.config = mergeOptions({}, defaultSettings, conf);
  }

  preRoute() {
    return Promise.resolve().then(() => {
      if (this.services.tokenStore) {
        return this.services.hapi.register(bearer).then(() =>
          this.services.hapi.auth.strategy('token', 'bearer-access-token', {
            validateFunc: (token, callback) =>
              this.services.tokenStore.validate(token, callback),
          }),
        );
      }
    });
  }

  preInit() {
    return Promise.resolve()
      .then(() => {
        this.services.hapi.connection({ port: this.config.apiPort });
        return this.services.hapi.register(Bell);
      })
      .then(() => {
        this.services.hapi.state('authNonce', {
          ttl: null,
          isSecure: false,
          isHttpOnly: false,
          encoding: 'base64json',
          clearInvalid: false, // remove invalid cookies
          strictHeader: true, // don't allow violations of RFC 6265
        });
      });
  }

  initialize() {
    return this.preInit()
      .then(() => this.preRoute())
      .then(() => {
        return Promise.all(
          (this.config.models || this.services.plump.getTypes())
            .map((t: typeof Model) => {
              // debugger;
              return this.services.hapi.register(
                plugin(
                  this.config.routeGenerators[t.type] ||
                    this.config.defaultRouteGenerator,
                  {
                    cors: true,
                    authentication: 'token',
                    model: t,
                  },
                  this.services,
                ),
                { routes: { prefix: `${this.config.apiRoot}/${t.type}` } },
              );
            }),
        );
      })
      .then(() =>
        this.services.hapi.register(
          configureAuth(this) as Hapi.PluginFunction<{}>,
          {
            routes: { prefix: this.config.authRoot },
          },
        ),
      )
      .then(() => {
        this.services.hapi.ext('onPreAuth', (request, reply) => {
          request.connection.info.protocol = this.config.apiProtocol;
          return reply.continue();
        });
      })
      .then(() => {
        this.services.io = SocketIO(this.services.hapi.listener);
        dispatch(this);
      });
  }

  baseUrl() {
    if (this.config.apiPort) {
      return `${this.config.apiProtocol}://${this.config.hostName}:${this.config
        .apiPort}`;
    } else {
      return `${this.config.apiProtocol}://${this.config.hostName}:${this.config
        .apiPort}`;
    }
  }

  start() {
    return this.services.hapi.start();
  }
}
