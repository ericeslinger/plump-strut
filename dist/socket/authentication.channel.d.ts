import { AuthenticationChannelMessage, AuthenticationChannelResponse } from './messageInterfaces';
import { StrutServer } from '../server';
export declare function dispatch(msg: AuthenticationChannelMessage, server: StrutServer): Promise<AuthenticationChannelResponse>;
