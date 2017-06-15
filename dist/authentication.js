"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
function routeGen(options, c) {
    return function (server) {
        server.auth.strategy(options.name, 'bell', options.strategy);
        server.route({
            method: ['GET', 'POST'],
            path: options.name,
            handler: function (request, reply) {
                return options.handler(request)
                    .then(function (s) {
                    reply(s)
                        .type('text/html')
                        .unstate('authNonce');
                });
            },
            config: {
                auth: options.name,
                state: {
                    parse: true,
                }
            }
        });
    };
}
function configureAuth(c) {
    var plugin = function (s, _, next) {
        s.route({
            method: 'GET',
            path: '',
            handler: function (request, reply) {
                reply("\n          <html>\n            <head><meta http-equiv=\"refresh\" content=\"5; url=" + c.authRoot + "/" + request.query['method'] + "\" /></head>\n            <body>REDIRECTING " + request.query['method'] + "</body>\n          </html>\n        ")
                    .type('text/html')
                    .state('authNonce', { nonce: request.query['nonce'] });
            },
            config: {
                validate: {
                    query: {
                        method: Joi.string().required(),
                        nonce: Joi.string().required(),
                    }
                }
            },
        });
        c.authTypes.forEach(function (t) { return routeGen(t, c)(s); });
        next();
    };
    plugin.attributes = {
        version: '1.0.0',
        name: 'authentication',
    };
    return plugin;
}
exports.configureAuth = configureAuth;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUEyQjtBQXFCM0Isa0JBQWtCLE9BQTJCLEVBQUUsQ0FBYztJQUMzRCxNQUFNLENBQUMsVUFBQyxNQUFNO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDWCxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO1lBQ3ZCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixPQUFPLEVBQUUsVUFBQyxPQUFxQixFQUFFLEtBQXNCO2dCQUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7cUJBQzlCLElBQUksQ0FBQyxVQUFDLENBQVM7b0JBQ2QsS0FBSyxDQUFDLENBQUMsQ0FBQzt5QkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDO3lCQUNqQixPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7Z0JBQ2xCLEtBQUssRUFBRTtvQkFDTCxLQUFLLEVBQUUsSUFBSTtpQkFDWjthQUNGO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELHVCQUE4QixDQUFjO0lBQzFDLElBQU0sTUFBTSxHQUEyRCxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSTtRQUV4RixDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ04sTUFBTSxFQUFFLEtBQUs7WUFDYixJQUFJLEVBQUUsRUFBRTtZQUNSLE9BQU8sRUFBRSxVQUFDLE9BQXFCLEVBQUUsS0FBc0I7Z0JBQ3JELEtBQUssQ0FBQyx5RkFFaUQsQ0FBQyxDQUFDLFFBQVEsU0FBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxvREFDcEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMseUNBRTlDLENBQUM7cUJBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQztxQkFDakIsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLFFBQVEsRUFBRTtvQkFDUixLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7d0JBQy9CLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO3FCQUMvQjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7UUFDNUMsSUFBSSxFQUFFLENBQUM7SUFDVCxDQUFDLENBQUM7SUFDRixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2xCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLElBQUksRUFBRSxnQkFBZ0I7S0FDdkIsQ0FBQztJQUNGLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWpDRCxzQ0FpQ0MiLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBKb2kgZnJvbSAnam9pJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBCZWxsIGZyb20gJ2JlbGwnO1xuaW1wb3J0IHsgU3RydXRDb25maWcgfSBmcm9tICcuL3NlcnZlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXV0aGVudGljYXRpb25UeXBlIHtcbiAgbmFtZTogc3RyaW5nO1xuICBoYW5kbGVyOiAocjogSGFwaS5SZXF1ZXN0KSA9PiBQcm9taXNlPHN0cmluZz47XG4gIHN0cmF0ZWd5OiB7XG4gICAgcHJvdmlkZXI6IHN0cmluZztcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgIGNvb2tpZTogc3RyaW5nO1xuICAgIHNjb3BlOiBzdHJpbmdbXTtcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIGNsaWVudFNlY3JldDogc3RyaW5nO1xuICAgIGlzU2VjdXJlOiBib29sZWFuO1xuICAgIGZvcmNlSHR0cHM6IGJvb2xlYW47XG4gICAgcHJvdmlkZXJQYXJhbXM/OiBhbnksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJvdXRlR2VuKG9wdGlvbnM6IEF1dGhlbnRpY2F0aW9uVHlwZSwgYzogU3RydXRDb25maWcpIHtcbiAgcmV0dXJuIChzZXJ2ZXIpID0+IHtcbiAgICBzZXJ2ZXIuYXV0aC5zdHJhdGVneShvcHRpb25zLm5hbWUsICdiZWxsJywgb3B0aW9ucy5zdHJhdGVneSk7XG4gICAgc2VydmVyLnJvdXRlKHtcbiAgICAgIG1ldGhvZDogWydHRVQnLCAnUE9TVCddLFxuICAgICAgcGF0aDogb3B0aW9ucy5uYW1lLFxuICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5oYW5kbGVyKHJlcXVlc3QpXG4gICAgICAgIC50aGVuKChzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZXBseShzKVxuICAgICAgICAgIC50eXBlKCd0ZXh0L2h0bWwnKVxuICAgICAgICAgIC51bnN0YXRlKCdhdXRoTm9uY2UnKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIGF1dGg6IG9wdGlvbnMubmFtZSxcbiAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICBwYXJzZTogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlQXV0aChjOiBTdHJ1dENvbmZpZykge1xuICBjb25zdCBwbHVnaW46IEhhcGkuUGx1Z2luRnVuY3Rpb248eyB2ZXJzaW9uOiBzdHJpbmcsIG5hbWU6IHN0cmluZyB9PiA9IGZ1bmN0aW9uKHMsIF8sIG5leHQpIHtcblxuICAgIHMucm91dGUoe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICByZXBseShgXG4gICAgICAgICAgPGh0bWw+XG4gICAgICAgICAgICA8aGVhZD48bWV0YSBodHRwLWVxdWl2PVwicmVmcmVzaFwiIGNvbnRlbnQ9XCI1OyB1cmw9JHtjLmF1dGhSb290fS8ke3JlcXVlc3QucXVlcnlbJ21ldGhvZCddfVwiIC8+PC9oZWFkPlxuICAgICAgICAgICAgPGJvZHk+UkVESVJFQ1RJTkcgJHtyZXF1ZXN0LnF1ZXJ5WydtZXRob2QnXX08L2JvZHk+XG4gICAgICAgICAgPC9odG1sPlxuICAgICAgICBgKVxuICAgICAgICAudHlwZSgndGV4dC9odG1sJylcbiAgICAgICAgLnN0YXRlKCdhdXRoTm9uY2UnLCB7IG5vbmNlOiByZXF1ZXN0LnF1ZXJ5Wydub25jZSddIH0pO1xuICAgICAgfSxcbiAgICAgIGNvbmZpZzoge1xuICAgICAgICB2YWxpZGF0ZToge1xuICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICBtZXRob2Q6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgICAgbm9uY2U6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjLmF1dGhUeXBlcy5mb3JFYWNoKHQgPT4gcm91dGVHZW4odCwgYykocykpO1xuICAgIG5leHQoKTtcbiAgfTtcbiAgcGx1Z2luLmF0dHJpYnV0ZXMgPSB7XG4gICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICBuYW1lOiAnYXV0aGVudGljYXRpb24nLFxuICB9O1xuICByZXR1cm4gcGx1Z2luO1xufVxuIl19
