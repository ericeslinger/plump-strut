"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
var AuthenticationModule = (function () {
    function AuthenticationModule() {
    }
    return AuthenticationModule;
}());
exports.AuthenticationModule = AuthenticationModule;
function routeGen(options) {
    return function (server) {
        server.auth.strategy(options.name, 'bell', options.strategy);
        server.route({
            method: ['GET', 'POST'],
            path: options.name,
            handler: options.handler,
            config: {
                auth: options.name,
            }
        });
    };
}
function cookieAndDispatch(request, reply) {
    console.log(request.query);
    reply("\n    <html>\n      <head><meta http-equiv=\"refresh\" content=\"5; url=" + request.query['method'] + "\" /></head>\n      <body>REDIRECTING " + request.query['method'] + "</body>\n    </html>\n  ")
        .type('text/html')
        .state('authNonce', { nonce: request.query['nonce'] });
}
var cookieRoute = {
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
    server.route(cookieRoute);
    next();
};
exports.plugin.attributes = {
    version: '1.0.0',
    name: 'authentication',
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUEyQjtBQW9CM0I7SUFBQTtJQUFvQyxDQUFDO0lBQUQsMkJBQUM7QUFBRCxDQUFwQyxBQUFxQyxJQUFBO0FBQXhCLG9EQUFvQjtBQUVqQyxrQkFBa0IsT0FBMkI7SUFDM0MsTUFBTSxDQUFDLFVBQUMsTUFBTTtRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3RCxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztZQUN2QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDbEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7YUFDbkI7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsMkJBQTJCLE9BQXFCLEVBQUUsS0FBc0I7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsS0FBSyxDQUFDLDZFQUVpRCxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyw4Q0FDdEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsNkJBRTlDLENBQUM7U0FDRCxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQ2pCLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELElBQU0sV0FBVyxHQUE0QjtJQUMzQyxNQUFNLEVBQUUsS0FBSztJQUNiLElBQUksRUFBRSxFQUFFO0lBQ1IsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixNQUFNLEVBQUU7UUFDTixRQUFRLEVBQUU7WUFDUixLQUFLLEVBQUU7Z0JBQ0wsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQy9CLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO2FBQy9CO1NBQ0Y7S0FDRjtDQUNGLENBQUM7QUFFVyxRQUFBLE1BQU0sR0FBMkQsVUFBUyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUk7SUFDcEcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQixJQUFJLEVBQUUsQ0FBQztBQUNULENBQUMsQ0FBQztBQUNGLGNBQU0sQ0FBQyxVQUFVLEdBQUc7SUFDbEIsT0FBTyxFQUFFLE9BQU87SUFDaEIsSUFBSSxFQUFFLGdCQUFnQjtDQUN2QixDQUFDIiwiZmlsZSI6ImF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgQmVsbCBmcm9tICdiZWxsJztcblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGlvblR5cGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIGhhbmRsZXI6IEhhcGkuUm91dGVIYW5kbGVyO1xuICBzdHJhdGVneToge1xuICAgIHByb3ZpZGVyOiBzdHJpbmc7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBjb29raWU6IHN0cmluZztcbiAgICBzY29wZTogc3RyaW5nW107XG4gICAgY2xpZW50SWQ6IHN0cmluZztcbiAgICBjbGllbnRTZWNyZXQ6IHN0cmluZztcbiAgICBpc1NlY3VyZTogYm9vbGVhbjtcbiAgICBmb3JjZUh0dHBzOiBib29sZWFuO1xuICAgIHByb3ZpZGVyUGFyYW1zPzogYW55LFxuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRpb25Nb2R1bGUgeyB9XG5cbmZ1bmN0aW9uIHJvdXRlR2VuKG9wdGlvbnM6IEF1dGhlbnRpY2F0aW9uVHlwZSkge1xuICByZXR1cm4gKHNlcnZlcikgPT4ge1xuICAgIHNlcnZlci5hdXRoLnN0cmF0ZWd5KG9wdGlvbnMubmFtZSwgJ2JlbGwnLCBvcHRpb25zLnN0cmF0ZWd5KTtcbiAgICBzZXJ2ZXIucm91dGUoe1xuICAgICAgbWV0aG9kOiBbJ0dFVCcsICdQT1NUJ10sXG4gICAgICBwYXRoOiBvcHRpb25zLm5hbWUsXG4gICAgICBoYW5kbGVyOiBvcHRpb25zLmhhbmRsZXIsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgYXV0aDogb3B0aW9ucy5uYW1lLFxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb29raWVBbmREaXNwYXRjaChyZXF1ZXN0OiBIYXBpLlJlcXVlc3QsIHJlcGx5OiBIYXBpLkJhc2VfUmVwbHkpIHtcbiAgY29uc29sZS5sb2cocmVxdWVzdC5xdWVyeSk7XG4gIHJlcGx5KGBcbiAgICA8aHRtbD5cbiAgICAgIDxoZWFkPjxtZXRhIGh0dHAtZXF1aXY9XCJyZWZyZXNoXCIgY29udGVudD1cIjU7IHVybD0ke3JlcXVlc3QucXVlcnlbJ21ldGhvZCddfVwiIC8+PC9oZWFkPlxuICAgICAgPGJvZHk+UkVESVJFQ1RJTkcgJHtyZXF1ZXN0LnF1ZXJ5WydtZXRob2QnXX08L2JvZHk+XG4gICAgPC9odG1sPlxuICBgKVxuICAudHlwZSgndGV4dC9odG1sJylcbiAgLnN0YXRlKCdhdXRoTm9uY2UnLCB7IG5vbmNlOiByZXF1ZXN0LnF1ZXJ5Wydub25jZSddIH0pO1xufVxuXG5jb25zdCBjb29raWVSb3V0ZTogSGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24gPSB7XG4gIG1ldGhvZDogJ0dFVCcsXG4gIHBhdGg6ICcnLFxuICBoYW5kbGVyOiBjb29raWVBbmREaXNwYXRjaCxcbiAgY29uZmlnOiB7XG4gICAgdmFsaWRhdGU6IHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIG1ldGhvZDogSm9pLnN0cmluZygpLnJlcXVpcmVkKCksXG4gICAgICAgIG5vbmNlOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59O1xuXG5leHBvcnQgY29uc3QgcGx1Z2luOiBIYXBpLlBsdWdpbkZ1bmN0aW9uPHsgdmVyc2lvbjogc3RyaW5nLCBuYW1lOiBzdHJpbmcgfT4gPSBmdW5jdGlvbihzZXJ2ZXIsIF8sIG5leHQpIHtcbiAgc2VydmVyLnJvdXRlKGNvb2tpZVJvdXRlKTtcbiAgbmV4dCgpO1xufTtcbnBsdWdpbi5hdHRyaWJ1dGVzID0ge1xuICB2ZXJzaW9uOiAnMS4wLjAnLFxuICBuYW1lOiAnYXV0aGVudGljYXRpb24nLFxufTtcbiJdfQ==
