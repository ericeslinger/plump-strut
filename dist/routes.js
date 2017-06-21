"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
function createRoutes(opts) {
    if (opts === void 0) { opts = {}; }
    var retVal = {
        read: {
            validate: {
                params: {
                    itemId: Joi.number().integer(),
                },
            },
            hapi: {
                method: 'GET',
                path: '/{itemId}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                },
            },
        },
        listChildren: {
            plural: true,
            validate: {
                params: {
                    itemId: Joi.number().integer(),
                },
            },
            hapi: {
                method: 'GET',
                path: '/{itemId}/{field}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                },
            },
        },
        query: {
            hapi: {
                method: 'GET',
                path: '',
                config: {
                    cors: opts.cors ? opts.cors : false,
                },
            },
        },
        create: {
            validate: {
                payload: true,
            },
            hapi: {
                method: 'POST',
                path: '',
                config: {
                    cors: opts.cors ? opts.cors : false,
                    payload: { output: 'data', parse: true },
                },
            },
        },
        update: {
            validate: {
                payload: true,
                params: {
                    itemId: Joi.number().integer().required(),
                },
            },
            hapi: {
                method: 'PATCH',
                path: '/{itemId}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                    payload: { output: 'data', parse: true },
                },
            },
        },
        delete: {
            validate: {
                params: {
                    itemId: Joi.number().integer().required(),
                },
            },
            hapi: {
                method: 'DELETE',
                path: '/{itemId}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                },
            },
        },
        addChild: {
            plural: true,
            validate: {
                params: {
                    itemId: Joi.number().integer().required(),
                },
            },
            hapi: {
                method: 'PUT',
                path: '/{itemId}/{field}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                    payload: { output: 'data', parse: true },
                },
            },
        },
        modifyChild: {
            plural: true,
            validate: {
                params: {
                    itemId: Joi.number().integer().required(),
                    childId: Joi.number().required(),
                },
            },
            hapi: {
                method: 'PATCH',
                path: '/{itemId}/{field}/{childId}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                    payload: { output: 'data', parse: true },
                },
            },
        },
        removeChild: {
            plural: true,
            validate: {
                params: {
                    itemId: Joi.number().integer().required(),
                    childId: Joi.number().required(),
                },
            },
            hapi: {
                method: 'DELETE',
                path: '/{itemId}/{field}/{childId}',
                config: {
                    cors: opts.cors ? opts.cors : false,
                },
            },
        },
    };
    if (opts.authFor) {
        Object.keys(opts.authFor).forEach(function (k) {
            retVal[k].hapi.config.auth = opts.authFor[k];
        });
    }
    return retVal;
}
exports.createRoutes = createRoutes;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUMsUUFBUSxFQUFFO2lCQUNqQzthQUNGO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxNQUFNLEVBQUU7b0JBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLO2lCQUNwQzthQUNGO1NBQ0Y7S0FDRixDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUE3SUQsb0NBNklDIiwiZmlsZSI6InJvdXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEpvaSBmcm9tICdqb2knO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZU9wdGlvbnMge1xuICBjb3JzOiBIYXBpLkNvcnNDb25maWd1cmF0aW9uT2JqZWN0O1xuICBhdXRoRm9yOiB7XG4gICAgcmVhZDogc3RyaW5nO1xuICAgIGxpc3RDaGlsZHJlbjogc3RyaW5nO1xuICAgIHF1ZXJ5OiBzdHJpbmc7XG4gICAgY3JlYXRlOiBzdHJpbmc7XG4gICAgdXBkYXRlOiBzdHJpbmc7XG4gICAgZGVsZXRlOiBzdHJpbmc7XG4gICAgYWRkQ2hpbGQ6IHN0cmluZztcbiAgICBtb2RpZnlDaGlsZDogc3RyaW5nO1xuICAgIHJlbW92ZUNoaWxkOiBzdHJpbmc7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb3V0ZXMob3B0czogUGFydGlhbDxSb3V0ZU9wdGlvbnM+ID0ge30pIHtcbiAgY29uc3QgcmV0VmFsID0ge1xuICAgIHJlYWQ6IHtcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBjb3JzOiBvcHRzLmNvcnMgPyBvcHRzLmNvcnMgOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaXN0Q2hpbGRyZW46IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGNvcnM6IG9wdHMuY29ycyA/IG9wdHMuY29ycyA6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHF1ZXJ5OiB7XG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBjb3JzOiBvcHRzLmNvcnMgPyBvcHRzLmNvcnMgOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjcmVhdGU6IHtcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBheWxvYWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0aDogJycsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGNvcnM6IG9wdHMuY29ycyA/IG9wdHMuY29ycyA6IGZhbHNlLFxuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdXBkYXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXlsb2FkOiB0cnVlLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGNvcnM6IG9wdHMuY29ycyA/IG9wdHMuY29ycyA6IGZhbHNlLFxuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVsZXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBjb3JzOiBvcHRzLmNvcnMgPyBvcHRzLmNvcnMgOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhZGRDaGlsZDoge1xuICAgICAgcGx1cmFsOiB0cnVlLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9L3tmaWVsZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBjb3JzOiBvcHRzLmNvcnMgPyBvcHRzLmNvcnMgOiBmYWxzZSxcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1vZGlmeUNoaWxkOiB7XG4gICAgICBwbHVyYWw6IHRydWUsXG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICBjaGlsZElkOiBKb2kubnVtYmVyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGNvcnM6IG9wdHMuY29ycyA/IG9wdHMuY29ycyA6IGZhbHNlLFxuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVtb3ZlQ2hpbGQ6IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgIGNoaWxkSWQ6IEpvaS5udW1iZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGNvcnM6IG9wdHMuY29ycyA/IG9wdHMuY29ycyA6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGlmIChvcHRzLmF1dGhGb3IpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRzLmF1dGhGb3IpLmZvckVhY2goayA9PiB7XG4gICAgICByZXRWYWxba10uaGFwaS5jb25maWcuYXV0aCA9IG9wdHMuYXV0aEZvcltrXTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXRWYWw7XG59XG4iXX0=
