import * as Hapi from 'hapi';
import { StrutConfig } from './server';
export interface AuthenticationType {
    name: string;
    handler: (r: Hapi.Request) => Promise<string>;
    strategy: {
        provider: string;
        password: string;
        cookie: string;
        scope: string[];
        clientId: string;
        clientSecret: string;
        isSecure: boolean;
        forceHttps: boolean;
        providerParams?: any;
    };
}
export declare function configureAuth(c: StrutConfig): Hapi.PluginFunction<{
    version: string;
    name: string;
}>;
