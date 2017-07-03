import * as Hapi from 'hapi';
import { Plump, Model } from 'plump';
import { RouteOptions } from './routes';
import { TokenService, AuthenticationStrategy } from './authentication';
export interface StrutConfig {
    models?: typeof Model[];
    apiRoot: string;
    apiProtocol: 'http' | 'https';
    authTypes: AuthenticationStrategy[];
    apiPort: number;
    hostName: string;
    authRoot: string;
    routeOptions: Partial<RouteOptions>;
}
export interface StrutServices {
    hapi: Hapi.Server;
    io: SocketIO.Server;
    plump: Plump;
    tokenStore: TokenService;
    [key: string]: any;
}
export declare class StrutServer {
    services: Partial<StrutServices>;
    config: StrutConfig;
    constructor(plump: Plump, conf: Partial<StrutConfig>, services?: Partial<StrutServices>);
    preRoute(): Promise<void>;
    preInit(): Promise<void>;
    initialize(): Promise<void>;
    baseUrl(): string;
    start(): Promise<Error>;
}
