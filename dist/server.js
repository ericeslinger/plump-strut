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
        }).then(function () {
            _this.hapi.state('authNonce', {
                ttl: null,
                isSecure: false,
                isHttpOnly: false,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUUsR0FBRyxRQUFRLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxtQkFBUSxDQUFDLEtBQUksQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBR0gsa0JBQUM7QUFBRCxDQWpEQSxBQWlEQyxJQUFBO0FBakRZLGtDQUFXIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0ICogYXMgQmVsbCBmcm9tICdiZWxsJztcbmltcG9ydCB7IFBsdW1wLCBNb2RlbCwgT3JhY2xlIH0gZnJvbSAncGx1bXAnO1xuaW1wb3J0IHsgQmFzZUNvbnRyb2xsZXIgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgZGlzcGF0Y2ggfSBmcm9tICcuL3NvY2tldC9jaGFubmVscyc7XG5pbXBvcnQgeyBjb25maWd1cmVBdXRoLCBBdXRoZW50aWNhdGlvblR5cGUgfSBmcm9tICcuL2F1dGhlbnRpY2F0aW9uJztcbmltcG9ydCB1bGlkIGZyb20gJ3VsaWQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0cnV0Q29uZmlnIHtcbiAgbW9kZWxzPzogdHlwZW9mIE1vZGVsW107XG4gIGFwaVJvb3Q6IHN0cmluZztcbiAgYXBpUHJvdG9jb2w6ICdodHRwJyB8ICdodHRwcyc7XG4gIGF1dGhUeXBlczogQXV0aGVudGljYXRpb25UeXBlW107XG4gIGFwaVBvcnQ6IG51bWJlcjtcbiAgYXV0aFJvb3Q6IHN0cmluZztcbn1cblxuY29uc3QgZGVmYXVsdFNldHRpbmdzOiBTdHJ1dENvbmZpZyA9IHtcbiAgYXBpUm9vdDogJy9hcGknLFxuICBhdXRoVHlwZXM6IFtdLFxuICBhcGlQb3J0OiAzMDAwLFxuICBhdXRoUm9vdDogJy9hdXRoJyxcbiAgYXBpUHJvdG9jb2w6ICdodHRwcycsXG59O1xuXG5leHBvcnQgY2xhc3MgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgaGFwaTogSGFwaS5TZXJ2ZXI7XG4gIHB1YmxpYyBpbzogU29ja2V0SU8uU2VydmVyO1xuICBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGx1bXA6IFBsdW1wLCBwdWJsaWMgb3JhY2xlOiBPcmFjbGUsIGNvbmY6IFBhcnRpYWw8U3RydXRDb25maWc+KSB7XG4gICAgdGhpcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGNvbmYpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICByZXR1cm4gdGhpcy5oYXBpLnJlZ2lzdGVyKEJlbGwpO1xuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5oYXBpLnN0YXRlKCdhdXRoTm9uY2UnLCB7XG4gICAgICAgIHR0bDogbnVsbCxcbiAgICAgICAgaXNTZWN1cmU6IGZhbHNlLFxuICAgICAgICBpc0h0dHBPbmx5OiBmYWxzZSxcbiAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICBzdHJpY3RIZWFkZXI6IHRydWUgLy8gZG9uJ3QgYWxsb3cgdmlvbGF0aW9ucyBvZiBSRkMgNjI2NVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnBsdW1wLmdldFR5cGVzKCkpLm1hcCgodCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIG5ldyBCYXNlQ29udHJvbGxlcih0aGlzLnBsdW1wLCB0KS5wbHVnaW4gYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9XG4gICAgICAgICk7XG4gICAgICB9KSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB0aGlzLmhhcGkucmVnaXN0ZXIoY29uZmlndXJlQXV0aCh0aGlzLmNvbmZpZykgYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sIHsgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfSB9KSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgcmVxdWVzdC5jb25uZWN0aW9uLmluZm8ucHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5hcGlQcm90b2NvbDtcbiAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgZGlzcGF0Y2godGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXBpLnN0YXJ0KCk7XG4gIH1cblxuXG59XG4iXX0=
