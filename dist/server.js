"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var bearer = require("hapi-auth-bearer-token");
var mergeOptions = require("merge-options");
var authentication_1 = require("./authentication");
var dispatch_1 = require("./socket/dispatch");
var base_1 = require("./base");
var joi_1 = require("./joi");
var authorize_1 = require("./authorize");
var authentication_channel_1 = require("./socket/authentication.channel");
var handle_1 = require("./handle");
var plugin_1 = require("./plugin");
var defaultSettings = {
    apiRoot: '/api',
    authTypes: [],
    apiPort: 3000,
    authRoot: '/auth',
    apiHostname: 'localhost',
    apiProtocol: 'http',
    routeOptions: {},
    defaultController: {
        generators: [base_1.base, joi_1.joi, authorize_1.authorize, handle_1.handle],
        attributes: ['create', 'read', 'update', 'delete'],
        relationships: ['create', 'read', 'update', 'delete'],
        other: ['query'],
    },
    socketHandlers: [authentication_channel_1.AuthenticationChannel],
    modelControllers: {},
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
            return Promise.all((_this.config.models || _this.services.plump.getTypes()).map(function (t) {
                return _this.services.hapi.register(plugin_1.plugin(_this.config.modelControllers[t.type] ||
                    _this.config.defaultController, {
                    cors: true,
                    authentication: 'token',
                    model: t,
                }, _this.services), { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        })
            .then(function () {
            if (_this.config.extraControllers) {
                return Promise.all(_this.config.extraControllers.map(function (ctrl) {
                    return _this.services.hapi.register(plugin_1.plugin(ctrl, { cors: true, authentication: 'token', routeName: ctrl.name }, _this.services), { routes: { prefix: _this.config.apiRoot + "/" + ctrl.name } });
                }));
            }
            else {
                return;
            }
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
            _this.config.socketHandlers.forEach(function (h) { return dispatch_1.dispatch(h, _this); });
        });
    };
    Strut.prototype.baseUrl = function () {
        if (this.config.externalHost) {
            return this.config.externalHost;
        }
        else if (this.config.apiPort) {
            return this.config.apiProtocol + "://" + this.config.apiHostname + ":" + this
                .config.apiPort;
        }
        else {
            return this.config.apiProtocol + "://" + this.config.apiHostname;
        }
    };
    Strut.prototype.start = function () {
        return this.services.hapi.start();
    };
    return Strut;
}());
exports.Strut = Strut;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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ZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0ICogYXMgQmVsbCBmcm9tICdiZWxsJztcbmltcG9ydCAqIGFzIGJlYXJlciBmcm9tICdoYXBpLWF1dGgtYmVhcmVyLXRva2VuJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcbmltcG9ydCB7IFBsdW1wLCBNb2RlbCwgVGVybWluYWxTdG9yZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCB7XG4gIFRva2VuU2VydmljZSxcbiAgUm91dGVPcHRpb25zLFxuICBSb3V0ZUdlbmVyYXRvcixcbiAgU3RydXRDb25maWcsXG4gIFN0cnV0U2VydmljZXMsXG4gIEF1dGhlbnRpY2F0aW9uU3RyYXRlZ3ksXG4gIFN0cnV0U2VydmVyLFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5cbmltcG9ydCB7IGNvbmZpZ3VyZUF1dGggfSBmcm9tICcuL2F1dGhlbnRpY2F0aW9uJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi9zb2NrZXQvZGlzcGF0Y2gnO1xuaW1wb3J0IHsgYmFzZSB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBqb2kgfSBmcm9tICcuL2pvaSc7XG5pbXBvcnQgeyBhdXRob3JpemUgfSBmcm9tICcuL2F1dGhvcml6ZSc7XG5pbXBvcnQgeyBBdXRoZW50aWNhdGlvbkNoYW5uZWwgfSBmcm9tICcuL3NvY2tldC9hdXRoZW50aWNhdGlvbi5jaGFubmVsJztcbmltcG9ydCB7IGhhbmRsZSB9IGZyb20gJy4vaGFuZGxlJztcbmltcG9ydCB7IHBsdWdpbiB9IGZyb20gJy4vcGx1Z2luJztcblxuY29uc3QgZGVmYXVsdFNldHRpbmdzOiBTdHJ1dENvbmZpZyA9IHtcbiAgYXBpUm9vdDogJy9hcGknLFxuICBhdXRoVHlwZXM6IFtdLFxuICBhcGlQb3J0OiAzMDAwLFxuICBhdXRoUm9vdDogJy9hdXRoJyxcbiAgYXBpSG9zdG5hbWU6ICdsb2NhbGhvc3QnLFxuICBhcGlQcm90b2NvbDogJ2h0dHAnLFxuICByb3V0ZU9wdGlvbnM6IHt9LFxuICBkZWZhdWx0Q29udHJvbGxlcjoge1xuICAgIGdlbmVyYXRvcnM6IFtiYXNlLCBqb2ksIGF1dGhvcml6ZSwgaGFuZGxlXSxcbiAgICBhdHRyaWJ1dGVzOiBbJ2NyZWF0ZScsICdyZWFkJywgJ3VwZGF0ZScsICdkZWxldGUnXSxcbiAgICByZWxhdGlvbnNoaXBzOiBbJ2NyZWF0ZScsICdyZWFkJywgJ3VwZGF0ZScsICdkZWxldGUnXSxcbiAgICBvdGhlcjogWydxdWVyeSddLFxuICB9LFxuICBzb2NrZXRIYW5kbGVyczogW0F1dGhlbnRpY2F0aW9uQ2hhbm5lbF0sXG4gIG1vZGVsQ29udHJvbGxlcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0IGltcGxlbWVudHMgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcbiAgcHVibGljIGV4dGVuc2lvbnM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFN0cnV0U2VydmljZXMgPSB7fSxcbiAgKSB7XG4gICAgdGhpcy5zZXJ2aWNlcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5zZXJ2aWNlcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuY29uZmlnID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgcHJlUm91dGUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMudG9rZW5TdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKGJlYXJlcikudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5hdXRoLnN0cmF0ZWd5KCd0b2tlbicsICdiZWFyZXItYWNjZXNzLXRva2VuJywge1xuICAgICAgICAgICAgdmFsaWRhdGVGdW5jOiAodG9rZW4sIGNhbGxiYWNrKSA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUudmFsaWRhdGUodG9rZW4sIGNhbGxiYWNrKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByZUluaXQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgICBpc1NlY3VyZTogZmFsc2UsXG4gICAgICAgICAgaXNIdHRwT25seTogZmFsc2UsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgICAgc3RyaWN0SGVhZGVyOiB0cnVlLCAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKClcbiAgICAgICAgICApLm1hcCgodDogdHlwZW9mIE1vZGVsKSA9PiB7XG4gICAgICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgIHBsdWdpbihcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5tb2RlbENvbnRyb2xsZXJzW3QudHlwZV0gfHxcbiAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlZmF1bHRDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGNvcnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbjogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiB0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcyxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke3QudHlwZX1gIH0gfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maWcuZXh0cmFDb250cm9sbGVycykge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmV4dHJhQ29udHJvbGxlcnMubWFwKGN0cmwgPT5cbiAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgICAgICAgIHBsdWdpbihcbiAgICAgICAgICAgICAgICAgIGN0cmwsXG4gICAgICAgICAgICAgICAgICB7IGNvcnM6IHRydWUsIGF1dGhlbnRpY2F0aW9uOiAndG9rZW4nLCByb3V0ZU5hbWU6IGN0cmwubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcyxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHtjdHJsLm5hbWV9YCB9IH0sXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIGNvbmZpZ3VyZUF1dGgodGhpcykgYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfSxcbiAgICAgICAgICB9LFxuICAgICAgICApLFxuICAgICAgKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaW8gPSBTb2NrZXRJTyh0aGlzLnNlcnZpY2VzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgICB0aGlzLmNvbmZpZy5zb2NrZXRIYW5kbGVycy5mb3JFYWNoKGggPT4gZGlzcGF0Y2goaCwgdGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICBiYXNlVXJsKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5leHRlcm5hbEhvc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5leHRlcm5hbEhvc3Q7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5hcGlQb3J0KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5hcGlIb3N0bmFtZX06JHt0aGlzXG4gICAgICAgIC5jb25maWcuYXBpUG9ydH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5hcGlIb3N0bmFtZX1gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5zdGFydCgpO1xuICB9XG59XG4iXX0=
