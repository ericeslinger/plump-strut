import * as Joi from 'joi';
import * as Hapi from 'hapi';
export interface RouteOptions {
    cors: Hapi.CorsConfigurationObject;
    authFor: {
        read: string;
        listChildren: string;
        query: string;
        create: string;
        update: string;
        delete: string;
        addChild: string;
        modifyChild: string;
        removeChild: string;
    };
}
export declare function createRoutes(opts?: Partial<RouteOptions>): {
    read: {
        validate: {
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
            };
        };
    };
    listChildren: {
        plural: boolean;
        validate: {
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
            };
        };
    };
    query: {
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
            };
        };
    };
    create: {
        validate: {
            payload: boolean;
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
                payload: {
                    output: string;
                    parse: boolean;
                };
            };
        };
    };
    update: {
        validate: {
            payload: boolean;
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
                payload: {
                    output: string;
                    parse: boolean;
                };
            };
        };
    };
    delete: {
        validate: {
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
            };
        };
    };
    addChild: {
        plural: boolean;
        validate: {
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
                payload: {
                    output: string;
                    parse: boolean;
                };
            };
        };
    };
    modifyChild: {
        plural: boolean;
        validate: {
            params: {
                itemId: Joi.NumberSchema;
                childId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
                payload: {
                    output: string;
                    parse: boolean;
                };
            };
        };
    };
    removeChild: {
        plural: boolean;
        validate: {
            params: {
                itemId: Joi.NumberSchema;
                childId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {
                cors: Hapi.CorsConfigurationObject;
            };
        };
    };
};
