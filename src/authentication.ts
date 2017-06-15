import * as Joi from 'joi';
import * as Hapi from 'hapi';
import * as Bell from 'bell';
import { StrutConfig } from './server';

export interface AuthenticationType {
  name: string;
  handler: (r: Hapi.Request) => Promise<string>;
  strategy: {
    provider: string;
    password?: string;
    cookie: string;
    scope: string[];
    clientId: string;
    clientSecret: string;
    isSecure: boolean;
    forceHttps: boolean;
    providerParams?: any,
  };
  nonceCookie?: Hapi.ServerStateCookieConfiguationObject;
}

function routeGen(options: AuthenticationType, c: StrutConfig) {
  const cookieOptions: Hapi.ServerStateCookieConfiguationObject = Object.assign(
    {}, {
      ttl: null,
      isSecure: true,
      isHttpOnly: true,
      encoding: 'base64json',
      isSameSite: false,
      clearInvalid: false, // remove invalid cookies
      strictHeader: true, // don't allow violations of RFC 6265
    },
    options.nonceCookie
  );
  return (server) => {
    server.auth.strategy(options.name, 'bell', options.strategy);
    server.state(`${options.name}-nonce`, cookieOptions);
    server.route({
      method: ['GET', 'POST'],
      path: `/${options.name}`,
      handler: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
        return options.handler(request)
        .then((s: string) => {
          reply(s)
          .type('text/html')
          .unstate(`${options.name}-nonce`);
        });
      },
      config: {
        auth: options.name,
        state: {
          parse: true,
        }
      }
    });
  };
}

export function configureAuth(c: StrutConfig) {
  const plugin: Hapi.PluginFunction<{ version: string, name: string }> = function(s, _, next) {
    s.route({
      method: 'GET',
      path: '',
      handler: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
        reply(`
          <html>
            <head><meta http-equiv="refresh" content="5; url=${c.authRoot}/${request.query['method']}" /></head>
            <body>REDIRECTING ${request.query['method']} / ${request.query['nonce']}</body>
          </html>
        `)
        .type('text/html')
        .state(`${request.query['method']}-nonce`, { nonce: request.query['nonce'] });
      },
      config: {
        validate: {
          query: {
            method: Joi.string().required(),
            nonce: Joi.string().required(),
          }
        }
      },
    });
    c.authTypes.forEach(t => routeGen(t, c)(s));
    next();
  };
  plugin.attributes = {
    version: '1.0.0',
    name: 'authentication',
  };
  return plugin;
}
