import { Model, Plump, ModelData, ModelReference, Oracle } from 'plump';
import { StrutServer } from './server';
import * as Hapi from 'hapi';
export interface RoutedItem<T extends ModelData> extends Hapi.Request {
    pre: {
        item: {
            ref: Model<T>;
            data: ModelData;
        };
    };
}
export interface StrutHandler<T> {
    (request: Hapi.Request): Promise<T>;
}
export declare class BaseController {
    plump: Plump;
    model: typeof Model;
    oracle: Oracle;
    options: any;
    routeInfo: any;
    plugin: {
        attributes: {
            version: string;
            name: string;
        };
    };
    static routes: string[];
    constructor(strut: StrutServer, model: typeof Model, options?: {});
    extraRoutes(): any[];
    read(): StrutHandler<ModelData>;
    update(): StrutHandler<ModelData>;
    delete(): StrutHandler<void>;
    create(): StrutHandler<ModelData>;
    addChild({field}: {
        field: any;
    }): (request: RoutedItem<ModelData>) => Promise<ModelData>;
    listChildren({field}: {
        field: any;
    }): StrutHandler<ModelData>;
    removeChild({field}: {
        field: any;
    }): (request: RoutedItem<ModelData>) => Promise<ModelData>;
    modifyChild({field}: {
        field: any;
    }): (request: RoutedItem<ModelData>) => Promise<ModelData>;
    query(): (request: any) => Promise<ModelReference[]>;
    createHandler(method: any, options: any): Hapi.RouteHandler;
    createJoiValidator(field?: string): any;
    loadHandler(): {
        method: (request: any, reply: any) => any;
        assign: string;
    };
    route(method: any, opts: any): any;
    approveHandler(method: any, opts: any): {
        method: (request: any, reply: any) => any;
        assign: string;
    };
    routeRelationships(method: any, opts: any): any[];
    routeAttributes(method: any, opts: any): any;
}
