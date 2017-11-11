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

import { SocketDispatch } from './socket/dataTypes';
import { AuthorizerDefinition, AuthorizeRequest, IOracle } from './authorize';

export interface RoutedItem extends Hapi.Request {
  pre: {
    item: {
      ref: Model<ModelData>;
      data: ModelData;
    };
  };
}

export interface HandledItem extends RoutedItem {
  pre: {
    item: {
      ref: Model<ModelData>;
      data: ModelData;
    };
    handle: ModelData;
  };
}

export interface StrutServer {
  config: StrutConfig;
  services: StrutServices;
  baseUrl: () => string;
  initialize: () => Promise<void>;
  preInit: () => Promise<void>;
  preRoute: () => Promise<void>;
  extensions: any;
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
  routeName?: string;
  model?: typeof Model;
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
  apiHostname: string;
  authRoot: string;
  routeOptions: Partial<RouteOptions>;
  socketHandlers: SocketDispatch[];
  modelControllers: {
    [type: string]: RouteController;
  };
  extraControllers?: RouteController[];
  defaultController?: RouteController;
}
export type CRUD = 'create' | 'read' | 'update' | 'delete';
// export type CRUDQ = 'create' | 'read' | 'update' | 'delete' | 'query';

export interface AttributeRouteSelector extends BasicRouteSelector {
  kind: 'attributes';
  action: CRUD;
}

export interface RelationshipRouteSelector extends BasicRouteSelector {
  kind: 'relationship';
  action: CRUD;
  relationship: string;
}

export interface OtherRouteSelector extends BasicRouteSelector {
  kind: 'other';
  action: string;
}

export interface RouteController {
  generators: SegmentGenerator[];
  attributes: CRUD[];
  relationships: CRUD[];
  other: string[];
  name?: string;
}

export type RouteSelector =
  | AttributeRouteSelector
  | OtherRouteSelector
  | RelationshipRouteSelector;
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

export interface StrutServices {
  hapi?: Hapi.Server;
  io?: SocketIO.Server;
  plump?: Plump;
  tokenStore?: TokenService;
  oracle?: IOracle;
  [key: string]: any;
}

export interface KeyService {
  test(key: string): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, val: T): Promise<T | null>;
}
