"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
function routeGen(options, strut) {
    var cookieOptions = Object.assign({}, {
        ttl: null,
        isSecure: true,
        isHttpOnly: true,
        encoding: 'base64json',
        isSameSite: false,
        clearInvalid: false,
        strictHeader: true
    }, options.nonceCookie);
    var routeHandler = function (request, reply) {
        return options.handler(request).then(function (r) {
            strut.io
                .to(request.state[options.name + "-nonce"].nonce)
                .emit(request.state[options.name + "-nonce"].nonce, {
                status: 'success',
                token: r.token
            });
            reply(r.response).type('text/html').unstate(options.name + "-nonce");
        });
    };
    return function (server) {
        server.auth.strategy(options.name, 'bell', options.strategy);
        server.state(options.name + "-nonce", cookieOptions);
        server.route({
            method: ['GET', 'POST'],
            path: "/" + options.name,
            handler: routeHandler,
            config: {
                auth: options.name,
                state: {
                    parse: true
                }
            }
        });
    };
}
function configureAuth(strut) {
    var plugin = function (s, _, next) {
        s.route({
            method: 'GET',
            path: '',
            handler: function (request, reply) {
                reply("\n          <html>\n            <head><meta http-equiv=\"refresh\" content=\"5; url=" + strut.config
                    .authRoot + "/" + request.query['method'] + "\" /></head>\n            <body>REDIRECTING " + request.query['method'] + " / " + request.query['nonce'] + "</body>\n          </html>\n        ")
                    .type('text/html')
                    .state(request.query['method'] + "-nonce", {
                    nonce: request.query['nonce']
                });
            },
            config: {
                validate: {
                    query: {
                        method: Joi.string().required(),
                        nonce: Joi.string().required()
                    }
                }
            }
        });
        strut.config.authTypes.forEach(function (t) { return routeGen(t, strut)(s); });
        next();
    };
    plugin.attributes = {
        version: '1.0.0',
        name: 'authentication'
    };
    return plugin;
}
exports.configureAuth = configureAuth;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFO2dCQUNOLFFBQVEsRUFBRTtvQkFDUixLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7d0JBQy9CLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO3FCQUMvQjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQzNELElBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLFVBQVUsR0FBRztRQUNsQixPQUFPLEVBQUUsT0FBTztRQUNoQixJQUFJLEVBQUUsZ0JBQWdCO0tBQ3ZCLENBQUM7SUFDRixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUExQ0Qsc0NBMENDIiwiZmlsZSI6ImF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgKiBhcyBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0ICogYXMgQmVsbCBmcm9tICdiZWxsJztcbmltcG9ydCB7IFN0cnV0Q29uZmlnLCBTdHJ1dFNlcnZlciB9IGZyb20gJy4vc2VydmVyJztcblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGlvblJlc3BvbnNlIHtcbiAgcmVzcG9uc2U6IHN0cmluZztcbiAgdG9rZW46IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGlvbkhhbmRsZXIge1xuICAocjogSGFwaS5SZXF1ZXN0KTogUHJvbWlzZTxBdXRoZW50aWNhdGlvblJlc3BvbnNlPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdXRoZW50aWNhdGlvblR5cGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xuICBpY29uVXJsPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhlbnRpY2F0aW9uU3RyYXRlZ3kge1xuICBuYW1lOiBzdHJpbmc7XG4gIGhhbmRsZXI6IEF1dGhlbnRpY2F0aW9uSGFuZGxlcjtcbiAgaWNvblVybD86IHN0cmluZztcbiAgc3RyYXRlZ3k6IHtcbiAgICBwcm92aWRlcjogc3RyaW5nO1xuICAgIHBhc3N3b3JkPzogc3RyaW5nO1xuICAgIGNvb2tpZTogc3RyaW5nO1xuICAgIHNjb3BlOiBzdHJpbmdbXTtcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIGNsaWVudFNlY3JldDogc3RyaW5nO1xuICAgIGlzU2VjdXJlOiBib29sZWFuO1xuICAgIGZvcmNlSHR0cHM6IGJvb2xlYW47XG4gICAgcHJvdmlkZXJQYXJhbXM/OiBhbnk7XG4gIH07XG4gIG5vbmNlQ29va2llPzogSGFwaS5TZXJ2ZXJTdGF0ZUNvb2tpZUNvbmZpZ3VhdGlvbk9iamVjdDtcbn1cblxuZnVuY3Rpb24gcm91dGVHZW4ob3B0aW9uczogQXV0aGVudGljYXRpb25TdHJhdGVneSwgc3RydXQ6IFN0cnV0U2VydmVyKSB7XG4gIGNvbnN0IGNvb2tpZU9wdGlvbnM6IEhhcGkuU2VydmVyU3RhdGVDb29raWVDb25maWd1YXRpb25PYmplY3QgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIHtcbiAgICAgIHR0bDogbnVsbCxcbiAgICAgIGlzU2VjdXJlOiB0cnVlLFxuICAgICAgaXNIdHRwT25seTogdHJ1ZSxcbiAgICAgIGVuY29kaW5nOiAnYmFzZTY0anNvbicsXG4gICAgICBpc1NhbWVTaXRlOiBmYWxzZSxcbiAgICAgIGNsZWFySW52YWxpZDogZmFsc2UsIC8vIHJlbW92ZSBpbnZhbGlkIGNvb2tpZXNcbiAgICAgIHN0cmljdEhlYWRlcjogdHJ1ZSAvLyBkb24ndCBhbGxvdyB2aW9sYXRpb25zIG9mIFJGQyA2MjY1XG4gICAgfSxcbiAgICBvcHRpb25zLm5vbmNlQ29va2llXG4gICk7XG4gIGNvbnN0IHJvdXRlSGFuZGxlcjogSGFwaS5Sb3V0ZUhhbmRsZXIgPSAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICByZXR1cm4gb3B0aW9ucy5oYW5kbGVyKHJlcXVlc3QpLnRoZW4ociA9PiB7XG4gICAgICBzdHJ1dC5pb1xuICAgICAgICAudG8ocmVxdWVzdC5zdGF0ZVtgJHtvcHRpb25zLm5hbWV9LW5vbmNlYF0ubm9uY2UpXG4gICAgICAgIC5lbWl0KHJlcXVlc3Quc3RhdGVbYCR7b3B0aW9ucy5uYW1lfS1ub25jZWBdLm5vbmNlLCB7XG4gICAgICAgICAgc3RhdHVzOiAnc3VjY2VzcycsXG4gICAgICAgICAgdG9rZW46IHIudG9rZW5cbiAgICAgICAgfSk7XG4gICAgICByZXBseShyLnJlc3BvbnNlKS50eXBlKCd0ZXh0L2h0bWwnKS51bnN0YXRlKGAke29wdGlvbnMubmFtZX0tbm9uY2VgKTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIHNlcnZlciA9PiB7XG4gICAgc2VydmVyLmF1dGguc3RyYXRlZ3kob3B0aW9ucy5uYW1lLCAnYmVsbCcsIG9wdGlvbnMuc3RyYXRlZ3kpO1xuICAgIHNlcnZlci5zdGF0ZShgJHtvcHRpb25zLm5hbWV9LW5vbmNlYCwgY29va2llT3B0aW9ucyk7XG4gICAgc2VydmVyLnJvdXRlKHtcbiAgICAgIG1ldGhvZDogWydHRVQnLCAnUE9TVCddLFxuICAgICAgcGF0aDogYC8ke29wdGlvbnMubmFtZX1gLFxuICAgICAgaGFuZGxlcjogcm91dGVIYW5kbGVyLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIGF1dGg6IG9wdGlvbnMubmFtZSxcbiAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICBwYXJzZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmVBdXRoKHN0cnV0OiBTdHJ1dFNlcnZlcikge1xuICBjb25zdCBwbHVnaW46IEhhcGkuUGx1Z2luRnVuY3Rpb248e1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gIH0+ID0gZnVuY3Rpb24ocywgXywgbmV4dCkge1xuICAgIHMucm91dGUoe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgaGFuZGxlcjogKHJlcXVlc3Q6IEhhcGkuUmVxdWVzdCwgcmVwbHk6IEhhcGkuQmFzZV9SZXBseSkgPT4ge1xuICAgICAgICByZXBseShcbiAgICAgICAgICBgXG4gICAgICAgICAgPGh0bWw+XG4gICAgICAgICAgICA8aGVhZD48bWV0YSBodHRwLWVxdWl2PVwicmVmcmVzaFwiIGNvbnRlbnQ9XCI1OyB1cmw9JHtzdHJ1dC5jb25maWdcbiAgICAgICAgICAgICAgLmF1dGhSb290fS8ke3JlcXVlc3QucXVlcnlbJ21ldGhvZCddfVwiIC8+PC9oZWFkPlxuICAgICAgICAgICAgPGJvZHk+UkVESVJFQ1RJTkcgJHtyZXF1ZXN0LnF1ZXJ5WydtZXRob2QnXX0gLyAke3JlcXVlc3QucXVlcnlbXG4gICAgICAgICAgICAnbm9uY2UnXG4gICAgICAgICAgXX08L2JvZHk+XG4gICAgICAgICAgPC9odG1sPlxuICAgICAgICBgXG4gICAgICAgIClcbiAgICAgICAgICAudHlwZSgndGV4dC9odG1sJylcbiAgICAgICAgICAuc3RhdGUoYCR7cmVxdWVzdC5xdWVyeVsnbWV0aG9kJ119LW5vbmNlYCwge1xuICAgICAgICAgICAgbm9uY2U6IHJlcXVlc3QucXVlcnlbJ25vbmNlJ11cbiAgICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgbWV0aG9kOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgIG5vbmNlOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHN0cnV0LmNvbmZpZy5hdXRoVHlwZXMuZm9yRWFjaCh0ID0+IHJvdXRlR2VuKHQsIHN0cnV0KShzKSk7XG4gICAgbmV4dCgpO1xuICB9O1xuICBwbHVnaW4uYXR0cmlidXRlcyA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIG5hbWU6ICdhdXRoZW50aWNhdGlvbidcbiAgfTtcbiAgcmV0dXJuIHBsdWdpbjtcbn1cbiJdfQ==
