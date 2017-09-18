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
        retVal.attributes[attr] = Joi[m.schema.attributes[attr].type]();
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
                    case 'query':
                        return {};
                }
            }
            else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                validate: {
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
        }
        return mergeOptions({}, i, joiBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9qb2kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSw0Q0FBOEM7QUFDOUMseUJBQTJCO0FBRTNCLDRCQUE0QixDQUFlO0lBQ3pDLElBQU0sTUFBTSxHQUFRO1FBQ2xCLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2xCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN6RCxVQUFVLEVBQUUsRUFBRTtRQUNkLGFBQWEsRUFBRSxFQUFFO0tBQ2xCLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtRQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xFLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsOEJBQThCLENBQWUsRUFBRSxZQUFvQixFQUFFLENBQVE7SUFDM0UsSUFBTSxDQUFDLEdBQ0wsQ0FBQyxDQUFDLEtBQUssQ0FDTCxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FDeEUsQ0FBQztJQUNKLElBQU0sVUFBVSxHQUFHO1FBQ2pCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN6RCxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtLQUM5QixDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBTSxRQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUVoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDL0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxxQkFBcUIsQ0FBZSxFQUFFLFlBQW9CLEVBQUUsQ0FBUTtJQUNsRSxJQUFNLENBQUMsR0FDTCxDQUFDLENBQUMsS0FBSyxDQUNMLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUN4RSxDQUFDO0lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFFWSxRQUFBLEdBQUcsR0FBcUIsVUFDbkMsT0FBcUIsRUFDckIsUUFBdUI7SUFFdkIsSUFBTSxNQUFNLEdBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN6RSxNQUFNLENBQUMsVUFBQyxDQUFtQztRQUN6QztZQUNFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLEtBQUssUUFBUTt3QkFDWCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixPQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztpQ0FDM0M7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLE1BQU07d0JBQ1QsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7cUNBQ3RCO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO29DQUMxQyxNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtxQ0FDdEI7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7cUNBQ3RCO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxPQUFPO3dCQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE9BQU8sRUFBRSxvQkFBb0IsQ0FDM0IsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsWUFBWSxFQUNwQixRQUFRLENBQUMsS0FBSyxDQUNmO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxNQUFNO3dCQUNULE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE1BQU0sRUFBRTt3Q0FDTixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3FDQUN0QjtpQ0FDRjs2QkFDRjt5QkFDRixDQUFDO29CQUNKLEtBQUssUUFBUTt3QkFDWCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTt3Q0FDckIsT0FBTyxFQUFFLEdBQUcsQ0FDVixXQUFXLENBQ1QsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsWUFBWSxFQUNwQixRQUFRLENBQUMsS0FBSyxDQUNmLENBQ0YsRUFBRTtxQ0FDSjtvQ0FDRCxPQUFPLEVBQUUsb0JBQW9CLENBQzNCLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZjtpQ0FDRjs2QkFDRjt5QkFDRixDQUFDO29CQUNKLEtBQUssUUFBUTt3QkFDWCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTt3Q0FDckIsT0FBTyxFQUFFLEdBQUcsQ0FDVixXQUFXLENBQ1QsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsWUFBWSxFQUNwQixRQUFRLENBQUMsS0FBSyxDQUNmLENBQ0YsRUFBRTtxQ0FDSjtpQ0FDRjs2QkFDRjt5QkFDRixDQUFDO2dCQUNOLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJqb2kuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBTZWdtZW50R2VuZXJhdG9yLFxuICBUcmFuc2Zvcm1lcixcbiAgUm91dGVPcHRpb25zLFxuICBTdHJ1dFNlcnZpY2VzLFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5pbXBvcnQgeyBNb2RlbCwgUGx1bXAgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuaW1wb3J0ICogYXMgSm9pIGZyb20gJ2pvaSc7XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZVZhbGlkYXRvcihtOiB0eXBlb2YgTW9kZWwpIHtcbiAgY29uc3QgcmV0VmFsOiBhbnkgPSB7XG4gICAgdHlwZTogSm9pLnN0cmluZygpLFxuICAgIGlkOiBKb2lbbS5zY2hlbWEuYXR0cmlidXRlc1ttLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZV0oKSxcbiAgICBhdHRyaWJ1dGVzOiB7fSxcbiAgICByZWxhdGlvbnNoaXBzOiB7fSxcbiAgfTtcblxuICBPYmplY3Qua2V5cyhtLnNjaGVtYS5hdHRyaWJ1dGVzKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgIHJldFZhbC5hdHRyaWJ1dGVzW2F0dHJdID0gSm9pW20uc2NoZW1hLmF0dHJpYnV0ZXNbYXR0cl0udHlwZV0oKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldFZhbDtcbn1cblxuZnVuY3Rpb24gcmVsYXRpb25zaGlwVmFsaWRhdGUobTogdHlwZW9mIE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgcDogUGx1bXApIHtcbiAgY29uc3QgYzogdHlwZW9mIE1vZGVsID1cbiAgICBwLnR5cGVzW1xuICAgICAgbS5zY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdLnR5cGUuc2lkZXNbcmVsYXRpb25zaGlwXS5vdGhlclR5cGVcbiAgICBdO1xuICBjb25zdCBkYXRhU2NoZW1hID0ge1xuICAgIGlkOiBKb2lbYy5zY2hlbWEuYXR0cmlidXRlc1tjLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZV0oKSxcbiAgICB0eXBlOiBKb2kuc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgfTtcblxuICBpZiAobS5zY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdLnR5cGUuZXh0cmFzKSB7XG4gICAgY29uc3QgZXh0cmFzID0gbS5zY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdLnR5cGUuZXh0cmFzO1xuXG4gICAgT2JqZWN0LmtleXMoZXh0cmFzKS5mb3JFYWNoKGV4dHJhID0+IHtcbiAgICAgIGRhdGFTY2hlbWFbJ21ldGEnXSA9IGRhdGFTY2hlbWFbJ21ldGEnXSB8fCB7fTtcbiAgICAgIGRhdGFTY2hlbWFbJ21ldGEnXVtleHRyYV0gPSBKb2lbZXh0cmFzW2V4dHJhXS50eXBlXSgpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBkYXRhU2NoZW1hO1xufVxuXG5mdW5jdGlvbiBjaGlsZElkVHlwZShtOiB0eXBlb2YgTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBwOiBQbHVtcCkge1xuICBjb25zdCBjOiB0eXBlb2YgTW9kZWwgPVxuICAgIHAudHlwZXNbXG4gICAgICBtLnNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0udHlwZS5zaWRlc1tyZWxhdGlvbnNoaXBdLm90aGVyVHlwZVxuICAgIF07XG4gIHJldHVybiBjLnNjaGVtYS5hdHRyaWJ1dGVzW2Muc2NoZW1hLmlkQXR0cmlidXRlXS50eXBlO1xufVxuXG5leHBvcnQgY29uc3Qgam9pOiBTZWdtZW50R2VuZXJhdG9yID0gKFxuICBvcHRpb25zOiBSb3V0ZU9wdGlvbnMsXG4gIHNlcnZpY2VzOiBTdHJ1dFNlcnZpY2VzLFxuKSA9PiB7XG4gIGNvbnN0IGlkVHlwZSA9XG4gICAgb3B0aW9ucy5tb2RlbC5zY2hlbWEuYXR0cmlidXRlc1tvcHRpb25zLm1vZGVsLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZTtcbiAgcmV0dXJuIChpOiBQYXJ0aWFsPEhhcGkuUm91dGVDb25maWd1cmF0aW9uPikgPT4ge1xuICAgIGZ1bmN0aW9uIGpvaUJsb2NrKCk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+IHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiBhdHRyaWJ1dGVWYWxpZGF0b3Iob3B0aW9ucy5tb2RlbCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiBhdHRyaWJ1dGVWYWxpZGF0b3Iob3B0aW9ucy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmtpbmQgPT09ICdyZWxhdGlvbnNoaXAnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHJlbGF0aW9uc2hpcFZhbGlkYXRlKFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRJZDogSm9pW1xuICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgcGF5bG9hZDogcmVsYXRpb25zaGlwVmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZElkOiBKb2lbXG4gICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZFR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZWxhdGlvbnNoaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlT3B0aW9ucyh7fSwgaSwgam9pQmxvY2soKSk7XG4gIH07XG59O1xuIl19
