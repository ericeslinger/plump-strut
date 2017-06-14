import * as Hapi from 'hapi';
export interface AuthenticationType {
    name: string;
    handler: Hapi.RouteHandler;
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
export declare class AuthenticationModule {
}
export declare const plugin: Hapi.PluginFunction<{
    version: string;
    name: string;
}>;
