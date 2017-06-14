import * as Joi from 'joi';
import * as Hapi from 'hapi';
import * as Bell from 'bell';

export interface AuthenticationType {
  name: string;
  handler: Hapi.RouteHandler;
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

export class AuthenticationModule { }

function routeGen(options: AuthenticationType) {
  return (server) => {
    server.auth.strategy(options.name, 'bell', options.strategy);
    server.route({
      method: ['GET', 'POST'],
      path: options.name,
      handler: options.handler,
      config: {
        auth: options.name,
      }
    });
  };
}

function cookieAndDispatch(request: Hapi.Request, reply: Hapi.Base_Reply) {
  console.log(request.query);
  reply(200).state('authNonce', { nonce: request.query['nonce'] });
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

const authRoute: Hapi.RouteConfiguration = {
  method: ['GET', 'POST'],
  path: null,
  config: {
    auth: null,
  }
};

export const plugin: Hapi.PluginFunction<{ version: string, name: string }> = function(server, _, next) {
  server.route(cookieRoute);
  next();
};
plugin.attributes = {
  version: '1.0.0',
  name: 'authentication',
};
