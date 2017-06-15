import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import { Plump, Model, Oracle } from 'plump';
import { AuthenticationType } from './authentication';
export interface StrutConfig {
    models?: typeof Model[];
    apiRoot: string;
    apiProtocol: 'http' | 'https';
    authTypes: AuthenticationType[];
    apiPort: number;
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
    start(): Promise<Error>;
}
