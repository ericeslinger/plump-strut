import { Model, Plump, ModelData, PackagedModelData, ModelReference } from 'plump';
import * as Hapi from 'hapi';
export interface RoutedItem extends Hapi.Request {
    pre: {
        item: {
            ref: Model;
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
    options: any;
    plugin: {
        attributes: {
            version: string;
            name: string;
        };
    };
    static routes: string[];
    constructor(plump: Plump, model: typeof Model, options?: {});
    extraRoutes(): any[];
    read(): StrutHandler<PackagedModelData>;
    update(): StrutHandler<ModelData>;
    delete(): StrutHandler<void>;
    create(): StrutHandler<ModelData>;
    addChild({field}: {
        field: any;
    }): (request: RoutedItem) => Promise<ModelData>;
    listChildren({field}: {
        field: any;
    }): StrutHandler<PackagedModelData>;
    removeChild({field}: {
        field: any;
    }): (request: RoutedItem) => Promise<ModelData>;
    modifyChild({field}: {
        field: any;
    }): (request: RoutedItem) => Promise<ModelData>;
    query(): (request: any) => Promise<ModelReference[]>;
    createHandler(method: any, options: any): Hapi.ISessionHandler;
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
