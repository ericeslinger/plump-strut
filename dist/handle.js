"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var mergeOptions = require("merge-options");
function appendLoadHandler(pre, model, plump, toLoad) {
    if (pre === void 0) { pre = []; }
    if (toLoad === void 0) { toLoad = ['attributes']; }
    return pre.concat({
        method: function (request, reply) {
            if (request.params && request.params.itemId) {
                var item_1 = plump.find({
                    type: model.type,
                    id: request.params.itemId,
                });
                return item_1
                    .get()
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QjtnQ0FDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUc7cUNBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO29DQUM1QixJQUFJLEVBQUUsS0FBSztvQ0FDWCxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPO2lDQUMzQixDQUFDO3FDQUNELElBQUksRUFBRTtxQ0FDTixJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQVIsQ0FBUSxDQUFDLENBQUM7NEJBQ3pCLENBQUM7NEJBQ0QsTUFBTSxFQUFFO2dDQUNOLEdBQUcsRUFBRSxpQkFBaUIsQ0FDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQ1osT0FBTyxDQUFDLEtBQUssRUFDYixRQUFRLENBQUMsS0FBSyxDQUNmOzZCQUNGO3lCQUNGLENBQUM7Z0JBQ04sQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6ImhhbmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFNlZ21lbnRHZW5lcmF0b3IsXG4gIFRyYW5zZm9ybWVyLFxuICBSb3V0ZWRJdGVtLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFN0cnV0Um91dGVDb25maWd1cmF0aW9uLFxuICBTdHJ1dFNlcnZpY2VzLFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5pbXBvcnQgeyBNb2RlbCwgUGx1bXAsIE1vZGVsRGF0YSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5mdW5jdGlvbiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgcHJlOiBhbnlbXSA9IFtdLFxuICBtb2RlbDogdHlwZW9mIE1vZGVsLFxuICBwbHVtcDogUGx1bXAsXG4gIHRvTG9hZDogc3RyaW5nW10gPSBbJ2F0dHJpYnV0ZXMnXSxcbikge1xuICByZXR1cm4gcHJlLmNvbmNhdCh7XG4gICAgbWV0aG9kOiAocmVxdWVzdDogSGFwaS5SZXF1ZXN0LCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwbHVtcC5maW5kKHtcbiAgICAgICAgICB0eXBlOiBtb2RlbC50eXBlLFxuICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaXRlbVxuICAgICAgICAgIC5nZXQoKVxuICAgICAgICAgIC50aGVuKHRoaW5nID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseSh7XG4gICAgICAgICAgICAgICAgcmVmOiBpdGVtLFxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaW5nLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3NpZ246ICdpdGVtJyxcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBoYW5kbGU6IFNlZ21lbnRHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXMsXG4pID0+IHtcbiAgcmV0dXJuIChpOiBQYXJ0aWFsPFN0cnV0Um91dGVDb25maWd1cmF0aW9uPikgPT4ge1xuICAgIGZ1bmN0aW9uIGhhbmRsZUJsb2NrKCk6IFBhcnRpYWw8U3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24+IHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gbmV3IG9wdGlvbnMubW9kZWwoXG4gICAgICAgICAgICAgICAgICByZXF1ZXN0LnBheWxvYWQuYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZWQuc2F2ZSgpLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5vcmFjbGUgJiZcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLm9yYWNsZS5maWx0ZXJzW29wdGlvbnMubW9kZWwudHlwZV1cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXBseShzZXJ2aWNlcy5vcmFjbGUuZmlsdGVyKHJlcXVlc3QucHJlLml0ZW0uZGF0YSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAuc2V0KHJlcXVlc3QucGF5bG9hZClcbiAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLmRlbGV0ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KCkuY29kZSgyMDApKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdxdWVyeSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBCb29tLm5vdEZvdW5kKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMua2luZCA9PT0gJ3JlbGF0aW9uc2hpcCcpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLmFkZChvcHRpb25zLnJlbGF0aW9uc2hpcCwgcmVxdWVzdC5wYXlsb2FkKVxuICAgICAgICAgICAgICAgICAgLnNhdmUoKVxuICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBseShyZXF1ZXN0LnByZS5pdGVtLmRhdGEpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICAgWydhdHRyaWJ1dGVzJywgYHJlbGF0aW9uc2hpcHMuJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gXSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5tb2RpZnlSZWxhdGlvbnNoaXAoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCByZXF1ZXN0LnBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IHRoZSB1c2VyIGZyb20gcG9zdGluZyBcIm1vZGlmeSBpZDoyIHRvIHRoZSByb3V0ZSAvaXRlbS9jaGlsZHJlbi8xXCJcbiAgICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5yZW1vdmUob3B0aW9ucy5yZWxhdGlvbnNoaXAsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ZvbycsXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5jaGlsZElkLFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZU9wdGlvbnMoe30sIGksIGhhbmRsZUJsb2NrKCkpO1xuICB9O1xufTtcbiJdfQ==
