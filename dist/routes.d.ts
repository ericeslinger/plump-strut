import * as Joi from 'joi';
export declare function createRoutes(opts?: any): {
    read: {
        validate: {
            params: {
                itemId: Joi.NumberSchema;
            };
        };
        hapi: {
            method: string;
            path: string;
            config: {};
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
            config: {};
        };
    };
    query: {
        hapi: {
            method: string;
            path: string;
            config: {};
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
            config: {};
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
            config: {};
        };
    };
};
