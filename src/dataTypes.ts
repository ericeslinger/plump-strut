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

export interface RoutedItem extends Hapi.Request {
  pre: {
    item: {
      ref: Model<ModelData>;
      data: ModelData;
    };
  };
}

export interface StrutServer {
  config: StrutConfig;
  services: StrutServices;
  baseUrl: () => string;
  initialize: () => Promise<void>;
  preInit: () => Promise<void>;
  preRoute: () => Promise<void>;
}

export interface RequestHandler {
  (m: ChannelRequest, s: StrutServer): Promise<Response>;
}

export interface StrutInnerConfig
  extends Hapi.RouteAdditionalConfigurationOptions {
  pre: Hapi.RoutePrerequisiteObjects[];
}

export interface StrutRouteConfiguration extends Hapi.RouteConfiguration {
  config: StrutInnerConfig;
}

export interface BasicRouteOptions {
  cors: Hapi.CorsConfigurationObject | boolean;
  authentication: string;
  model: typeof Model;
}
export interface BasicRouteSelector {
  kind: string;
  action: string;
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
    [type: string]: SegmentGenerator[];
  };
  defaultRouteGenerator?: SegmentGenerator[];
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

export interface Transformer {
  (block: Partial<StrutRouteConfiguration>): Partial<StrutRouteConfiguration>;
}

export interface SegmentGenerator {
  (opts: RouteOptions, strut: StrutServices): Transformer;
}

export interface RouteGenerator {
  base: SegmentGenerator;
  joi: SegmentGenerator;
  authorize: SegmentGenerator;
  handle: SegmentGenerator;
}

export interface SingletonRequest {
  responseKey: string;
}

export interface ChannelRequest {
  request: string;
  client: SocketIO.Socket;
}

export interface TestKeyAuthenticationRequest
  extends ChannelRequest,
    SingletonRequest {
  request: 'testkey';
  key: string;
}

export interface StartAuthenticationRequest
  extends ChannelRequest,
    SingletonRequest {
  request: 'startauth';
  nonce: string;
}

export type AuthenticationRequest =
  | TestKeyAuthenticationRequest
  | StartAuthenticationRequest;

export interface Response {
  response: string;
}

export interface InvalidRequestResponse extends Response {
  response: 'invalidRequest';
}

export interface StartResponse extends Response {
  response: 'startauth';
  types: AuthenticationType[];
}

export interface TestResponse extends Response {
  response: 'testkey';
  auth: boolean;
}

export type AuthenticationResponse =
  | InvalidRequestResponse
  | StartResponse
  | TestResponse;

export interface AuthenticationType {
  name: string;
  url: string;
  iconUrl?: string;
}

export interface RestAuthenticationResponse {
  response: string;
  token: string;
}

export interface AuthenticationHandler {
  (r: Hapi.Request, strut: StrutServices): Promise<RestAuthenticationResponse>;
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

export interface TokenService {
  validate: (
    token: string,
    callback: (err: Error | null, credentials: any) => void,
  ) => void;
  tokenToUser: (token: string) => Promise<ModelData>;
  userToToken: (user: ModelData) => Promise<string>;
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

export interface StrutServices {
  hapi?: Hapi.Server;
  io?: SocketIO.Server;
  plump?: Plump;
  tokenStore?: TokenService;
  oracle?: IOracle;
  [key: string]: any;
}

export interface AbstractAuthorizeRequest {
  kind: 'attributes' | 'relationship' | 'compound';
}

export interface AbstractAttributesAuthorizeRequest
  extends AbstractAuthorizeRequest {
  action: 'create' | 'read' | 'update' | 'delete' | 'query';
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
  data?: ModelData;
}

export type AttributesAuthorizeRequest =
  | AttributesCreateAuthorizeRequest
  | AttributesReadAuthorizeRequest
  | AttributesUpdateAuthorizeRequest
  | AttributesDeleteAuthorizeRequest
  | AttributesQueryAuthorizeRequest;

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

export interface ActorMapFn {
  (m: ModelData): ModelReference;
}

export interface AuthorizerDefinition {
  authorize(req: AuthorizeRequest): Promise<AuthorizeResponse>;
  mapActor?: ActorMapFn;
}

export interface KeyService {
  test(key: string): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, val: T): Promise<T | null>;
}
