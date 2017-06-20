import * as Hapi from 'hapi';
import { StrutServer } from './server';
export interface AuthenticationResponse {
    response: string;
    token: string;
}
export interface AuthenticationHandler {
    (r: Hapi.Request, strut: StrutServer): Promise<AuthenticationResponse>;
}
export interface AuthenticationType {
    name: string;
    url: string;
    iconUrl?: string;
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
export declare function configureAuth(strut: StrutServer): Hapi.PluginFunction<{
    version: string;
    name: string;
}>;
