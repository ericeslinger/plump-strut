import { Plump } from 'plump';
import { StrutConfig, StrutServices, StrutServer } from './dataTypes';
export declare class Strut implements StrutServer {
    services: StrutServices;
    config: StrutConfig;
    extensions: any;
    constructor(plump: Plump, conf: Partial<StrutConfig>, services?: StrutServices);
    preRoute(): Promise<void>;
    preInit(): Promise<void>;
    initialize(): any;
    baseUrl(): string;
    start(): Promise<Error>;
}
