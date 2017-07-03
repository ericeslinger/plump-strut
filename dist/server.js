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
    routeOptions: {}
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
                        }
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
                strictHeader: true
            });
        });
    };
    StrutServer.prototype.initialize = function () {
        var _this = this;
        return this.preInit()
            .then(function () { return _this.preRoute(); })
            .then(function () {
            return Promise.all((_this.config.models || _this.services.plump.getTypes()).map(function (t) {
                return _this.services.hapi.register(new base_1.BaseController(_this.services.plump, t, _this.config.routeOptions).plugin, { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        })
            .then(function () {
            return _this.services.hapi.register(authentication_1.configureAuth(_this), {
                routes: { prefix: _this.config.authRoot }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEdBQUcsUUFBUSxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELG1CQUFRLENBQUMsS0FBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNkJBQU8sR0FBUDtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLFdBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFNBQUksSUFBSSxDQUFDLE1BQU07aUJBQ3ZFLE9BQVMsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsV0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsU0FBSSxJQUFJLENBQUMsTUFBTTtpQkFDdkUsT0FBUyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCwyQkFBSyxHQUFMO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDSCxrQkFBQztBQUFELENBOUZBLEFBOEZDLElBQUE7QUE5Rlksa0NBQVciLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHsgQmFzZUNvbnRyb2xsZXIgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgUm91dGVPcHRpb25zIH0gZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9jaGFubmVscyc7XG5pbXBvcnQge1xuICBjb25maWd1cmVBdXRoLFxuICBUb2tlblNlcnZpY2UsXG4gIEF1dGhlbnRpY2F0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQgKiBhcyBiZWFyZXIgZnJvbSAnaGFwaS1hdXRoLWJlYXJlci10b2tlbic7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRDb25maWcge1xuICBtb2RlbHM/OiB0eXBlb2YgTW9kZWxbXTtcbiAgYXBpUm9vdDogc3RyaW5nO1xuICBhcGlQcm90b2NvbDogJ2h0dHAnIHwgJ2h0dHBzJztcbiAgYXV0aFR5cGVzOiBBdXRoZW50aWNhdGlvblN0cmF0ZWd5W107XG4gIGFwaVBvcnQ6IG51bWJlcjtcbiAgaG9zdE5hbWU6IHN0cmluZztcbiAgYXV0aFJvb3Q6IHN0cmluZztcbiAgcm91dGVPcHRpb25zOiBQYXJ0aWFsPFJvdXRlT3B0aW9ucz47XG59XG5cbmNvbnN0IGRlZmF1bHRTZXR0aW5nczogU3RydXRDb25maWcgPSB7XG4gIGFwaVJvb3Q6ICcvYXBpJyxcbiAgYXV0aFR5cGVzOiBbXSxcbiAgYXBpUG9ydDogMzAwMCxcbiAgYXV0aFJvb3Q6ICcvYXV0aCcsXG4gIGhvc3ROYW1lOiAnbG9jYWxob3N0JyxcbiAgYXBpUHJvdG9jb2w6ICdodHRwcycsXG4gIHJvdXRlT3B0aW9uczoge31cbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRTZXJ2aWNlcyB7XG4gIGhhcGk6IEhhcGkuU2VydmVyO1xuICBpbzogU29ja2V0SU8uU2VydmVyO1xuICBwbHVtcDogUGx1bXA7XG4gIHRva2VuU3RvcmU6IFRva2VuU2VydmljZTtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwbHVtcDogUGx1bXAsXG4gICAgY29uZjogUGFydGlhbDxTdHJ1dENvbmZpZz4sXG4gICAgcHVibGljIHNlcnZpY2VzOiBQYXJ0aWFsPFN0cnV0U2VydmljZXM+ID0ge31cbiAgKSB7XG4gICAgdGhpcy5zZXJ2aWNlcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5zZXJ2aWNlcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuY29uZmlnID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgcHJlUm91dGUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VydmljZXMudG9rZW5TdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKGJlYXJlcikudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5hdXRoLnN0cmF0ZWd5KCd0b2tlbicsICdiZWFyZXItYWNjZXNzLXRva2VuJywge1xuICAgICAgICAgICAgdmFsaWRhdGVGdW5jOiAodG9rZW4sIGNhbGxiYWNrKSA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnRva2VuU3RvcmUudmFsaWRhdGUodG9rZW4sIGNhbGxiYWNrKVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcmVJbml0KCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoQmVsbCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhdGUoJ2F1dGhOb25jZScsIHtcbiAgICAgICAgICB0dGw6IG51bGwsXG4gICAgICAgICAgaXNTZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIGlzSHR0cE9ubHk6IGZhbHNlLFxuICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0anNvbicsXG4gICAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnByZUluaXQoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5wcmVSb3V0ZSgpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnNlcnZpY2VzLnBsdW1wLmdldFR5cGVzKCkpLm1hcCh0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgIG5ldyBCYXNlQ29udHJvbGxlcihcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLnBsdW1wLFxuICAgICAgICAgICAgICAgIHQsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcucm91dGVPcHRpb25zXG4gICAgICAgICAgICAgICkucGx1Z2luIGFzIEhhcGkuUGx1Z2luRnVuY3Rpb248e30+LFxuICAgICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIGNvbmZpZ3VyZUF1dGgodGhpcykgYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaW8gPSBTb2NrZXRJTyh0aGlzLnNlcnZpY2VzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgICBkaXNwYXRjaCh0aGlzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgYmFzZVVybCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcuYXBpUG9ydCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXJ0KCk7XG4gIH1cbn1cbiJdfQ==
