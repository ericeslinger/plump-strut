import Joi from 'joi';

export const baseRoutes = {
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
        auth: 'token',
      },
    },
  },
  schema: {
    hapi: {
      method: 'GET',
      path: '/schema',
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
        auth: 'token',
      },
    },
  },
  query: {
    hapi: {
      method: 'GET',
      path: '',
      config: {
        auth: 'token',
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
        payload: { output: 'data', parse: true },
        auth: 'token',
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
        auth: 'token',
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
        auth: 'token',
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
        payload: { output: 'data', parse: true },
        auth: 'token',
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
        auth: 'token',
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
        auth: 'token',
      },
    },
  },
};
