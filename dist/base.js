'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseController = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _baseRoutes = require('./baseRoutes');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var baseRoutes = (0, _baseRoutes.createRoutes)();

function plugin(server, _, next) {
  var _this = this;

  server.route(this.constructor.routes.map(function (method) {
    return _this.route(method, baseRoutes[method]);
  }).reduce(function (acc, curr) {
    return acc.concat(curr);
  }, []) // routeRelationship returns an array
  );
  server.route(this.extraRoutes());
  next();
}

var BaseController = exports.BaseController = function () {
  function BaseController(plump, Model) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, BaseController);

    this.plump = plump;
    this.Model = Model;
    this.options = Object.assign({}, { sideloads: [] }, options);
    this.plugin = plugin.bind(this);
    this.plugin.attributes = Object.assign({}, {
      version: '1.0.0',
      name: this.Model.$name
    }, this.options.plugin);
  }

  _createClass(BaseController, [{
    key: 'extraRoutes',
    value: function extraRoutes() {
      return [];
    }
  }, {
    key: 'read',
    value: function read() {
      var _this2 = this;

      return function (request) {
        return request.pre.item.$get().then(function (obj) {
          return _bluebird2.default.all(_this2.options.sideloads.map(function (field) {
            return request.pre.item.$get(field);
          })).then(function (values) {
            var sides = {};
            values.forEach(function (v, idx) {
              sides[_this2.options.sideloads[idx]] = v;
            });
            return Object.assign({}, obj, sides);
          });
        }).then(function (resp) {
          return _defineProperty({}, _this2.Model.$name, [resp]);
        });
      };
    }
  }, {
    key: 'update',
    value: function update() {
      return function (request) {
        return request.pre.item.$set(request.payload).$save().then(function (v) {
          return v.$get();
        });
      };
    }
  }, {
    key: 'delete',
    value: function _delete() {
      return function (request) {
        return request.pre.item.$delete();
      };
    }
  }, {
    key: 'create',
    value: function create() {
      var _this3 = this;

      return function (request) {
        return new _this3.Model(request.payload, _this3.plump).$save().then(function (v) {
          return v.$get();
        });
      };
    }
  }, {
    key: 'addChild',
    value: function addChild(_ref2) {
      var field = _ref2.field;

      return function (request) {
        return request.pre.item.$add(field, request.payload).$save();
      };
    }
  }, {
    key: 'listChildren',
    value: function listChildren(_ref3) {
      var field = _ref3.field;

      return function (request) {
        return request.pre.item.$get(field).then(function (list) {
          return _defineProperty({}, field, list);
        });
      };
    }
  }, {
    key: 'removeChild',
    value: function removeChild(_ref5) {
      var field = _ref5.field;

      return function (request) {
        return request.pre.item.$remove(field, request.params.childId).$save();
      };
    }
  }, {
    key: 'modifyChild',
    value: function modifyChild(_ref6) {
      var field = _ref6.field;

      return function (request) {
        return request.pre.item.$modifyRelationship(field, request.params.childId, request.payload).$save();
      };
    }
  }, {
    key: 'query',
    value: function query() {
      var _this4 = this;

      return function (request) {
        return _this4.plump.query(_this4.Model.$name, request.query);
      };
    }
  }, {
    key: 'schema',
    value: function schema() {
      var _this5 = this;

      return function () {
        return _bluebird2.default.resolve({
          schema: JSON.parse(JSON.stringify(_this5.Model))
        });
      };
    }
  }, {
    key: 'createHandler',
    value: function createHandler(method, options) {
      var handler = this[method](options);
      return function (request, reply) {
        return handler(request).then(function (response) {
          reply(response).code(200);
        }).catch(function (err) {
          console.log(err);
          reply(_boom2.default.badImplementation(err));
        });
      };
    }
  }, {
    key: 'createJoiValidator',
    value: function createJoiValidator(field) {
      try {
        var schema = this.Model.$schema;
        if (field) {
          if (field in schema.attributes) {
            return _defineProperty({}, field, _joi2.default[schema.attributes[field].type]());
          } else if (field in schema.relationships) {
            var retVal = { id: _joi2.default.number() };

            if (schema.relationships[field].type.$extras) {
              var extras = schema.relationships[field].type.$extras;

              Object.keys(extras).forEach(function (extra) {
                var extraType = extras[extra].type;
                retVal[extra] = _joi2.default[extraType]();
              });
            }
            return retVal;
          } else {
            return {};
          }
        } else {
          var _retVal = {
            type: _joi2.default.string(),
            id: _joi2.default.number(),
            attributes: {},
            relationships: {}
          };

          Object.keys(schema.attributes).forEach(function (attr) {
            _retVal.attributes[attr] = _joi2.default[schema.attributes[attr].type]();
          });

          Object.keys(schema.relationships).forEach(function (relName) {
            _retVal.relationships[relName] = { id: _joi2.default.number() };

            if (schema.relationships[relName].type.$extras) {
              var _extras = schema.relationships[relName].type.$extras;

              for (var extra in _extras) {
                // eslint-disable-line guard-for-in
                var extraType = _extras[extra].type;
                _retVal.relationships[relName][extra] = _joi2.default[extraType]();
              }
            }
          });
          console.log(JSON.stringify(_retVal, null, 2));
          return _retVal;
        }
      } catch (err) {
        console.log(err);
        return {};
      }
    }
  }, {
    key: 'loadHandler',
    value: function loadHandler() {
      var _this6 = this;

      return {
        method: function method(request, reply) {
          if (request.params && request.params.itemId) {
            var item = _this6.plump.find(_this6.Model.$name, request.params.itemId);
            return item.$get().then(function (thing) {
              if (thing) {
                reply(item);
              } else {
                reply(_boom2.default.notFound());
              }
            }).catch(function (err) {
              console.log(err);
              reply(_boom2.default.badImplementation(err));
            });
          } else {
            return reply(_boom2.default.notFound());
          }
        },
        assign: 'item'
      };
    }
  }, {
    key: 'route',
    value: function route(method, opts) {
      if (opts.plural) {
        return this.routeRelationships(method, opts);
      } else {
        return this.routeAttributes(method, opts);
      }
    }

    // override approveHandler with whatever per-route
    // logic you want - reply with Boom.notAuthorized()
    // or any other value on non-approved status

  }, {
    key: 'approveHandler',
    value: function approveHandler(method, opts) {
      // eslint-disable-line no-unused-vars
      return {
        method: function method(request, reply) {
          return reply(true);
        },
        assign: 'approve'
      };
    }
  }, {
    key: 'routeRelationships',
    value: function routeRelationships(method, opts) {
      var _this7 = this;

      return Object.keys(this.Model.$schema.relationships).map(function (field) {
        var genericOpts = (0, _mergeOptions2.default)({}, opts, {
          validate: {},
          generatorOptions: { field: field }
        });
        genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
        if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
          genericOpts.validate.payload = _this7.createJoiValidator(field);
        }
        genericOpts.plural = false;
        return _this7.routeAttributes(method, genericOpts);
      });
    }
  }, {
    key: 'routeAttributes',
    value: function routeAttributes(method, opts) {
      /*
      opts: {
        pre: [ANY PREHANDLERs]
        handler: handler override
        validate: {Joi by type (param, query, payload)},
        auth: anything other than token,
        hapi: {ALL OTHER HAPI OPTIONS, MUST BE JSON STRINGIFYABLE},
      },
      */

      var routeConfig = (0, _mergeOptions2.default)({}, {
        handler: opts.handler || this.createHandler(method, opts.generatorOptions),
        config: {
          pre: [this.approveHandler(method, opts.generatorOptions)],
          validate: {}
        }
      }, opts.hapi);

      if (opts.hapi.path.indexOf('itemId') >= 0) {
        routeConfig.config.pre.unshift(this.loadHandler());
      }

      if (opts.pre !== undefined) {
        opts.pre.forEach(function (p) {
          return routeConfig.config.pre.push(p);
        });
      }

      if (opts.validate && opts.validate.query) {
        routeConfig.config.validate.query = opts.validate.query;
      }

      if (opts.validate && opts.validate.params) {
        routeConfig.config.validate.params = opts.validate.params;
      }

      if (opts.validate && opts.validate.payload === true) {
        routeConfig.config.validate.payload = this.createJoiValidator();
      } else if (opts.validate && opts.validate.payload) {
        routeConfig.config.validate.payload = opts.validate.payload;
      }
      return routeConfig;
    }
  }]);

  return BaseController;
}();

