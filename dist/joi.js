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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9qb2kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSw0Q0FBOEM7QUFDOUMseUJBQTJCO0FBRTNCLDRCQUE0QixDQUFlO0lBQ3pDLElBQU0sTUFBTSxHQUFRO1FBQ2xCLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2xCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN6RCxVQUFVLEVBQUUsRUFBRTtRQUNkLGFBQWEsRUFBRSxFQUFFO0tBQ2xCLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtRQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xFLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsOEJBQThCLENBQWUsRUFBRSxZQUFvQixFQUFFLENBQVE7SUFDM0UsSUFBTSxDQUFDLEdBQ0wsQ0FBQyxDQUFDLEtBQUssQ0FDTCxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FDeEUsQ0FBQztJQUNKLElBQU0sVUFBVSxHQUFHO1FBQ2pCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN6RCxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtLQUM5QixDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckQsSUFBTSxRQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUVoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDL0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxxQkFBcUIsQ0FBZSxFQUFFLFlBQW9CLEVBQUUsQ0FBUTtJQUNsRSxJQUFNLENBQUMsR0FDTCxDQUFDLENBQUMsS0FBSyxDQUNMLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUN4RSxDQUFDO0lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFFWSxRQUFBLEdBQUcsR0FBcUIsVUFDbkMsT0FBcUIsRUFDckIsUUFBdUI7SUFFdkIsSUFBTSxNQUFNLEdBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN6RSxNQUFNLENBQUMsVUFBQyxDQUFtQztRQUN6QztZQUNFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLEtBQUssUUFBUTt3QkFDWCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixPQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztpQ0FDM0M7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLE1BQU07d0JBQ1QsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7cUNBQ3RCO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7b0JBQ0osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO29DQUMxQyxNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtxQ0FDdEI7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7cUNBQ3RCO2lDQUNGOzZCQUNGO3lCQUNGLENBQUM7Z0JBQ04sQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQzs0QkFDTCxNQUFNLEVBQUU7Z0NBQ04sUUFBUSxFQUFFO29DQUNSLE1BQU0sRUFBRTt3Q0FDTixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3FDQUN0QjtvQ0FDRCxPQUFPLEVBQUUsb0JBQW9CLENBQzNCLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZjtpQ0FDRjs2QkFDRjt5QkFDRixDQUFDO29CQUNKLEtBQUssTUFBTTt3QkFDVCxNQUFNLENBQUM7NEJBQ0wsTUFBTSxFQUFFO2dDQUNOLFFBQVEsRUFBRTtvQ0FDUixNQUFNLEVBQUU7d0NBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtxQ0FDdEI7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7d0NBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQ1YsV0FBVyxDQUNULE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZixDQUNGLEVBQUU7cUNBQ0o7b0NBQ0QsT0FBTyxFQUFFLG9CQUFvQixDQUMzQixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQ2Y7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztvQkFDSixLQUFLLFFBQVE7d0JBQ1gsTUFBTSxDQUFDOzRCQUNMLE1BQU0sRUFBRTtnQ0FDTixRQUFRLEVBQUU7b0NBQ1IsTUFBTSxFQUFFO3dDQUNOLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7d0NBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQ1YsV0FBVyxDQUNULE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLFlBQVksRUFDcEIsUUFBUSxDQUFDLEtBQUssQ0FDZixDQUNGLEVBQUU7cUNBQ0o7aUNBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDWixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiam9pLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRTZXJ2aWNlcyxcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuaW1wb3J0IHsgTW9kZWwsIFBsdW1wIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcbmltcG9ydCAqIGFzIEpvaSBmcm9tICdqb2knO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGVWYWxpZGF0b3IobTogdHlwZW9mIE1vZGVsKSB7XG4gIGNvbnN0IHJldFZhbDogYW55ID0ge1xuICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICBpZDogSm9pW20uc2NoZW1hLmF0dHJpYnV0ZXNbbS5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGVdKCksXG4gICAgYXR0cmlidXRlczoge30sXG4gICAgcmVsYXRpb25zaGlwczoge30sXG4gIH07XG5cbiAgT2JqZWN0LmtleXMobS5zY2hlbWEuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyID0+IHtcbiAgICByZXRWYWwuYXR0cmlidXRlc1thdHRyXSA9IEpvaVttLnNjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gIH0pO1xuXG4gIHJldHVybiByZXRWYWw7XG59XG5cbmZ1bmN0aW9uIHJlbGF0aW9uc2hpcFZhbGlkYXRlKG06IHR5cGVvZiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIHA6IFBsdW1wKSB7XG4gIGNvbnN0IGM6IHR5cGVvZiBNb2RlbCA9XG4gICAgcC50eXBlc1tcbiAgICAgIG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLnNpZGVzW3JlbGF0aW9uc2hpcF0ub3RoZXJUeXBlXG4gICAgXTtcbiAgY29uc3QgZGF0YVNjaGVtYSA9IHtcbiAgICBpZDogSm9pW2Muc2NoZW1hLmF0dHJpYnV0ZXNbYy5zY2hlbWEuaWRBdHRyaWJ1dGVdLnR5cGVdKCksXG4gICAgdHlwZTogSm9pLnN0cmluZygpLm9wdGlvbmFsKCksXG4gIH07XG5cbiAgaWYgKG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLmV4dHJhcykge1xuICAgIGNvbnN0IGV4dHJhcyA9IG0uc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXS50eXBlLmV4dHJhcztcblxuICAgIE9iamVjdC5rZXlzKGV4dHJhcykuZm9yRWFjaChleHRyYSA9PiB7XG4gICAgICBkYXRhU2NoZW1hWydtZXRhJ10gPSBkYXRhU2NoZW1hWydtZXRhJ10gfHwge307XG4gICAgICBkYXRhU2NoZW1hWydtZXRhJ11bZXh0cmFdID0gSm9pW2V4dHJhc1tleHRyYV0udHlwZV0oKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZGF0YVNjaGVtYTtcbn1cblxuZnVuY3Rpb24gY2hpbGRJZFR5cGUobTogdHlwZW9mIE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgcDogUGx1bXApIHtcbiAgY29uc3QgYzogdHlwZW9mIE1vZGVsID1cbiAgICBwLnR5cGVzW1xuICAgICAgbS5zY2hlbWEucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdLnR5cGUuc2lkZXNbcmVsYXRpb25zaGlwXS5vdGhlclR5cGVcbiAgICBdO1xuICByZXR1cm4gYy5zY2hlbWEuYXR0cmlidXRlc1tjLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZTtcbn1cblxuZXhwb3J0IGNvbnN0IGpvaTogU2VnbWVudEdlbmVyYXRvciA9IChcbiAgb3B0aW9uczogUm91dGVPcHRpb25zLFxuICBzZXJ2aWNlczogU3RydXRTZXJ2aWNlc1xuKSA9PiB7XG4gIGNvbnN0IGlkVHlwZSA9XG4gICAgb3B0aW9ucy5tb2RlbC5zY2hlbWEuYXR0cmlidXRlc1tvcHRpb25zLm1vZGVsLnNjaGVtYS5pZEF0dHJpYnV0ZV0udHlwZTtcbiAgcmV0dXJuIChpOiBQYXJ0aWFsPEhhcGkuUm91dGVDb25maWd1cmF0aW9uPikgPT4ge1xuICAgIGZ1bmN0aW9uIGpvaUJsb2NrKCk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+IHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiBhdHRyaWJ1dGVWYWxpZGF0b3Iob3B0aW9ucy5tb2RlbCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiBhdHRyaWJ1dGVWYWxpZGF0b3Iob3B0aW9ucy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUlkOiBKb2lbaWRUeXBlXSgpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMua2luZCA9PT0gJ3JlbGF0aW9uc2hpcCcpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiByZWxhdGlvbnNoaXBWYWxpZGF0ZShcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZWxhdGlvbnNoaXAsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtSWQ6IEpvaVtpZFR5cGVdKCksXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRJZDogSm9pW1xuICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXBcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiByZWxhdGlvbnNoaXBWYWxpZGF0ZShcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5yZWxhdGlvbnNoaXAsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1JZDogSm9pW2lkVHlwZV0oKSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRJZDogSm9pW1xuICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXBcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF0oKSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAnb3RoZXInKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFjdGlvbiA9PT0gJ3F1ZXJ5Jykge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKHt9LCBpLCBqb2lCbG9jaygpKTtcbiAgfTtcbn07XG4iXX0=
