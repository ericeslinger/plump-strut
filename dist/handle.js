'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handle = undefined;

var _boom = require('boom');

var Boom = _interopRequireWildcard(_boom);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function loadHandler(model, plump) {
    var toLoad = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['attributes', 'relationships'];

    return {
        method: function method(request, reply) {
            if (request.params && request.params.itemId) {
                var item = plump.find({
                    type: model.type,
                    id: request.params.itemId
                });
                debugger;
                return item.get({ fields: toLoad, view: request.query.view || 'default' }).then(function (thing) {
                    if (thing) {
                        reply({
                            ref: item,
                            data: thing
                        });
                    } else {
                        reply(Boom.notFound());
                    }
                }).catch(function (err) {
                    console.log(err);
                    reply(Boom.badImplementation(err));
                });
            } else {
                return reply(Boom.notFound());
            }
        },
        assign: 'item'
    };
}
function handler(request, reply) {
    return reply(request.pre['handle']);
}
var handle = exports.handle = function handle(options, services) {
    return function (i) {
        function handleBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                pre: i.config.pre.concat({
                                    method: function method(request, reply) {
                                        var created = new options.model(request.payload, services.plump);
                                        return created.save().then(function (v) {
                                            return reply(v);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            },
                            handler: handler
                        };
                    case 'read':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, ['attributes']), {
                                    method: function method(request, reply) {
                                        if (services.oracle && services.oracle.filters[options.model.type]) {
                                            return reply(services.oracle.filter(request.pre.item.data));
                                        } else {
                                            return reply(request.pre.item.data);
                                        }
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                    case 'update':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump), {
                                    method: function method(request, reply) {
                                        return request.pre.item.ref.set(request.payload).save().then(function (v) {
                                            return reply(v);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                    case 'delete':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump), {
                                    method: function method(request, reply) {
                                        return request.pre.item.ref.delete().then(function (v) {
                                            return reply().takeover().code(200);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                }
            } else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, ['attributes', 'relationships.' + options.relationship]), {
                                    method: function method(request, reply) {
                                        return request.pre.item.ref.add(options.relationship, request.payload).save().then(function (v) {
                                            return reply(v);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                    case 'read':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, ['attributes', 'relationships.' + options.relationship]), {
                                    method: function method(request, reply) {
                                        return reply(request.pre.item.data);
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                    case 'update':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, ['attributes', 'relationships.' + options.relationship]), {
                                    method: function method(request, reply) {
                                        return request.pre.item.ref.modifyRelationship(options.relationship, Object.assign({}, request.payload, {
                                            // prevent the user from posting "modify id:2 to the route /item/children/1"
                                            id: request.params.childId
                                        })).save().then(function (v) {
                                            return reply(v);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                    case 'delete':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, ['attributes', 'relationships.' + options.relationship]), {
                                    method: function method(request, reply) {
                                        return request.pre.item.ref.remove(options.relationship, {
                                            type: 'foo',
                                            id: request.params.childId
                                        }).save().then(function (v) {
                                            return reply(v);
                                        });
                                    },
                                    assign: 'handle'
                                })
                            }
                        };
                }
            } else if (options.kind === 'other') {
                if (options.action === 'query') {
                    return {
                        handler: function handler(request, reply) {
                            return Boom.notFound();
                        }
                    };
                }
            }
        }
        return (0, _mergeOptions2.default)({}, i, handleBlock());
    };
};