BaseController.routes = ['read', 'query', 'listChildren', 'addChild', 'removeChild', 'modifyChild', 'create', 'update', 'delete'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRnZXQiLCJ0aGVuIiwib2JqIiwiYWxsIiwiZmllbGQiLCJ2YWx1ZXMiLCJzaWRlcyIsImZvckVhY2giLCJ2IiwiaWR4IiwicmVzcCIsIiRzZXQiLCJwYXlsb2FkIiwiJHNhdmUiLCIkZGVsZXRlIiwiJGFkZCIsImxpc3QiLCIkcmVtb3ZlIiwicGFyYW1zIiwiY2hpbGRJZCIsIiRtb2RpZnlSZWxhdGlvbnNoaXAiLCJxdWVyeSIsInJlc29sdmUiLCJzY2hlbWEiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJoYW5kbGVyIiwicmVwbHkiLCJyZXNwb25zZSIsImNvZGUiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJiYWRJbXBsZW1lbnRhdGlvbiIsIiRzY2hlbWEiLCJ0eXBlIiwicmVsYXRpb25zaGlwcyIsInJldFZhbCIsImlkIiwibnVtYmVyIiwiJGV4dHJhcyIsImV4dHJhcyIsImtleXMiLCJleHRyYVR5cGUiLCJleHRyYSIsInN0cmluZyIsImF0dHIiLCJyZWxOYW1lIiwiaXRlbUlkIiwiZmluZCIsInRoaW5nIiwibm90Rm91bmQiLCJvcHRzIiwicGx1cmFsIiwicm91dGVSZWxhdGlvbnNoaXBzIiwicm91dGVBdHRyaWJ1dGVzIiwiZ2VuZXJpY09wdHMiLCJ2YWxpZGF0ZSIsImdlbmVyYXRvck9wdGlvbnMiLCJoYXBpIiwicGF0aCIsInJlcGxhY2UiLCJpbmRleE9mIiwiY3JlYXRlSm9pVmFsaWRhdG9yIiwicm91dGVDb25maWciLCJjcmVhdGVIYW5kbGVyIiwiY29uZmlnIiwiYXBwcm92ZUhhbmRsZXIiLCJ1bnNoaWZ0IiwibG9hZEhhbmRsZXIiLCJ1bmRlZmluZWQiLCJwIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxhQUFhLCtCQUFuQjs7QUFFQSxTQUFTQyxNQUFULENBQWdCQyxNQUFoQixFQUF3QkMsQ0FBeEIsRUFBMkJDLElBQTNCLEVBQWlDO0FBQUE7O0FBQy9CRixTQUFPRyxLQUFQLENBQ0UsS0FBS0MsV0FBTCxDQUFpQkMsTUFBakIsQ0FDQ0MsR0FERCxDQUNLLFVBQUNDLE1BQUQ7QUFBQSxXQUFZLE1BQUtKLEtBQUwsQ0FBV0ksTUFBWCxFQUFtQlQsV0FBV1MsTUFBWCxDQUFuQixDQUFaO0FBQUEsR0FETCxFQUVDQyxNQUZELENBRVEsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsV0FBZUQsSUFBSUUsTUFBSixDQUFXRCxJQUFYLENBQWY7QUFBQSxHQUZSLEVBRXlDLEVBRnpDLENBREYsQ0FHK0M7QUFIL0M7QUFLQVYsU0FBT0csS0FBUCxDQUFhLEtBQUtTLFdBQUwsRUFBYjtBQUNBVjtBQUNEOztJQUVZVyxjLFdBQUFBLGM7QUFDWCwwQkFBWUMsS0FBWixFQUFtQkMsS0FBbkIsRUFBd0M7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQUE7O0FBQ3RDLFNBQUtGLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLE9BQUwsR0FBZUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRUMsV0FBVyxFQUFiLEVBQWxCLEVBQXFDSCxPQUFyQyxDQUFmO0FBQ0EsU0FBS2pCLE1BQUwsR0FBY0EsT0FBT3FCLElBQVAsQ0FBWSxJQUFaLENB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T0FBNUIsR0FBc0MwQyxLQUFLSyxRQUFMLENBQWMvQyxPQUFwRDtBQUNEO0FBQ0QsYUFBT3NELFdBQVA7QUFDRDs7Ozs7O0FBR0hqRixlQUFlUixNQUFmLEdBQXdCLENBQ3RCLE1BRHNCLEVBRXRCLE9BRnNCLEVBR3RCLGNBSHNCLEVBSXRCLFVBSnNCLEVBS3RCLGFBTHNCLEVBTXRCLGFBTnNCLEVBT3RCLFFBUHNCLEVBUXRCLFFBUnNCLEVBU3RCLFFBVHNCLENBQXhCIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQm9vbSBmcm9tICdib29tJztcbmltcG9ydCBKb2kgZnJvbSAnam9pJztcbmltcG9ydCB7IGNyZWF0ZVJvdXRlcyB9IGZyb20gJy4vYmFzZVJvdXRlcyc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuY29uc3QgYmFzZVJvdXRlcyA9IGNyZWF0ZVJvdXRlcygpO1xuXG5mdW5jdGlvbiBwbHVnaW4oc2VydmVyLCBfLCBuZXh0KSB7XG4gIHNlcnZlci5yb3V0ZShcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnJvdXRlc1xuICAgIC5tYXAoKG1ldGhvZCkgPT4gdGhpcy5yb3V0ZShtZXRob2QsIGJhc2VSb3V0ZXNbbWV0aG9kXSkpXG4gICAgLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIpLCBbXSkgLy8gcm91dGVSZWxhdGlvbnNoaXAgcmV0dXJucyBhbiBhcnJheVxuICApO1xuICBzZXJ2ZXIucm91dGUodGhpcy5leHRyYVJvdXRlcygpKTtcbiAgbmV4dCgpO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihwbHVtcCwgTW9kZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGx1bXAgPSBwbHVtcDtcbiAgICB0aGlzLk1vZGVsID0gTW9kZWw7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaWRlbG9hZHM6IFtdIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4uYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBuYW1lOiB0aGlzLk1vZGVsLiRuYW1lLFxuICAgIH0sIHRoaXMub3B0aW9ucy5wbHVnaW4pO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoKVxuICAgICAgLnRoZW4oKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gQmx1ZWJpcmQuYWxsKHRoaXMub3B0aW9ucy5zaWRlbG9hZHMubWFwKChmaWVsZCkgPT4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKSkpXG4gICAgICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgICAgICBjb25zdCBzaWRlcyA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2LCBpZHgpID0+IHtcbiAgICAgICAgICAgIHNpZGVzW3RoaXMub3B0aW9ucy5zaWRlbG9hZHNbaWR4XV0gPSB2O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvYmosIHNpZGVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgW3RoaXMuTW9kZWwuJG5hbWVdOiBbcmVzcF0sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICB1cGRhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kc2V0KHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRkZWxldGUoKTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsKHJlcXVlc3QucGF5bG9hZCwgdGhpcy5wbHVtcClcbiAgICAgIC4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYWRkQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGxpc3RDaGlsZHJlbih7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpXG4gICAgICAudGhlbigobGlzdCkgPT4ge1xuICAgICAgICByZXR1cm4geyBbZmllbGRdOiBsaXN0IH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kcmVtb3ZlKGZpZWxkLCByZXF1ZXN0LnBhcmFtcy5jaGlsZElkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBtb2RpZnlDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRtb2RpZnlSZWxhdGlvbnNoaXAoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsIHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wbHVtcC5xdWVyeSh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnF1ZXJ5KTtcbiAgICB9O1xuICB9XG5cbiAgc2NoZW1hKCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSh7XG4gICAgICAgIHNjaGVtYTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLk1vZGVsKSksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpc1ttZXRob2RdKG9wdGlvbnMpO1xuICAgIHJldHVybiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyKHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmVwbHkocmVzcG9uc2UpLmNvZGUoMjAwKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5Nb2RlbC4kc2NoZW1hO1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZCBpbiBzY2hlbWEuYXR0cmlidXRlcykge1xuICAgICAgICAgIHJldHVybiB7IFtmaWVsZF06IEpvaVtzY2hlbWEuYXR0cmlidXRlc1tmaWVsZF0udHlwZV0oKSB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZpZWxkIGluIHNjaGVtYS5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgY29uc3QgcmV0VmFsID0geyBpZDogSm9pLm51bWJlcigpIH07XG5cbiAgICAgICAgICBpZiAoc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGUuJGV4dHJhcykge1xuICAgICAgICAgICAgY29uc3QgZXh0cmFzID0gc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGUuJGV4dHJhcztcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZXh0cmFzKS5mb3JFYWNoKGV4dHJhID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXh0cmFUeXBlID0gZXh0cmFzW2V4dHJhXS50eXBlO1xuICAgICAgICAgICAgICByZXRWYWxbZXh0cmFdID0gSm9pW2V4dHJhVHlwZV0oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge1xuICAgICAgICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICBpZDogSm9pLm51bWJlcigpLFxuICAgICAgICAgIGF0dHJpYnV0ZXM6IHt9LFxuICAgICAgICAgIHJlbGF0aW9uc2hpcHM6IHt9LFxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5hdHRyaWJ1dGVzKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgIHJldFZhbC5hdHRyaWJ1dGVzW2F0dHJdID0gSm9pW3NjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5yZWxhdGlvbnNoaXBzKS5mb3JFYWNoKHJlbE5hbWUgPT4ge1xuICAgICAgICAgIHJldFZhbC5yZWxhdGlvbnNoaXBzW3JlbE5hbWVdID0geyBpZDogSm9pLm51bWJlcigpIH07XG5cbiAgICAgICAgICBpZiAoc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0udHlwZS4kZXh0cmFzKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYXMgPSBzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxOYW1lXS50eXBlLiRleHRyYXM7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXh0cmEgaW4gZXh0cmFzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ3VhcmQtZm9yLWluXG4gICAgICAgICAgICAgIGNvbnN0IGV4dHJhVHlwZSA9IGV4dHJhc1tleHRyYV0udHlwZTtcbiAgICAgICAgICAgICAgcmV0VmFsLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV1bZXh0cmFdID0gSm9pW2V4dHJhVHlwZV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXRWYWwsIG51bGwsIDIpKTtcbiAgICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgbG9hZEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnBhcmFtcyAmJiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5wbHVtcC5maW5kKHRoaXMuTW9kZWwuJG5hbWUsIHJlcXVlc3QucGFyYW1zLml0ZW1JZCk7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uJGdldCgpXG4gICAgICAgICAgLnRoZW4oKHRoaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpbmcpIHtcbiAgICAgICAgICAgICAgcmVwbHkoaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXNzaWduOiAnaXRlbScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlKG1ldGhvZCwgb3B0cykge1xuICAgIGlmIChvcHRzLnBsdXJhbCkge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVSZWxhdGlvbnNoaXBzKG1ldGhvZCwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlQXR0cmlidXRlcyhtZXRob2QsIG9wdHMpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gb3ZlcnJpZGUgYXBwcm92ZUhhbmRsZXIgd2l0aCB3aGF0ZXZlciBwZXItcm91dGVcbiAgLy8gbG9naWMgeW91IHdhbnQgLSByZXBseSB3aXRoIEJvb20ubm90QXV0aG9yaXplZCgpXG4gIC8vIG9yIGFueSBvdGhlciB2YWx1ZSBvbiBub24tYXBwcm92ZWQgc3RhdHVzXG4gIGFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgIH07XG4gIH1cblxuICByb3V0ZVJlbGF0aW9uc2hpcHMobWV0aG9kLCBvcHRzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuTW9kZWwuJHNjaGVtYS5yZWxhdGlvbnNoaXBzKS5tYXAoZmllbGQgPT4ge1xuICAgICAgY29uc3QgZ2VuZXJpY09wdHMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICAgIHt9LFxuICAgICAgICBvcHRzLFxuICAgICAgICB7XG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICAgIGdlbmVyYXRvck9wdGlvbnM6IHsgZmllbGQgfSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGdlbmVyaWNPcHRzLmhhcGkucGF0aCA9IGdlbmVyaWNPcHRzLmhhcGkucGF0aC5yZXBsYWNlKCd7ZmllbGR9JywgZmllbGQpO1xuICAgICAgaWYgKFsnUE9TVCcsICdQVVQnLCAnUEFUQ0gnXS5pbmRleE9mKGdlbmVyaWNPcHRzLmhhcGkubWV0aG9kKSA+PSAwKSB7XG4gICAgICAgIGdlbmVyaWNPcHRzLnZhbGlkYXRlLnBheWxvYWQgPSB0aGlzLmNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCk7XG4gICAgICB9XG4gICAgICBnZW5lcmljT3B0cy5wbHVyYWwgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlQXR0cmlidXRlcyhtZXRob2QsIGdlbmVyaWNPcHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvdXRlQXR0cmlidXRlcyhtZXRob2QsIG9wdHMpIHtcbiAgICAvKlxuICAgIG9wdHM6IHtcbiAgICAgIHByZTogW0FOWSBQUkVIQU5ETEVSc11cbiAgICAgIGhhbmRsZXI6IGhhbmRsZXIgb3ZlcnJpZGVcbiAgICAgIHZhbGlkYXRlOiB7Sm9pIGJ5IHR5cGUgKHBhcmFtLCBxdWVyeSwgcGF5bG9hZCl9LFxuICAgICAgYXV0aDogYW55dGhpbmcgb3RoZXIgdGhhbiB0b2tlbixcbiAgICAgIGhhcGk6IHtBTEwgT1RIRVIgSEFQSSBPUFRJT05TLCBNVVNUIEJFIEpTT04gU1RSSU5HSUZZQUJMRX0sXG4gICAgfSxcbiAgICAqL1xuXG4gICAgY29uc3Qgcm91dGVDb25maWcgPSBtZXJnZU9wdGlvbnMoXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogb3B0cy5oYW5kbGVyIHx8IHRoaXMuY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyksXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHByZTogW3RoaXMuYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzLmdlbmVyYXRvck9wdGlvbnMpXSxcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgb3B0cy5oYXBpXG4gICAgKTtcblxuICAgIGlmIChvcHRzLmhhcGkucGF0aC5pbmRleE9mKCdpdGVtSWQnKSA+PSAwKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcucHJlLnVuc2hpZnQodGhpcy5sb2FkSGFuZGxlcigpKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5wcmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0cy5wcmUuZm9yRWFjaCgocCkgPT4gcm91dGVDb25maWcuY29uZmlnLnByZS5wdXNoKHApKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnF1ZXJ5KSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucXVlcnkgPSBvcHRzLnZhbGlkYXRlLnF1ZXJ5O1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGFyYW1zKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGFyYW1zID0gb3B0cy52YWxpZGF0ZS5wYXJhbXM7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkID09PSB0cnVlKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IHRoaXMuY3JlYXRlSm9pVmFsaWRhdG9yKCk7XG4gICAgfSBlbHNlIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGF5bG9hZCkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBheWxvYWQgPSBvcHRzLnZhbGlkYXRlLnBheWxvYWQ7XG4gICAgfVxuICAgIHJldHVybiByb3V0ZUNvbmZpZztcbiAgfVxufVxuXG5CYXNlQ29udHJvbGxlci5yb3V0ZXMgPSBbXG4gICdyZWFkJyxcbiAgJ3F1ZXJ5JyxcbiAgJ2xpc3RDaGlsZHJlbicsXG4gICdhZGRDaGlsZCcsXG4gICdyZW1vdmVDaGlsZCcsXG4gICdtb2RpZnlDaGlsZCcsXG4gICdjcmVhdGUnLFxuICAndXBkYXRlJyxcbiAgJ2RlbGV0ZScsXG5dO1xuIl19
