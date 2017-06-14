import * as Joi from 'joi';
import * as Hapi from 'hapi';
import * as Bell from 'bell';

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

function routeGen(options: AuthenticationType) {
  return (server) => {
    server.auth.strategy(options.name, 'bell', options.strategy);
    server.route({
      method: ['GET', 'POST'],
      path: options.name,
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
      }
    });
  };
}

function cookieAndDispatch(request: Hapi.Request, reply: Hapi.Base_Reply) {
  console.log(request.query);
  reply(`
    <html>
      <head><meta http-equiv="refresh" content="5; url=${request.query['method']}" /></head>
      <body>REDIRECTING ${request.query['method']}</body>
    </html>
  `)
  .type('text/html')
  .state('authNonce', { nonce: request.query['nonce'] });
}

const cookieRoute: Hapi.RouteConfiguration = {
  method: 'GET',
  path: '',
  handler: cookieAndDispatch,
  config: {
    validate: {
      query: {
        method: Joi.string().required(),
        nonce: Joi.string().required(),
      }
    }
  },
};

export function configureAuth(types: AuthenticationType[], server: Hapi.Server) {
  const plugin: Hapi.PluginFunction<{ version: string, name: string }> = function(s, _, next) {
    s.route(cookieRoute);
    types.forEach(t => routeGen(t)(server));
    next();
  };
  plugin.attributes = {
    version: '1.0.0',
    name: 'authentication',
  };
  return plugin;
}
