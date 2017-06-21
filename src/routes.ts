import * as Joi from 'joi';
import * as Hapi from 'hapi';

export interface RouteOptions {
  cors: Hapi.CorsConfigurationObject;
  authFor: {
    read?: string;
    listChildren?: string;
    query?: string;
    create?: string;
    update?: string;
    delete?: string;
    addChild?: string;
    modifyChild?: string;
    removeChild?: string;
  };
}

export function createRoutes(opts: Partial<RouteOptions> = {}) {
  const retVal = {
    read: {
      validate: {
        params: {
          itemId: Joi.number().integer(),
        },
      },
      hapi: {
        method: 'GET',
        path: '/{itemId}',
        config: {
          cors: opts.cors ? opts.cors : false,
        },
      },
    },
    listChildren: {
      plural: true,
      validate: {
        params: {
          itemId: Joi.number().integer(),
        },
      },
      hapi: {
        method: 'GET',
        path: '/{itemId}/{field}',
        config: {
          cors: opts.cors ? opts.cors : false,
        },
      },
    },
    query: {
      hapi: {
        method: 'GET',
        path: '',
        config: {
          cors: opts.cors ? opts.cors : false,
        },
      },
    },
    create: {
      validate: {
        payload: true,
      },
      hapi: {
        method: 'POST',
        path: '',
        config: {
          cors: opts.cors ? opts.cors : false,
          payload: { output: 'data', parse: true },
        },
      },
    },
    update: {
      validate: {
        payload: true,
        params: {
          itemId: Joi.number().integer().required(),
        },
      },
      hapi: {
        method: 'PATCH',
        path: '/{itemId}',
        config: {
          cors: opts.cors ? opts.cors : false,
          payload: { output: 'data', parse: true },
        },
      },
    },
    delete: {
      validate: {
        params: {
          itemId: Joi.number().integer().required(),
        },
      },
      hapi: {
        method: 'DELETE',
        path: '/{itemId}',
        config: {
          cors: opts.cors ? opts.cors : false,
        },
      },
    },
    addChild: {
      plural: true,
      validate: {
        params: {
          itemId: Joi.number().integer().required(),
        },
      },
      hapi: {
        method: 'PUT',
        path: '/{itemId}/{field}',
        config: {
          cors: opts.cors ? opts.cors : false,
          payload: { output: 'data', parse: true },
        },
      },
    },
    modifyChild: {
      plural: true,
      validate: {
        params: {
          itemId: Joi.number().integer().required(),
          childId: Joi.number().required(),
        },
      },
      hapi: {
        method: 'PATCH',
        path: '/{itemId}/{field}/{childId}',
        config: {
          cors: opts.cors ? opts.cors : false,
          payload: { output: 'data', parse: true },
        },
      },
    },
    removeChild: {
      plural: true,
      validate: {
        params: {
          itemId: Joi.number().integer().required(),
          childId: Joi.number().required(),
        },
      },
      hapi: {
        method: 'DELETE',
        path: '/{itemId}/{field}/{childId}',
        config: {
          cors: opts.cors ? opts.cors : false,
        },
      },
    },
  };

  if (opts.authFor) {
    Object.keys(opts.authFor).forEach(k => {
      retVal[k].hapi.config.auth = opts.authFor[k];
    });
  }

  return retVal;
}
