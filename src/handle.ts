import {
  SegmentGenerator,
  Transformer,
  RoutedItem,
  RouteOptions,
  StrutRouteConfiguration,
  StrutServices,
} from './dataTypes';
import { Model, Plump, ModelData } from 'plump';
import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as mergeOptions from 'merge-options';

function loadHandler(
  model: typeof Model,
  plump: Plump,
  toLoad: string[] = ['attributes', 'relationships'],
) {
  return {
    method: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
      if (request.params && request.params.itemId) {
        const item = plump.find({
          type: model.type,
          id: request.params.itemId,
        });
        return item
          .get(toLoad)
          .then(thing => {
            if (thing) {
              reply({
                ref: item,
                data: thing,
              });
            } else {
              reply(Boom.notFound());
            }
          })
          .catch(err => {
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

function handler(request: Hapi.Request, reply: Hapi.Base_Reply) {
  return reply(request.pre['handle']);
}

export const handle: SegmentGenerator = (
  options: RouteOptions,
  services: StrutServices,
) => {
  return (i: Partial<StrutRouteConfiguration>) => {
    function handleBlock(): Partial<StrutRouteConfiguration> {
      if (options.kind === 'attributes') {
        switch (options.action) {
          case 'create':
            return {
              config: {
                pre: i.config.pre.concat({
                  method: (request: Hapi.Request, reply: Hapi.Base_Reply) => {
                    const created = new options.model(
                      request.payload,
                      services.plump,
                    );
                    return created.save().then(v => reply(v));
                  },
                  assign: 'handle',
                }),
              },
              handler: handler,
            };
          case 'read':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      if (
                        services.oracle &&
                        services.oracle.filters[options.model.type]
                      ) {
                        return reply(
                          services.oracle.filter(request.pre.item.data),
                        );
                      } else {
                        return reply(request.pre.item.data);
                      }
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'update':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return request.pre.item.ref
                        .set(request.payload)
                        .save()
                        .then(v => reply(v));
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'delete':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return request.pre.item.ref.delete().then(v =>
                        reply()
                          .takeover()
                          .code(200),
                      );
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'query':
            return {
              handler: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                return Boom.notFound();
              },
            };
        }
      } else if (options.kind === 'relationship') {
        switch (options.action) {
          case 'create':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump, [
                    'attributes',
                    `relationships.${options.relationship}`,
                  ]),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return request.pre.item.ref
                        .add(options.relationship, request.payload)
                        .save()
                        .then(v => reply(v));
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'read':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump, [
                    'attributes',
                    `relationships.${options.relationship}`,
                  ]),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return reply(request.pre.item.data);
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'update':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump, [
                    'attributes',
                    `relationships.${options.relationship}`,
                  ]),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return request.pre.item.ref
                        .modifyRelationship(
                          options.relationship,
                          Object.assign({}, request.payload, {
                            // prevent the user from posting "modify id:2 to the route /item/children/1"
                            id: request.params.childId,
                          }),
                        )
                        .save()
                        .then(v => reply(v));
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
          case 'delete':
            return {
              handler: handler,
              config: {
                pre: i.config.pre.concat(
                  loadHandler(options.model, services.plump, [
                    'attributes',
                    `relationships.${options.relationship}`,
                  ]),
                  {
                    method: (request: RoutedItem, reply: Hapi.Base_Reply) => {
                      return request.pre.item.ref
                        .remove(options.relationship, {
                          type: 'foo',
                          id: request.params.childId,
                        })
                        .save()
                        .then(v => reply(v));
                    },
                    assign: 'handle',
                  },
                ),
              },
            };
        }
      }
    }
    return mergeOptions({}, i, handleBlock());
  };
};
