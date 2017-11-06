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
    defaultController: {
        generators: [base_1.base, joi_1.joi, authorize_1.authorize, handle_1.handle],
        attributes: ['create', 'read', 'update', 'delete'],
        relationships: ['create', 'read', 'update', 'delete'],
        other: ['query'],
    },
    socketHandlers: [authentication_channel_1.AuthenticationChannel],
    controllers: {},
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
                return _this.services.hapi.register(plugin_1.plugin(_this.config.controllers[t.type] ||
                    _this.config.defaultController, {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QztZQUNOLE1BQU0sQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsV0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsU0FBSSxJQUFJLENBQUMsTUFBTTtpQkFDdkUsT0FBUyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBSyxHQUFMO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDSCxZQUFDO0FBQUQsQ0F0R0EsQUFzR0MsSUFBQTtBQXRHWSxzQkFBSyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvJztcbmltcG9ydCAqIGFzIEJlbGwgZnJvbSAnYmVsbCc7XG5pbXBvcnQgKiBhcyBiZWFyZXIgZnJvbSAnaGFwaS1hdXRoLWJlYXJlci10b2tlbic7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5pbXBvcnQgeyBQbHVtcCwgTW9kZWwsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQge1xuICBUb2tlblNlcnZpY2UsXG4gIFJvdXRlT3B0aW9ucyxcbiAgUm91dGVHZW5lcmF0b3IsXG4gIFN0cnV0Q29uZmlnLFxuICBTdHJ1dFNlcnZpY2VzLFxuICBBdXRoZW50aWNhdGlvblN0cmF0ZWd5LFxuICBTdHJ1dFNlcnZlcixcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuXG5pbXBvcnQgeyBjb25maWd1cmVBdXRoIH0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4vc29ja2V0L2Rpc3BhdGNoJztcbmltcG9ydCB7IGJhc2UgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgam9pIH0gZnJvbSAnLi9qb2knO1xuaW1wb3J0IHsgYXV0aG9yaXplIH0gZnJvbSAnLi9hdXRob3JpemUnO1xuaW1wb3J0IHsgQXV0aGVudGljYXRpb25DaGFubmVsIH0gZnJvbSAnLi9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbCc7XG5pbXBvcnQgeyBoYW5kbGUgfSBmcm9tICcuL2hhbmRsZSc7XG5pbXBvcnQgeyBwbHVnaW4gfSBmcm9tICcuL3BsdWdpbic7XG5cbmNvbnN0IGRlZmF1bHRTZXR0aW5nczogU3RydXRDb25maWcgPSB7XG4gIGFwaVJvb3Q6ICcvYXBpJyxcbiAgYXV0aFR5cGVzOiBbXSxcbiAgYXBpUG9ydDogMzAwMCxcbiAgYXV0aFJvb3Q6ICcvYXV0aCcsXG4gIGhvc3ROYW1lOiAnbG9jYWxob3N0JyxcbiAgYXBpUHJvdG9jb2w6ICdodHRwcycsXG4gIHJvdXRlT3B0aW9uczoge30sXG4gIGRlZmF1bHRDb250cm9sbGVyOiB7XG4gICAgZ2VuZXJhdG9yczogW2Jhc2UsIGpvaSwgYXV0aG9yaXplLCBoYW5kbGVdLFxuICAgIGF0dHJpYnV0ZXM6IFsnY3JlYXRlJywgJ3JlYWQnLCAndXBkYXRlJywgJ2RlbGV0ZSddLFxuICAgIHJlbGF0aW9uc2hpcHM6IFsnY3JlYXRlJywgJ3JlYWQnLCAndXBkYXRlJywgJ2RlbGV0ZSddLFxuICAgIG90aGVyOiBbJ3F1ZXJ5J10sXG4gIH0sXG4gIHNvY2tldEhhbmRsZXJzOiBbQXV0aGVudGljYXRpb25DaGFubmVsXSxcbiAgY29udHJvbGxlcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0IGltcGxlbWVudHMgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcbiAgcHVibGljIGV4dGVuc2lvbnM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFN0cnV0U2VydmljZXMgPSB7fVxuICApIHtcbiAgICB0aGlzLnNlcnZpY2VzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgICB0aGlzLnNlcnZpY2VzLnBsdW1wID0gcGx1bXA7XG4gICAgdGhpcy5jb25maWcgPSBtZXJnZU9wdGlvbnMoe30sIGRlZmF1bHRTZXR0aW5ncywgY29uZik7XG4gIH1cblxuICBwcmVSb3V0ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy50b2tlblN0b3JlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoYmVhcmVyKS50aGVuKCgpID0+XG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmF1dGguc3RyYXRlZ3koJ3Rva2VuJywgJ2JlYXJlci1hY2Nlc3MtdG9rZW4nLCB7XG4gICAgICAgICAgICB2YWxpZGF0ZUZ1bmM6ICh0b2tlbiwgY2FsbGJhY2spID0+XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZXMudG9rZW5TdG9yZS52YWxpZGF0ZSh0b2tlbiwgY2FsbGJhY2spLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcmVJbml0KCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoQmVsbCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhdGUoJ2F1dGhOb25jZScsIHtcbiAgICAgICAgICB0dGw6IG51bGwsXG4gICAgICAgICAgaXNTZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIGlzSHR0cE9ubHk6IGZhbHNlLFxuICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0anNvbicsXG4gICAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSwgLy8gZG9uJ3QgYWxsb3cgdmlvbGF0aW9ucyBvZiBSRkMgNjI2NVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcmVJbml0KClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMucHJlUm91dGUoKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICh0aGlzLmNvbmZpZy5tb2RlbHMgfHwgdGhpcy5zZXJ2aWNlcy5wbHVtcC5nZXRUeXBlcygpXG4gICAgICAgICAgKS5tYXAoKHQ6IHR5cGVvZiBNb2RlbCkgPT4ge1xuICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgICAgICBwbHVnaW4oXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbGxlcnNbdC50eXBlXSB8fFxuICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVmYXVsdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgY29yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uOiAndG9rZW4nLFxuICAgICAgICAgICAgICAgICAgbW9kZWw6IHQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHt0LnR5cGV9YCB9IH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgY29uZmlndXJlQXV0aCh0aGlzKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgcHJlZml4OiB0aGlzLmNvbmZpZy5hdXRoUm9vdCB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaW8gPSBTb2NrZXRJTyh0aGlzLnNlcnZpY2VzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgICB0aGlzLmNvbmZpZy5zb2NrZXRIYW5kbGVycy5mb3JFYWNoKGggPT4gZGlzcGF0Y2goaCwgdGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICBiYXNlVXJsKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5hcGlQb3J0KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhcnQoKTtcbiAgfVxufVxuIl19
