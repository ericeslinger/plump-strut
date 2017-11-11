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
            return this.config.apiProtocol + "://" + this.config.apiHostname + ":" + this
                .config.apiPort;
        }
        else {
            return this.config.apiProtocol + "://" + this.config.apiHostname + ":" + this
                .config.apiPort;
        }
    };
    Strut.prototype.start = function () {
        return this.services.hapi.start();
    };
    return Strut;
}());
exports.Strut = Strut;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNKLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RCxLQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxtQkFBUSxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHVCQUFPLEdBQVA7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxXQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxTQUFJLElBQUk7aUJBQ25FLE1BQU0sQ0FBQyxPQUFTLENBQUM7UUFDdEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxXQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxTQUFJLElBQUk7aUJBQ25FLE1BQU0sQ0FBQyxPQUFTLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBSyxHQUFMO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFDSCxZQUFDO0FBQUQsQ0F4SEEsQUF3SEMsSUFBQTtBQXhIWSxzQkFBSyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvJztcbmltcG9ydCAqIGFzIEJlbGwgZnJvbSAnYmVsbCc7XG5pbXBvcnQgKiBhcyBiZWFyZXIgZnJvbSAnaGFwaS1hdXRoLWJlYXJlci10b2tlbic7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5pbXBvcnQgeyBQbHVtcCwgTW9kZWwsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQge1xuICBUb2tlblNlcnZpY2UsXG4gIFJvdXRlT3B0aW9ucyxcbiAgUm91dGVHZW5lcmF0b3IsXG4gIFN0cnV0Q29uZmlnLFxuICBTdHJ1dFNlcnZpY2VzLFxuICBBdXRoZW50aWNhdGlvblN0cmF0ZWd5LFxuICBTdHJ1dFNlcnZlcixcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuXG5pbXBvcnQgeyBjb25maWd1cmVBdXRoIH0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4vc29ja2V0L2Rpc3BhdGNoJztcbmltcG9ydCB7IGJhc2UgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgam9pIH0gZnJvbSAnLi9qb2knO1xuaW1wb3J0IHsgYXV0aG9yaXplIH0gZnJvbSAnLi9hdXRob3JpemUnO1xuaW1wb3J0IHsgQXV0aGVudGljYXRpb25DaGFubmVsIH0gZnJvbSAnLi9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbCc7XG5pbXBvcnQgeyBoYW5kbGUgfSBmcm9tICcuL2hhbmRsZSc7XG5pbXBvcnQgeyBwbHVnaW4gfSBmcm9tICcuL3BsdWdpbic7XG5cbmNvbnN0IGRlZmF1bHRTZXR0aW5nczogU3RydXRDb25maWcgPSB7XG4gIGFwaVJvb3Q6ICcvYXBpJyxcbiAgYXV0aFR5cGVzOiBbXSxcbiAgYXBpUG9ydDogMzAwMCxcbiAgYXV0aFJvb3Q6ICcvYXV0aCcsXG4gIGFwaUhvc3RuYW1lOiAnbG9jYWxob3N0JyxcbiAgYXBpUHJvdG9jb2w6ICdodHRwcycsXG4gIHJvdXRlT3B0aW9uczoge30sXG4gIGRlZmF1bHRDb250cm9sbGVyOiB7XG4gICAgZ2VuZXJhdG9yczogW2Jhc2UsIGpvaSwgYXV0aG9yaXplLCBoYW5kbGVdLFxuICAgIGF0dHJpYnV0ZXM6IFsnY3JlYXRlJywgJ3JlYWQnLCAndXBkYXRlJywgJ2RlbGV0ZSddLFxuICAgIHJlbGF0aW9uc2hpcHM6IFsnY3JlYXRlJywgJ3JlYWQnLCAndXBkYXRlJywgJ2RlbGV0ZSddLFxuICAgIG90aGVyOiBbJ3F1ZXJ5J10sXG4gIH0sXG4gIHNvY2tldEhhbmRsZXJzOiBbQXV0aGVudGljYXRpb25DaGFubmVsXSxcbiAgbW9kZWxDb250cm9sbGVyczoge30sXG59O1xuXG5leHBvcnQgY2xhc3MgU3RydXQgaW1wbGVtZW50cyBTdHJ1dFNlcnZlciB7XG4gIHB1YmxpYyBjb25maWc6IFN0cnV0Q29uZmlnO1xuICBwdWJsaWMgZXh0ZW5zaW9uczogYW55ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcGx1bXA6IFBsdW1wLFxuICAgIGNvbmY6IFBhcnRpYWw8U3RydXRDb25maWc+LFxuICAgIHB1YmxpYyBzZXJ2aWNlczogU3RydXRTZXJ2aWNlcyA9IHt9LFxuICApIHtcbiAgICB0aGlzLnNlcnZpY2VzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgICB0aGlzLnNlcnZpY2VzLnBsdW1wID0gcGx1bXA7XG4gICAgdGhpcy5jb25maWcgPSBtZXJnZU9wdGlvbnMoe30sIGRlZmF1bHRTZXR0aW5ncywgY29uZik7XG4gIH1cblxuICBwcmVSb3V0ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy50b2tlblN0b3JlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoYmVhcmVyKS50aGVuKCgpID0+XG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmF1dGguc3RyYXRlZ3koJ3Rva2VuJywgJ2JlYXJlci1hY2Nlc3MtdG9rZW4nLCB7XG4gICAgICAgICAgICB2YWxpZGF0ZUZ1bmM6ICh0b2tlbiwgY2FsbGJhY2spID0+XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZXMudG9rZW5TdG9yZS52YWxpZGF0ZSh0b2tlbiwgY2FsbGJhY2spLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJlSW5pdCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmNvbm5lY3Rpb24oeyBwb3J0OiB0aGlzLmNvbmZpZy5hcGlQb3J0IH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKEJlbGwpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXRlKCdhdXRoTm9uY2UnLCB7XG4gICAgICAgICAgdHRsOiBudWxsLFxuICAgICAgICAgIGlzU2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICBpc0h0dHBPbmx5OiBmYWxzZSxcbiAgICAgICAgICBlbmNvZGluZzogJ2Jhc2U2NGpzb24nLFxuICAgICAgICAgIGNsZWFySW52YWxpZDogZmFsc2UsIC8vIHJlbW92ZSBpbnZhbGlkIGNvb2tpZXNcbiAgICAgICAgICBzdHJpY3RIZWFkZXI6IHRydWUsIC8vIGRvbid0IGFsbG93IHZpb2xhdGlvbnMgb2YgUkZDIDYyNjVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJlSW5pdCgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnByZVJvdXRlKCkpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAodGhpcy5jb25maWcubW9kZWxzIHx8IHRoaXMuc2VydmljZXMucGx1bXAuZ2V0VHlwZXMoKVxuICAgICAgICAgICkubWFwKCh0OiB0eXBlb2YgTW9kZWwpID0+IHtcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICAgICAgcGx1Z2luKFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm1vZGVsQ29udHJvbGxlcnNbdC50eXBlXSB8fFxuICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVmYXVsdENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgY29yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uOiAndG9rZW4nLFxuICAgICAgICAgICAgICAgICAgbW9kZWw6IHQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5leHRyYUNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgdGhpcy5jb25maWcuZXh0cmFDb250cm9sbGVycy5tYXAoY3RybCA9PlxuICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgICAgICAgcGx1Z2luKFxuICAgICAgICAgICAgICAgICAgY3RybCxcbiAgICAgICAgICAgICAgICAgIHsgY29yczogdHJ1ZSwgYXV0aGVudGljYXRpb246ICd0b2tlbicsIHJvdXRlTmFtZTogY3RybC5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke2N0cmwubmFtZX1gIH0gfSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgY29uZmlndXJlQXV0aCh0aGlzKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb3V0ZXM6IHsgcHJlZml4OiB0aGlzLmNvbmZpZy5hdXRoUm9vdCB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICksXG4gICAgICApXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICAgIHJlcXVlc3QuY29ubmVjdGlvbi5pbmZvLnByb3RvY29sID0gdGhpcy5jb25maWcuYXBpUHJvdG9jb2w7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5pbyA9IFNvY2tldElPKHRoaXMuc2VydmljZXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICAgIHRoaXMuY29uZmlnLnNvY2tldEhhbmRsZXJzLmZvckVhY2goaCA9PiBkaXNwYXRjaChoLCB0aGlzKSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGJhc2VVcmwoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmFwaVBvcnQpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmFwaUhvc3RuYW1lfToke3RoaXNcbiAgICAgICAgLmNvbmZpZy5hcGlQb3J0fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmFwaUhvc3RuYW1lfToke3RoaXNcbiAgICAgICAgLmNvbmZpZy5hcGlQb3J0fWA7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXJ0KCk7XG4gIH1cbn1cbiJdfQ==
