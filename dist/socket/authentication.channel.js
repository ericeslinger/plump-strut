"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dispatch(msg, server) {
    if (msg.request === 'startauth') {
        msg.client.join(msg.nonce);
        return Promise.resolve({
            response: msg.request,
            types: server.config.authTypes.map(function (v) {
                return {
                    name: v.name,
                    iconUrl: v.iconUrl,
                    url: "" + server.baseUrl() + server.config
                        .authRoot + "?method=" + v.name + "&nonce=" + msg.nonce,
                };
            }),
        });
    }
    else if (msg.request === 'testkey') {
        return server.oracle.keyService.test(msg.key).then(function (v) {
            return {
                response: msg.request,
                auth: v,
            };
        });
    }
    else {
        return Promise.resolve({
            response: 'invalidRequest',
        });
    }
}
exports.dispatch = dispatch;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQUNFLEdBQTBCLEVBQzFCLE1BQW1CO0lBRW5CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFHM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDckIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3JCLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2dCQUNsQyxNQUFNLENBQUM7b0JBQ0wsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztvQkFDbEIsR0FBRyxFQUFFLEtBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNO3lCQUNyQyxRQUFRLGdCQUFXLENBQUMsQ0FBQyxJQUFJLGVBQVUsR0FBRyxDQUFDLEtBQU87aUJBQ2xELENBQUM7WUFDSixDQUFDLENBQUM7U0FDSCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDO1lBQ2xELE1BQU0sQ0FBQztnQkFDTCxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxDQUFDO2FBQ1IsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQXlCO1lBQzdDLFFBQVEsRUFBRSxnQkFBZ0I7U0FDM0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUM7QUEvQkQsNEJBK0JDIiwiZmlsZSI6InNvY2tldC9hdXRoZW50aWNhdGlvbi5jaGFubmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXV0aGVudGljYXRpb25SZXF1ZXN0LFxuICBBdXRoZW50aWNhdGlvblJlc3BvbnNlLFxuICBSZXNwb25zZSxcbn0gZnJvbSAnLi9tZXNzYWdlSW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBTdHJ1dFNlcnZlciB9IGZyb20gJy4uL3NlcnZlcic7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2goXG4gIG1zZzogQXV0aGVudGljYXRpb25SZXF1ZXN0LFxuICBzZXJ2ZXI6IFN0cnV0U2VydmVyLFxuKTogUHJvbWlzZTxBdXRoZW50aWNhdGlvblJlc3BvbnNlPiB7XG4gIGlmIChtc2cucmVxdWVzdCA9PT0gJ3N0YXJ0YXV0aCcpIHtcbiAgICBtc2cuY2xpZW50LmpvaW4obXNnLm5vbmNlKTtcbiAgICAvLyB0aGlzIG5vbmNlIGV4cGlyZXMgaW4gZml2ZSBtaW51dGVzLlxuICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gbXNnLmNsaWVudC5sZWF2ZShtc2cubm9uY2UpLCA1ICogNjAgKiAxMDAwKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgIHJlc3BvbnNlOiBtc2cucmVxdWVzdCxcbiAgICAgIHR5cGVzOiBzZXJ2ZXIuY29uZmlnLmF1dGhUeXBlcy5tYXAodiA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogdi5uYW1lLFxuICAgICAgICAgIGljb25Vcmw6IHYuaWNvblVybCxcbiAgICAgICAgICB1cmw6IGAke3NlcnZlci5iYXNlVXJsKCl9JHtzZXJ2ZXIuY29uZmlnXG4gICAgICAgICAgICAuYXV0aFJvb3R9P21ldGhvZD0ke3YubmFtZX0mbm9uY2U9JHttc2cubm9uY2V9YCxcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKG1zZy5yZXF1ZXN0ID09PSAndGVzdGtleScpIHtcbiAgICByZXR1cm4gc2VydmVyLm9yYWNsZS5rZXlTZXJ2aWNlLnRlc3QobXNnLmtleSkudGhlbih2ID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3BvbnNlOiBtc2cucmVxdWVzdCxcbiAgICAgICAgYXV0aDogdixcbiAgICAgIH07XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZTxBdXRoZW50aWNhdGlvblJlc3BvbnNlPih7XG4gICAgICByZXNwb25zZTogJ2ludmFsaWRSZXF1ZXN0JyxcbiAgICB9KTtcbiAgfVxufVxuIl19
