import {
  Model,
  ModelData,
  ModelReference,
  Plump,
  IndefiniteModelData,
} from 'plump';
import * as Hapi from 'hapi';
import mergeOptions from 'merge-options';
import * as Joi from 'joi';
import * as Boom from 'boom';
import {
  SegmentGenerator,
  Transformer,
  RouteOptions,
  StrutRouteConfiguration,
  StrutServices,
} from './dataTypes';
import { Oracle } from './oracle';

export interface AbstractAuthorizeRequest {
  kind: 'attributes' | 'relationship' | 'compound' | 'other';
}

export interface OtherAuthorizeRequest extends AbstractAuthorizeRequest {
  kind: 'other';
  action: string;
}

export interface AbstractAttributesAuthorizeRequest
  extends AbstractAuthorizeRequest {
  action: 'create' | 'read' | 'update' | 'delete';
  actor: ModelReference;
  kind: 'attributes';
}

export interface AttributesReadAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'read';
  target: ModelReference;
}

export interface AttributesDeleteAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'delete';
  target: ModelReference;
}

export interface AttributesCreateAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'create';
  data?: IndefiniteModelData;
  target: {
    type: string;
  };
}

export interface QueryAuthorizeRequest extends OtherAuthorizeRequest {
  action: 'query';
  actor: ModelReference;
  target: {
    type: string;
  };
}

export interface AttributesUpdateAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'update';
  target: ModelReference;
  data?: ModelData;
}

export type AttributesAuthorizeRequest =
  | AttributesCreateAuthorizeRequest
  | AttributesReadAuthorizeRequest
  | AttributesUpdateAuthorizeRequest
  | AttributesDeleteAuthorizeRequest;

export interface AbstractRelationshipAuthorizeRequest
  extends AbstractAuthorizeRequest {
  kind: 'relationship';
  actor: ModelReference;
  action: 'create' | 'read' | 'update' | 'delete';
  relationship: string;
  target: ModelReference;
}

export interface RelationshipCreateAuthorizeRequest
  extends AbstractRelationshipAuthorizeRequest {
  action: 'create';
  child: ModelReference;
  meta?: any;
}

export interface RelationshipReadAuthorizeRequest
  extends AbstractRelationshipAuthorizeRequest {
  action: 'read';
}

export interface RelationshipUpdateAuthorizeRequest
  extends AbstractRelationshipAuthorizeRequest {
  action: 'update';
  child: ModelReference;
  meta?: any;
}

export interface RelationshipDeleteAuthorizeRequest
  extends AbstractRelationshipAuthorizeRequest {
  action: 'delete';
  child: ModelReference;
}

export type RelationshipAuthorizeRequest =
  | RelationshipCreateAuthorizeRequest
  | RelationshipReadAuthorizeRequest
  | RelationshipUpdateAuthorizeRequest
  | RelationshipDeleteAuthorizeRequest;

export type SimpleAuthorizeRequest =
  | RelationshipAuthorizeRequest
  | QueryAuthorizeRequest
  | AttributesAuthorizeRequest;

export interface CompoundAuthorizeRequest extends AbstractAuthorizeRequest {
  kind: 'compound';
  combinator: 'and' | 'or';
  list: (
    | AttributesAuthorizeRequest
    | QueryAuthorizeRequest
    | RelationshipAuthorizeRequest
    | CompoundAuthorizeRequest)[];
}

export type ConcreteAuthorizeRequest =
  | RelationshipAuthorizeRequest
  | QueryAuthorizeRequest
  | AttributesAuthorizeRequest;
export type AuthorizeRequest =
  | RelationshipAuthorizeRequest
  | QueryAuthorizeRequest
  | AttributesAuthorizeRequest
  | CompoundAuthorizeRequest;

export interface AbstractAuthorizeResponse {
  kind: string;
}

export interface FinalAuthorizeResponse extends AbstractAuthorizeResponse {
  kind: 'final';
  result: boolean;
}

export interface DelegateAuthorizeResponse extends AbstractAuthorizeResponse {
  kind: 'delegated';
  delegate: AuthorizeRequest;
}

export type AuthorizeResponse =
  | FinalAuthorizeResponse
  | DelegateAuthorizeResponse;

export interface ActorMapFn {
  (m: ModelData): ModelReference;
}

export interface AuthorizerDefinition {
  mapActor?: ActorMapFn;
  authorize(req: AuthorizeRequest): Promise<AuthorizeResponse>;
}

export interface FilterDefinition {
  type: 'white' | 'black';
  attributes?: string[];
  relationships?: string[];
}

export interface IOracle {
  authorizers: { [name: string]: AuthorizerDefinition };
  filters: { [name: string]: FilterDefinition };
  addAuthorizer(auth: AuthorizerDefinition, forType: string): void;
  addFilter(auth: FilterDefinition, forType: string): void;
  filter(m: ModelData): ModelData;
  dispatch(request: AuthorizeRequest): Promise<FinalAuthorizeResponse>;
  authorize(request: AuthorizeRequest): Promise<boolean>;
}

function generateAuthRequest(
  options: RouteOptions,
  services: StrutServices
): (r: Hapi.Request) => AuthorizeRequest {
  const getActor: ActorMapFn = services.oracle.authorizers[options.model.type]
    .mapActor
    ? services.oracle.authorizers[options.model.type].mapActor
    : v => v;
  return (req: Hapi.Request) => {
    if (options.kind === 'attributes') {
      switch (options.action) {
        case 'create':
          return {
            data: req.payload,
            target: { type: options.model.type },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'read':
          return {
            target: { type: options.model.type, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'update':
          return {
            data: req.payload,
            target: { type: options.model.type, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
        case 'delete':
          return {
            data: req.payload,
            target: { type: options.model.type, id: req.params.itemId },
            kind: options.kind,
            action: options.action,
            actor: getActor(req.auth.credentials.user),
          };
      }
    } else if (options.kind === 'relationship') {
      const childModel =
        services.plump.types[
          options.model.schema.relationships[options.relationship].type.sides[
            options.relationship
          ].otherType
        ];
      switch (options.action) {
        case 'create':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.model.type, id: req.params.itemId },
            meta: req.payload.meta,
            child: { type: childModel.type, id: req.payload.id },
          };
        case 'read':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.model.type, id: req.params.itemId },
          };
        case 'update':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.model.type, id: req.params.itemId },
            child: { type: childModel.type, id: req.params.childId },
            meta: req.payload.meta,
          };
        case 'delete':
          return {
            kind: options.kind,
            action: options.action,
            relationship: options.relationship,
            actor: getActor(req.auth.credentials.user),
            target: { type: options.model.type, id: req.params.itemId },
            child: { type: childModel.type, id: req.params.childId },
          };
      }
    } else if (options.kind === 'other') {
      if (options.action === 'query') {
        return {
          target: { type: options.model.type },
          kind: options.kind,
          action: options.action,
          actor: getActor(req.auth.credentials.user),
        };
      }
    }
  };
}

export const authorize: SegmentGenerator = (
  options: RouteOptions,
  services: StrutServices
) => {
  return (o: Partial<StrutRouteConfiguration>) => {
    const i = mergeOptions({}, o);
    if (services.oracle && services.oracle.authorizers[options.model.type]) {
      if (i.config.pre === undefined) {
        i.config.pre = [];
      }
      const authMap = generateAuthRequest(options, services);
      i.config.auth = 'token';
      i.config.pre = i.config.pre.concat({
        assign: 'authorize',
        method: (req: Hapi.Request, reply: Hapi.Base_Reply) => {
          services.oracle.dispatch(authMap(req)).then(v => {
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
};
