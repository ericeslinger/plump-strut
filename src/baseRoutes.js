import Joi from 'joi';

export function createRoutes(opts = {}) {
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
        config: {},
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
        config: {},
      },
    },
    query: {
      hapi: {
        method: 'GET',
        path: '',
        config: {},
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
        config: {},
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
        config: {},
      },
    },
  };

  if (opts.authFor) {
    Object.keys(opts.authFor).forEach((k) => {
      retVal[k].hapi.config.auth = opts.authFor[k];
    });
  }

  return retVal;
}
