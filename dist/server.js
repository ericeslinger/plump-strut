"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var base_1 = require("./base");
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
            return Promise.all((_this.config.models || _this.plump.getTypes()).map(function (t) {
                return _this.hapi.register(new base_1.BaseController(_this.plump, t).plugin, { routes: { prefix: _this.config.apiRoot + "/" + t.type } });
            }));
        }).then(function () {
            _this.hapi.ext('onPreAuth', function (request, reply) {
                request.connection.info.protocol = _this.config.apiProtocol;
                return reply.continue();
            });
        })
            .then(function () {
            _this.io = SocketIO(_this.hapi.listener);
        });
    };
    StrutServer.prototype.start = function () {
        return this.hapi.start();
    };
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBNkI7QUFDN0Isb0NBQXNDO0FBRXRDLCtCQUF3QztBQVV4QztJQUtFLHFCQUFtQixLQUFZLEVBQVMsTUFBYyxFQUFTLE1BQW1CO1FBQS9ELFVBQUssR0FBTCxLQUFLLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUNoRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxnQ0FBVSxHQUFWO1FBQUEsaUJBbUJDO1FBbEJDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO2FBQ3ZCLElBQUksQ0FBQztZQUNKLEtBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEtBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDO2dCQUNyRSxNQUFNLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQ3ZCLElBQUkscUJBQWMsQ0FBQyxLQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQWlDLEVBQ2pFLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFLLEtBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxTQUFJLENBQUMsQ0FBQyxJQUFNLEVBQUUsRUFBRSxDQUM3RCxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFDLE9BQU8sRUFBRSxLQUFLO2dCQUN4QyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDSixLQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUgsa0JBQUM7QUFBRCxDQWxDQSxBQWtDQyxJQUFBO0FBbENZLGtDQUFXIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBPcmFjbGUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRDb25maWcge1xuICBtb2RlbHM/OiB0eXBlb2YgTW9kZWxbXTtcbiAgYXBpUm9vdDogc3RyaW5nO1xuICBhcGlQcm90b2NvbDogJ2h0dHAnIHwgJ2h0dHBzJztcbiAgYXV0aFR5cGVzOiBzdHJpbmdbXTtcbiAgYXBpUG9ydDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgaGFwaTogSGFwaS5TZXJ2ZXI7XG4gIHB1YmxpYyBpbzogU29ja2V0SU8uU2VydmVyO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHBsdW1wOiBQbHVtcCwgcHVibGljIG9yYWNsZTogT3JhY2xlLCBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZykge1xuICAgIHRoaXMuaGFwaSA9IG5ldyBIYXBpLlNlcnZlcigpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IHRoaXMuY29uZmlnLmFwaVBvcnQgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoKHRoaXMuY29uZmlnLm1vZGVscyB8fCB0aGlzLnBsdW1wLmdldFR5cGVzKCkpLm1hcCgodCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXBpLnJlZ2lzdGVyKFxuICAgICAgICAgIG5ldyBCYXNlQ29udHJvbGxlcih0aGlzLnBsdW1wLCB0KS5wbHVnaW4gYXMgSGFwaS5QbHVnaW5GdW5jdGlvbjx7fT4sXG4gICAgICAgICAgICB7IHJvdXRlczogeyBwcmVmaXg6IGAke3RoaXMuY29uZmlnLmFwaVJvb3R9LyR7dC50eXBlfWAgfSB9XG4gICAgICAgICk7XG4gICAgICB9KSk7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhhcGkuZXh0KCdvblByZUF1dGgnLCAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgcmVxdWVzdC5jb25uZWN0aW9uLmluZm8ucHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5hcGlQcm90b2NvbDtcbiAgICAgICAgcmV0dXJuIHJlcGx5LmNvbnRpbnVlKCk7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLmhhcGkubGlzdGVuZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFwaS5zdGFydCgpO1xuICB9XG5cbn1cbiJdfQ==
