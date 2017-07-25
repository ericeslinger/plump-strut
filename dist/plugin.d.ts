import * as Hapi from 'hapi';
import { RouteGenerator, BasicRouteOptions, StrutServices } from './dataTypes';
export declare function plugin(gen: RouteGenerator, routeOptions: BasicRouteOptions, services: StrutServices): (server: Hapi.Server, _: any, next: any) => void;
