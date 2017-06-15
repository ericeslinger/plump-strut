import * as Joi from 'joi';
import * as Hapi from 'hapi';
import * as Bell from 'bell';
import { StrutConfig } from './server';

export interface AuthenticationType {
  name: string;
  handler: (r: Hapi.Request) => Promise<string>;
  strategy: {
    provider: string;
    password: string;
    cookie: string;
    scope: string[];
    clientId: string;
    clientSecret: string;
    isSecure: boolean;
    forceHttps: boolean;
    providerParams?: any,
  };
}

function routeGen(options: AuthenticationType, c: StrutConfig) {
  return (server) => {
    server.auth.strategy(options.name, 'bell', options.strategy);
    server.route({
      method: ['GET', 'POST'],
      path: `/${options.name}`,
      handler: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
        return options.handler(request)
        .then((s: string) => {
          reply(s)
          .type('text/html')
          .unstate('authNonce');
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
            <body>REDIRECTING ${request.query['method']}</body>
          </html>
        `)
        .type('text/html')
        .state('authNonce', { nonce: request.query['nonce'] });
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
