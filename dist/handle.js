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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Qzs0QkFDRCxNQUFNLEVBQUU7Z0NBQ04sR0FBRyxFQUFFLGlCQUFpQixDQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFDWixPQUFPLENBQUMsS0FBSyxFQUNiLFFBQVEsQ0FBQyxLQUFLLENBQ2Y7NkJBQ0Y7eUJBQ0YsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiaGFuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlZEl0ZW0sXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24sXG4gIFN0cnV0U2VydmljZXMsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcbmltcG9ydCB7IE1vZGVsLCBQbHVtcCwgTW9kZWxEYXRhIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIEJvb20gZnJvbSAnYm9vbSc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmZ1bmN0aW9uIGFwcGVuZExvYWRIYW5kbGVyKFxuICBwcmU6IGFueVtdID0gW10sXG4gIG1vZGVsOiB0eXBlb2YgTW9kZWwsXG4gIHBsdW1wOiBQbHVtcCxcbiAgdG9Mb2FkOiBzdHJpbmdbXSA9IFsnYXR0cmlidXRlcyddLFxuKSB7XG4gIHJldHVybiBwcmUuY29uY2F0KHtcbiAgICBtZXRob2Q6IChyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgIGlmIChyZXF1ZXN0LnBhcmFtcyAmJiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHBsdW1wLmZpbmQoe1xuICAgICAgICAgIHR5cGU6IG1vZGVsLnR5cGUsXG4gICAgICAgICAgaWQ6IHJlcXVlc3QucGFyYW1zLml0ZW1JZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpdGVtXG4gICAgICAgICAgLmdldCgpXG4gICAgICAgICAgLnRoZW4odGhpbmcgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgIHJlcGx5KHtcbiAgICAgICAgICAgICAgICByZWY6IGl0ZW0sXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpbmcsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFzc2lnbjogJ2l0ZW0nLFxuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IGhhbmRsZTogU2VnbWVudEdlbmVyYXRvciA9IChcbiAgb3B0aW9uczogUm91dGVPcHRpb25zLFxuICBzZXJ2aWNlczogU3RydXRTZXJ2aWNlcyxcbikgPT4ge1xuICByZXR1cm4gKGk6IFBhcnRpYWw8U3RydXRSb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gaGFuZGxlQmxvY2soKTogUGFydGlhbDxTdHJ1dFJvdXRlQ29uZmlndXJhdGlvbj4ge1xuICAgICAgaWYgKG9wdGlvbnMua2luZCA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBuZXcgb3B0aW9ucy5tb2RlbChcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3QucGF5bG9hZC5hdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlZC5zYXZlKCkudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBseShyZXF1ZXN0LnByZS5pdGVtLmRhdGEpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoYW5kbGVyOiAocmVxdWVzdDogUm91dGVkSXRlbSwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLnJlZlxuICAgICAgICAgICAgICAgICAgLnNldChyZXF1ZXN0LnBheWxvYWQpXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5kZWxldGUoKVxuICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSgpLmNvZGUoMjAwKSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncXVlcnknOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQm9vbS5ub3RGb3VuZCgpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmtpbmQgPT09ICdyZWxhdGlvbnNoaXAnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS5yZWZcbiAgICAgICAgICAgICAgICAgIC5hZGQob3B0aW9ucy5yZWxhdGlvbnNoaXAsIHJlcXVlc3QucGF5bG9hZClcbiAgICAgICAgICAgICAgICAgIC5zYXZlKClcbiAgICAgICAgICAgICAgICAgIC50aGVuKHYgPT4gcmVwbHkodikpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwcmU6IGFwcGVuZExvYWRIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgaS5jb25maWcucHJlLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IFJvdXRlZEl0ZW0sIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHkocmVxdWVzdC5wcmUuaXRlbS5kYXRhKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICAgIFsnYXR0cmlidXRlcycsIGByZWxhdGlvbnNoaXBzLiR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9YF0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAubW9kaWZ5UmVsYXRpb25zaGlwKFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnJlbGF0aW9uc2hpcCxcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgcmVxdWVzdC5wYXlsb2FkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gcHJldmVudCB0aGUgdXNlciBmcm9tIHBvc3RpbmcgXCJtb2RpZnkgaWQ6MiB0byB0aGUgcm91dGUgL2l0ZW0vY2hpbGRyZW4vMVwiXG4gICAgICAgICAgICAgICAgICAgICAgaWQ6IHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLnNhdmUoKVxuICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiByZXBseSh2KSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHByZTogYXBwZW5kTG9hZEhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICBpLmNvbmZpZy5wcmUsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgc2VydmljZXMucGx1bXAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhbmRsZXI6IChyZXF1ZXN0OiBSb3V0ZWRJdGVtLCByZXBseTogSGFwaS5CYXNlX1JlcGx5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0ucmVmXG4gICAgICAgICAgICAgICAgICAucmVtb3ZlKG9wdGlvbnMucmVsYXRpb25zaGlwLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmb28nLFxuICAgICAgICAgICAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuc2F2ZSgpXG4gICAgICAgICAgICAgICAgICAudGhlbih2ID0+IHJlcGx5KHYpKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcHJlOiBhcHBlbmRMb2FkSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgIGkuY29uZmlnLnByZSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWwsXG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5wbHVtcCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKHt9LCBpLCBoYW5kbGVCbG9jaygpKTtcbiAgfTtcbn07XG4iXX0=
