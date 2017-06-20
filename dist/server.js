"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var base_1 = require("./base");
var channels_1 = require("./socket/channels");
var authentication_1 = require("./authentication");
var defaultSettings = {
    apiRoot: '/api',
    authTypes: [],
    apiPort: 3000,
    authRoot: '/auth',
    hostName: 'localhost',
    apiProtocol: 'https',
};
var StrutServer = (function () {
    function StrutServer(plump, oracle, conf) {
        this.plump = plump;
        this.oracle = oracle;
        this.hapi = new Hapi.Server();
        this.config = Object.assign({}, defaultSettings, conf);
    }
    StrutServer.prototype.initialize = function () {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.hapi.connection({ port: _this.config.apiPort });
            return _this.hapi.register(Bell);
        })
            .then(function () {
            _this.hapi.state('authNonce', {
                ttl: null,
                isSecure: false,
                isHttpOnly: false,
                encoding: 'base64json',
                clearInvalid: false,
                strictHeader: true,
            });
            return Promise.all((_this.config.models || _this.plump.getTypes()).map(function (t) {
                return _this.hapi.register(new base_1.BaseController(_this.plump, t)
                    .plugin, { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        })
            .then(function () {
            return _this.hapi.register(authentication_1.configureAuth(_this), {
                routes: { prefix: _this.config.authRoot },
            });
        })
            .then(function () {
            _this.hapi.ext('onPreAuth', function (request, reply) {
                request.connection.info.protocol = _this.config.apiProtocol;
                return reply.continue();
            });
        })
            .then(function () {
            _this.io = SocketIO(_this.hapi.listener);
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
        return this.hapi.start();
    };
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SixLQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLG1CQUFRLENBQUMsS0FBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNkJBQU8sR0FBUDtRQUNFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLFdBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFNBQUksSUFBSSxDQUFDLE1BQU07aUJBQ3ZFLE9BQVMsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsV0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsU0FBSSxJQUFJLENBQUMsTUFBTTtpQkFDdkUsT0FBUyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCwyQkFBSyxHQUFMO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FyRUEsQUFxRUMsSUFBQTtBQXJFWSxrQ0FBVyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvJztcbmltcG9ydCAqIGFzIEJlbGwgZnJvbSAnYmVsbCc7XG5pbXBvcnQgeyBQbHVtcCwgTW9kZWwsIE9yYWNsZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi9zb2NrZXQvY2hhbm5lbHMnO1xuaW1wb3J0IHsgY29uZmlndXJlQXV0aCwgQXV0aGVudGljYXRpb25TdHJhdGVneSB9IGZyb20gJy4vYXV0aGVudGljYXRpb24nO1xuaW1wb3J0IHVsaWQgZnJvbSAndWxpZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRDb25maWcge1xuICBtb2RlbHM/OiB0eXBlb2YgTW9kZWxbXTtcbiAgYXBpUm9vdDogc3RyaW5nO1xuICBhcGlQcm90b2NvbDogJ2h0dHAnIHwgJ2h0dHBzJztcbiAgYXV0aFR5cGVzOiBBdXRoZW50aWNhdGlvblN0cmF0ZWd5W107XG4gIGFwaVBvcnQ6IG51bWJlcjtcbiAgaG9zdE5hbWU6IHN0cmluZztcbiAgYXV0aFJvb3Q6IHN0cmluZztcbn1cblxuY29uc3QgZGVmYXVsdFNldHRpbmdzOiBTdHJ1dENvbmZpZyA9IHtcbiAgYXBpUm9vdDogJy9hcGknLFxuICBhdXRoVHlwZXM6IFtdLFxuICBhcGlQb3J0OiAzMDAwLFxuICBhdXRoUm9vdDogJy9hdXRoJyxcbiAgaG9zdE5hbWU6ICdsb2NhbGhvc3QnLFxuICBhcGlQcm90b2NvbDogJ2h0dHBzJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdHJ1dFNlcnZlciB7XG4gIHB1YmxpYyBoYXBpOiBIYXBpLlNlcnZlcjtcbiAgcHVibGljIGlvOiBTb2NrZXRJTy5TZXJ2ZXI7XG4gIHB1YmxpYyBjb25maWc6IFN0cnV0Q29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBwbHVtcDogUGx1bXAsXG4gICAgcHVibGljIG9yYWNsZTogT3JhY2xlLFxuICAgIGNvbmY6IFBhcnRpYWw8U3RydXRDb25maWc+LFxuICApIHtcbiAgICB0aGlzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRTZXR0aW5ncywgY29uZik7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmhhcGkucmVnaXN0ZXIoQmVsbCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmhhcGkuc3RhdGUoJ2F1dGhOb25jZScsIHtcbiAgICAgICAgICB0dGw6IG51bGwsXG4gICAgICAgICAgaXNTZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIGlzSHR0cE9ubHk6IGZhbHNlLFxuICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0anNvbicsXG4gICAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSwgLy8gZG9uJ3QgYWxsb3cgdmlvbGF0aW9ucyBvZiBSRkMgNjI2NVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgICh0aGlzLmNvbmZpZy5tb2RlbHMgfHwgdGhpcy5wbHVtcC5nZXRUeXBlcygpKS5tYXAodCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgICAgICBuZXcgQmFzZUNvbnRyb2xsZXIodGhpcy5wbHVtcCwgdClcbiAgICAgICAgICAgICAgICAucGx1Z2luIGFzIEhhcGkuUGx1Z2luRnVuY3Rpb248e30+LFxuICAgICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICB0aGlzLmhhcGkucmVnaXN0ZXIoY29uZmlndXJlQXV0aCh0aGlzKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9Piwge1xuICAgICAgICAgIHJvdXRlczogeyBwcmVmaXg6IHRoaXMuY29uZmlnLmF1dGhSb290IH0sXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgICBkaXNwYXRjaCh0aGlzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgYmFzZVVybCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcuYXBpUG9ydCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmFwaVByb3RvY29sfTovLyR7dGhpcy5jb25maWcuaG9zdE5hbWV9OiR7dGhpcy5jb25maWdcbiAgICAgICAgLmFwaVBvcnR9YDtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXBpLnN0YXJ0KCk7XG4gIH1cbn1cbiJdfQ==
