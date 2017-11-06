import * as Hapi from 'hapi';
import { BasicRouteOptions, StrutServices, RouteController } from './dataTypes';
export declare function plugin(ctrl: RouteController, routeOptions: BasicRouteOptions, services: StrutServices): (server: Hapi.Server, _: any, next: any) => void;
