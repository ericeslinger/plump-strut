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
                                return reply(request.pre.item.data);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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OzRCQUNELE1BQU0sRUFBRTtnQ0FDTixHQUFHLEVBQUUsaUJBQWlCLENBQ3BCLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUNaLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsUUFBUSxDQUFDLEtBQUssQ0FDZjs2QkFDRjt5QkFDRixDQUFDO2dCQUNOLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJoYW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBHZW5lcmF0b3IsXG4gIFRyYW5zZm9ybWVyLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFN0cnV0Um91dGVDb25maWd1cmF0aW9uLFxuICBTdHJ1dFNlcnZpY2VzLFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5pbXBvcnQgeyBNb2RlbCwgUGx1bXAsIE1vZGVsRGF0YSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlZEl0ZW0gZXh0ZW5kcyBIYXBpLlJlcXVlc3Qge1xuICBwcmU6IHtcbiAgICBpdGVtOiB7XG4gICAgICByZWY6IE1vZGVsPE1vZGVsRGF0YT47XG4gICAgICBkYXRhOiBNb2RlbERhdGE7XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kTG9hZEhhbmRsZXIoXG4gIHByZTogYW55W10gPSBbXSxcbiAgbW9kZWw6IHR5cGVvZiBNb2RlbCxcbiAgcGx1bXA6IFBsdW1wLFxuICB0b0xvYWQ6IHN0cmluZ1tdID0gWydhdHRyaWJ1dGVzJ11cbikge1xuICByZXR1cm4gcHJlLmNvbmNhdCh7XG4gICAgbWV0aG9kOiAocmVxdWVzdDogSGFwaS5SZXF1ZXN0LCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwbHVtcC5maW5kKHtcbiAgICAgICAgICB0eXBlOiBtb2RlbC50eXBlLFxuICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaXRlbVxuICAgICAgICAgIC5nZXQoKVxuICAgICAgICAgIC50aGVuKHRoaW5nID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseSh7XG4gICAgICAgICAgICAgICAgcmVmOiBpdGVtLFxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaW5nLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3NpZ246ICdpdGVtJyxcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBoYW5kbGU6IEdlbmVyYXRvciA9IChcbiAgb3B0aW9uczogUm91dGVPcHRpb25zLFxuICBzZXJ2aWNlczogU3RydXRTZXJ2aWNlc1xuKSA9PiB7XG4gIHJldHVybiAoaTogUGFydGlhbDxTdHJ1dFJvdXRlQ29uZmlndXJhdGlvbj4pID0+IHtcbiAgICBmdW5jdGlvbiBoYW5kbGVCbG9jaygpOiBQYXJ0aWFsPFN0cnV0Um91dGVDb25maWd1cmF0aW9uPiB7XG4gICAgICBpZiAob3B0aW9ucy5raW5kID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogSGFwaS5SZXF1ZXN0LCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZCA9IG5ldyBvcHRpb25zLm1vZGVsKFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdC5wYXlsb2FkLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZWQuc2F2ZSgpLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLnNldChyZXF1ZXN0LnBheWxvYWQpXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLmRlbGV0ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KCkuY29kZSgyMDApKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJvb20ubm90Rm91bmQoKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAncmVsYXRpb25zaGlwJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAuYWRkKG9wdGlvbnMucmVsYXRpb25zaGlwLCByZXF1ZXN0LnBheWxvYWQpXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgIFsnYXR0cmlidXRlcycsIGByZWxhdGlvbnNoaXBzLiR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9YF1cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5tb2RpZnlSZWxhdGlvbnNoaXAoXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucmVsYXRpb25zaGlwLFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCByZXF1ZXN0LnBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IHRoZSB1c2VyIGZyb20gcG9zdGluZyBcIm1vZGlmeSBpZDoyIHRvIHRoZSByb3V0ZSAvaXRlbS9jaGlsZHJlbi8xXCJcbiAgICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAucmVtb3ZlKG9wdGlvbnMucmVsYXRpb25zaGlwLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmb28nLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZU9wdGlvbnMoe30sIGksIGhhbmRsZUJsb2NrKCkpO1xuICB9O1xufTtcbiJdfQ==
