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
import { dispatch } from './socket/dispatch';
import { base } from './base';
import { joi } from './joi';
import { authorize } from './authorize';
import { AuthenticationChannel } from './socket/authentication.channel';
import { handle } from './handle';
import { plugin } from './plugin';

const defaultSettings: StrutConfig = {
  apiRoot: '/api',
  authTypes: [],
  apiPort: 3000,
  authRoot: '/auth',
  apiHostname: 'localhost',
  apiProtocol: 'http',
  routeOptions: {},
  defaultController: {
    generators: [base, joi, authorize, handle],
    attributes: ['create', 'read', 'update', 'delete'],
    relationships: ['create', 'read', 'update', 'delete'],
    other: ['query'],
  },
  socketHandlers: [AuthenticationChannel],
  modelControllers: {},
};

export class Strut implements StrutServer {
  public config: StrutConfig;
  public extensions: any = {};

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
          (this.config.models || this.services.plump.getTypes()
          ).map((t: typeof Model) => {
            // debugger;
            return this.services.hapi.register(
              plugin(
                this.config.modelControllers[t.type] ||
                  this.config.defaultController,
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
      .then(() => {
        if (this.config.extraControllers) {
          return Promise.all(
            this.config.extraControllers.map(ctrl =>
              this.services.hapi.register(
                plugin(
                  ctrl,
                  { cors: true, authentication: 'token', routeName: ctrl.name },
                  this.services,
                ),
                { routes: { prefix: `${this.config.apiRoot}/${ctrl.name}` } },
              ),
            ),
          );
        } else {
          return;
        }
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
        this.config.socketHandlers.forEach(h => dispatch(h, this));
      });
  }

  baseUrl() {
    if (this.config.externalHost) {
      return this.config.externalHost;
    } else if (this.config.apiPort) {
      return `${this.config.apiProtocol}://${this.config.apiHostname}:${this
        .config.apiPort}`;
    } else {
      return `${this.config.apiProtocol}://${this.config.apiHostname}`;
    }
  }

  start(): Promise<any> {
    return this.services.hapi.start();
  }
}
