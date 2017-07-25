import { Plump } from 'plump';
import { StrutServices, StrutConfig } from './dataTypes';
export declare class StrutServer {
    services: StrutServices;
    config: StrutConfig;
    constructor(plump: Plump, conf: Partial<StrutConfig>, services?: StrutServices);
    preRoute(): Promise<void>;
    preInit(): Promise<void>;
    initialize(): Promise<void>;
    baseUrl(): string;
    start(): Promise<Error>;
}
