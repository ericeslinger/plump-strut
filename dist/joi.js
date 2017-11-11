"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mergeOptions = require("merge-options");
var Joi = require("joi");
function attributeValidator(m) {
    var retVal = {
        type: Joi.string(),
        id: Joi[m.schema.attributes[m.schema.idAttribute].type](),
        attributes: {},
        relationships: {},
    };
    Object.keys(m.schema.attributes).forEach(function (attr) {
        if (m.schema.attributes[attr].type === 'boolean') {
            retVal.attributes[attr] = Joi.boolean()
                .truthy('true')
                .falsy('false');
        }
        else {
            retVal.attributes[attr] = Joi[m.schema.attributes[attr].type]();
        }
    });
    return retVal;
}
function relationshipValidate(m, relationship, p) {
    var c = p.types[m.schema.relationships[relationship].type.sides[relationship].otherType];
    var dataSchema = {
        id: Joi[c.schema.attributes[c.schema.idAttribute].type](),
        type: Joi.string().optional(),
    };
    if (m.schema.relationships[relationship].type.extras) {
        var extras_1 = m.schema.relationships[relationship].type.extras;
        Object.keys(extras_1).forEach(function (extra) {
            dataSchema['meta'] = dataSchema['meta'] || {};
            dataSchema['meta'][extra] = Joi[extras_1[extra].type]();
        });
    }
    return dataSchema;
}
function childIdType(m, relationship, p) {
    var c = p.types[m.schema.relationships[relationship].type.sides[relationship].otherType];
    return c.schema.attributes[c.schema.idAttribute].type;
}
exports.joi = function (options, services) {
    var idType = options.model.schema.attributes[options.model.schema.idAttribute].type;
    return function (i) {
        function joiBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                validate: {
                                    payload: attributeValidator(options.model),
                                },
                            },
                        };
                    case 'read':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                    },
                                },
                            },
                        };
                    case 'update':
                        return {
                            config: {
                                validate: {
                                    payload: attributeValidator(options.model),
                                    params: {
                                        itemId: Joi[idType](),
                                    },
                                },
                            },
                        };
                    case 'delete':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                    },
                                },
                            },
                        };
                }
            }
            else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                    },
                                    payload: relationshipValidate(options.model, options.relationship, services.plump),
                                },
                            },
                        };
                    case 'read':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                    },
                                },
                            },
                        };
                    case 'update':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                        childId: Joi[childIdType(options.model, options.relationship, services.plump)](),
                                    },
                                    payload: relationshipValidate(options.model, options.relationship, services.plump),
                                },
                            },
                        };
                    case 'delete':
                        return {
                            config: {
                                validate: {
                                    params: {
                                        itemId: Joi[idType](),
                                        childId: Joi[childIdType(options.model, options.relationship, services.plump)](),
                                    },
                                },
                            },
                        };
                }
            }
            else if (options.kind === 'other') {
                if (options.action === 'query') {
                    return {};
                }
            }
        }
        return mergeOptions({}, i, joiBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZixDQUNGLEVBQUU7cUNBQ0o7b0NBQ0QsT0FBTyxFQUFFLG9CQUFvQixDQUMzQixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQ2Y7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7d0NBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQ1YsV0FBVyxDQUNULE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZixDQUNGLEVBQUU7cUNBQ0o7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDWixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiam9pLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRTZXJ2aWNlcyxcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuaW1wb3J0IHsgTW9kZWwsIFBsdW1wIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcbmltcG9ydCAqIGFzIEpvaSBmcm9tICdqb2knO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGVWYWxpZGF0b3IobTogdHlwZW9mIE1vZGVsKSB7XG4gIGNvbnN0IHJldFZhbDogYW55ID0ge1xuICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICBpZDogSm9pW20uc2NoZW1hLmF0dHJpYnV0ZXNbbS5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGVdKCksXG4gICAgYXR0cmlidXRlczoge30sXG4gICAgcmVsYXRpb25zaGlwczoge30sXG4gIH07XG5cbiAgT2JqZWN0LmtleXMobS5zY2hlbWEuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyID0+IHtcbiAgICBpZiAobS5zY2hlbWEuYXR0cmlidXRlc1thdHRyXS50eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldFZhbC5hdHRyaWJ1dGVzW2F0dHJdID0gSm9pLmJvb2xlYW4oKVxuICAgICAgICAudHJ1dGh5KCd0cnVlJylcbiAgICAgICAgLmZhbHN5KCdmYWxzZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRWYWwuYXR0cmlidXRlc1thdHRyXSA9IEpvaVttLnNjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmV0VmFsO1xufVxuXG5mdW5jdGlvbiByZWxhdGlvbnNoaXBWYWxpZGF0ZShtOiB0eXBlb2YgTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBwOiBQbHVtcCkge1xuICBjb25zdCBjOiB0eXBlb2YgTW9kZWwgPVxuICAgIHAudHlwZXNbXG4gICAgICBtLnNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0udHlwZS5zaWRlc1tyZWxhdGlvbnNoaXBdLm90aGVyVHlwZVxuICAgIF07XG4gIGNvbnN0IGRhdGFTY2hlbWEgPSB7XG4gICAgaWQ6IEpvaVtjLnNjaGVtYS5hdHRyaWJ1dGVzW2Muc2NoZW1hLmlkQXR0cmlidXRlXS50eXBlXSgpLFxuICAgIHR5cGU6IEpvaS5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICB9O1xuXG4gIGlmIChtLnNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0udHlwZS5leHRyYXMpIHtcbiAgICBjb25zdCBleHRyYXMgPSBtLnNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0udHlwZS5leHRyYXM7XG5cbiAgICBPYmplY3Qua2V5cyhleHRyYXMpLmZvckVhY2goZXh0cmEgPT4ge1xuICAgICAgZGF0YVNjaGVtYVsnbWV0YSddID0gZGF0YVNjaGVtYVsnbWV0YSddIHx8IHt9O1xuICAgICAgZGF0YVNjaGVtYVsnbWV0YSddW2V4dHJhXSA9IEpvaVtleHRyYXNbZXh0cmFdLnR5cGVdKCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGRhdGFTY2hlbWE7XG59XG5cbmZ1bmN0aW9uIGNoaWxkSWRUeXBlKG06IHR5cGVvZiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIHA6IFBsdW1wKSB7XG4gIGNvbnN0IGM6IHR5cGVvZiBNb2RlbCA9XG4gICAgcC50eXBlc1tcbiAgICAgIG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLnNpZGVzW3JlbGF0aW9uc2hpcF0ub3RoZXJUeXBlXG4gICAgXTtcbiAgcmV0dXJuIGMuc2NoZW1hLmF0dHJpYnV0ZXNbYy5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGU7XG59XG5cbmV4cG9ydCBjb25zdCBqb2k6IFNlZ21lbnRHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXMsXG4pID0+IHtcbiAgY29uc3QgaWRUeXBlID1cbiAgICBvcHRpb25zLm1vZGVsLnNjaGVtYS5hdHRyaWJ1dGVzW29wdGlvbnMubW9kZWwuc2NoZW1hLmlkQXR0cmlidXRlXS50eXBlO1xuICByZXR1cm4gKGk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gam9pQmxvY2soKTogUGFydGlhbDxIYXBpLlJvdXRlQ29uZmlndXJhdGlvbj4ge1xuICAgICAgaWYgKG9wdGlvbnMua2luZCA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IGF0dHJpYnV0ZVZhbGlkYXRvcihvcHRpb25zLm1vZGVsKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IGF0dHJpYnV0ZVZhbGlkYXRvcihvcHRpb25zLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAncmVsYXRpb25zaGlwJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHJlbGF0aW9uc2hpcFZhbGlkYXRlKFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRJZDogSm9pW1xuICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgcGF5bG9hZDogcmVsYXRpb25zaGlwVmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZElkOiBKb2lbXG4gICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZFR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZWxhdGlvbnNoaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAnb3RoZXInKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFjdGlvbiA9PT0gJ3F1ZXJ5Jykge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKHt9LCBpLCBqb2lCbG9jaygpKTtcbiAgfTtcbn07XG4iXX0=
