import * as Boom from 'boom';
import * as Joi from 'joi';
import { createRoutes } from './routes';
import * as mergeOptions from 'merge-options';
import { Model, Plump, ModelData, ModelReference } from 'plump'; // tslint:disable-line no-unused-variable
// need to import ModelReference because some of the methods return them.
import * as Hapi from 'hapi';

const baseRoutes = createRoutes();

function plugin(server, _, next) {
  server.route(
    this.constructor.routes
    .map((method) => this.route(method, baseRoutes[method]))
    .reduce((acc, curr) => acc.concat(curr), []) // routeRelationship returns an array
  );
  server.route(this.extraRoutes());
  next();
}

export interface RoutedItem extends Hapi.Request {
  pre: {
    item: {
      ref: Model,
      data: ModelData,
    };
  };
}

export interface StrutHandler<T> {
  (request: Hapi.Request): Promise<T>;
}

export class BaseController {
  public plump: Plump;
  public model: typeof Model;
  public options;
  public plugin: {
    attributes: {
      version: string,
      name: string
    }
  };
  static routes: string[];
  constructor(plump: Plump, model: typeof Model, options = {}) {
    this.plump = plump;
    this.model = model;
    this.options = Object.assign({}, { sideloads: [] }, options);
    this.plugin = plugin.bind(this);
    this.plugin.attributes = Object.assign({}, {
      version: '1.0.0',
      name: this.model.typeName,
    }, this.options.plugin);
  }

  extraRoutes() {
    return [];
  }

  read(): StrutHandler<ModelData> {
    return (request: RoutedItem) => Promise.resolve(request.pre.item.data);
  }

  update(): StrutHandler<ModelData> {
    return (request: RoutedItem) => {
      return request.pre.item.ref.set(request.payload).save();
    };
  }

  delete(): StrutHandler<void> {
    return (request: RoutedItem) => {
      return request.pre.item.ref.delete();
    };
  }

  create(): StrutHandler<ModelData> {
    return (request) => {
      return new this.model(request.payload.attributes, this.plump).save();
    };
  }

  addChild({ field }) {
    return (request: RoutedItem) => {
      return request.pre.item.ref.add(field, request.payload).save();
    };
  }

  listChildren({ field }): StrutHandler<ModelData> {
    return (request: RoutedItem) => request.pre.item.ref.get(`relationships.${field}`);
  }

  removeChild({ field }) {
    return (request: RoutedItem) => {
      return request.pre.item.ref.remove(field, { id: request.params.childId } ).save();
    };
  }

  modifyChild({ field }) {
    return (request: RoutedItem) => {
      const update = {
        id: request.params.childId,
        meta: request.payload.meta,
      };
      return request.pre.item.ref.modifyRelationship(field, update).save();
    };
  }

  query() {
    return (request) => {
      return this.plump.query(request.query);
    };
  }

  createHandler(method, options): Hapi.ISessionHandler {
    const handler = this[method](options);
    return (request: Hapi.Request, reply: Hapi.IReply) => {
      return handler(request)
      .then((response) => {
        reply(response).code(200);
      }).catch((err) => {
        console.log(err);
        reply(Boom.badImplementation(err));
      });
    };
  }

