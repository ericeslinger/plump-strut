'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Strut = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hapi = require('hapi');

var Hapi = _interopRequireWildcard(_hapi);

var _socket = require('socket.io');

var SocketIO = _interopRequireWildcard(_socket);

var _bell = require('bell');

var Bell = _interopRequireWildcard(_bell);

var _hapiAuthBearerToken = require('hapi-auth-bearer-token');

var bearer = _interopRequireWildcard(_hapiAuthBearerToken);

var _mergeOptions = require('merge-options');

var mergeOptions = _interopRequireWildcard(_mergeOptions);

var _authentication = require('./authentication');

var _dispatch = require('./socket/dispatch');

var _base = require('./base');

var _joi = require('./joi');

var _authorize = require('./authorize');

var _authentication2 = require('./socket/authentication.channel');

var _handle = require('./handle');

var _plugin = require('./plugin');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultSettings = {
    apiRoot: '/api',
    authTypes: [],
    apiPort: 3000,
    authRoot: '/auth',
    apiHostname: 'localhost',
    apiProtocol: 'http',
    routeOptions: {},
    defaultController: {
        generators: [_base.base, _joi.joi, _authorize.authorize, _handle.handle],
        attributes: ['create', 'read', 'update', 'delete'],
        relationships: ['create', 'read', 'update', 'delete'],
        other: ['query']
    },
    socketHandlers: [_authentication2.AuthenticationChannel],
    modelControllers: {}
};

var Strut = exports.Strut = function () {
    function Strut(plump, conf) {
        var services = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Strut);

        this.services = services;
        this.extensions = {};
        this.services.hapi = new Hapi.Server();
        this.services.plump = plump;
        this.config = mergeOptions({}, defaultSettings, conf);
    }

    _createClass(Strut, [{
        key: 'preRoute',
        value: function preRoute() {
            var _this = this;

            return Promise.resolve().then(function () {
                if (_this.services.tokenStore) {
                    return _this.services.hapi.register(bearer).then(function () {
                        return _this.services.hapi.auth.strategy('token', 'bearer-access-token', {
                            validateFunc: function validateFunc(token, callback) {
                                return _this.services.tokenStore.validate(token, callback);
                            }
                        });
                    });
                }
            });
        }
    }, {
        key: 'preInit',
        value: function preInit() {
            var _this2 = this;

            return Promise.resolve().then(function () {
                _this2.services.hapi.connection({ port: _this2.config.apiPort });
                return _this2.services.hapi.register(Bell);
            }).then(function () {
                _this2.services.hapi.state('authNonce', {
                    ttl: null,
                    isSecure: false,
                    isHttpOnly: false,
                    encoding: 'base64json',
                    clearInvalid: false,
                    strictHeader: true
                });
            });
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            var _this3 = this;

            return this.preInit().then(function () {
                return _this3.preRoute();
            }).then(function () {
                return Promise.all((_this3.config.models || _this3.services.plump.getTypes()).map(function (t) {
                    // debugger;
                    return _this3.services.hapi.register((0, _plugin.plugin)(_this3.config.modelControllers[t.type] || _this3.config.defaultController, {
                        cors: true,
                        authentication: 'token',
                        model: t
                    }, _this3.services), { routes: { prefix: _this3.config.apiRoot + '/' + t.type } });
                }));
            }).then(function () {
                if (_this3.config.extraControllers) {
                    return Promise.all(_this3.config.extraControllers.map(function (ctrl) {
                        return _this3.services.hapi.register((0, _plugin.plugin)(ctrl, { cors: true, authentication: 'token', routeName: ctrl.name }, _this3.services), { routes: { prefix: _this3.config.apiRoot + '/' + ctrl.name } });
                    }));
                } else {
                    return;
                }
            }).then(function () {
                return _this3.services.hapi.register((0, _authentication.configureAuth)(_this3), {
                    routes: { prefix: _this3.config.authRoot }
                });
            }).then(function () {
                _this3.services.hapi.ext('onPreAuth', function (request, reply) {
                    request.connection.info.protocol = _this3.config.apiProtocol;
                    return reply.continue();
                });
            }).then(function () {
                _this3.services.io = SocketIO(_this3.services.hapi.listener);
                _this3.config.socketHandlers.forEach(function (h) {
                    return (0, _dispatch.dispatch)(h, _this3);
                });
            });
        }
    }, {
        key: 'baseUrl',
        value: function baseUrl() {
            if (this.config.externalHost) {
                return this.config.externalHost;
            } else if (this.config.apiPort) {
                return this.config.apiProtocol + '://' + this.config.apiHostname + ':' + this.config.apiPort;
            } else {
                return this.config.apiProtocol + '://' + this.config.apiHostname;
            }
        }
    }, {
        key: 'start',
        value: function start() {
            return this.services.hapi.start();
        }
    }]);

    return Strut;
}();