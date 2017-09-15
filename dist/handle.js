"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var mergeOptions = require("merge-options");
function appendLoadHandler(pre, model, plump, toLoad) {
    if (pre === void 0) { pre = []; }
    if (toLoad === void 0) { toLoad = ['attributes', 'relationships']; }
    return pre.concat({
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
    });
}
exports.handle = function (options, services) {
    return function (i) {
        function handleBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            handler: function (request, reply) {
                                var created = new options.model(request.payload.attributes, services.plump);
                                return created.save().then(function (v) { return reply(v); });
                            },
                        };
                    case 'read':
                        return {
                            handler: function (request, reply) {
                                if (services.oracle &&
                                    services.oracle.filters[options.model.type]) {
                                    return reply(services.oracle.filter(request.pre.item.data));
                                }
                                else {
                                    return reply(request.pre.item.data);
                                }
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
                            },
                        };
                    case 'update':
                        return {
                            handler: function (request, reply) {
                                return request.pre.item.ref
                                    .set(request.payload)
                                    .save()
                                    .then(function (v) { return reply(v); });
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
                            },
                        };
                    case 'delete':
                        return {
                            handler: function (request, reply) {
                                return request.pre.item.ref
                                    .delete()
                                    .then(function (v) { return reply().code(200); });
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
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
                            handler: function (request, reply) {
                                return request.pre.item.ref
                                    .add(options.relationship, request.payload)
                                    .save()
                                    .then(function (v) { return reply(v); });
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
                            },
                        };
                    case 'read':
                        return {
                            handler: function (request, reply) {
                                return reply(request.pre.item.data);
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump, ['attributes', "relationships." + options.relationship]),
                            },
                        };
                    case 'update':
                        return {
                            handler: function (request, reply) {
                                return request.pre.item.ref
                                    .modifyRelationship(options.relationship, Object.assign({}, request.payload, {
                                    id: request.params.childId,
                                }))
                                    .save()
                                    .then(function (v) { return reply(v); });
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
                            },
                        };
                    case 'delete':
                        return {
                            handler: function (request, reply) {
                                return request.pre.item.ref
                                    .remove(options.relationship, {
                                    type: 'foo',
                                    id: request.params.childId,
                                })
                                    .save()
                                    .then(function (v) { return reply(v); });
                            },
                            config: {
                                pre: appendLoadHandler(i.config.pre, options.model, services.plump),
                            },
                        };
                }
            }
        }
        return mergeOptions({}, i, handleBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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VUFBQyxPQUFtQixFQUFFLEtBQXNCO2dDQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRztxQ0FDeEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7b0NBQzVCLElBQUksRUFBRSxLQUFLO29DQUNYLEVBQUUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU87aUNBQzNCLENBQUM7cUNBQ0QsSUFBSSxFQUFFO3FDQUNOLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBUixDQUFRLENBQUMsQ0FBQzs0QkFDekIsQ0FBQzs0QkFDRCxNQUFNLEVBQUU7Z0NBQ04sR0FBRyxFQUFFLGlCQUFpQixDQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFDWixPQUFPLENBQUMsS0FBSyxFQUNiLFFBQVEsQ0FBQyxLQUFLLENBQ2Y7NkJBQ0Y7eUJBQ0YsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiaGFuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlZEl0ZW0sXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24sXG4gIFN0cnV0U2VydmljZXMsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcbmltcG9ydCB7IE1vZGVsLCBQbHVtcCwgTW9kZWxEYXRhIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIEJvb20gZnJvbSAnYm9vbSc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmZ1bmN0aW9uIGFwcGVuZExvYWRIYW5kbGVyKFxuICBwcmU6IGFueVtdID0gW10sXG4gIG1vZGVsOiB0eXBlb2YgTW9kZWwsXG4gIHBsdW1wOiBQbHVtcCxcbiAgdG9Mb2FkOiBzdHJpbmdbXSA9IFsnYXR0cmlidXRlcycsICdyZWxhdGlvbnNoaXBzJ10sXG4pIHtcbiAgcmV0dXJuIHByZS5jb25jYXQoe1xuICAgIG1ldGhvZDogKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgaWYgKHJlcXVlc3QucGFyYW1zICYmIHJlcXVlc3QucGFyYW1zLml0ZW1JZCkge1xuICAgICAgICBjb25zdCBpdGVtID0gcGx1bXAuZmluZCh7XG4gICAgICAgICAgdHlwZTogbW9kZWwudHlwZSxcbiAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuaXRlbUlkLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGl0ZW1cbiAgICAgICAgICAuZ2V0KHRvTG9hZClcbiAgICAgICAgICAudGhlbih0aGluZyA9PiB7XG4gICAgICAgICAgICBpZiAodGhpbmcpIHtcbiAgICAgICAgICAgICAgcmVwbHkoe1xuICAgICAgICAgICAgICAgIHJlZjogaXRlbSxcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGluZyxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXNzaWduOiAnaXRlbScsXG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgaGFuZGxlOiBTZWdtZW50R2VuZXJhdG9yID0gKFxuICBvcHRpb25zOiBSb3V0ZU9wdGlvbnMsXG4gIHNlcnZpY2VzOiBTdHJ1dFNlcnZpY2VzLFxuKSA9PiB7XG4gIHJldHVybiAoaTogUGFydGlhbDxTdHJ1dFJvdXRlQ29uZmlndXJhdGlvbj4pID0+IHtcbiAgICBmdW5jdGlvbiBoYW5kbGVCbG9jaygpOiBQYXJ0aWFsPFN0cnV0Um91dGVDb25maWd1cmF0aW9uPiB7XG4gICAgICBpZiAob3B0aW9ucy5raW5kID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogSGFwaS5SZXF1ZXN0LCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IG5ldyBvcHRpb25zLm1vZGVsKFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdC5wYXlsb2FkLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVkLnNhdmUoKS50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMub3JhY2xlICYmXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5vcmFjbGUuZmlsdGVyc1tvcHRpb25zLm1vZGVsLnR5cGVdXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkoc2VydmljZXMub3JhY2xlLmZpbHRlcihyZXF1ZXN0LnByZS5pdGVtLmRhdGEpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcGx5KHJlcXVlc3QucHJlLml0ZW0uZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLnNldChyZXF1ZXN0LnBheWxvYWQpXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5kZWxldGUoKVxuICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSgpLmNvZGUoMjAwKSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncXVlcnknOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQm9vbS5ub3RGb3VuZCgpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmtpbmQgPT09ICdyZWxhdGlvbnNoaXAnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5hZGQob3B0aW9ucy5yZWxhdGlvbnNoaXAsIHJlcXVlc3QucGF5bG9hZClcbiAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgIFsnYXR0cmlidXRlcycsIGByZWxhdGlvbnNoaXBzLiR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9YF0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAubW9kaWZ5UmVsYXRpb25zaGlwKFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgcmVxdWVzdC5wYXlsb2FkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gcHJldmVudCB0aGUgdXNlciBmcm9tIHBvc3RpbmcgXCJtb2RpZnkgaWQ6MiB0byB0aGUgcm91dGUgL2l0ZW0vY2hpbGRyZW4vMVwiXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLnNhdmUoKVxuICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAucmVtb3ZlKG9wdGlvbnMucmVsYXRpb25zaGlwLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmb28nLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKHt9LCBpLCBoYW5kbGVCbG9jaygpKTtcbiAgfTtcbn07XG4iXX0=
