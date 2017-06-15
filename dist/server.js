"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var Bell = require("bell");
var base_1 = require("./base");
var channels_1 = require("./socket/channels");
var authentication_1 = require("./authentication");
var StrutServer = (function () {
    function StrutServer(plump, oracle, config) {
        this.plump = plump;
        this.oracle = oracle;
        this.config = config;
        this.hapi = new Hapi.Server();
    }
    StrutServer.prototype.initialize = function () {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.hapi.connection({ port: _this.config.apiPort });
            return _this.hapi.register(Bell);
        }).then(function () {
            _this.hapi.state('authNonce', {
                ttl: null,
                isSecure: true,
                isHttpOnly: true,
                encoding: 'base64json',
                clearInvalid: false,
                strictHeader: true
            });
            return Promise.all((_this.config.models || _this.plump.getTypes()).map(function (t) {
                return _this.hapi.register(new base_1.BaseController(_this.plump, t).plugin, { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        })
            .then(function () { return _this.hapi.register(authentication_1.configureAuth(_this.config), { routes: { prefix: _this.config.authRoot } }); })
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
    StrutServer.prototype.start = function () {
        return this.hapi.start();
    };
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUM7SUFFSCxrQkFBQztBQUFELENBL0NBLEFBK0NDLElBQUE7QUEvQ1ksa0NBQVciLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBPcmFjbGUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4vc29ja2V0L2NoYW5uZWxzJztcbmltcG9ydCB7IGNvbmZpZ3VyZUF1dGgsIEF1dGhlbnRpY2F0aW9uVHlwZSB9IGZyb20gJy4vYXV0aGVudGljYXRpb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0cnV0Q29uZmlnIHtcbiAgbW9kZWxzPzogdHlwZW9mIE1vZGVsW107XG4gIGFwaVJvb3Q6IHN0cmluZztcbiAgYXBpUHJvdG9jb2w6ICdodHRwJyB8ICdodHRwcyc7XG4gIGF1dGhUeXBlczogQXV0aGVudGljYXRpb25UeXBlW107XG4gIGFwaVBvcnQ6IG51bWJlcjtcbiAgYXV0aFJvb3Q6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFN0cnV0U2VydmVyIHtcbiAgcHVibGljIGhhcGk6IEhhcGkuU2VydmVyO1xuICBwdWJsaWMgaW86IFNvY2tldElPLlNlcnZlcjtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwbHVtcDogUGx1bXAsIHB1YmxpYyBvcmFjbGU6IE9yYWNsZSwgcHVibGljIGNvbmZpZzogU3RydXRDb25maWcpIHtcbiAgICB0aGlzLmhhcGkgPSBuZXcgSGFwaS5TZXJ2ZXIoKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5oYXBpLmNvbm5lY3Rpb24oeyBwb3J0OiB0aGlzLmNvbmZpZy5hcGlQb3J0IH0pO1xuICAgICAgcmV0dXJuIHRoaXMuaGFwaS5yZWdpc3RlcihCZWxsKTtcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGFwaS5zdGF0ZSgnYXV0aE5vbmNlJywge1xuICAgICAgICB0dGw6IG51bGwsXG4gICAgICAgIGlzU2VjdXJlOiB0cnVlLFxuICAgICAgICBpc0h0dHBPbmx5OiB0cnVlLFxuICAgICAgICBlbmNvZGluZzogJ2Jhc2U2NGpzb24nLFxuICAgICAgICBjbGVhckludmFsaWQ6IGZhbHNlLCAvLyByZW1vdmUgaW52YWxpZCBjb29raWVzXG4gICAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbCgodGhpcy5jb25maWcubW9kZWxzIHx8IHRoaXMucGx1bXAuZ2V0VHlwZXMoKSkubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgbmV3IEJhc2VDb250cm9sbGVyKHRoaXMucGx1bXAsIHQpLnBsdWdpbiBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHt0LnR5cGV9YCB9IH1cbiAgICAgICAgKTtcbiAgICAgIH0pKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHRoaXMuaGFwaS5yZWdpc3Rlcihjb25maWd1cmVBdXRoKHRoaXMuY29uZmlnKSBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PiwgeyByb3V0ZXM6IHsgcHJlZml4OiB0aGlzLmNvbmZpZy5hdXRoUm9vdCB9IH0pKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICByZXR1cm4gcmVwbHkuY29udGludWUoKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5pbyA9IFNvY2tldElPKHRoaXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICBkaXNwYXRjaCh0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLmhhcGkuc3RhcnQoKTtcbiAgfVxuXG59XG4iXX0=
