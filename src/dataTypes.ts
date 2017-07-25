import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import {
  Model,
  ModelReference,
  IndefiniteModelData,
  ModelData,
  ModelSchema,
  Plump,
} from 'plump';

export interface AuthenticationResponse {
  response: string;
  token: string;
}

export interface AuthenticationHandler {
  (r: Hapi.Request, strut: StrutServices): Promise<AuthenticationResponse>;
}

export interface StrutConfig {
  models?: typeof Model[];
  apiRoot: string;
  apiProtocol: 'http' | 'https';
  authTypes: AuthenticationStrategy[];
  apiPort: number;
  hostName: string;
  authRoot: string;
  routeOptions: Partial<RouteOptions>;
  routeGenerators: {
    [type: string]: Partial<RouteGenerator>;
  };
  defaultRouteGenerator?: RouteGenerator;
}

export interface AuthenticationType {
  name: string;
  url: string;
  iconUrl?: string;
}

export interface AuthenticationStrategy {
  name: string;
  handler: AuthenticationHandler;
  iconUrl?: string;
  strategy: {
    provider: string;
    password?: string;
    cookie: string;
    scope: string[];
    clientId: string;
    clientSecret: string;
    isSecure: boolean;
    forceHttps: boolean;
    providerParams?: any;
  };
  nonceCookie?: Hapi.ServerStateCookieConfiguationObject;
}

export interface StrutInnerConfig
  extends Hapi.RouteAdditionalConfigurationOptions {
  pre: Hapi.RoutePrerequisiteObjects[];
}

export interface StrutRouteConfiguration extends Hapi.RouteConfiguration {
  config: StrutInnerConfig;
}

export interface Transformer {
  (block: Partial<StrutRouteConfiguration>): Partial<StrutRouteConfiguration>;
}

export interface BasicRouteOptions {
  cors: Hapi.CorsConfigurationObject | boolean;
  authentication: string;
  model: typeof Model;
  actorMapFn?: (m: ModelData) => ModelReference;
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
}

export type RouteSelector = AttributeRouteSelector | RelationshipRouteSelector;
export type RouteOptions = BasicRouteOptions & RouteSelector;

export interface TokenService {
  validate: (
    token: string,
    callback: (err: Error | null, credentials: any) => void
  ) => void;
  tokenToUser: (token: string) => Promise<ModelData>;
  userToToken: (user: ModelData) => Promise<string>;
}

export interface StrutServices {
  hapi?: Hapi.Server;
  io?: SocketIO.Server;
  plump?: Plump;
  tokenStore?: TokenService;
  [key: string]: any;
}

export interface Generator {
  (opts: RouteOptions, strut: StrutServices): Transformer;
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

export interface AttributesQueryAuthorizeRequest
  extends AbstractAttributesAuthorizeRequest {
  action: 'query';
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
  | AttributesQueryAuthorizeRequest
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

export interface RouteGenerator {
  base: Generator;
  joi: Generator;
  authorize: Generator;
  handle: Generator;
}
