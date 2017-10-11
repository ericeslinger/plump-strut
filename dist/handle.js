"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var mergeOptions = require("merge-options");
function loadHandler(model, plump, toLoad) {
    if (toLoad === void 0) { toLoad = ['attributes', 'relationships']; }
    return {
        method: function (request, reply) {
            if (request.params && request.params.itemId) {
                var item_1 = plump.find({
                    type: model.type,
                    id: request.params.itemId,
                });
                return item_1
                    .get(toLoad)
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
}
function handler(request, reply) {
    return reply(request.pre['handle']);
}
exports.handle = function (options, services) {
    return function (i) {
        function handleBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            config: {
                                pre: i.config.pre.concat({
                                    method: function (request, reply) {
                                        var created = new options.model(request.payload, services.plump);
                                        return created.save().then(function (v) { return reply(v); });
                                    },
                                    assign: 'handle',
                                }),
                            },
                            handler: handler,
                        };
                    case 'read':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump), {
                                    method: function (request, reply) {
                                        if (services.oracle &&
                                            services.oracle.filters[options.model.type]) {
                                            return reply(services.oracle.filter(request.pre.item.data));
                                        }
                                        else {
                                            return reply(request.pre.item.data);
                                        }
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'update':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump), {
                                    method: function (request, reply) {
                                        return request.pre.item.ref
                                            .set(request.payload)
                                            .save()
                                            .then(function (v) { return reply(v); });
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'delete':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump), {
                                    method: function (request, reply) {
                                        return request.pre.item.ref.delete().then(function (v) {
                                            return reply()
                                                .takeover()
                                                .code(200);
                                        });
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'query':
                        return {
                            handler: function (request, reply) {
                                return Boom.notFound();
                            },
                        };
                }
            }
            else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, [
                                    'attributes',
                                    "relationships." + options.relationship,
                                ]), {
                                    method: function (request, reply) {
                                        return request.pre.item.ref
                                            .add(options.relationship, request.payload)
                                            .save()
                                            .then(function (v) { return reply(v); });
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'read':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, [
                                    'attributes',
                                    "relationships." + options.relationship,
                                ]), {
                                    method: function (request, reply) {
                                        return reply(request.pre.item.data);
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'update':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, [
                                    'attributes',
                                    "relationships." + options.relationship,
                                ]), {
                                    method: function (request, reply) {
                                        return request.pre.item.ref
                                            .modifyRelationship(options.relationship, Object.assign({}, request.payload, {
                                            id: request.params.childId,
                                        }))
                                            .save()
                                            .then(function (v) { return reply(v); });
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                    case 'delete':
                        return {
                            handler: handler,
                            config: {
                                pre: i.config.pre.concat(loadHandler(options.model, services.plump, [
                                    'attributes',
                                    "relationships." + options.relationship,
                                ]), {
                                    method: function (request, reply) {
                                        return request.pre.item.ref
                                            .remove(options.relationship, {
                                            type: 'foo',
                                            id: request.params.childId,
                                        })
                                            .save()
                                            .then(function (v) { return reply(v); });
                                    },
                                    assign: 'handle',
                                }),
                            },
                        };
                }
            }
        }
        return mergeOptions({}, i, handleBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TSxFQUFFLFVBQUMsT0FBbUIsRUFBRSxLQUFzQjt3Q0FDbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUc7NkNBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFOzRDQUM1QixJQUFJLEVBQUUsS0FBSzs0Q0FDWCxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPO3lDQUMzQixDQUFDOzZDQUNELElBQUksRUFBRTs2Q0FDTixJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQVIsQ0FBUSxDQUFDLENBQUM7b0NBQ3pCLENBQUM7b0NBQ0QsTUFBTSxFQUFFLFFBQVE7aUNBQ2pCLENBQ0Y7NkJBQ0Y7eUJBQ0YsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiaGFuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlZEl0ZW0sXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24sXG4gIFN0cnV0U2VydmljZXMsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcbmltcG9ydCB7IE1vZGVsLCBQbHVtcCwgTW9kZWxEYXRhIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIEJvb20gZnJvbSAnYm9vbSc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmZ1bmN0aW9uIGxvYWRIYW5kbGVyKFxuICBtb2RlbDogdHlwZW9mIE1vZGVsLFxuICBwbHVtcDogUGx1bXAsXG4gIHRvTG9hZDogc3RyaW5nW10gPSBbJ2F0dHJpYnV0ZXMnLCAncmVsYXRpb25zaGlwcyddLFxuKSB7XG4gIHJldHVybiB7XG4gICAgbWV0aG9kOiAocmVxdWVzdDogSGFwaS5SZXF1ZXN0LCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwbHVtcC5maW5kKHtcbiAgICAgICAgICB0eXBlOiBtb2RlbC50eXBlLFxuICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaXRlbVxuICAgICAgICAgIC5nZXQodG9Mb2FkKVxuICAgICAgICAgIC50aGVuKHRoaW5nID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseSh7XG4gICAgICAgICAgICAgICAgcmVmOiBpdGVtLFxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaW5nLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3NpZ246ICdpdGVtJyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpIHtcbiAgcmV0dXJuIHJlcGx5KHJlcXVlc3QucHJlWydoYW5kbGUnXSk7XG59XG5cbmV4cG9ydCBjb25zdCBoYW5kbGU6IFNlZ21lbnRHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXMsXG4pID0+IHtcbiAgcmV0dXJuIChpOiBQYXJ0aWFsPFN0cnV0Um91dGVDb25maWd1cmF0aW9uPikgPT4ge1xuICAgIGZ1bmN0aW9uIGhhbmRsZUJsb2NrKCk6IFBhcnRpYWw8U3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24+IHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogaS5jb25maWcucHJlLmNvbmNhdCh7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6IChyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IG5ldyBvcHRpb25zLm1vZGVsKFxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QucGF5bG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZWQuc2F2ZSgpLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgYXNzaWduOiAnaGFuZGxlJyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGkuY29uZmlnLnByZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICBsb2FkSGFuZGxlcihvcHRpb25zLm1vZGVsLCBzZXJ2aWNlcy5wbHVtcCksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5vcmFjbGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLm9yYWNsZS5maWx0ZXJzW29wdGlvbnMubW9kZWwudHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXBseShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMub3JhY2xlLmZpbHRlcihyZXF1ZXN0LnByZS5pdGVtLmRhdGEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcGx5KHJlcXVlc3QucHJlLml0ZW0uZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246ICdoYW5kbGUnLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBpLmNvbmZpZy5wcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIob3B0aW9ucy5tb2RlbCwgc2VydmljZXMucGx1bXApLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0KHJlcXVlc3QucGF5bG9hZClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246ICdoYW5kbGUnLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBpLmNvbmZpZy5wcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgbG9hZEhhbmRsZXIob3B0aW9ucy5tb2RlbCwgc2VydmljZXMucGx1bXApLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmLmRlbGV0ZSgpLnRoZW4odiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHkoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudGFrZW92ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuY29kZSgyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFzc2lnbjogJ2hhbmRsZScsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJvb20ubm90Rm91bmQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAncmVsYXRpb25zaGlwJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogaS5jb25maWcucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyKG9wdGlvbnMubW9kZWwsIHNlcnZpY2VzLnBsdW1wLCBbXG4gICAgICAgICAgICAgICAgICAgICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgICAgICAgYHJlbGF0aW9uc2hpcHMuJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQob3B0aW9ucy5yZWxhdGlvbnNoaXAsIHJlcXVlc3QucGF5bG9hZClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246ICdoYW5kbGUnLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogaS5jb25maWcucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyKG9wdGlvbnMubW9kZWwsIHNlcnZpY2VzLnBsdW1wLCBbXG4gICAgICAgICAgICAgICAgICAgICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgICAgICAgYHJlbGF0aW9uc2hpcHMuJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduOiAnaGFuZGxlJyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogaS5jb25maWcucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyKG9wdGlvbnMubW9kZWwsIHNlcnZpY2VzLnBsdW1wLCBbXG4gICAgICAgICAgICAgICAgICAgICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgICAgICAgYHJlbGF0aW9uc2hpcHMuJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tb2RpZnlSZWxhdGlvbnNoaXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCByZXF1ZXN0LnBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IHRoZSB1c2VyIGZyb20gcG9zdGluZyBcIm1vZGlmeSBpZDoyIHRvIHRoZSByb3V0ZSAvaXRlbS9jaGlsZHJlbi8xXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduOiAnaGFuZGxlJyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogaS5jb25maWcucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyKG9wdGlvbnMubW9kZWwsIHNlcnZpY2VzLnBsdW1wLCBbXG4gICAgICAgICAgICAgICAgICAgICdhdHRyaWJ1dGVzJyxcbiAgICAgICAgICAgICAgICAgICAgYHJlbGF0aW9uc2hpcHMuJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUob3B0aW9ucy5yZWxhdGlvbnNoaXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ZvbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5jaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246ICdoYW5kbGUnLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKHt9LCBpLCBoYW5kbGVCbG9jaygpKTtcbiAgfTtcbn07XG4iXX0=
