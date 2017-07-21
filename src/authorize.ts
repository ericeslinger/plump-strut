import { ModelSchema, ModelData } from 'plump';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';
import * as Joi from 'joi';
import * as Boom from 'boom';
import {
  Generator,
  Transformer,
  RouteOptions,
  StrutRouteConfiguration,
} from './dataTypes';
import { Oracle } from './oracle';

function package(
  req: Hapi.Request & {
    auth: {
      credentials: {
        user: ModelData;
      };
    };
  },
  route: RouteOptions
): Promise<AuthorizeRequest> {
  return Promise.resolve().then<AuthorizeRequest>(() => {
    if (route.kind === 'attributes') {
      if (route.action === 'create') {
        return {
          data: req.payload,
          target: { type: route.target },
          kind: 'attributes',
          action: 'create',
          actor: req.auth.credentials.user,
        };
      } else if (route.action === 'read') {
        return {
          target: { type: route.target, id: req.params.itemId },
          kind: 'attributes',
          action: 'read',
          actor: req.auth.credentials.user,
        };
      } else if (route.action === 'update') {
        return {
          data: req.payload,
          target: { type: route.target, id: req.params.itemId },
          kind: 'attributes',
          action: 'update',
          actor: req.auth.credentials.user,
        };
      } else if (route.action === 'delete') {
        return {
          data: req.payload,
          target: { type: route.target, id: req.params.itemId },
          kind: 'attributes',
          action: 'update',
          actor: req.auth.credentials.user,
        };
      }
    } else if (route.kind === 'relationship') {
      if (route.action === 'create') {
        return {
          kind: 'relationship',
          action: 'create',
          relationship: route.relationship,
          actor: req.auth.credentials.user,
          target: { type: route.target, id: req.params.itemId },
          meta: req.payload.meta,
          child: { type: route.childType, id: req.payload.id },
        };
      } else if (route.action === 'read') {
        return {
          kind: 'relationship',
          action: 'read',
          relationship: route.relationship,
          actor: req.auth.credentials.user,
          target: { type: route.target, id: req.params.itemId },
        };
      } else if (route.action === 'update') {
        return {
          kind: 'relationship',
          action: 'update',
          relationship: route.relationship,
          actor: req.auth.credentials.user,
          target: { type: route.target, id: req.params.itemId },
          child: { type: route.childType, id: req.payload.id },
          meta: req.payload.meta,
        };
      } else if (route.action === 'delete') {
        return {
          kind: 'relationship',
          action: 'delete',
          relationship: route.relationship,
          actor: req.auth.credentials.user,
          target: { type: route.target, id: req.params.itemId },
          child: { type: route.childType, id: req.payload.id },
        };
      }
    }
  });
}

export function joi(options: RouteOptions, oracle: Oracle): Transformer {
  return (i: Partial<StrutRouteConfiguration>) => {
    if (oracle && oracle.authorizers[options.schema.name]) {
      if (i.config.pre === undefined) {
        i.config.pre = [];
      }
      i.config.pre.push({
        assign: 'authorize',
        method: (req: Hapi.Request, reply: Hapi.Base_Reply) => {
          oracle
            .package(req, options)
            .then(ar => oracle.dispatch(ar))
            .then(v => {
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
