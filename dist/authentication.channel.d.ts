import { StrutServer, AuthenticationRequest, AuthenticationResponse } from './dataTypes';
export declare function authenticationChannelDispatch(msg: AuthenticationRequest, server: StrutServer): Promise<AuthenticationResponse>;
