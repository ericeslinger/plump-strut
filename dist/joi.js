'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.joi = undefined;

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _joi = require('joi');

var Joi = _interopRequireWildcard(_joi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function attributeValidator(m) {
    var retVal = {
        type: Joi.string(),
        id: Joi[m.schema.attributes[m.schema.idAttribute].type](),
        attributes: {},
        relationships: {}
    };
    Object.keys(m.schema.attributes).forEach(function (attr) {
        if (m.schema.attributes[attr].type === 'boolean') {
            retVal.attributes[attr] = Joi.boolean().truthy('true').falsy('false');
        } else {
            retVal.attributes[attr] = Joi[m.schema.attributes[attr].type]();
        }
    });
    return retVal;
}
function relationshipValidate(m, relationship, p) {
    var c = p.types[m.schema.relationships[relationship].type.sides[relationship].otherType];
    var dataSchema = {
        id: Joi[c.schema.attributes[c.schema.idAttribute].type](),
        type: Joi.string().optional()
    };
    if (m.schema.relationships[relationship].type.extras) {
        var extras = m.schema.relationships[relationship].type.extras;
        Object.keys(extras).forEach(function (extra) {
            dataSchema['meta'] = dataSchema['meta'] || {};
            dataSchema['meta'][extra] = Joi[extras[extra].type]();
        });
    }
    return dataSchema;
}
function childIdType(m, relationship, p) {
    var c = p.types[m.schema.relationships[relationship].type.sides[relationship].otherType];
    return c.schema.attributes[c.schema.idAttribute].type;
}
var joi = exports.joi = function joi(options, services) {
    var idType = options.model.schema.attributes[options.model.schema.idAttribute].type;
    return function (i) {
        function joiBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                validate: {
                                    payload: attributeValidator(options.model)
                                }
                            }
                        };
                    case 'read':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType]()
                                    },
                                    query: {
                                        view: Joi.string()
                                    }
                                }
                            }
                        };
                    case 'update':
                        return {
                            config: {
                                validate: {
                                    payload: attributeValidator(options.model),
                                    params: {
                                        itemId: Joi[idType]()
                                    }
                                }
                            }
                        };
                    case 'delete':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType]()
                                    }
                                }
                            }
                        };
                }
            } else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType]()
                                    },
                                    payload: relationshipValidate(options.model, options.relationship, services.plump)
                                }
                            }
                        };
                    case 'read':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType]()
                                    }
                                }
                            }
                        };
                    case 'update':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                        childId: Joi[childIdType(options.model, options.relationship, services.plump)]()
                                    },
                                    payload: relationshipValidate(options.model, options.relationship, services.plump)
                                }
                            }
                        };
                    case 'delete':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                        childId: Joi[childIdType(options.model, options.relationship, services.plump)]()
                                    }
                                }
                            }
                        };
                }
            } else if (options.kind === 'other') {
                if (options.action === 'query') {
                    return {};
                }
            }
        }
        return (0, _mergeOptions2.default)({}, i, joiBlock());
    };
};