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
                config: {},
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
                config: {},
            },
        },
        query: {
            hapi: {
                method: 'GET',
                path: '',
                config: {},
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
                config: {},
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
                config: {},
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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UUFBUSxFQUFFO29CQUN6QyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtpQkFDakM7YUFDRjtZQUNELElBQUksRUFBRTtnQkFDSixNQUFNLEVBQUUsT0FBTztnQkFDZixJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxNQUFNLEVBQUU7b0JBQ04sT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2lCQUN6QzthQUNGO1NBQ0Y7UUFDRCxXQUFXLEVBQUU7WUFDWCxNQUFNLEVBQUUsSUFBSTtZQUNaLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3pDLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO2lCQUNqQzthQUNGO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxNQUFNLEVBQUUsRUFBRTthQUNYO1NBQ0Y7S0FDRixDQUFDO0lBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUEvSEQsb0NBK0hDIiwiZmlsZSI6InJvdXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEpvaSBmcm9tICdqb2knO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm91dGVzKG9wdHM6IGFueSA9IHt9KSB7XG4gIGNvbnN0IHJldFZhbCA9IHtcbiAgICByZWFkOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaXN0Q2hpbGRyZW46IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcXVlcnk6IHtcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0aDogJycsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3JlYXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXlsb2FkOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHVwZGF0ZToge1xuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGF5bG9hZDogdHJ1ZSxcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlbGV0ZToge1xuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhZGRDaGlsZDoge1xuICAgICAgcGx1cmFsOiB0cnVlLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9L3tmaWVsZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1vZGlmeUNoaWxkOiB7XG4gICAgICBwbHVyYWw6IHRydWUsXG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICBjaGlsZElkOiBKb2kubnVtYmVyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVtb3ZlQ2hpbGQ6IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgIGNoaWxkSWQ6IEpvaS5udW1iZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG5cbiAgaWYgKG9wdHMuYXV0aEZvcikge1xuICAgIE9iamVjdC5rZXlzKG9wdHMuYXV0aEZvcikuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgcmV0VmFsW2tdLmhhcGkuY29uZmlnLmF1dGggPSBvcHRzLmF1dGhGb3Jba107XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmV0VmFsO1xufVxuIl19
