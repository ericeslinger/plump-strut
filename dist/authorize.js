'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.authorize = undefined;

var _mergeOptions = require('merge-options');

var mergeOptions = _interopRequireWildcard(_mergeOptions);

var _boom = require('boom');

var Boom = _interopRequireWildcard(_boom);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function generateAuthRequest(options, services) {
    var getActor = services.oracle.authorizers[options.model.type].mapActor ? services.oracle.authorizers[options.model.type].mapActor : function (v) {
        return v;
    };
    return function (req) {
        if (options.kind === 'attributes') {
            switch (options.action) {
                case 'create':
                    return {
                        data: req.payload,
                        target: { type: options.model.type },
                        kind: options.kind,
                        action: options.action,
                        actor: getActor(req.auth.credentials.user)
                    };
                case 'read':
                    return {
                        target: { type: options.model.type, id: req.params.itemId },
                        kind: options.kind,
                        action: options.action,
                        actor: getActor(req.auth.credentials.user)
                    };
                case 'update':
                    return {
                        data: req.payload,
                        target: { type: options.model.type, id: req.params.itemId },
                        kind: options.kind,
                        action: options.action,
                        actor: getActor(req.auth.credentials.user)
                    };
                case 'delete':
                    return {
                        data: req.payload,
                        target: { type: options.model.type, id: req.params.itemId },
                        kind: options.kind,
                        action: options.action,
                        actor: getActor(req.auth.credentials.user)
                    };
            }
        } else if (options.kind === 'relationship') {
            var childModel = services.plump.types[options.model.schema.relationships[options.relationship].type.sides[options.relationship].otherType];
            switch (options.action) {
                case 'create':
                    return {
                        kind: options.kind,
                        action: options.action,
                        relationship: options.relationship,
                        actor: getActor(req.auth.credentials.user),
                        target: { type: options.model.type, id: req.params.itemId },
                        meta: req.payload.meta,
                        child: { type: childModel.type, id: req.payload.id }
                    };
                case 'read':
                    return {
                        kind: options.kind,
                        action: options.action,
                        relationship: options.relationship,
                        actor: getActor(req.auth.credentials.user),
                        target: { type: options.model.type, id: req.params.itemId }
                    };
                case 'update':
                    return {
                        kind: options.kind,
                        action: options.action,
                        relationship: options.relationship,
                        actor: getActor(req.auth.credentials.user),
                        target: { type: options.model.type, id: req.params.itemId },
                        child: { type: childModel.type, id: req.params.childId },
                        meta: req.payload.meta
                    };
                case 'delete':
                    return {
                        kind: options.kind,
                        action: options.action,
                        relationship: options.relationship,
                        actor: getActor(req.auth.credentials.user),
                        target: { type: options.model.type, id: req.params.itemId },
                        child: { type: childModel.type, id: req.params.childId }
                    };
            }
        } else if (options.kind === 'other') {
            if (options.action === 'query') {
                return {
                    target: { type: options.model.type },
                    kind: options.kind,
                    action: options.action,
                    actor: getActor(req.auth.credentials.user)
                };
            }
        }
    };
}
var authorize = exports.authorize = function authorize(options, services) {
    return function (o) {
        var i = mergeOptions({}, o);
        if (services.oracle && services.oracle.authorizers[options.model.type]) {
            if (i.config.pre === undefined) {
                i.config.pre = [];
            }
            var authMap = generateAuthRequest(options, services);
            i.config.auth = 'token';
            i.config.pre = i.config.pre.concat({
                assign: 'authorize',
                method: function method(req, reply) {
                    services.oracle.dispatch(authMap(req)).then(function (v) {
                        if (v.result === true) {
                            reply(true);
                        } else {
                            reply(Boom.unauthorized());
                        }
                    });
                }
            });
        }
        return i;
    };
};