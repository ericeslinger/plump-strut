"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hapi = require("hapi");
var SocketIO = require("socket.io");
var base_1 = require("./base");
var channels_1 = require("./socket/channels");
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
            channels_1.dispatch(_this);
        });
    };
    StrutServer.prototype.start = function () {
        return this.hapi.start();
    };
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBNkI7QUFDN0Isb0NBQXNDO0FBRXRDLCtCQUF3QztBQUN4Qyw4Q0FBNkM7QUFVN0M7SUFLRSxxQkFBbUIsS0FBWSxFQUFTLE1BQWMsRUFBUyxNQUFtQjtRQUEvRCxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQWE7UUFDaEYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsZ0NBQVUsR0FBVjtRQUFBLGlCQW9CQztRQW5CQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTthQUN2QixJQUFJLENBQUM7WUFDSixLQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxLQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUN2QixJQUFJLHFCQUFjLENBQUMsS0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFpQyxFQUNqRSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBSyxLQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sU0FBSSxDQUFDLENBQUMsSUFBTSxFQUFFLEVBQUUsQ0FDN0QsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDTixLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBQyxPQUFPLEVBQUUsS0FBSztnQkFDeEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDO1lBQ0osS0FBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxtQkFBUSxDQUFDLEtBQUksQ0FBQyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUFLLEdBQUw7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUgsa0JBQUM7QUFBRCxDQW5DQSxBQW1DQyxJQUFBO0FBbkNZLGtDQUFXIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBPcmFjbGUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4vc29ja2V0L2NoYW5uZWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBTdHJ1dENvbmZpZyB7XG4gIG1vZGVscz86IHR5cGVvZiBNb2RlbFtdO1xuICBhcGlSb290OiBzdHJpbmc7XG4gIGFwaVByb3RvY29sOiAnaHR0cCcgfCAnaHR0cHMnO1xuICBhdXRoVHlwZXM6IHN0cmluZ1tdO1xuICBhcGlQb3J0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBTdHJ1dFNlcnZlciB7XG4gIHB1YmxpYyBoYXBpOiBIYXBpLlNlcnZlcjtcbiAgcHVibGljIGlvOiBTb2NrZXRJTy5TZXJ2ZXI7XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGx1bXA6IFBsdW1wLCBwdWJsaWMgb3JhY2xlOiBPcmFjbGUsIHB1YmxpYyBjb25maWc6IFN0cnV0Q29uZmlnKSB7XG4gICAgdGhpcy5oYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGFwaS5jb25uZWN0aW9uKHsgcG9ydDogdGhpcy5jb25maWcuYXBpUG9ydCB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbCgodGhpcy5jb25maWcubW9kZWxzIHx8IHRoaXMucGx1bXAuZ2V0VHlwZXMoKSkubWFwKCh0KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhcGkucmVnaXN0ZXIoXG4gICAgICAgICAgbmV3IEJhc2VDb250cm9sbGVyKHRoaXMucGx1bXAsIHQpLnBsdWdpbiBhcyBIYXBpLlBsdWdpbkZ1bmN0aW9uPHt9PixcbiAgICAgICAgICAgIHsgcm91dGVzOiB7IHByZWZpeDogYCR7dGhpcy5jb25maWcuYXBpUm9vdH0vJHt0LnR5cGV9YCB9IH1cbiAgICAgICAgKTtcbiAgICAgIH0pKTtcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuaGFwaS5leHQoJ29uUHJlQXV0aCcsIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICByZXF1ZXN0LmNvbm5lY3Rpb24uaW5mby5wcm90b2NvbCA9IHRoaXMuY29uZmlnLmFwaVByb3RvY29sO1xuICAgICAgICByZXR1cm4gcmVwbHkuY29udGludWUoKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5pbyA9IFNvY2tldElPKHRoaXMuaGFwaS5saXN0ZW5lcik7XG4gICAgICBkaXNwYXRjaCh0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLmhhcGkuc3RhcnQoKTtcbiAgfVxuXG59XG4iXX0=
