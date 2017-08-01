import * as Hapi from 'hapi';
import { TokenService } from './dataTypes';
import { StrutServer } from './server';
export declare function rebindTokenValidator(t: TokenService): {
    validateFunc: (token: any, callback: any) => void;
};
export declare function configureAuth(strut: StrutServer): Hapi.PluginFunction<{
    version: string;
    name: string;
}>;
