"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var base_1 = require("./base");
var channels_1 = require("./socket/channels");
var authentication_1 = require("./authentication");
var bearer = require("hapi-auth-bearer-token");
var mergeOptions = require("merge-options");
var defaultSettings = {
    apiRoot: '/api',
    authTypes: [],
    apiPort: 3000,
    authRoot: '/auth',
    hostName: 'localhost',
    apiProtocol: 'https',
    routeOptions: {},
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
            return Promise.all((_this.config.models || _this.services.plump.getTypes()).map(function (t) {
                return _this.services.hapi.register(new base_1.BaseController(_this, t, _this.config.routeOptions)
                    .plugin, { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELG1CQUFRLENBQUMsS0FBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNkJBQU8sR0FBUDtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLFdBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFNBQUksSUFBSSxDQUFDLE1BQU07aUJBQ3ZFLE9BQVMsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsV0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsU0FBSSxJQUFJLENBQUMsTUFBTTtpQkFDdkUsT0FBUyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCwyQkFBSyxHQUFMO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDSCxrQkFBQztBQUFELENBM0ZBLEFBMkZDLElBQUE7QUEzRlksa0NBQVciLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBUZXJtaW5hbFN0b3JlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHsgQmFzZUNvbnRyb2xsZXIgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgUm91dGVPcHRpb25zIH0gZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9jaGFubmVscyc7XG5pbXBvcnQge1xuICBjb25maWd1cmVBdXRoLFxuICBUb2tlblNlcnZpY2UsXG4gIEF1dGhlbnRpY2F0aW9uU3RyYXRlZ3ksXG59IGZyb20gJy4vYXV0aGVudGljYXRpb24nO1xuaW1wb3J0ICogYXMgYmVhcmVyIGZyb20gJ2hhcGktYXV0aC1iZWFyZXItdG9rZW4nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0cnV0Q29uZmlnIHtcbiAgbW9kZWxzPzogdHlwZW9mIE1vZGVsW107XG4gIGFwaVJvb3Q6IHN0cmluZztcbiAgYXBpUHJvdG9jb2w6ICdodHRwJyB8ICdodHRwcyc7XG4gIGF1dGhUeXBlczogQXV0aGVudGljYXRpb25TdHJhdGVneVtdO1xuICBhcGlQb3J0OiBudW1iZXI7XG4gIGhvc3ROYW1lOiBzdHJpbmc7XG4gIGF1dGhSb290OiBzdHJpbmc7XG4gIHJvdXRlT3B0aW9uczogUGFydGlhbDxSb3V0ZU9wdGlvbnM+O1xufVxuXG5jb25zdCBkZWZhdWx0U2V0dGluZ3M6IFN0cnV0Q29uZmlnID0ge1xuICBhcGlSb290OiAnL2FwaScsXG4gIGF1dGhUeXBlczogW10sXG4gIGFwaVBvcnQ6IDMwMDAsXG4gIGF1dGhSb290OiAnL2F1dGgnLFxuICBob3N0TmFtZTogJ2xvY2FsaG9zdCcsXG4gIGFwaVByb3RvY29sOiAnaHR0cHMnLFxuICByb3V0ZU9wdGlvbnM6IHt9LFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBTdHJ1dFNlcnZpY2VzIHtcbiAgaGFwaTogSGFwaS5TZXJ2ZXI7XG4gIGlvOiBTb2NrZXRJTy5TZXJ2ZXI7XG4gIHBsdW1wOiBQbHVtcDtcbiAgdG9rZW5TdG9yZTogVG9rZW5TZXJ2aWNlO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBTdHJ1dFNlcnZlciB7XG4gIHB1YmxpYyBjb25maWc6IFN0cnV0Q29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFBhcnRpYWw8U3RydXRTZXJ2aWNlcz4gPSB7fSxcbiAgKSB7XG4gICAgdGhpcy5zZXJ2aWNlcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5zZXJ2aWNlcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuY29uZmlnID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgcHJlUm91dGUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMudG9rZW5TdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKGJlYXJlcikudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5hdXRoLnN0cmF0ZWd5KCd0b2tlbicsICdiZWFyZXItYWNjZXNzLXRva2VuJywge1xuICAgICAgICAgICAgdmFsaWRhdGVGdW5jOiAodG9rZW4sIGNhbGxiYWNrKSA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUudmFsaWRhdGUodG9rZW4sIGNhbGxiYWNrKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByZUluaXQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgICBpc1NlY3VyZTogZmFsc2UsXG4gICAgICAgICAgaXNIdHRwT25seTogZmFsc2UsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgICAgc3RyaWN0SGVhZGVyOiB0cnVlLCAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKCkpLm1hcCh0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgIG5ldyBCYXNlQ29udHJvbGxlcih0aGlzLCB0LCB0aGlzLmNvbmZpZy5yb3V0ZU9wdGlvbnMpXG4gICAgICAgICAgICAgICAgLnBsdWdpbiBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke3QudHlwZX1gIH0gfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIGNvbmZpZ3VyZUF1dGgodGhpcykgYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfSxcbiAgICAgICAgICB9LFxuICAgICAgICApLFxuICAgICAgKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaW8gPSBTb2NrZXRJTyh0aGlzLnNlcnZpY2VzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgICBkaXNwYXRjaCh0aGlzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgYmFzZVVybCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcuYXBpUG9ydCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXJ0KCk7XG4gIH1cbn1cbiJdfQ==
