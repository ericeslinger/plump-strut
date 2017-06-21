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
        return server.services.oracle.keyService.test(msg.key).then(function (v) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQUNFLEdBQTBCLEVBQzFCLE1BQW1CO0lBRW5CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFHM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDckIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3JCLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2dCQUNsQyxNQUFNLENBQUM7b0JBQ0wsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztvQkFDbEIsR0FBRyxFQUFFLEtBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNO3lCQUNyQyxRQUFRLGdCQUFXLENBQUMsQ0FBQyxJQUFJLGVBQVUsR0FBRyxDQUFDLEtBQU87aUJBQ2xELENBQUM7WUFDSixDQUFDLENBQUM7U0FDSCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztZQUMzRCxNQUFNLENBQUM7Z0JBQ0wsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUNyQixJQUFJLEVBQUUsQ0FBQzthQUNSLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUF5QjtZQUM3QyxRQUFRLEVBQUUsZ0JBQWdCO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBL0JELDRCQStCQyIsImZpbGUiOiJzb2NrZXQvYXV0aGVudGljYXRpb24uY2hhbm5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEF1dGhlbnRpY2F0aW9uUmVxdWVzdCxcbiAgQXV0aGVudGljYXRpb25SZXNwb25zZSxcbiAgUmVzcG9uc2UsXG59IGZyb20gJy4vbWVzc2FnZUludGVyZmFjZXMnO1xuaW1wb3J0IHsgU3RydXRTZXJ2ZXIgfSBmcm9tICcuLi9zZXJ2ZXInO1xuaW1wb3J0ICogYXMgU29ja2V0SU8gZnJvbSAnc29ja2V0LmlvJztcblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoKFxuICBtc2c6IEF1dGhlbnRpY2F0aW9uUmVxdWVzdCxcbiAgc2VydmVyOiBTdHJ1dFNlcnZlcixcbik6IFByb21pc2U8QXV0aGVudGljYXRpb25SZXNwb25zZT4ge1xuICBpZiAobXNnLnJlcXVlc3QgPT09ICdzdGFydGF1dGgnKSB7XG4gICAgbXNnLmNsaWVudC5qb2luKG1zZy5ub25jZSk7XG4gICAgLy8gdGhpcyBub25jZSBleHBpcmVzIGluIGZpdmUgbWludXRlcy5cbiAgICAvLyBzZXRUaW1lb3V0KCgpID0+IG1zZy5jbGllbnQubGVhdmUobXNnLm5vbmNlKSwgNSAqIDYwICogMTAwMCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICByZXNwb25zZTogbXNnLnJlcXVlc3QsXG4gICAgICB0eXBlczogc2VydmVyLmNvbmZpZy5hdXRoVHlwZXMubWFwKHYgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHYubmFtZSxcbiAgICAgICAgICBpY29uVXJsOiB2Lmljb25VcmwsXG4gICAgICAgICAgdXJsOiBgJHtzZXJ2ZXIuYmFzZVVybCgpfSR7c2VydmVyLmNvbmZpZ1xuICAgICAgICAgICAgLmF1dGhSb290fT9tZXRob2Q9JHt2Lm5hbWV9Jm5vbmNlPSR7bXNnLm5vbmNlfWAsXG4gICAgICAgIH07XG4gICAgICB9KSxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChtc2cucmVxdWVzdCA9PT0gJ3Rlc3RrZXknKSB7XG4gICAgcmV0dXJuIHNlcnZlci5zZXJ2aWNlcy5vcmFjbGUua2V5U2VydmljZS50ZXN0KG1zZy5rZXkpLnRoZW4odiA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXNwb25zZTogbXNnLnJlcXVlc3QsXG4gICAgICAgIGF1dGg6IHYsXG4gICAgICB9O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmU8QXV0aGVudGljYXRpb25SZXNwb25zZT4oe1xuICAgICAgcmVzcG9uc2U6ICdpbnZhbGlkUmVxdWVzdCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==