'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rebindTokenValidator = rebindTokenValidator;
exports.configureAuth = configureAuth;

var _joi = require('joi');

var Joi = _interopRequireWildcard(_joi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    var routeHandler = function routeHandler(request, reply) {
        return options.handler(request, strut).then(function (r) {
            strut.io.to(request.state[options.name + '-nonce'].nonce).emit(request.state[options.name + '-nonce'].nonce, {
                response: 'token',
                status: 'success',
                token: r.token
            });
            reply(r.response).type('text/html').unstate(options.name + '-nonce');
        });
    };
    return function (server) {
        server.auth.strategy(options.name, 'bell', options.strategy);
        server.state(options.name + '-nonce', cookieOptions);
        server.route({
            method: ['GET', 'POST'],
            path: '/' + options.name,
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
function rebindTokenValidator(t) {
    return {
        validateFunc: function validateFunc(token, callback) {
            return t.validate(token, callback);
        }
    };
}
function configureAuth(strut) {
    var plugin = function plugin(s, _, next) {
        s.route({
            method: 'GET',
            path: '',
            handler: function handler(request, reply) {
                reply('\n          <html>\n            <head><meta http-equiv="refresh" content="0; url=' + strut.config.authRoot + '/' + request.query['method'] + '" /></head>\n            <body>REDIRECTING ' + request.query['method'] + ' / ' + request.query['nonce'] + '</body>\n          </html>\n        ').type('text/html').state(request.query['method'] + '-nonce', {
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
        strut.config.authTypes.forEach(function (t) {
            return routeGen(t, strut.services)(s);
        });
        next();
    };
    plugin.attributes = {
        version: '1.0.0',
        name: 'authentication'
    };
    return plugin;
}