  createJoiValidator(field?: string) {
    try {
      const schema = this.model.schema;
      if (field) {
        if (field in schema.attributes) {
          return { [field]: Joi[schema.attributes[field].type]() };
        } else if (field in schema.relationships) {
          const dataSchema: any = {
            id: Joi.number(),
          };

          if (schema.relationships[field].type.extras) {
            const extras = schema.relationships[field].type.extras;

            Object.keys(extras).forEach(extra => {
              dataSchema.meta = dataSchema.meta || {};
              dataSchema.meta[extra] = Joi[extras[extra].type]();
            });
          }
          return dataSchema;
        } else {
          return {};
        }
      } else {
        const retVal: any = {
          typeName: Joi.string(),
          id: Joi.number(),
          attributes: {},
          relationships: {},
        };

        Object.keys(schema.attributes).forEach(attr => {
          retVal.attributes[attr] = Joi[schema.attributes[attr].type]();
        });

        Object.keys(schema.relationships).forEach(relName => {
          const itemSchema: any = { id: Joi.number() };

          if (schema.relationships[relName].type.extras) {
            const extras = schema.relationships[relName].type.extras;

            for (const extra in extras) { // eslint-disable-line guard-for-in
              const extraType = extras[extra].type;
              itemSchema.meta = itemSchema.meta || {};
              itemSchema.meta[extra] = Joi[extraType]();
            }
          }
          retVal.relationships[relName] = Joi.array().items(Joi.object({
            op: Joi.string().valid('add', 'modify', 'remove'),
            data: itemSchema,
          }));
        });
        return retVal;
      }
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  loadHandler() {
    return {
      method: (request, reply) => {
        if (request.params && request.params.itemId) {
          const item = this.plump.find({ typeName: this.model.typeName, id: request.params.itemId });
          return item.get()
          .then((thing) => {
            if (thing) {
              reply({
                ref: item,
                data: thing,
              });
            } else {
              reply(Boom.notFound());
            }
          }).catch((err) => {
            console.log(err);
            reply(Boom.badImplementation(err));
          });
        } else {
          return reply(Boom.notFound());
        }
      },
      assign: 'item',
    };
  }

  route(method, opts) {
    if (opts.plural) {
      return this.routeRelationships(method, opts);
    } else {
      return this.routeAttributes(method, opts);
    }
  }


  // override approveHandler with whatever per-route
  // logic you want - reply with Boom.notAuthorized()
  // or any other value on non-approved status
  approveHandler(method, opts) { // eslint-disable-line no-unused-vars
    return {
      method: (request, reply) => reply(true),
      assign: 'approve',
    };
  }

  routeRelationships(method, opts) {
    return Object.keys(this.model.schema.relationships).map(field => {
      const genericOpts = mergeOptions(
        {},
        opts,
        {
          validate: {},
          generatorOptions: { field },
        }
      );
      genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
      if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
        genericOpts.validate.payload = this.createJoiValidator(field);
      }
      genericOpts.plural = false;
      return this.routeAttributes(method, genericOpts);
    });
  }

  routeAttributes(method, opts) {
    /*
    opts: {
      pre: [ANY PREHANDLERs]
      handler: handler override
      validate: {Joi by type (param, query, payload)},
      auth: anything other than token,
      hapi: {ALL OTHER HAPI OPTIONS, MUST BE JSON STRINGIFYABLE},
    },
    */

    const routeConfig = mergeOptions(
      {},
      {
        handler: opts.handler || this.createHandler(method, opts.generatorOptions),
        config: {
          pre: [this.approveHandler(method, opts.generatorOptions)],
          validate: {},
        },
      },
      opts.hapi
    );

    if (opts.hapi.path.indexOf('itemId') >= 0) {
      routeConfig.config.pre.unshift(this.loadHandler());
    }

    if (opts.pre !== undefined) {
      opts.pre.forEach((p) => routeConfig.config.pre.push(p));
    }

    if (opts.validate && opts.validate.query) {
      routeConfig.config.validate.query = opts.validate.query;
    }

    if (opts.validate && opts.validate.params) {
      routeConfig.config.validate.params = opts.validate.params;
    }

    if (opts.validate && opts.validate.payload === true) {
      routeConfig.config.validate.payload = this.createJoiValidator();
    } else if (opts.validate && opts.validate.payload) {
      routeConfig.config.validate.payload = opts.validate.payload;
    }
    return routeConfig;
  }
}

BaseController.routes = [
  'read',
  'query',
  'listChildren',
  'addChild',
  'removeChild',
  'modifyChild',
  'create',
  'update',
  'delete',
];
