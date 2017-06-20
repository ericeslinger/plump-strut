import * as Hapi from 'hapi';
import { Plump, Model, Oracle } from 'plump';
import { AuthenticationStrategy } from './authentication';
export interface StrutConfig {
    models?: typeof Model[];
    apiRoot: string;
    apiProtocol: 'http' | 'https';
    authTypes: AuthenticationStrategy[];
    apiPort: number;
    hostName: string;
    authRoot: string;
}
export declare class StrutServer {
    plump: Plump;
    oracle: Oracle;
    hapi: Hapi.Server;
    io: SocketIO.Server;
    config: StrutConfig;
    constructor(plump: Plump, oracle: Oracle, conf: Partial<StrutConfig>);
    initialize(): Promise<void>;
    baseUrl(): string;
    start(): Promise<Error>;
}
