import * as Hapi from 'hapi';
import { SegmentGenerator, BasicRouteOptions, StrutServices } from './dataTypes';
export declare function plugin(gen: SegmentGenerator[], routeOptions: BasicRouteOptions, services: StrutServices): (server: Hapi.Server, _: any, next: any) => void;
