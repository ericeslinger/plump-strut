import * as Hapi from 'hapi';
import * as SocketIO from 'socket.io';
import { Plump, Model, Oracle } from 'plump';
export interface StrutConfig {
    models?: typeof Model[];
    apiRoot: string;
    apiProtocol: 'http' | 'https';
    authTypes: string[];
    apiPort: number;
}
export declare class StrutServer {
    plump: Plump;
    oracle: Oracle;
    config: StrutConfig;
    hapi: Hapi.Server;
    io: SocketIO.Server;
    constructor(plump: Plump, oracle: Oracle, config: StrutConfig);
    start(): Promise<void>;
}
