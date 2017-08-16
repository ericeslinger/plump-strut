"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var bearer = require("hapi-auth-bearer-token");
var mergeOptions = require("merge-options");
var authentication_1 = require("./authentication");
var socket_channel_1 = require("./socket.channel");
var base_1 = require("./base");
var joi_1 = require("./joi");
var authorize_1 = require("./authorize");
var handle_1 = require("./handle");
var plugin_1 = require("./plugin");
var defaultSettings = {
    apiRoot: '/api',
    authTypes: [],
    apiPort: 3000,
    authRoot: '/auth',
    hostName: 'localhost',
    apiProtocol: 'https',
    routeOptions: {},
    defaultRouteGenerator: [base_1.base, joi_1.joi, authorize_1.authorize, handle_1.handle],
    routeGenerators: {},
};
var Strut = (function () {
    function Strut(plump, conf, services) {
        if (services === void 0) { services = {}; }
        this.services = services;
        this.extensions = {};
        this.services.hapi = new Hapi.Server();
        this.services.plump = plump;
        this.config = mergeOptions({}, defaultSettings, conf);
    }
    Strut.prototype.preRoute = function () {
        var _this = this;
        return Promise.resolve().then(function () {
            if (_this.services.tokenStore) {
                return _this.services.hapi.register(bearer).then(function () {
                    return _this.services.hapi.auth.strategy('token', 'bearer-access-token', {
                        validateFunc: function (token, callback) {
                            return _this.services.tokenStore.validate(token, callback);
                        },
                    });
                });
            }
        });
    };
    Strut.prototype.preInit = function () {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.services.hapi.connection({ port: _this.config.apiPort });
            return _this.services.hapi.register(Bell);
        })
            .then(function () {
            _this.services.hapi.state('authNonce', {
                ttl: null,
                isSecure: false,
                isHttpOnly: false,
                encoding: 'base64json',
                clearInvalid: false,
                strictHeader: true,
            });
        });
    };
    Strut.prototype.initialize = function () {
        var _this = this;
        return this.preInit()
            .then(function () { return _this.preRoute(); })
            .then(function () {
            return Promise.all((_this.config.models || _this.services.plump.getTypes())
                .map(function (t) {
                return _this.services.hapi.register(plugin_1.plugin(_this.config.routeGenerators[t.type] ||
                    _this.config.defaultRouteGenerator, {
                    cors: true,
                    authentication: 'token',
                    model: t,
                }, _this.services), { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        })
            .then(function () {
            return _this.services.hapi.register(authentication_1.configureAuth(_this), {
                routes: { prefix: _this.config.authRoot },
            });
        })
            .then(function () {
            _this.services.hapi.ext('onPreAuth', function (request, reply) {
                request.connection.info.protocol = _this.config.apiProtocol;
                return reply.continue();
            });
        })
            .then(function () {
            _this.services.io = SocketIO(_this.services.hapi.listener);
            socket_channel_1.dispatch(_this);
        });
    };
    Strut.prototype.baseUrl = function () {
        if (this.config.apiPort) {
            return this.config.apiProtocol + "://" + this.config.hostName + ":" + this.config
                .apiPort;
        }
        else {
            return this.config.apiProtocol + "://" + this.config.hostName + ":" + this.config
                .apiPort;
        }
    };
    Strut.prototype.start = function () {
        return this.services.hapi.start();
    };
    return Strut;
}());
exports.Strut = Strut;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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KiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvJztcbmltcG9ydCAqIGFzIEJlbGwgZnJvbSAnYmVsbCc7XG5pbXBvcnQgKiBhcyBiZWFyZXIgZnJvbSAnaGFwaS1hdXRoLWJlYXJlci10b2tlbic7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5pbXBvcnQgeyBQbHVtcCwgTW9kZWwsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQge1xuICBUb2tlblNlcnZpY2UsXG4gIFJvdXRlT3B0aW9ucyxcbiAgUm91dGVHZW5lcmF0b3IsXG4gIFN0cnV0Q29uZmlnLFxuICBTdHJ1dFNlcnZpY2VzLFxuICBBdXRoZW50aWNhdGlvblN0cmF0ZWd5LFxuICBTdHJ1dFNlcnZlcixcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuXG5pbXBvcnQgeyBjb25maWd1cmVBdXRoIH0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4vc29ja2V0LmNoYW5uZWwnO1xuaW1wb3J0IHsgYmFzZSB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBqb2kgfSBmcm9tICcuL2pvaSc7XG5pbXBvcnQgeyBhdXRob3JpemUgfSBmcm9tICcuL2F1dGhvcml6ZSc7XG5pbXBvcnQgeyBoYW5kbGUgfSBmcm9tICcuL2hhbmRsZSc7XG5pbXBvcnQgeyBwbHVnaW4gfSBmcm9tICcuL3BsdWdpbic7XG5cbmNvbnN0IGRlZmF1bHRTZXR0aW5nczogU3RydXRDb25maWcgPSB7XG4gIGFwaVJvb3Q6ICcvYXBpJyxcbiAgYXV0aFR5cGVzOiBbXSxcbiAgYXBpUG9ydDogMzAwMCxcbiAgYXV0aFJvb3Q6ICcvYXV0aCcsXG4gIGhvc3ROYW1lOiAnbG9jYWxob3N0JyxcbiAgYXBpUHJvdG9jb2w6ICdodHRwcycsXG4gIHJvdXRlT3B0aW9uczoge30sXG4gIGRlZmF1bHRSb3V0ZUdlbmVyYXRvcjogW2Jhc2UsIGpvaSwgYXV0aG9yaXplLCBoYW5kbGVdLFxuICByb3V0ZUdlbmVyYXRvcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0IGltcGxlbWVudHMgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcbiAgcHVibGljIGV4dGVuc2lvbnM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFN0cnV0U2VydmljZXMgPSB7fSxcbiAgKSB7XG4gICAgdGhpcy5zZXJ2aWNlcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5zZXJ2aWNlcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuY29uZmlnID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgcHJlUm91dGUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMudG9rZW5TdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKGJlYXJlcikudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5hdXRoLnN0cmF0ZWd5KCd0b2tlbicsICdiZWFyZXItYWNjZXNzLXRva2VuJywge1xuICAgICAgICAgICAgdmFsaWRhdGVGdW5jOiAodG9rZW4sIGNhbGxiYWNrKSA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUudmFsaWRhdGUodG9rZW4sIGNhbGxiYWNrKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByZUluaXQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgICBpc1NlY3VyZTogZmFsc2UsXG4gICAgICAgICAgaXNIdHRwT25seTogZmFsc2UsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgICAgc3RyaWN0SGVhZGVyOiB0cnVlLCAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKCkpXG4gICAgICAgICAgICAubWFwKCh0OiB0eXBlb2YgTW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgICAgcGx1Z2luKFxuICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcucm91dGVHZW5lcmF0b3JzW3QudHlwZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVmYXVsdFJvdXRlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb3JzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbjogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHQsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcyxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHt0LnR5cGV9YCB9IH0sXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgY29uZmlndXJlQXV0aCh0aGlzKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgcHJlZml4OiB0aGlzLmNvbmZpZy5hdXRoUm9vdCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICksXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICAgIHJlcXVlc3QuY29ubmVjdGlvbi5pbmZvLnByb3RvY29sID0gdGhpcy5jb25maWcuYXBpUHJvdG9jb2w7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5pbyA9IFNvY2tldElPKHRoaXMuc2VydmljZXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICAgIGRpc3BhdGNoKHRoaXMpO1xuICAgICAgfSk7XG4gIH1cblxuICBiYXNlVXJsKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5hcGlQb3J0KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhcnQoKTtcbiAgfVxufVxuIl19
