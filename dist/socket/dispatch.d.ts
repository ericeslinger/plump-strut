/// <reference types="socket.io" />
import { StrutServer } from '../dataTypes';
import { ResponseEnvelope, Response, SocketDispatch } from './dataTypes';
export declare function respond(c: SocketIO.Socket, s: StrutServer): (r: ResponseEnvelope<Response>) => boolean | SocketIO.Namespace;
export declare function dispatch(d: SocketDispatch, s: StrutServer): void;
