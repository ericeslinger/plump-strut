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
    defaultRouteGenerator: {
        base: base_1.base,
        joi: joi_1.joi,
        authorize: authorize_1.authorize,
        handle: handle_1.handle,
    },
    routeGenerators: {},
};
var Strut = (function () {
    function Strut(plump, conf, services) {
        if (services === void 0) { services = {}; }
        this.services = services;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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cyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0ICogYXMgQmVsbCBmcm9tICdiZWxsJztcbmltcG9ydCAqIGFzIGJlYXJlciBmcm9tICdoYXBpLWF1dGgtYmVhcmVyLXRva2VuJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcbmltcG9ydCB7IFBsdW1wLCBNb2RlbCwgVGVybWluYWxTdG9yZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCB7XG4gIFRva2VuU2VydmljZSxcbiAgUm91dGVPcHRpb25zLFxuICBSb3V0ZUdlbmVyYXRvcixcbiAgU3RydXRDb25maWcsXG4gIFN0cnV0U2VydmljZXMsXG4gIEF1dGhlbnRpY2F0aW9uU3RyYXRlZ3ksXG4gIFN0cnV0U2VydmVyLFxufSBmcm9tICcuL2RhdGFUeXBlcyc7XG5cbmltcG9ydCB7IGNvbmZpZ3VyZUF1dGggfSBmcm9tICcuL2F1dGhlbnRpY2F0aW9uJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi9zb2NrZXQuY2hhbm5lbCc7XG5pbXBvcnQgeyBiYXNlIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IGpvaSB9IGZyb20gJy4vam9pJztcbmltcG9ydCB7IGF1dGhvcml6ZSB9IGZyb20gJy4vYXV0aG9yaXplJztcbmltcG9ydCB7IGhhbmRsZSB9IGZyb20gJy4vaGFuZGxlJztcbmltcG9ydCB7IHBsdWdpbiB9IGZyb20gJy4vcGx1Z2luJztcblxuY29uc3QgZGVmYXVsdFNldHRpbmdzOiBTdHJ1dENvbmZpZyA9IHtcbiAgYXBpUm9vdDogJy9hcGknLFxuICBhdXRoVHlwZXM6IFtdLFxuICBhcGlQb3J0OiAzMDAwLFxuICBhdXRoUm9vdDogJy9hdXRoJyxcbiAgaG9zdE5hbWU6ICdsb2NhbGhvc3QnLFxuICBhcGlQcm90b2NvbDogJ2h0dHBzJyxcbiAgcm91dGVPcHRpb25zOiB7fSxcbiAgZGVmYXVsdFJvdXRlR2VuZXJhdG9yOiB7XG4gICAgYmFzZSxcbiAgICBqb2ksXG4gICAgYXV0aG9yaXplLFxuICAgIGhhbmRsZSxcbiAgfSxcbiAgcm91dGVHZW5lcmF0b3JzOiB7fSxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdHJ1dCBpbXBsZW1lbnRzIFN0cnV0U2VydmVyIHtcbiAgcHVibGljIGNvbmZpZzogU3RydXRDb25maWc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcGx1bXA6IFBsdW1wLFxuICAgIGNvbmY6IFBhcnRpYWw8U3RydXRDb25maWc+LFxuICAgIHB1YmxpYyBzZXJ2aWNlczogU3RydXRTZXJ2aWNlcyA9IHt9LFxuICApIHtcbiAgICB0aGlzLnNlcnZpY2VzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgICB0aGlzLnNlcnZpY2VzLnBsdW1wID0gcGx1bXA7XG4gICAgdGhpcy5jb25maWcgPSBtZXJnZU9wdGlvbnMoe30sIGRlZmF1bHRTZXR0aW5ncywgY29uZik7XG4gIH1cblxuICBwcmVSb3V0ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zZXJ2aWNlcy50b2tlblN0b3JlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLmhhcGkucmVnaXN0ZXIoYmVhcmVyKS50aGVuKCgpID0+XG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmF1dGguc3RyYXRlZ3koJ3Rva2VuJywgJ2JlYXJlci1hY2Nlc3MtdG9rZW4nLCB7XG4gICAgICAgICAgICB2YWxpZGF0ZUZ1bmM6ICh0b2tlbiwgY2FsbGJhY2spID0+XG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZXMudG9rZW5TdG9yZS52YWxpZGF0ZSh0b2tlbiwgY2FsbGJhY2spLFxuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJlSW5pdCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmNvbm5lY3Rpb24oeyBwb3J0OiB0aGlzLmNvbmZpZy5hcGlQb3J0IH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5oYXBpLnJlZ2lzdGVyKEJlbGwpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLnN0YXRlKCdhdXRoTm9uY2UnLCB7XG4gICAgICAgICAgdHRsOiBudWxsLFxuICAgICAgICAgIGlzU2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICBpc0h0dHBPbmx5OiBmYWxzZSxcbiAgICAgICAgICBlbmNvZGluZzogJ2Jhc2U2NGpzb24nLFxuICAgICAgICAgIGNsZWFySW52YWxpZDogZmFsc2UsIC8vIHJlbW92ZSBpbnZhbGlkIGNvb2tpZXNcbiAgICAgICAgICBzdHJpY3RIZWFkZXI6IHRydWUsIC8vIGRvbid0IGFsbG93IHZpb2xhdGlvbnMgb2YgUkZDIDYyNjVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJlSW5pdCgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLnByZVJvdXRlKCkpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgICAgICAodGhpcy5jb25maWcubW9kZWxzIHx8IHRoaXMuc2VydmljZXMucGx1bXAuZ2V0VHlwZXMoKSlcbiAgICAgICAgICAgIC5tYXAoKHQ6IHR5cGVvZiBNb2RlbCkgPT4ge1xuICAgICAgICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICAgICAgICBwbHVnaW4oXG4gICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuZGVmYXVsdFJvdXRlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5yb3V0ZUdlbmVyYXRvcnNbdC50eXBlXSxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvcnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uOiAndG9rZW4nLFxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke3QudHlwZX1gIH0gfSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIHRoaXMuc2VydmljZXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICBjb25maWd1cmVBdXRoKHRoaXMpIGFzIEhhcGkuUGx1Z2luRnVuY3Rpb248e30+LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJvdXRlczogeyBwcmVmaXg6IHRoaXMuY29uZmlnLmF1dGhSb290IH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgKSxcbiAgICAgIClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5oYXBpLmV4dCgnb25QcmVBdXRoJywgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgICAgcmVxdWVzdC5jb25uZWN0aW9uLmluZm8ucHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5hcGlQcm90b2NvbDtcbiAgICAgICAgICByZXR1cm4gcmVwbHkuY29udGludWUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmlvID0gU29ja2V0SU8odGhpcy5zZXJ2aWNlcy5oYXBpLmxpc3RlbmVyKTtcbiAgICAgICAgZGlzcGF0Y2godGhpcyk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGJhc2VVcmwoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmFwaVBvcnQpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmhvc3ROYW1lfToke3RoaXMuY29uZmlnXG4gICAgICAgIC5hcGlQb3J0fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5hcGlQcm90b2NvbH06Ly8ke3RoaXMuY29uZmlnLmhvc3ROYW1lfToke3RoaXMuY29uZmlnXG4gICAgICAgIC5hcGlQb3J0fWA7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZXMuaGFwaS5zdGFydCgpO1xuICB9XG59XG4iXX0=
