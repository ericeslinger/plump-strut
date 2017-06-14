"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
function cookieAndDispatch(request, reply) {
    console.log(request.query);
    reply(200).state('authNonce', { nonce: request.query['nonce'] });
}
var authRoute = {
    method: 'GET',
    path: '',
    handler: cookieAndDispatch,
    config: {
        validate: {
            query: {
                method: Joi.string().required(),
                nonce: Joi.string().required(),
            }
        }
    },
};
exports.plugin = function (server, _, next) {
    server.route(authRoute);
    next();
};
exports.plugin.attributes = {
    version: '1.0.0',
    name: 'authentication',
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUEyQjtBQUczQiwyQkFBMkIsT0FBcUIsRUFBRSxLQUFzQjtJQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsSUFBTSxTQUFTLEdBQTRCO0lBQ3pDLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLEVBQUU7SUFDUixPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLE1BQU0sRUFBRTtRQUNOLFFBQVEsRUFBRTtZQUNSLEtBQUssRUFBRTtnQkFDTCxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtnQkFDL0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7YUFDL0I7U0FDRjtLQUNGO0NBQ0YsQ0FBQztBQUVXLFFBQUEsTUFBTSxHQUEyRCxVQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSTtJQUNwRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hCLElBQUksRUFBRSxDQUFDO0FBQ1QsQ0FBQyxDQUFDO0FBQ0YsY0FBTSxDQUFDLFVBQVUsR0FBRztJQUNsQixPQUFPLEVBQUUsT0FBTztJQUNoQixJQUFJLEVBQUUsZ0JBQWdCO0NBQ3ZCLENBQUMiLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBKb2kgZnJvbSAnam9pJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5cbmZ1bmN0aW9uIGNvb2tpZUFuZERpc3BhdGNoKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkge1xuICBjb25zb2xlLmxvZyhyZXF1ZXN0LnF1ZXJ5KTtcbiAgcmVwbHkoMjAwKS5zdGF0ZSgnYXV0aE5vbmNlJywgeyBub25jZTogcmVxdWVzdC5xdWVyeVsnbm9uY2UnXSB9KTtcbn1cblxuY29uc3QgYXV0aFJvdXRlOiBIYXBpLlJvdXRlQ29uZmlndXJhdGlvbiA9IHtcbiAgbWV0aG9kOiAnR0VUJyxcbiAgcGF0aDogJycsXG4gIGhhbmRsZXI6IGNvb2tpZUFuZERpc3BhdGNoLFxuICBjb25maWc6IHtcbiAgICB2YWxpZGF0ZToge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgbWV0aG9kOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgICAgbm9uY2U6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBwbHVnaW46IEhhcGkuUGx1Z2luRnVuY3Rpb248eyB2ZXJzaW9uOiBzdHJpbmcsIG5hbWU6IHN0cmluZyB9PiA9IGZ1bmN0aW9uKHNlcnZlciwgXywgbmV4dCkge1xuICBzZXJ2ZXIucm91dGUoYXV0aFJvdXRlKTtcbiAgbmV4dCgpO1xufTtcbnBsdWdpbi5hdHRyaWJ1dGVzID0ge1xuICB2ZXJzaW9uOiAnMS4wLjAnLFxuICBuYW1lOiAnYXV0aGVudGljYXRpb24nLFxufTtcbiJdfQ==
