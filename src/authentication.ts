import * as Joi from 'joi';
import * as Hapi from 'hapi';
import * as Bell from 'bell';
import { StrutConfig, StrutServer } from './server';

export interface AuthenticationResponse {
  response: string;
  token: string;
}

export interface AuthenticationHandler {
  (r: Hapi.Request, strut: StrutServer): Promise<AuthenticationResponse>;
}

export interface AuthenticationType {
  name: string;
  url: string;
  iconUrl?: string;
}

export interface AuthenticationStrategy {
  name: string;
  handler: AuthenticationHandler;
  iconUrl?: string;
  strategy: {
    provider: string;
    password?: string;
    cookie: string;
    scope: string[];
    clientId: string;
    clientSecret: string;
    isSecure: boolean;
    forceHttps: boolean;
    providerParams?: any;
  };
  nonceCookie?: Hapi.ServerStateCookieConfiguationObject;
}

function routeGen(options: AuthenticationStrategy, strut: StrutServer) {
  const cookieOptions: Hapi.ServerStateCookieConfiguationObject = Object.assign(
    {},
    {
      ttl: null,
      isSecure: true,
      isHttpOnly: true,
      encoding: 'base64json',
      isSameSite: false,
      clearInvalid: false, // remove invalid cookies
      strictHeader: true, // don't allow violations of RFC 6265
    },
    options.nonceCookie,
  );
  const routeHandler: Hapi.RouteHandler = (request, reply) => {
    return options.handler(request, strut).then(r => {
      strut.services.io
        .to(request.state[`${options.name}-nonce`].nonce)
        .emit(request.state[`${options.name}-nonce`].nonce, {
          status: 'success',
          token: r.token,
        });
      reply(r.response).type('text/html').unstate(`${options.name}-nonce`);
    });
  };
  return server => {
    server.auth.strategy(options.name, 'bell', options.strategy);
    server.state(`${options.name}-nonce`, cookieOptions);
    server.route({
      method: ['GET', 'POST'],
      path: `/${options.name}`,
      handler: routeHandler,
      config: {
        auth: options.name,
        state: {
          parse: true,
        },
      },
    });
  };
}

export function configureAuth(strut: StrutServer) {
  const plugin: Hapi.PluginFunction<{
    version: string;
    name: string;
  }> = function(s, _, next) {
    s.route({
      method: 'GET',
      path: '',
      handler: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
        reply(
          `
          <html>
            <head><meta http-equiv="refresh" content="5; url=${strut.config
              .authRoot}/${request.query['method']}" /></head>
            <body>REDIRECTING ${request.query['method']} / ${request.query[
            'nonce'
          ]}</body>
          </html>
        `,
        )
          .type('text/html')
          .state(`${request.query['method']}-nonce`, {
            nonce: request.query['nonce'],
          });
      },
      config: {
        validate: {
          query: {
            method: Joi.string().required(),
            nonce: Joi.string().required(),
          },
        },
      },
    });
    strut.config.authTypes.forEach(t => routeGen(t, strut)(s));
    next();
  };
  plugin.attributes = {
    version: '1.0.0',
    name: 'authentication',
  };
  return plugin;
}