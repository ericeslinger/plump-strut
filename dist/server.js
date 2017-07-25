"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var bearer = require("hapi-auth-bearer-token");
var mergeOptions = require("merge-options");
var channels_1 = require("./socket/channels");
var authentication_1 = require("./authentication");
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
    defaultRouteGenerator: {
        base: base_1.base,
        joi: joi_1.joi,
        authorize: authorize_1.authorize,
        handle: handle_1.handle,
    },
    routeGenerators: {},
};
var StrutServer = (function () {
    function StrutServer(plump, conf, services) {
        if (services === void 0) { services = {}; }
        this.services = services;
        this.services.hapi = new Hapi.Server();
        this.services.plump = plump;
        this.config = mergeOptions({}, defaultSettings, conf);
    }
    StrutServer.prototype.preRoute = function () {
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
    StrutServer.prototype.preInit = function () {
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
    StrutServer.prototype.initialize = function () {
        var _this = this;
        return this.preInit()
            .then(function () { return _this.preRoute(); })
            .then(function () {
            return Promise.all((_this.config.models || _this.services.plump.getTypes())
                .map(function (t) {
                return _this.services.hapi.register(plugin_1.plugin(Object.assign({}, _this.config.defaultRouteGenerator, _this.config.routeGenerators[t.type]), {
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
            channels_1.dispatch(_this);
        });
    };
    StrutServer.prototype.baseUrl = function () {
        if (this.config.apiPort) {
            return this.config.apiProtocol + "://" + this.config.hostName + ":" + this.config
                .apiPort;
        }
        else {
            return this.config.apiProtocol + "://" + this.config.hostName + ":" + this.config
                .apiPort;
        }
    };
    StrutServer.prototype.start = function () {
        return this.services.hapi.start();
    };
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0ICogYXMgYmVhcmVyIGZyb20gJ2hhcGktYXV0aC1iZWFyZXItdG9rZW4nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBUZXJtaW5hbFN0b3JlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9jaGFubmVscyc7XG5pbXBvcnQgeyBjb25maWd1cmVBdXRoIH0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQge1xuICBUb2tlblNlcnZpY2UsXG4gIFN0cnV0U2VydmljZXMsXG4gIFN0cnV0Q29uZmlnLFxuICBBdXRoZW50aWNhdGlvblN0cmF0ZWd5LFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5cbmltcG9ydCB7IGJhc2UgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgam9pIH0gZnJvbSAnLi9qb2knO1xuaW1wb3J0IHsgYXV0aG9yaXplIH0gZnJvbSAnLi9hdXRob3JpemUnO1xuaW1wb3J0IHsgaGFuZGxlIH0gZnJvbSAnLi9oYW5kbGUnO1xuaW1wb3J0IHsgcGx1Z2luIH0gZnJvbSAnLi9wbHVnaW4nO1xuXG5jb25zdCBkZWZhdWx0U2V0dGluZ3M6IFN0cnV0Q29uZmlnID0ge1xuICBhcGlSb290OiAnL2FwaScsXG4gIGF1dGhUeXBlczogW10sXG4gIGFwaVBvcnQ6IDMwMDAsXG4gIGF1dGhSb290OiAnL2F1dGgnLFxuICBob3N0TmFtZTogJ2xvY2FsaG9zdCcsXG4gIGFwaVByb3RvY29sOiAnaHR0cHMnLFxuICByb3V0ZU9wdGlvbnM6IHt9LFxuICBkZWZhdWx0Um91dGVHZW5lcmF0b3I6IHtcbiAgICBiYXNlLFxuICAgIGpvaSxcbiAgICBhdXRob3JpemUsXG4gICAgaGFuZGxlLFxuICB9LFxuICByb3V0ZUdlbmVyYXRvcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0U2VydmVyIHtcbiAgcHVibGljIGNvbmZpZzogU3RydXRDb25maWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcGx1bXA6IFBsdW1wLFxuICAgIGNvbmY6IFBhcnRpYWw8U3RydXRDb25maWc+LFxuICAgIHB1YmxpYyBzZXJ2aWNlczogU3RydXRTZXJ2aWNlcyA9IHt9XG4gICkge1xuICAgIHRoaXMuc2VydmljZXMuaGFwaSA9IG5ldyBIYXBpLlNlcnZlcigpO1xuICAgIHRoaXMuc2VydmljZXMucGx1bXAgPSBwbHVtcDtcbiAgICB0aGlzLmNvbmZpZyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdFNldHRpbmdzLCBjb25mKTtcbiAgfVxuXG4gIHByZVJvdXRlKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihiZWFyZXIpLnRoZW4oKCkgPT5cbiAgICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuYXV0aC5zdHJhdGVneSgndG9rZW4nLCAnYmVhcmVyLWFjY2Vzcy10b2tlbicsIHtcbiAgICAgICAgICAgIHZhbGlkYXRlRnVuYzogKHRva2VuLCBjYWxsYmFjaykgPT5cbiAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcy50b2tlblN0b3JlLnZhbGlkYXRlKHRva2VuLCBjYWxsYmFjayksXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByZUluaXQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgICBpc1NlY3VyZTogZmFsc2UsXG4gICAgICAgICAgaXNIdHRwT25seTogZmFsc2UsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgICAgc3RyaWN0SGVhZGVyOiB0cnVlLCAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKCkpXG4gICAgICAgICAgICAubWFwKCh0OiB0eXBlb2YgTW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgICAgcGx1Z2luKFxuICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmRlZmF1bHRSb3V0ZUdlbmVyYXRvcixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcucm91dGVHZW5lcmF0b3JzW3QudHlwZV1cbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvcnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uOiAndG9rZW4nLFxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICBjb25maWd1cmVBdXRoKHRoaXMpIGFzIEhhcGkuUGx1Z2luRnVuY3Rpb248e30+LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJvdXRlczogeyBwcmVmaXg6IHRoaXMuY29uZmlnLmF1dGhSb290IH0sXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICAgIHJlcXVlc3QuY29ubmVjdGlvbi5pbmZvLnByb3RvY29sID0gdGhpcy5jb25maWcuYXBpUHJvdG9jb2w7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5pbyA9IFNvY2tldElPKHRoaXMuc2VydmljZXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICAgIGRpc3BhdGNoKHRoaXMpO1xuICAgICAgfSk7XG4gIH1cblxuICBiYXNlVXJsKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5hcGlQb3J0KSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcuYXBpUHJvdG9jb2x9Oi8vJHt0aGlzLmNvbmZpZy5ob3N0TmFtZX06JHt0aGlzLmNvbmZpZ1xuICAgICAgICAuYXBpUG9ydH1gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhcnQoKTtcbiAgfVxufVxuIl19
