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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9qb2kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSw0Q0FBOEM7QUFDOUMseUJBQTJCO0FBRTNCLDRCQUE0QixDQUFlO0lBQ3pDLElBQU0sTUFBTSxHQUFRO1FBQ2xCLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2xCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN6RCxVQUFVLEVBQUUsRUFBRTtRQUNkLGFBQWEsRUFBRSxFQUFFO0tBQ2xCLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtRQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xFLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsOEJBQThCLENBQWUsRUFBRSxZQUFvQixFQUFFLENBQVE7SUFDM0UsSUFBTSxDQUFDLEdBQ0wsQ0FBQyxDQUFDLEtBQUssQ0FDTCxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FDeEUsQ0FBQztJQUNKLElBQU0sVUFBVSxHQUFHO1FBQ2pCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtLQUMxRCxDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBTSxRQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUVoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDL0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxxQkFBcUIsQ0FBZSxFQUFFLFlBQW9CLEVBQUUsQ0FBUTtJQUNsRSxJQUFNLENBQUMsR0FDTCxDQUFDLENBQUMsS0FBSyxDQUNMLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUN4RSxDQUFDO0lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFFWSxRQUFBLEdBQUcsR0FBYyxVQUM1QixPQUFxQixFQUNyQixRQUF1QjtJQUV2QixJQUFNLE1BQU0sR0FDVixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3pFLE1BQU0sQ0FBQyxVQUFDLENBQW1DO1FBQ3pDO1lBQ0UsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2lDQUMzQzs2QkFDRjt5QkFDRixDQUFDO29CQUNKLEtBQUssTUFBTTt3QkFDVCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtxQ0FDdEI7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0NBQzFDLE1BQU0sRUFBRTt3Q0FDTixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3FDQUN0QjtpQ0FDRjs2QkFDRjt5QkFDRixDQUFDO29CQUNKLEtBQUssUUFBUTt3QkFDWCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtxQ0FDdEI7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLE9BQU87d0JBQ1YsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDZCxDQUFDO1lBQ0gsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN2QixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsT0FBTyxFQUFFLG9CQUFvQixDQUMzQixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQ2Y7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLE1BQU07d0JBQ1QsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7cUNBQ3RCO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE1BQU0sRUFBRTt3Q0FDTixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dDQUNyQixPQUFPLEVBQUUsR0FBRyxDQUNWLFdBQVcsQ0FDVCxPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQ2YsQ0FDRixFQUFFO3FDQUNKO29DQUNELE9BQU8sRUFBRSxvQkFBb0IsQ0FDM0IsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsWUFBWSxFQUNwQixRQUFRLENBQUMsS0FBSyxDQUNmO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE1BQU0sRUFBRTt3Q0FDTixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dDQUNyQixPQUFPLEVBQUUsR0FBRyxDQUNWLFdBQVcsQ0FDVCxPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQ2YsQ0FDRixFQUFFO3FDQUNKO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7Z0JBQ04sQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImpvaS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRTZXJ2aWNlcyxcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuaW1wb3J0IHsgTW9kZWwsIFBsdW1wIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcbmltcG9ydCAqIGFzIEpvaSBmcm9tICdqb2knO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGVWYWxpZGF0b3IobTogdHlwZW9mIE1vZGVsKSB7XG4gIGNvbnN0IHJldFZhbDogYW55ID0ge1xuICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICBpZDogSm9pW20uc2NoZW1hLmF0dHJpYnV0ZXNbbS5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGVdKCksXG4gICAgYXR0cmlidXRlczoge30sXG4gICAgcmVsYXRpb25zaGlwczoge30sXG4gIH07XG5cbiAgT2JqZWN0LmtleXMobS5zY2hlbWEuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyID0+IHtcbiAgICByZXRWYWwuYXR0cmlidXRlc1thdHRyXSA9IEpvaVttLnNjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gIH0pO1xuXG4gIHJldHVybiByZXRWYWw7XG59XG5cbmZ1bmN0aW9uIHJlbGF0aW9uc2hpcFZhbGlkYXRlKG06IHR5cGVvZiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIHA6IFBsdW1wKSB7XG4gIGNvbnN0IGM6IHR5cGVvZiBNb2RlbCA9XG4gICAgcC50eXBlc1tcbiAgICAgIG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLnNpZGVzW3JlbGF0aW9uc2hpcF0ub3RoZXJUeXBlXG4gICAgXTtcbiAgY29uc3QgZGF0YVNjaGVtYSA9IHtcbiAgICBpZDogSm9pW2Muc2NoZW1hLmF0dHJpYnV0ZXNbYy5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGVdKCksXG4gIH07XG5cbiAgaWYgKG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLmV4dHJhcykge1xuICAgIGNvbnN0IGV4dHJhcyA9IG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLmV4dHJhcztcblxuICAgIE9iamVjdC5rZXlzKGV4dHJhcykuZm9yRWFjaChleHRyYSA9PiB7XG4gICAgICBkYXRhU2NoZW1hWydtZXRhJ10gPSBkYXRhU2NoZW1hWydtZXRhJ10gfHwge307XG4gICAgICBkYXRhU2NoZW1hWydtZXRhJ11bZXh0cmFdID0gSm9pW2V4dHJhc1tleHRyYV0udHlwZV0oKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZGF0YVNjaGVtYTtcbn1cblxuZnVuY3Rpb24gY2hpbGRJZFR5cGUobTogdHlwZW9mIE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgcDogUGx1bXApIHtcbiAgY29uc3QgYzogdHlwZW9mIE1vZGVsID1cbiAgICBwLnR5cGVzW1xuICAgICAgbS5zY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdLnR5cGUuc2lkZXNbcmVsYXRpb25zaGlwXS5vdGhlclR5cGVcbiAgICBdO1xuICByZXR1cm4gYy5zY2hlbWEuYXR0cmlidXRlc1tjLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZTtcbn1cblxuZXhwb3J0IGNvbnN0IGpvaTogR2VuZXJhdG9yID0gKFxuICBvcHRpb25zOiBSb3V0ZU9wdGlvbnMsXG4gIHNlcnZpY2VzOiBTdHJ1dFNlcnZpY2VzXG4pID0+IHtcbiAgY29uc3QgaWRUeXBlID1cbiAgICBvcHRpb25zLm1vZGVsLnNjaGVtYS5hdHRyaWJ1dGVzW29wdGlvbnMubW9kZWwuc2NoZW1hLmlkQXR0cmlidXRlXS50eXBlO1xuICByZXR1cm4gKGk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gam9pQmxvY2soKTogUGFydGlhbDxIYXBpLlJvdXRlQ29uZmlndXJhdGlvbj4ge1xuICAgICAgaWYgKG9wdGlvbnMua2luZCA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IGF0dHJpYnV0ZVZhbGlkYXRvcihvcHRpb25zLm1vZGVsKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IGF0dHJpYnV0ZVZhbGlkYXRvcihvcHRpb25zLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncXVlcnknOlxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMua2luZCA9PT0gJ3JlbGF0aW9uc2hpcCcpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGF5bG9hZDogcmVsYXRpb25zaGlwVmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkSWQ6IEpvaVtcbiAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkVHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgcGF5bG9hZDogcmVsYXRpb25zaGlwVmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkSWQ6IEpvaVtcbiAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkVHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wXG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZU9wdGlvbnMoe30sIGksIGpvaUJsb2NrKCkpO1xuICB9O1xufTtcbiJdfQ==
