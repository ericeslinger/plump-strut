'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _filter(input, f) {
    var rV = {
        id: input.id,
        type: input.type,
        relationships: {},
        attributes: {}
    };
    ['attributes', 'relationships'].forEach(function (thing) {
        if (input[thing]) {
            Object.keys(input[thing]).forEach(function (a) {
                if (f.type === 'white' && f[thing] && f[thing].indexOf(a) >= 0 || f.type === 'black' && (!f[thing] || !(f[thing].indexOf(a) >= 0))) {
                    rV[thing][a] = input[thing][a];
                }
            });
        }
    });
    return rV;
}

var Oracle = exports.Oracle = function () {
    function Oracle(keyService) {
        _classCallCheck(this, Oracle);

        this.keyService = keyService;
        this.authorizers = {};
        this.filters = {};
    }

    _createClass(Oracle, [{
        key: 'addAuthorizer',
        value: function addAuthorizer(auth, forType) {
            this.authorizers[forType] = auth;
        }
    }, {
        key: 'filter',
        value: function filter(md) {
            if (this.filters[md.type]) {
                return _filter(md, this.filters[md.type]);
            } else {
                return md;
            }
        }
    }, {
        key: 'addFilter',
        value: function addFilter(f, forType) {
            this.filters[forType] = f;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(request) {
            var _this = this;

            return Promise.resolve().then(function () {
                if (request.kind === 'compound') {
                    return Promise.all(request.list.map(function (v) {
                        return _this.dispatch(v);
                    })).then(function (res) {
                        return request.combinator === 'or' ? res.some(function (v) {
                            return v.result;
                        }) : res.every(function (v) {
                            return v.result;
                        });
                    }).then(function (f) {
                        return { kind: 'final', result: f };
                    });
                } else {
                    return _this.authorizers[request.target.type].authorize(request);
                }
            }).then(function (v) {
                if (v.kind === 'final') {
                    return v;
                } else if (v.kind === 'delegated') {
                    return _this.dispatch(v.delegate);
                }
            });
        }
    }, {
        key: 'authorize',
        value: function authorize(request) {
            return this.dispatch(request).then(function (f) {
                return f.result;
            });
        }
    }]);

    return Oracle;
}();