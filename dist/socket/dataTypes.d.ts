import { ModelData } from 'plump';
import { AuthenticationType, StrutServer } from '../dataTypes';
export interface SocketDispatch {
    connect?: SocketEventHandler;
    disconnect?: SocketEventHandler;
    error?: SocketEventHandler;
    disconnecting?: SocketEventHandler;
    [evt: string]: SocketEventHandler;
}
export interface ResponseEnvelope<T extends Response = Response> {
    key: string;
    msg: T;
    broadcast?: boolean | string;
}
export interface AuthenticatedSocket extends SocketIO.Socket {
    user?: ModelData;
}
export interface ChannelRequest {
    request: string;
    client: AuthenticatedSocket;
}
export interface SingletonRequest extends ChannelRequest {
    responseKey: string;
}
export interface SocketEventHandler {
    (msg: ChannelRequest, strut: StrutServer): Promise<ResponseEnvelope>;
}
export interface TestKeyAuthenticationRequest extends SingletonRequest {
    request: 'testkey';
    key: string;
}
export interface StartAuthenticationRequest extends SingletonRequest {
    request: 'startauth';
    nonce: string;
}
export declare type AuthenticationRequest = TestKeyAuthenticationRequest | StartAuthenticationRequest;
export interface InvalidRequestResponse extends Response {
    response: 'invalidRequest';
}
export interface StartResponse extends Response {
    response: 'startauth';
    types: AuthenticationType[];
}
export interface GoodTestResponse extends Response {
    response: 'testkey';
    auth: true;
    token: string;
    you?: any;
    included?: ModelData[];
}
export interface Response {
    response: string;
}
export interface BadTestResponse extends Response {
    response: 'testkey';
    auth: false;
}
export declare type TestResponse = GoodTestResponse | BadTestResponse;
export interface GoodTokenResponse extends Response {
    response: 'token';
    status: 'success';
    token: string;
}
export interface BadTokenResponse extends Response {
    response: 'token';
    status: 'failure';
}
export declare type TokenResponse = GoodTokenResponse | BadTokenResponse;
export declare type AuthenticationResponse = InvalidRequestResponse | StartResponse | TestResponse | TokenResponse;
