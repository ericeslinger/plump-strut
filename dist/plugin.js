'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.plugin = plugin;
function compose(o, services, funs) {
    return function () {
        var initial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return funs.map(function (f) {
            return f(o, services);
        }).reduce(function (acc, v) {
            return v(acc) || acc;
        }, initial);
    };
}
function plugin(ctrl,
// gen: SegmentGenerator[],
routeOptions, services) {
    function p(server, _, next) {
        var routes = [];
        if (routeOptions.model) {
            ctrl.attributes.forEach(function (action) {
                var o = Object.assign({}, routeOptions, {
                    kind: 'attributes',
                    action: action
                });
                routes.push(compose(o, services, ctrl.generators)());
            });
            Object.keys(routeOptions.model.schema.relationships).forEach(function (relationship) {
                ctrl.relationships.forEach(function (action) {
                    var o = Object.assign({}, routeOptions, {
                        kind: 'relationship',
                        action: action,
                        relationship: relationship
                    });
                    routes.push(compose(o, services, ctrl.generators)());
                });
            });
        }
        ctrl.other.forEach(function (action) {
            var o = Object.assign({}, routeOptions, {
                kind: 'other',
                action: action
            });
            routes.push(compose(o, services, ctrl.generators)());
        });
        server.route(routes.filter(function (v) {
            return !!v;
        }));
        next();
    }
    p['attributes'] = Object.assign({}, {
        version: '1.0.0',
        name: routeOptions.routeName || routeOptions.model.type
    });
    return p;
}