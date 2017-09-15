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
    hostName: 'localhost',
    apiProtocol: 'https',
    routeOptions: {},
    defaultRouteGenerator: [base_1.base, joi_1.joi, authorize_1.authorize, handle_1.handle],
    socketHandlers: [authentication_channel_1.AuthenticationChannel],
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
            _this.config.socketHandlers.forEach(function (h) { return dispatch_1.dispatch(h, _this); });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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USxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBQ0gsWUFBQztBQUFELENBdEdBLEFBc0dDLElBQUE7QUF0R1ksc0JBQUsiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0ICogYXMgYmVhcmVyIGZyb20gJ2hhcGktYXV0aC1iZWFyZXItdG9rZW4nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBUZXJtaW5hbFN0b3JlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHtcbiAgVG9rZW5TZXJ2aWNlLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFJvdXRlR2VuZXJhdG9yLFxuICBTdHJ1dENvbmZpZyxcbiAgU3RydXRTZXJ2aWNlcyxcbiAgQXV0aGVudGljYXRpb25TdHJhdGVneSxcbiAgU3RydXRTZXJ2ZXIsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcblxuaW1wb3J0IHsgY29uZmlndXJlQXV0aCB9IGZyb20gJy4vYXV0aGVudGljYXRpb24nO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9kaXNwYXRjaCc7XG5pbXBvcnQgeyBiYXNlIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IGpvaSB9IGZyb20gJy4vam9pJztcbmltcG9ydCB7IGF1dGhvcml6ZSB9IGZyb20gJy4vYXV0aG9yaXplJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0aW9uQ2hhbm5lbCB9IGZyb20gJy4vc29ja2V0L2F1dGhlbnRpY2F0aW9uLmNoYW5uZWwnO1xuaW1wb3J0IHsgaGFuZGxlIH0gZnJvbSAnLi9oYW5kbGUnO1xuaW1wb3J0IHsgcGx1Z2luIH0gZnJvbSAnLi9wbHVnaW4nO1xuXG5jb25zdCBkZWZhdWx0U2V0dGluZ3M6IFN0cnV0Q29uZmlnID0ge1xuICBhcGlSb290OiAnL2FwaScsXG4gIGF1dGhUeXBlczogW10sXG4gIGFwaVBvcnQ6IDMwMDAsXG4gIGF1dGhSb290OiAnL2F1dGgnLFxuICBob3N0TmFtZTogJ2xvY2FsaG9zdCcsXG4gIGFwaVByb3RvY29sOiAnaHR0cHMnLFxuICByb3V0ZU9wdGlvbnM6IHt9LFxuICBkZWZhdWx0Um91dGVHZW5lcmF0b3I6IFtiYXNlLCBqb2ksIGF1dGhvcml6ZSwgaGFuZGxlXSxcbiAgc29ja2V0SGFuZGxlcnM6IFtBdXRoZW50aWNhdGlvbkNoYW5uZWxdLFxuICByb3V0ZUdlbmVyYXRvcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0IGltcGxlbWVudHMgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcbiAgcHVibGljIGV4dGVuc2lvbnM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFN0cnV0U2VydmljZXMgPSB7fSxcbiAgKSB7XG4gICAgdGhpcy5zZXJ2aWNlcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5zZXJ2aWNlcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuY29uZmlnID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgcHJlUm91dGUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMudG9rZW5TdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKGJlYXJlcikudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5hdXRoLnN0cmF0ZWd5KCd0b2tlbicsICdiZWFyZXItYWNjZXNzLXRva2VuJywge1xuICAgICAgICAgICAgdmFsaWRhdGVGdW5jOiAodG9rZW4sIGNhbGxiYWNrKSA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUudmFsaWRhdGUodG9rZW4sIGNhbGxiYWNrKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByZUluaXQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgICBpc1NlY3VyZTogZmFsc2UsXG4gICAgICAgICAgaXNIdHRwT25seTogZmFsc2UsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgICAgc3RyaWN0SGVhZGVyOiB0cnVlLCAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKCkpXG4gICAgICAgICAgICAubWFwKCh0OiB0eXBlb2YgTW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgICAgcGx1Z2luKFxuICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcucm91dGVHZW5lcmF0b3JzW3QudHlwZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVmYXVsdFJvdXRlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb3JzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbjogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHQsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcyxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHt0LnR5cGV9YCB9IH0sXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgY29uZmlndXJlQXV0aCh0aGlzKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgcHJlZml4OiB0aGlzLmNvbmZpZy5hdXRoUm9vdCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICksXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICAgIHJlcXVlc3QuY29ubmVjdGlvbi5pbmZvLnByb3RvY29sID0gdGhpcy5jb25maWcuYXBpUHJvdG9jb2w7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5pbyA9IFNvY2tldElPKHRoaXMuc2VydmljZXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICAgIHRoaXMuY29uZmlnLnNvY2tldEhhbmRsZXJzLmZvckVhY2goaCA9PiBkaXNwYXRjaChoLCB0aGlzKSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGJhc2VVcmwoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmFwaVBvcnQpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmhvc3ROYW1lfToke3RoaXMuY29uZmlnXG4gICAgICAgIC5hcGlQb3J0fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmhvc3ROYW1lfToke3RoaXMuY29uZmlnXG4gICAgICAgIC5hcGlQb3J0fWA7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5zdGFydCgpO1xuICB9XG59XG4iXX0=
