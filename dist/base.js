"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var Joi = require("joi");
var routes_1 = require("./routes");
var mergeOptions = require("merge-options");
function plugin(server, _, next) {
    var _this = this;
    server.route(this.constructor.routes
        .map(function (method) { return _this.route(method, _this.routeInfo[method]); })
        .reduce(function (acc, curr) { return acc.concat(curr); }, []));
    server.route(this.extraRoutes());
    next();
}
var BaseController = (function () {
    function BaseController(strut, model, options) {
        if (options === void 0) { options = {}; }
        this.plump = strut.services.plump;
        this.oracle = strut.services.oracle;
        this.model = model;
        this.options = Object.assign({}, { sideloads: [] }, options);
        this.plugin = plugin.bind(this);
        this.routeInfo = routes_1.createRoutes(options);
        this.plugin.attributes = Object.assign({}, {
            version: '1.0.0',
            name: this.model.type,
        }, this.options.plugin);
    }
    BaseController.prototype.extraRoutes = function () {
        return [];
    };
    BaseController.prototype.read = function () {
        return function (request) {
            return Promise.resolve(request.pre.item.data);
        };
    };
    BaseController.prototype.update = function () {
        return function (request) {
            return request.pre.item.ref.set(request.payload).save();
        };
    };
    BaseController.prototype.delete = function () {
        return function (request) {
            return request.pre.item.ref.delete();
        };
    };
    BaseController.prototype.create = function () {
        var _this = this;
        return function (request) {
            return new _this.model(request.payload.attributes, _this.plump).save();
        };
    };
    BaseController.prototype.addChild = function (_a) {
        var field = _a.field;
        return function (request) {
            return request.pre.item.ref.add(field, request.payload).save();
        };
    };
    BaseController.prototype.listChildren = function (_a) {
        var field = _a.field;
        return function (request) {
            return request.pre.item.ref.get("relationships." + field);
        };
    };
    BaseController.prototype.removeChild = function (_a) {
        var field = _a.field;
        return function (request) {
            return request.pre.item.ref
                .remove(field, { id: request.params.childId })
                .save();
        };
    };
    BaseController.prototype.modifyChild = function (_a) {
        var field = _a.field;
        return function (request) {
            var update = {
                id: request.params.childId,
                meta: request.payload.meta,
            };
            return request.pre.item.ref.modifyRelationship(field, update).save();
        };
    };
    BaseController.prototype.query = function () {
        var _this = this;
        return function (request) {
            return _this.plump.query(request.query);
        };
    };
    BaseController.prototype.createHandler = function (method, options) {
        var handler = this[method](options);
        return function (request, reply) {
            return handler(request)
                .then(function (response) {
                reply(response).code(200);
            })
                .catch(function (err) {
                console.log(err);
                reply(Boom.badImplementation(err));
            });
        };
    };
    BaseController.prototype.createJoiValidator = function (field) {
        try {
            var schema_1 = this.model.schema;
            if (field) {
                if (field in schema_1.attributes) {
                    return _a = {}, _a[field] = Joi[schema_1.attributes[field].type](), _a;
                }
                else if (field in schema_1.relationships) {
                    var dataSchema_1 = {
                        id: Joi.number(),
                    };
                    if (schema_1.relationships[field].type.extras) {
                        var extras_1 = schema_1.relationships[field].type.extras;
                        Object.keys(extras_1).forEach(function (extra) {
                            dataSchema_1.meta = dataSchema_1.meta || {};
                            dataSchema_1.meta[extra] = Joi[extras_1[extra].type]();
                        });
                    }
                    return dataSchema_1;
                }
                else {
                    return {};
                }
            }
            else {
                var retVal_1 = {
                    type: Joi.string(),
                    id: Joi.number(),
                    attributes: {},
                    relationships: {},
                };
                Object.keys(schema_1.attributes).forEach(function (attr) {
                    retVal_1.attributes[attr] = Joi[schema_1.attributes[attr].type]();
                });
                Object.keys(schema_1.relationships).forEach(function (relName) {
                    var itemSchema = { id: Joi.number() };
                    if (schema_1.relationships[relName].type.extras) {
                        var extras = schema_1.relationships[relName].type.extras;
                        for (var extra in extras) {
                            var extraType = extras[extra].type;
                            itemSchema.meta = itemSchema.meta || {};
                            itemSchema.meta[extra] = Joi[extraType]();
                        }
                    }
                    retVal_1.relationships[relName] = Joi.array().items(Joi.object({
                        op: Joi.string().valid('add', 'modify', 'remove'),
                        data: itemSchema,
                    }));
                });
                return retVal_1;
            }
        }
        catch (err) {
            console.log(err);
            return {};
        }
        var _a;
    };
    BaseController.prototype.loadHandler = function () {
        var _this = this;
        return {
            method: function (request, reply) {
                if (request.params && request.params.itemId) {
                    var item_1 = _this.plump.find({
                        type: _this.model.type,
                        id: request.params.itemId,
                    });
                    return item_1
                        .get()
                        .then(function (thing) {
                        if (thing) {
                            reply({
                                ref: item_1,
                                data: thing,
                            });
                        }
                        else {
                            reply(Boom.notFound());
                        }
                    })
                        .catch(function (err) {
                        console.log(err);
                        reply(Boom.badImplementation(err));
                    });
                }
                else {
                    return reply(Boom.notFound());
                }
            },
            assign: 'item',
        };
    };
    BaseController.prototype.route = function (method, opts) {
        if (opts.plural) {
            return this.routeRelationships(method, opts);
        }
        else {
            return this.routeAttributes(method, opts);
        }
    };
    BaseController.prototype.approveHandler = function (method, opts) {
        var _this = this;
        if (this.oracle === null) {
            return {
                method: function (request, reply) { return reply(true); },
                assign: 'approve',
            };
        }
        else if (method === 'create') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        data: request.data,
                        target: { type: _this.model.type },
                        kind: 'attributes',
                        action: 'create',
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'read') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    console.log(JSON.stringify(request.auth));
                    return _this.oracle
                        .authorize({
                        action: 'read',
                        kind: 'attributes',
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        target: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'update') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'update',
                        data: request.data,
                        kind: 'attributes',
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        target: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'delete') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'delete',
                        kind: 'attributes',
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        target: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'addChild') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'create',
                        kind: 'relationship',
                        relationship: opts.generatorOptions.field,
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        meta: request.data.meta ? request.data.meta : undefined,
                        child: {
                            type: _this.model.schema.relationships[opts.generatorOptions.field].type.sides[opts.generatorOptions.field].otherType,
                            id: request.data.id,
                        },
                        parent: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'listChildren') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'read',
                        kind: 'relationship',
                        relationship: opts.generatorOptions.field,
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        parent: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'modifyChild') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'update',
                        kind: 'relationship',
                        relationship: opts.generatorOptions.field,
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        meta: request.data.meta,
                        child: {
                            type: _this.model.schema.relationships[opts.generatorOptions.field].type.sides[opts.generatorOptions.field].otherType,
                            id: request.data.id,
                        },
                        parent: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else if (method === 'removeChild') {
            return {
                assign: 'approve',
                method: function (request, reply) {
                    return _this.oracle
                        .authorize({
                        action: 'delete',
                        kind: 'relationship',
                        relationship: opts.generatorOptions.field,
                        actor: {
                            type: 'profiles',
                            id: request.auth.credentials.user.attributes.profile_id,
                        },
                        child: {
                            id: request.params.childId,
                            type: _this.model.schema.relationships[opts.generatorOptions.field].type.sides[opts.generatorOptions.field].otherType,
                        },
                        parent: {
                            type: _this.model.type,
                            id: request.params.itemId,
                        },
                    })
                        .then(function (v) { return reply(v ? v : Boom.forbidden()); });
                },
            };
        }
        else {
            return {
                method: function (request, reply) { return reply(true); },
                assign: 'approve',
            };
        }
    };
    BaseController.prototype.routeRelationships = function (method, opts) {
        var _this = this;
        return Object.keys(this.model.schema.relationships).map(function (field) {
            var genericOpts = mergeOptions({}, opts, {
                validate: {},
                generatorOptions: { field: field },
            });
            genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
            if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
                genericOpts.validate.payload = _this.createJoiValidator(field);
            }
            genericOpts.plural = false;
            return _this.routeAttributes(method, genericOpts);
        });
    };
    BaseController.prototype.routeAttributes = function (method, opts) {
        var routeConfig = mergeOptions({}, {
            handler: opts.handler || this.createHandler(method, opts.generatorOptions),
            config: {
                pre: [this.approveHandler(method, opts.generatorOptions)],
                validate: {},
            },
        }, opts.hapi);
        if (opts.hapi.path.indexOf('itemId') >= 0) {
            routeConfig.config.pre.unshift(this.loadHandler());
        }
        if (opts.pre !== undefined) {
            opts.pre.forEach(function (p) { return routeConfig.config.pre.push(p); });
        }
        if (opts.validate && opts.validate.query) {
            routeConfig.config.validate.query = opts.validate.query;
        }
        if (opts.validate && opts.validate.params) {
            routeConfig.config.validate.params = opts.validate.params;
        }
        if (opts.validate && opts.validate.payload === true) {
            routeConfig.config.validate.payload = this.createJoiValidator();
        }
        else if (opts.validate && opts.validate.payload) {
            routeConfig.config.validate.payload = opts.validate.payload;
        }
        return routeConfig;
    };
    return BaseController;
}());
exports.BaseController = BaseController;
BaseController.routes = [
    'read',
    'query',
    'listChildren',
    'addChild',
    'removeChild',
    'modifyChild',
    'create',
    'update',
    'delete',
];

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUN0QixNQUFNO0lBQ04sT0FBTztJQUNQLGNBQWM7SUFDZCxVQUFVO0lBQ1YsYUFBYTtJQUNiLGFBQWE7SUFDYixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7Q0FDVCxDQUFDIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0ICogYXMgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyBjcmVhdGVSb3V0ZXMgfSBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5pbXBvcnQgeyBNb2RlbCwgUGx1bXAsIE1vZGVsRGF0YSwgTW9kZWxSZWZlcmVuY2UsIE9yYWNsZSB9IGZyb20gJ3BsdW1wJzsgLy8gdHNsaW50OmRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyaWFibGVcbmltcG9ydCB7IFN0cnV0U2VydmVyIH0gZnJvbSAnLi9zZXJ2ZXInO1xuLy8gbmVlZCB0byBpbXBvcnQgTW9kZWxSZWZlcmVuY2UgYmVjYXVzZSBzb21lIG9mIHRoZSBtZXRob2RzIHJldHVybiB0aGVtLlxuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcblxuZnVuY3Rpb24gcGx1Z2luKHNlcnZlciwgXywgbmV4dCkge1xuICBzZXJ2ZXIucm91dGUoXG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5yb3V0ZXNcbiAgICAgIC5tYXAobWV0aG9kID0+IHRoaXMucm91dGUobWV0aG9kLCB0aGlzLnJvdXRlSW5mb1ttZXRob2RdKSlcbiAgICAgIC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pLCAvLyByb3V0ZVJlbGF0aW9uc2hpcCByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVkSXRlbTxUIGV4dGVuZHMgTW9kZWxEYXRhPiBleHRlbmRzIEhhcGkuUmVxdWVzdCB7XG4gIHByZToge1xuICAgIGl0ZW06IHtcbiAgICAgIHJlZjogTW9kZWw8VD47XG4gICAgICBkYXRhOiBNb2RlbERhdGE7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdHJ1dEhhbmRsZXI8VD4ge1xuICAocmVxdWVzdDogSGFwaS5SZXF1ZXN0KTogUHJvbWlzZTxUPjtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2VDb250cm9sbGVyIHtcbiAgcHVibGljIHBsdW1wOiBQbHVtcDtcbiAgcHVibGljIG1vZGVsOiB0eXBlb2YgTW9kZWw7XG4gIHB1YmxpYyBvcmFjbGU6IE9yYWNsZTtcbiAgcHVibGljIG9wdGlvbnM7XG4gIHB1YmxpYyByb3V0ZUluZm87XG4gIHB1YmxpYyBwbHVnaW46IHtcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgc3RhdGljIHJvdXRlczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKHN0cnV0OiBTdHJ1dFNlcnZlciwgbW9kZWw6IHR5cGVvZiBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHN0cnV0LnNlcnZpY2VzLnBsdW1wO1xuICAgIHRoaXMub3JhY2xlID0gc3RydXQuc2VydmljZXMub3JhY2xlO1xuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJvdXRlSW5mbyA9IGNyZWF0ZVJvdXRlcyhvcHRpb25zKTtcbiAgICB0aGlzLnBsdWdpbi5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgICBuYW1lOiB0aGlzLm1vZGVsLnR5cGUsXG4gICAgICB9LFxuICAgICAgdGhpcy5vcHRpb25zLnBsdWdpbixcbiAgICApO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpOiBTdHJ1dEhhbmRsZXI8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIChyZXF1ZXN0OiBSb3V0ZWRJdGVtPE1vZGVsRGF0YT4pID0+XG4gICAgICBQcm9taXNlLnJlc29sdmUocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgfVxuXG4gIHVwZGF0ZSgpOiBTdHJ1dEhhbmRsZXI8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIChyZXF1ZXN0OiBSb3V0ZWRJdGVtPE1vZGVsRGF0YT4pID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZi5zZXQocmVxdWVzdC5wYXlsb2FkKS5zYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpOiBTdHJ1dEhhbmRsZXI8dm9pZD4ge1xuICAgIHJldHVybiAocmVxdWVzdDogUm91dGVkSXRlbTxNb2RlbERhdGE+KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWYuZGVsZXRlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZSgpOiBTdHJ1dEhhbmRsZXI8TW9kZWxEYXRhPiB7XG4gICAgcmV0dXJuIHJlcXVlc3QgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLm1vZGVsKHJlcXVlc3QucGF5bG9hZC5hdHRyaWJ1dGVzLCB0aGlzLnBsdW1wKS5zYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGFkZENoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdDogUm91dGVkSXRlbTxNb2RlbERhdGE+KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWYuYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpLnNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgbGlzdENoaWxkcmVuKHsgZmllbGQgfSk6IFN0cnV0SGFuZGxlcjxNb2RlbERhdGE+IHtcbiAgICByZXR1cm4gKHJlcXVlc3Q6IFJvdXRlZEl0ZW08TW9kZWxEYXRhPikgPT5cbiAgICAgIHJlcXVlc3QucHJlLml0ZW0ucmVmLmdldChgcmVsYXRpb25zaGlwcy4ke2ZpZWxkfWApO1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0OiBSb3V0ZWRJdGVtPE1vZGVsRGF0YT4pID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAucmVtb3ZlKGZpZWxkLCB7IGlkOiByZXF1ZXN0LnBhcmFtcy5jaGlsZElkIH0pXG4gICAgICAgIC5zYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIG1vZGlmeUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdDogUm91dGVkSXRlbTxNb2RlbERhdGE+KSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGUgPSB7XG4gICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5jaGlsZElkLFxuICAgICAgICBtZXRhOiByZXF1ZXN0LnBheWxvYWQubWV0YSxcbiAgICAgIH07XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWYubW9kaWZ5UmVsYXRpb25zaGlwKGZpZWxkLCB1cGRhdGUpLnNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIHJlcXVlc3QgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGx1bXAucXVlcnkocmVxdWVzdC5xdWVyeSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRpb25zKTogSGFwaS5Sb3V0ZUhhbmRsZXIge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzW21ldGhvZF0ob3B0aW9ucyk7XG4gICAgcmV0dXJuIChyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyKHJlcXVlc3QpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICByZXBseShyZXNwb25zZSkuY29kZSgyMDApO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQ/OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbC5zY2hlbWE7XG4gICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGZpZWxkIGluIHNjaGVtYS5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogSm9pW3NjaGVtYS5hdHRyaWJ1dGVzW2ZpZWxkXS50eXBlXSgpIH07XG4gICAgICAgIH0gZWxzZSBpZiAoZmllbGQgaW4gc2NoZW1hLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgICAgICBjb25zdCBkYXRhU2NoZW1hOiBhbnkgPSB7XG4gICAgICAgICAgICBpZDogSm9pLm51bWJlcigpLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGUuZXh0cmFzKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYXMgPSBzY2hlbWEucmVsYXRpb25zaGlwc1tmaWVsZF0udHlwZS5leHRyYXM7XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGV4dHJhcykuZm9yRWFjaChleHRyYSA9PiB7XG4gICAgICAgICAgICAgIGRhdGFTY2hlbWEubWV0YSA9IGRhdGFTY2hlbWEubWV0YSB8fCB7fTtcbiAgICAgICAgICAgICAgZGF0YVNjaGVtYS5tZXRhW2V4dHJhXSA9IEpvaVtleHRyYXNbZXh0cmFdLnR5cGVdKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRhdGFTY2hlbWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXRWYWw6IGFueSA9IHtcbiAgICAgICAgICB0eXBlOiBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgaWQ6IEpvaS5udW1iZXIoKSxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7fSxcbiAgICAgICAgICByZWxhdGlvbnNoaXBzOiB7fSxcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICByZXRWYWwuYXR0cmlidXRlc1thdHRyXSA9IEpvaVtzY2hlbWEuYXR0cmlidXRlc1thdHRyXS50eXBlXSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEucmVsYXRpb25zaGlwcykuZm9yRWFjaChyZWxOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBpdGVtU2NoZW1hOiBhbnkgPSB7IGlkOiBKb2kubnVtYmVyKCkgfTtcblxuICAgICAgICAgIGlmIChzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxOYW1lXS50eXBlLmV4dHJhcykge1xuICAgICAgICAgICAgY29uc3QgZXh0cmFzID0gc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0udHlwZS5leHRyYXM7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXh0cmEgaW4gZXh0cmFzKSB7XG4gICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ3VhcmQtZm9yLWluXG4gICAgICAgICAgICAgIGNvbnN0IGV4dHJhVHlwZSA9IGV4dHJhc1tleHRyYV0udHlwZTtcbiAgICAgICAgICAgICAgaXRlbVNjaGVtYS5tZXRhID0gaXRlbVNjaGVtYS5tZXRhIHx8IHt9O1xuICAgICAgICAgICAgICBpdGVtU2NoZW1hLm1ldGFbZXh0cmFdID0gSm9pW2V4dHJhVHlwZV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0VmFsLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0gPSBKb2kuYXJyYXkoKS5pdGVtcyhcbiAgICAgICAgICAgIEpvaS5vYmplY3Qoe1xuICAgICAgICAgICAgICBvcDogSm9pLnN0cmluZygpLnZhbGlkKCdhZGQnLCAnbW9kaWZ5JywgJ3JlbW92ZScpLFxuICAgICAgICAgICAgICBkYXRhOiBpdGVtU2NoZW1hLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvYWRIYW5kbGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucGx1bXAuZmluZCh7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLm1vZGVsLnR5cGUsXG4gICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuaXRlbUlkLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBpdGVtXG4gICAgICAgICAgICAuZ2V0KClcbiAgICAgICAgICAgIC50aGVuKHRoaW5nID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVwbHkoe1xuICAgICAgICAgICAgICAgICAgcmVmOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgZGF0YTogdGhpbmcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3NpZ246ICdpdGVtJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGUobWV0aG9kLCBvcHRzKSB7XG4gICAgaWYgKG9wdHMucGx1cmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVJlbGF0aW9uc2hpcHMobWV0aG9kLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cbiAgLy8gb3ZlcnJpZGUgYXBwcm92ZUhhbmRsZXIgd2l0aCB3aGF0ZXZlciBwZXItcm91dGVcbiAgLy8gbG9naWMgeW91IHdhbnQgLSByZXBseSB3aXRoIEJvb20ubm90QXV0aG9yaXplZCgpXG4gIC8vIG9yIGFueSBvdGhlciB2YWx1ZSBvbiBub24tYXBwcm92ZWQgc3RhdHVzXG4gIGFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBpZiAodGhpcy5vcmFjbGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnY3JlYXRlJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PlxuICAgICAgICAgIHRoaXMub3JhY2xlXG4gICAgICAgICAgICAuYXV0aG9yaXplKHtcbiAgICAgICAgICAgICAgZGF0YTogcmVxdWVzdC5kYXRhLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHsgdHlwZTogdGhpcy5tb2RlbC50eXBlIH0sXG4gICAgICAgICAgICAgIGtpbmQ6ICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgYWN0b3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZmlsZXMnLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LmF1dGguY3JlZGVudGlhbHMudXNlci5hdHRyaWJ1dGVzLnByb2ZpbGVfaWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2ID8gdiA6IEJvb20uZm9yYmlkZGVuKCkpKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdyZWFkJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5hdXRoKSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub3JhY2xlXG4gICAgICAgICAgICAuYXV0aG9yaXplKHtcbiAgICAgICAgICAgICAgYWN0aW9uOiAncmVhZCcsXG4gICAgICAgICAgICAgIGtpbmQ6ICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgYWN0b3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZmlsZXMnLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LmF1dGguY3JlZGVudGlhbHMudXNlci5hdHRyaWJ1dGVzLnByb2ZpbGVfaWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMubW9kZWwudHlwZSxcbiAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuaXRlbUlkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodiA/IHYgOiBCb29tLmZvcmJpZGRlbigpKSk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAndXBkYXRlJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PlxuICAgICAgICAgIHRoaXMub3JhY2xlXG4gICAgICAgICAgICAuYXV0aG9yaXplKHtcbiAgICAgICAgICAgICAgYWN0aW9uOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgZGF0YTogcmVxdWVzdC5kYXRhLFxuICAgICAgICAgICAgICBraW5kOiAnYXR0cmlidXRlcycsXG4gICAgICAgICAgICAgIGFjdG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Byb2ZpbGVzJyxcbiAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5hdXRoLmNyZWRlbnRpYWxzLnVzZXIuYXR0cmlidXRlcy5wcm9maWxlX2lkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLm1vZGVsLnR5cGUsXG4gICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QucGFyYW1zLml0ZW1JZCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYgPyB2IDogQm9vbS5mb3JiaWRkZW4oKSkpLFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gJ2RlbGV0ZScpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT5cbiAgICAgICAgICB0aGlzLm9yYWNsZVxuICAgICAgICAgICAgLmF1dGhvcml6ZSh7XG4gICAgICAgICAgICAgIGFjdGlvbjogJ2RlbGV0ZScsXG4gICAgICAgICAgICAgIGtpbmQ6ICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgYWN0b3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZmlsZXMnLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LmF1dGguY3JlZGVudGlhbHMudXNlci5hdHRyaWJ1dGVzLnByb2ZpbGVfaWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMubW9kZWwudHlwZSxcbiAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuaXRlbUlkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodiA/IHYgOiBCb29tLmZvcmJpZGRlbigpKSksXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSAnYWRkQ2hpbGQnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhc3NpZ246ICdhcHByb3ZlJyxcbiAgICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+XG4gICAgICAgICAgdGhpcy5vcmFjbGVcbiAgICAgICAgICAgIC5hdXRob3JpemUoe1xuICAgICAgICAgICAgICBhY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICBraW5kOiAncmVsYXRpb25zaGlwJyxcbiAgICAgICAgICAgICAgcmVsYXRpb25zaGlwOiBvcHRzLmdlbmVyYXRvck9wdGlvbnMuZmllbGQsXG4gICAgICAgICAgICAgIGFjdG9yOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Byb2ZpbGVzJyxcbiAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5hdXRoLmNyZWRlbnRpYWxzLnVzZXIuYXR0cmlidXRlcy5wcm9maWxlX2lkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBtZXRhOiByZXF1ZXN0LmRhdGEubWV0YSA/IHJlcXVlc3QuZGF0YS5tZXRhIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBjaGlsZDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMubW9kZWwuc2NoZW1hLnJlbGF0aW9uc2hpcHNbXG4gICAgICAgICAgICAgICAgICBvcHRzLmdlbmVyYXRvck9wdGlvbnMuZmllbGRcbiAgICAgICAgICAgICAgICBdLnR5cGUuc2lkZXNbb3B0cy5nZW5lcmF0b3JPcHRpb25zLmZpZWxkXS5vdGhlclR5cGUsXG4gICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QuZGF0YS5pZCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5tb2RlbC50eXBlLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2ID8gdiA6IEJvb20uZm9yYmlkZGVuKCkpKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdsaXN0Q2hpbGRyZW4nKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhc3NpZ246ICdhcHByb3ZlJyxcbiAgICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+XG4gICAgICAgICAgdGhpcy5vcmFjbGVcbiAgICAgICAgICAgIC5hdXRob3JpemUoe1xuICAgICAgICAgICAgICBhY3Rpb246ICdyZWFkJyxcbiAgICAgICAgICAgICAga2luZDogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogb3B0cy5nZW5lcmF0b3JPcHRpb25zLmZpZWxkLFxuICAgICAgICAgICAgICBhY3Rvcjoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdwcm9maWxlcycsXG4gICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QuYXV0aC5jcmVkZW50aWFscy51c2VyLmF0dHJpYnV0ZXMucHJvZmlsZV9pZCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5tb2RlbC50eXBlLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2ID8gdiA6IEJvb20uZm9yYmlkZGVuKCkpKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdtb2RpZnlDaGlsZCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT5cbiAgICAgICAgICB0aGlzLm9yYWNsZVxuICAgICAgICAgICAgLmF1dGhvcml6ZSh7XG4gICAgICAgICAgICAgIGFjdGlvbjogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgIGtpbmQ6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgICAgICAgICByZWxhdGlvbnNoaXA6IG9wdHMuZ2VuZXJhdG9yT3B0aW9ucy5maWVsZCxcbiAgICAgICAgICAgICAgYWN0b3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZmlsZXMnLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LmF1dGguY3JlZGVudGlhbHMudXNlci5hdHRyaWJ1dGVzLnByb2ZpbGVfaWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG1ldGE6IHJlcXVlc3QuZGF0YS5tZXRhLFxuICAgICAgICAgICAgICBjaGlsZDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMubW9kZWwuc2NoZW1hLnJlbGF0aW9uc2hpcHNbXG4gICAgICAgICAgICAgICAgICBvcHRzLmdlbmVyYXRvck9wdGlvbnMuZmllbGRcbiAgICAgICAgICAgICAgICBdLnR5cGUuc2lkZXNbb3B0cy5nZW5lcmF0b3JPcHRpb25zLmZpZWxkXS5vdGhlclR5cGUsXG4gICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QuZGF0YS5pZCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5tb2RlbC50eXBlLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2ID8gdiA6IEJvb20uZm9yYmlkZGVuKCkpKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09ICdyZW1vdmVDaGlsZCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT5cbiAgICAgICAgICB0aGlzLm9yYWNsZVxuICAgICAgICAgICAgLmF1dGhvcml6ZSh7XG4gICAgICAgICAgICAgIGFjdGlvbjogJ2RlbGV0ZScsXG4gICAgICAgICAgICAgIGtpbmQ6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgICAgICAgICByZWxhdGlvbnNoaXA6IG9wdHMuZ2VuZXJhdG9yT3B0aW9ucy5maWVsZCxcbiAgICAgICAgICAgICAgYWN0b3I6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZmlsZXMnLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LmF1dGguY3JlZGVudGlhbHMudXNlci5hdHRyaWJ1dGVzLnByb2ZpbGVfaWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNoaWxkOiB7XG4gICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsXG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5tb2RlbC5zY2hlbWEucmVsYXRpb25zaGlwc1tcbiAgICAgICAgICAgICAgICAgIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucy5maWVsZFxuICAgICAgICAgICAgICAgIF0udHlwZS5zaWRlc1tvcHRzLmdlbmVyYXRvck9wdGlvbnMuZmllbGRdLm90aGVyVHlwZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5tb2RlbC50eXBlLFxuICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2ID8gdiA6IEJvb20uZm9yYmlkZGVuKCkpKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHJvdXRlUmVsYXRpb25zaGlwcyhtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbC5zY2hlbWEucmVsYXRpb25zaGlwcykubWFwKGZpZWxkID0+IHtcbiAgICAgIGNvbnN0IGdlbmVyaWNPcHRzID0gbWVyZ2VPcHRpb25zKHt9LCBvcHRzLCB7XG4gICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZCB9LFxuICAgICAgfSk7XG4gICAgICBnZW5lcmljT3B0cy5oYXBpLnBhdGggPSBnZW5lcmljT3B0cy5oYXBpLnBhdGgucmVwbGFjZSgne2ZpZWxkfScsIGZpZWxkKTtcbiAgICAgIGlmIChbJ1BPU1QnLCAnUFVUJywgJ1BBVENIJ10uaW5kZXhPZihnZW5lcmljT3B0cy5oYXBpLm1ldGhvZCkgPj0gMCkge1xuICAgICAgICBnZW5lcmljT3B0cy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpO1xuICAgICAgfVxuICAgICAgZ2VuZXJpY09wdHMucGx1cmFsID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZUF0dHJpYnV0ZXMobWV0aG9kLCBnZW5lcmljT3B0cyk7XG4gICAgfSk7XG4gIH1cblxuICByb3V0ZUF0dHJpYnV0ZXMobWV0aG9kLCBvcHRzKSB7XG4gICAgLypcbiAgICBvcHRzOiB7XG4gICAgICBwcmU6IFtBTlkgUFJFSEFORExFUnNdXG4gICAgICBoYW5kbGVyOiBoYW5kbGVyIG92ZXJyaWRlXG4gICAgICB2YWxpZGF0ZToge0pvaSBieSB0eXBlIChwYXJhbSwgcXVlcnksIHBheWxvYWQpfSxcbiAgICAgIGF1dGg6IGFueXRoaW5nIG90aGVyIHRoYW4gdG9rZW4sXG4gICAgICBoYXBpOiB7QUxMIE9USEVSIEhBUEkgT1BUSU9OUywgTVVTVCBCRSBKU09OIFNUUklOR0lGWUFCTEV9LFxuICAgIH0sXG4gICAgKi9cblxuICAgIGNvbnN0IHJvdXRlQ29uZmlnID0gbWVyZ2VPcHRpb25zKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6XG4gICAgICAgICAgb3B0cy5oYW5kbGVyIHx8IHRoaXMuY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyksXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHByZTogW3RoaXMuYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzLmdlbmVyYXRvck9wdGlvbnMpXSxcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgb3B0cy5oYXBpLFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXBpLnBhdGguaW5kZXhPZignaXRlbUlkJykgPj0gMCkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnByZS51bnNoaWZ0KHRoaXMubG9hZEhhbmRsZXIoKSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucHJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdHMucHJlLmZvckVhY2gocCA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnbGlzdENoaWxkcmVuJyxcbiAgJ2FkZENoaWxkJyxcbiAgJ3JlbW92ZUNoaWxkJyxcbiAgJ21vZGlmeUNoaWxkJyxcbiAgJ2NyZWF0ZScsXG4gICd1cGRhdGUnLFxuICAnZGVsZXRlJyxcbl07XG4iXX0=
