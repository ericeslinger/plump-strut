'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.base = undefined;

var _mergeOptions = require('merge-options');

var mergeOptions = _interopRequireWildcard(_mergeOptions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
        return mergeOptions({}, i, {
            config: {
                cors: options.cors ? options.cors : false,
                pre: []
            }
        }, routeBlock());
    };
};