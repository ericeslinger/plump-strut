import { ModelSchema, ModelData, ModelReference } from 'plump';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';
import * as Joi from 'joi';
import * as Boom from 'boom';
import {
  AuthorizeRequest,
  Generator,
  Transformer,
  RouteOptions,
  StrutRouteConfiguration,
} from './dataTypes';
import { Oracle } from './oracle';

function generateAuthRequest(
  options: RouteOptions
): (r: Hapi.Request) => AuthorizeRequest {
  return (req: Hapi.Request) => {
    const getActor = options.actorMapFn
      ? options.actorMapFn
      : (v: ModelReference) => v;
    if (options.kind === 'attributes') {
      switch (options.action) {
        case 'create':
          return {
            data: req.payload,
            target: { type: options.schema.name },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'read':
          return {
            target: { type: options.schema.name, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'update':
          return {
            data: req.payload,
            target: { type: options.schema.name, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'delete':
          return {
            data: req.payload,
            target: { type: options.schema.name, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'query':
          return {
            target: { type: options.schema.name },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
      }
    } else if (options.kind === 'relationship') {
      switch (options.action) {
        case 'create':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.schema.name, id: req.params.itemId },
            meta: req.payload.meta,
            child: { type: options.childSchema.name, id: req.payload.id },
          };
        case 'read':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.schema.name, id: req.params.itemId },
          };
        case 'update':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.schema.name, id: req.params.itemId },
            child: { type: options.childSchema.name, id: req.payload.id },
            meta: req.payload.meta,
          };
        case 'delete':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.schema.name, id: req.params.itemId },
            child: { type: options.childSchema.name, id: req.payload.id },
          };
      }
    }
  };
}

export function joi(options: RouteOptions, oracle: Oracle): Transformer {
  return (i: Partial<StrutRouteConfiguration>) => {
    if (oracle && oracle.authorizers[options.schema.name]) {
      if (i.config.pre === undefined) {
        i.config.pre = [];
      }
      const authMap = generateAuthRequest(options);
      i.config.pre = i.config.pre.concat({
        assign: 'authorize',
        method: (req: Hapi.Request, reply: Hapi.Base_Reply) => {
          oracle.dispatch(authMap(req)).then(v => {
            if (v.result === true) {
              reply(true);
            } else {
              reply(Boom.unauthorized());
            }
          });
        },
      });
    }
    return i;
  };
}
