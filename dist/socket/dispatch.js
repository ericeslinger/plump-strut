'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.respond = respond;
exports.dispatch = dispatch;
// note: the connect events are server-level things
// fired when a socket connects, whereas the rest
// are in response to specific socket emissions.
function respond(c, s) {
    return function (r) {
        if (r.broadcast === true) {
            return s.services.io.emit(r.key, r.msg);
        } else if (r.broadcast && typeof r.broadcast === 'string') {
            return s.services.io.to(r.broadcast).emit(r.key, r.msg);
        } else {
            return c.emit(r.key, r.msg);
        }
    };
}
function dispatch(d, s) {
    s.services.io.on('connect', function (c) {
        return Promise.resolve().then(function () {
            if (d.connect) {
                return d.connect({
                    request: 'connect',
                    client: c
                }, s).then(respond(c, s));
            }
        }).then(function () {
            Object.keys(d).forEach(function (key) {
                if (key !== 'connect') {
                    var h = d[key];
                    c.on(key, function (m) {
                        var msg = Object.assign({}, m, { client: c });
                        h(msg, s).then(respond(c, s)).catch(function (e) {
                            return console.log(e);
                        });
                    });
                }
            });
        });
    });
}