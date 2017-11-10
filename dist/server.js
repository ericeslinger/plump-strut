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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNKLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RCxLQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxtQkFBUSxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHVCQUFPLEdBQVA7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxXQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxTQUFJLElBQUksQ0FBQyxNQUFNO2lCQUN2RSxPQUFTLENBQUM7UUFDZixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLFdBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFNBQUksSUFBSSxDQUFDLE1BQU07aUJBQ3ZFLE9BQVMsQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQscUJBQUssR0FBTDtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBQ0gsWUFBQztBQUFELENBeEhBLEFBd0hDLElBQUE7QUF4SFksc0JBQUsiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0ICogYXMgYmVhcmVyIGZyb20gJ2hhcGktYXV0aC1iZWFyZXItdG9rZW4nO1xuaW1wb3J0ICogYXMgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBUZXJtaW5hbFN0b3JlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHtcbiAgVG9rZW5TZXJ2aWNlLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFJvdXRlR2VuZXJhdG9yLFxuICBTdHJ1dENvbmZpZyxcbiAgU3RydXRTZXJ2aWNlcyxcbiAgQXV0aGVudGljYXRpb25TdHJhdGVneSxcbiAgU3RydXRTZXJ2ZXIsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcblxuaW1wb3J0IHsgY29uZmlndXJlQXV0aCB9IGZyb20gJy4vYXV0aGVudGljYXRpb24nO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9kaXNwYXRjaCc7XG5pbXBvcnQgeyBiYXNlIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IGpvaSB9IGZyb20gJy4vam9pJztcbmltcG9ydCB7IGF1dGhvcml6ZSB9IGZyb20gJy4vYXV0aG9yaXplJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0aW9uQ2hhbm5lbCB9IGZyb20gJy4vc29ja2V0L2F1dGhlbnRpY2F0aW9uLmNoYW5uZWwnO1xuaW1wb3J0IHsgaGFuZGxlIH0gZnJvbSAnLi9oYW5kbGUnO1xuaW1wb3J0IHsgcGx1Z2luIH0gZnJvbSAnLi9wbHVnaW4nO1xuXG5jb25zdCBkZWZhdWx0U2V0dGluZ3M6IFN0cnV0Q29uZmlnID0ge1xuICBhcGlSb290OiAnL2FwaScsXG4gIGF1dGhUeXBlczogW10sXG4gIGFwaVBvcnQ6IDMwMDAsXG4gIGF1dGhSb290OiAnL2F1dGgnLFxuICBob3N0TmFtZTogJ2xvY2FsaG9zdCcsXG4gIGFwaVByb3RvY29sOiAnaHR0cHMnLFxuICByb3V0ZU9wdGlvbnM6IHt9LFxuICBkZWZhdWx0Q29udHJvbGxlcjoge1xuICAgIGdlbmVyYXRvcnM6IFtiYXNlLCBqb2ksIGF1dGhvcml6ZSwgaGFuZGxlXSxcbiAgICBhdHRyaWJ1dGVzOiBbJ2NyZWF0ZScsICdyZWFkJywgJ3VwZGF0ZScsICdkZWxldGUnXSxcbiAgICByZWxhdGlvbnNoaXBzOiBbJ2NyZWF0ZScsICdyZWFkJywgJ3VwZGF0ZScsICdkZWxldGUnXSxcbiAgICBvdGhlcjogWydxdWVyeSddLFxuICB9LFxuICBzb2NrZXRIYW5kbGVyczogW0F1dGhlbnRpY2F0aW9uQ2hhbm5lbF0sXG4gIG1vZGVsQ29udHJvbGxlcnM6IHt9LFxufTtcblxuZXhwb3J0IGNsYXNzIFN0cnV0IGltcGxlbWVudHMgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcbiAgcHVibGljIGV4dGVuc2lvbnM6IGFueSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBsdW1wOiBQbHVtcCxcbiAgICBjb25mOiBQYXJ0aWFsPFN0cnV0Q29uZmlnPixcbiAgICBwdWJsaWMgc2VydmljZXM6IFN0cnV0U2VydmljZXMgPSB7fVxuICApIHtcbiAgICB0aGlzLnNlcnZpY2VzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgICB0aGlzLnNlcnZpY2VzLnBsdW1wID0gcGx1bXA7XG4gICAgdGhpcy5jb25maWcgPSBtZXJnZU9wdGlvbnMoe30sIGRlZmF1bHRTZXR0aW5ncywgY29uZik7XG4gIH1cblxuICBwcmVSb3V0ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy50b2tlblN0b3JlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoYmVhcmVyKS50aGVuKCgpID0+XG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmF1dGguc3RyYXRlZ3koJ3Rva2VuJywgJ2JlYXJlci1hY2Nlc3MtdG9rZW4nLCB7XG4gICAgICAgICAgICB2YWxpZGF0ZUZ1bmM6ICh0b2tlbiwgY2FsbGJhY2spID0+XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZXMudG9rZW5TdG9yZS52YWxpZGF0ZSh0b2tlbiwgY2FsbGJhY2spLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcmVJbml0KCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoQmVsbCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkuc3RhdGUoJ2F1dGhOb25jZScsIHtcbiAgICAgICAgICB0dGw6IG51bGwsXG4gICAgICAgICAgaXNTZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIGlzSHR0cE9ubHk6IGZhbHNlLFxuICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0anNvbicsXG4gICAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSwgLy8gZG9uJ3QgYWxsb3cgdmlvbGF0aW9ucyBvZiBSRkMgNjI2NVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcmVJbml0KClcbiAgICAgIC50aGVuKCgpID0+IHRoaXMucHJlUm91dGUoKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICh0aGlzLmNvbmZpZy5tb2RlbHMgfHwgdGhpcy5zZXJ2aWNlcy5wbHVtcC5nZXRUeXBlcygpXG4gICAgICAgICAgKS5tYXAoKHQ6IHR5cGVvZiBNb2RlbCkgPT4ge1xuICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgICAgICBwbHVnaW4oXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubW9kZWxDb250cm9sbGVyc1t0LnR5cGVdIHx8XG4gICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5kZWZhdWx0Q29udHJvbGxlcixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBjb3JzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgYXV0aGVudGljYXRpb246ICd0b2tlbicsXG4gICAgICAgICAgICAgICAgICBtb2RlbDogdCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZXNcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke3QudHlwZX1gIH0gfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmV4dHJhQ29udHJvbGxlcnMpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5leHRyYUNvbnRyb2xsZXJzLm1hcChjdHJsID0+XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICAgICAgICBwbHVnaW4oXG4gICAgICAgICAgICAgICAgICBjdHJsLFxuICAgICAgICAgICAgICAgICAgeyBjb3JzOiB0cnVlLCBhdXRoZW50aWNhdGlvbjogJ3Rva2VuJywgcm91dGVOYW1lOiBjdHJsLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZXNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHtjdHJsLm5hbWV9YCB9IH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIGNvbmZpZ3VyZUF1dGgodGhpcykgYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfSxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmV4dCgnb25QcmVBdXRoJywgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgICAgcmVxdWVzdC5jb25uZWN0aW9uLmluZm8ucHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5hcGlQcm90b2NvbDtcbiAgICAgICAgICByZXR1cm4gcmVwbHkuY29udGludWUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmlvID0gU29ja2V0SU8odGhpcy5zZXJ2aWNlcy5oYXBpLmxpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5jb25maWcuc29ja2V0SGFuZGxlcnMuZm9yRWFjaChoID0+IGRpc3BhdGNoKGgsIHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgYmFzZVVybCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcuYXBpUG9ydCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXJ0KCk7XG4gIH1cbn1cbiJdfQ==
