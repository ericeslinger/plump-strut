"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
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
            .then(function () { return _this.hapi.register(authentication_1.plugin, { routes: { prefix: _this.config.authRoot } }); })
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBNkI7QUFDN0Isb0NBQXNDO0FBRXRDLCtCQUF3QztBQUN4Qyw4Q0FBNkM7QUFDN0MsbURBQWtFO0FBV2xFO0lBS0UscUJBQW1CLEtBQVksRUFBUyxNQUFjLEVBQVMsTUFBbUI7UUFBL0QsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFTLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQ2hGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELGdDQUFVLEdBQVY7UUFBQSxpQkE4QkM7UUE3QkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7YUFDdkIsSUFBSSxDQUFDO1lBQ0osS0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtnQkFDM0IsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFFBQVEsRUFBRSxZQUFZO2dCQUN0QixZQUFZLEVBQUUsS0FBSztnQkFDbkIsWUFBWSxFQUFFLElBQUk7YUFDbkIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxLQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUN2QixJQUFJLHFCQUFjLENBQUMsS0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFpQyxFQUNqRSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBSyxLQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sU0FBSSxDQUFDLENBQUMsSUFBTSxFQUFFLEVBQUUsQ0FDN0QsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUErQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFqSCxDQUFpSCxDQUFDO2FBQzdILElBQUksQ0FBQztZQUNKLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFDLE9BQU8sRUFBRSxLQUFLO2dCQUN4QyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDSixLQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLG1CQUFRLENBQUMsS0FBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMkJBQUssR0FBTDtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFSCxrQkFBQztBQUFELENBN0NBLEFBNkNDLElBQUE7QUE3Q1ksa0NBQVciLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIFNvY2tldElPIGZyb20gJ3NvY2tldC5pbyc7XG5pbXBvcnQgeyBQbHVtcCwgTW9kZWwsIE9yYWNsZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi9zb2NrZXQvY2hhbm5lbHMnO1xuaW1wb3J0IHsgcGx1Z2luIGFzIGF1dGhlbnRpY2F0aW9uUGx1Z2luIH0gZnJvbSAnLi9hdXRoZW50aWNhdGlvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRDb25maWcge1xuICBtb2RlbHM/OiB0eXBlb2YgTW9kZWxbXTtcbiAgYXBpUm9vdDogc3RyaW5nO1xuICBhcGlQcm90b2NvbDogJ2h0dHAnIHwgJ2h0dHBzJztcbiAgYXV0aFR5cGVzOiBzdHJpbmdbXTtcbiAgYXBpUG9ydDogbnVtYmVyO1xuICBhdXRoUm9vdDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgaGFwaTogSGFwaS5TZXJ2ZXI7XG4gIHB1YmxpYyBpbzogU29ja2V0SU8uU2VydmVyO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHBsdW1wOiBQbHVtcCwgcHVibGljIG9yYWNsZTogT3JhY2xlLCBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZykge1xuICAgIHRoaXMuaGFwaSA9IG5ldyBIYXBpLlNlcnZlcigpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICB0aGlzLmhhcGkuc3RhdGUoJ2F1dGhOb25jZScsIHtcbiAgICAgICAgdHRsOiBudWxsLFxuICAgICAgICBpc1NlY3VyZTogdHJ1ZSxcbiAgICAgICAgaXNIdHRwT25seTogdHJ1ZSxcbiAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjRqc29uJyxcbiAgICAgICAgY2xlYXJJbnZhbGlkOiBmYWxzZSwgLy8gcmVtb3ZlIGludmFsaWQgY29va2llc1xuICAgICAgICBzdHJpY3RIZWFkZXI6IHRydWUgLy8gZG9uJ3QgYWxsb3cgdmlvbGF0aW9ucyBvZiBSRkMgNjI2NVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnBsdW1wLmdldFR5cGVzKCkpLm1hcCgodCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIG5ldyBCYXNlQ29udHJvbGxlcih0aGlzLnBsdW1wLCB0KS5wbHVnaW4gYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9XG4gICAgICAgICk7XG4gICAgICB9KSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB0aGlzLmhhcGkucmVnaXN0ZXIoYXV0aGVudGljYXRpb25QbHVnaW4gYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sIHsgcm91dGVzOiB7IHByZWZpeDogdGhpcy5jb25maWcuYXV0aFJvb3QgfSB9KSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgcmVxdWVzdC5jb25uZWN0aW9uLmluZm8ucHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5hcGlQcm90b2NvbDtcbiAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLmhhcGkubGlzdGVuZXIpO1xuICAgICAgZGlzcGF0Y2godGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXBpLnN0YXJ0KCk7XG4gIH1cblxufVxuIl19
