import * as Hapi from 'hapi';
import { Plump, Model } from 'plump';
import { RouteOptions } from './routes';
import { AuthenticationStrategy } from './authentication';
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
    [key: string]: any;
}
export declare class StrutServer {
    config: StrutConfig;
    services: Partial<StrutServices>;
    constructor(plump: Plump, conf: Partial<StrutConfig>);
    initialize(): Promise<void>;
    baseUrl(): string;
    start(): Promise<Error>;
}
