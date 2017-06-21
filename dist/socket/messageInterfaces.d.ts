import { StrutServer } from '../index';
import { AuthenticationType } from '../authentication';
export interface SingletonRequest {
    responseKey: string;
}
export interface ChannelRequest {
    request: string;
    client: SocketIO.Socket;
}
export interface TestKeyAuthenticationRequest extends ChannelRequest, SingletonRequest {
    request: 'testkey';
    key: string;
}
export interface StartAuthenticationRequest extends ChannelRequest, SingletonRequest {
    request: 'startauth';
    nonce: string;
}
export declare type AuthenticationRequest = TestKeyAuthenticationRequest | StartAuthenticationRequest;
export interface Response {
    response: string;
}
export interface InvalidRequestResponse extends Response {
    response: 'invalidRequest';
}
export interface StartResponse extends Response {
    response: 'startauth';
    types: AuthenticationType[];
}
export interface TestResponse extends Response {
    response: 'testkey';
    auth: boolean;
}
export interface RequestHandler {
    (m: ChannelRequest, s: StrutServer): Promise<Response>;
}
export declare type AuthenticationResponse = InvalidRequestResponse | StartResponse | TestResponse;