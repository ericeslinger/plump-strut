import { AuthenticationRequest, AuthenticationResponse } from './messageInterfaces';
import { StrutServer } from '../server';
export declare function dispatch(msg: AuthenticationRequest, server: StrutServer): Promise<AuthenticationResponse>;
