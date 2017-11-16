'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.base = undefined;

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var base = exports.base = function base(options, services) {
    return function (i) {
        function routeBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            method: 'POST',
                            path: '',
                            config: {
                                payload: { output: 'data', parse: true }
                            }
                        };
                    case 'read':
                        return {
                            method: 'GET',
                            path: '/{itemId}'
                        };
                    case 'update':
                        return {
                            method: 'PATCH',
                            path: '/{itemId}',
                            config: {
                                payload: { output: 'data', parse: true }
                            }
                        };
                    case 'delete':
                        return {
                            method: 'DELETE',
                            path: '/{itemId}'
                        };
                }
            } else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            method: 'PUT',
                            path: '/{itemId}/' + options.relationship,
                            config: {
                                payload: { output: 'data', parse: true }
                            }
                        };
                    case 'read':
                        return {
                            method: 'GET',
                            path: '/{itemId}/' + options.relationship
                        };
                    case 'update':
                        return {
                            method: 'PATCH',
                            path: '/{itemId}/' + options.relationship + '/{childId}',
                            config: {
                                payload: { output: 'data', parse: true }
                            }
                        };
                    case 'delete':
                        return {
                            method: 'DELETE',
                            path: '/{itemId}/' + options.relationship + '/{childId}'
                        };
                }
            } else if (options.kind === 'other') {
                if (options.action === 'query') {
                    return {
                        method: 'GET',
                        path: ''
                    };
                }
            }
        }
        return (0, _mergeOptions2.default)({}, i, {
            config: {
                cors: options.cors ? options.cors : false,
                pre: []
            }
        }, routeBlock());
    };
};