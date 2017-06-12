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
    StrutServer.prototype.start = function () {
        var _this = this;
        return Promise.resolve()
            .then(function () {
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
    return StrutServer;
}());
exports.StrutServer = StrutServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBNkI7QUFDN0Isb0NBQXNDO0FBRXRDLCtCQUF3QztBQVV4QztJQUtFLHFCQUFtQixLQUFZLEVBQVMsTUFBYyxFQUFTLE1BQW1CO1FBQS9ELFVBQUssR0FBTCxLQUFLLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUNoRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCwyQkFBSyxHQUFMO1FBQUEsaUJBa0JDO1FBakJDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO2FBQ3ZCLElBQUksQ0FBQztZQUNKLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksS0FBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUM7Z0JBQ3JFLE1BQU0sQ0FBQyxLQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FDdkIsSUFBSSxxQkFBYyxDQUFDLEtBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBaUMsRUFDakUsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUssS0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLFNBQUksQ0FBQyxDQUFDLElBQU0sRUFBRSxFQUFFLENBQzdELENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ04sS0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQUMsT0FBTyxFQUFFLEtBQUs7Z0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNKLEtBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUgsa0JBQUM7QUFBRCxDQTdCQSxBQTZCQyxJQUFBO0FBN0JZLGtDQUFXIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuaW1wb3J0IHsgUGx1bXAsIE1vZGVsLCBPcmFjbGUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydXRDb25maWcge1xuICBtb2RlbHM/OiB0eXBlb2YgTW9kZWxbXTtcbiAgYXBpUm9vdDogc3RyaW5nO1xuICBhcGlQcm90b2NvbDogJ2h0dHAnIHwgJ2h0dHBzJztcbiAgYXV0aFR5cGVzOiBzdHJpbmdbXTtcbiAgYXBpUG9ydDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgU3RydXRTZXJ2ZXIge1xuICBwdWJsaWMgaGFwaTogSGFwaS5TZXJ2ZXI7XG4gIHB1YmxpYyBpbzogU29ja2V0SU8uU2VydmVyO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHBsdW1wOiBQbHVtcCwgcHVibGljIG9yYWNsZTogT3JhY2xlLCBwdWJsaWMgY29uZmlnOiBTdHJ1dENvbmZpZykge1xuICAgIHRoaXMuaGFwaSA9IG5ldyBIYXBpLlNlcnZlcigpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKCh0aGlzLmNvbmZpZy5tb2RlbHMgfHwgdGhpcy5wbHVtcC5nZXRUeXBlcygpKS5tYXAoKHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFwaS5yZWdpc3RlcihcbiAgICAgICAgICBuZXcgQmFzZUNvbnRyb2xsZXIodGhpcy5wbHVtcCwgdCkucGx1Z2luIGFzIEhhcGkuUGx1Z2luRnVuY3Rpb248e30+LFxuICAgICAgICAgICAgeyByb3V0ZXM6IHsgcHJlZml4OiBgJHt0aGlzLmNvbmZpZy5hcGlSb290fS8ke3QudHlwZX1gIH0gfVxuICAgICAgICApO1xuICAgICAgfSkpO1xuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5oYXBpLmV4dCgnb25QcmVBdXRoJywgKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgIHJlcXVlc3QuY29ubmVjdGlvbi5pbmZvLnByb3RvY29sID0gdGhpcy5jb25maWcuYXBpUHJvdG9jb2w7XG4gICAgICAgIHJldHVybiByZXBseS5jb250aW51ZSgpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmlvID0gU29ja2V0SU8odGhpcy5oYXBpLmxpc3RlbmVyKTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=
