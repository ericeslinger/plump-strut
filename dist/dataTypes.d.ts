import * as Hapi from 'hapi';
import { Model, ModelData, Plump } from 'plump';
import { SocketDispatch } from './socket/dataTypes';
import { IOracle } from './authorize';
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
    extensions: any;
}
export interface StrutInnerConfig extends Hapi.RouteAdditionalConfigurationOptions {
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
    socketHandlers: SocketDispatch[];
    controllers: {
        [type: string]: RouteController;
    };
    defaultController?: RouteController;
}
export declare type CRUD = 'create' | 'read' | 'update' | 'delete';
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
    attributes?: CRUD[];
    relationships?: CRUD[];
    other?: string[];
}
export declare type RouteSelector = AttributeRouteSelector | OtherRouteSelector | RelationshipRouteSelector;
export declare type RouteOptions = BasicRouteOptions & RouteSelector;
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
    validate: (token: string, callback: (err: Error | null, credentials: any) => void) => void;
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
