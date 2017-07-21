import * as Hapi from 'hapi';
import {
  ModelReference,
  IndefiniteModelData,
  ModelData,
  ModelSchema,
} from 'plump';

export interface StrutRouteConfiguration extends Hapi.RouteConfiguration {
  config: Hapi.RouteAdditionalConfigurationOptions;
}

export interface Transformer {
  (block: Partial<StrutRouteConfiguration>): Partial<StrutRouteConfiguration>;
}

export interface BasicRouteOptions {
  cors: Hapi.CorsConfigurationObject | boolean;
  authentication: string;
  schema: ModelSchema;
}
export interface BasicRouteSelector {
  kind: string;
  action: string;
}

export interface AttributeRouteSelector extends BasicRouteSelector {
  kind: 'attributes';
  action: 'create' | 'read' | 'update' | 'delete' | 'query';
}

export interface RelationshipRouteSelector extends BasicRouteSelector {
  kind: 'relationship';
  action: 'create' | 'read' | 'update' | 'delete';
  relationship: string;
  childSchema: ModelSchema;
}

export type RouteSelector = AttributeRouteSelector | RelationshipRouteSelector;
export type RouteOptions = BasicRouteOptions & RouteSelector;

export interface Generator {
  (opts: RouteOptions): Transformer;
}

export interface AbstractAuthorizeRequest {
  kind: 'attributes' | 'relationship' | 'compound';
  actor: ModelReference;
  action: string;
}

export interface AbstractAttributesAuthorizeRequest
  extends AbstractAuthorizeRequest {
  action: 'create' | 'read' | 'update' | 'delete' | 'query';
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
  data: IndefiniteModelData;
  target: {
    type: string;
  };
}

export interface AttributesUpdateAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'update';
  target: ModelReference;
  data: ModelData;
}

export type AttributesAuthorizeRequest =
  | AttributesCreateAuthorizeRequest
  | AttributesReadAuthorizeRequest
  | AttributesUpdateAuthorizeRequest
  | AttributesDeleteAuthorizeRequest;

export interface AbstractRelationshipAuthorizeRequest
  extends AbstractAuthorizeRequest {
  kind: 'relationship';
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
  | AttributesAuthorizeRequest;

export interface CompoundAuthorizeRequest extends AbstractAuthorizeRequest {
  kind: 'compound';
  combinator: 'and' | 'or';
  list: (
    | AttributesAuthorizeRequest
    | RelationshipAuthorizeRequest
    | CompoundAuthorizeRequest)[];
}

export type ConcreteAuthorizeRequest =
  | RelationshipAuthorizeRequest
  | AttributesAuthorizeRequest;
export type AuthorizeRequest =
  | RelationshipAuthorizeRequest
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

export interface AuthorizerDefinition {
  authorize(req: AuthorizeRequest): Promise<AuthorizeResponse>;
}

export interface KeyService {
  test(key: string): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, val: T): Promise<T | null>;
}
