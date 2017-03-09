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
      return function (request) {
        return request.pre.item.$bulkGet();
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
      var _this2 = this;

      return function (request) {
        return new _this2.Model(request.payload, _this2.plump).$save().then(function (v) {
          return v.$get();
        });
      };
    }
  }, {
    key: 'addChild',
    value: function addChild(_ref) {
      var field = _ref.field;

      return function (request) {
        return request.pre.item.$add(field, request.payload).$save();
      };
    }
  }, {
    key: 'listChildren',
    value: function listChildren(_ref2) {
      var field = _ref2.field;

      return function (request) {
        return request.pre.item.$get(field).then(function (list) {
          return _defineProperty({}, field, list);
        });
      };
    }
  }, {
    key: 'removeChild',
    value: function removeChild(_ref4) {
      var field = _ref4.field;

      return function (request) {
        return request.pre.item.$remove(field, request.params.childId).$save();
      };
    }
  }, {
    key: 'modifyChild',
    value: function modifyChild(_ref5) {
      var field = _ref5.field;

      return function (request) {
        return request.pre.item.$modifyRelationship(field, request.params.childId, request.payload).$save();
      };
    }
  }, {
    key: 'query',
    value: function query() {
      var _this3 = this;

      return function (request) {
        return _this3.plump.query(_this3.Model.$name, request.query);
      };
    }
  }, {
    key: 'schema',
    value: function schema() {
      var _this4 = this;

      return function () {
        return _bluebird2.default.resolve({
          schema: JSON.parse(JSON.stringify(_this4.Model))
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
            var itemSchema = { id: _joi2.default.number() };

            if (schema.relationships[relName].type.$extras) {
              var _extras = schema.relationships[relName].type.$extras;

              for (var extra in _extras) {
                // eslint-disable-line guard-for-in
                var extraType = _extras[extra].type;
                itemSchema.meta = itemSchema.meta || {};
                itemSchema.meta[extra] = _joi2.default[extraType]();
              }
            }
            _retVal.relationships[relName] = _joi2.default.array().items({
              op: _joi2.default.string().valid('add', 'modify', 'remove'),
              data: itemSchema
            });
          });
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
      var _this5 = this;

      return {
        method: function method(request, reply) {
          if (request.params && request.params.itemId) {
            var item = _this5.plump.find(_this5.Model.$name, request.params.itemId);
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
      var _this6 = this;

      return Object.keys(this.Model.$schema.relationships).map(function (field) {
        var genericOpts = (0, _mergeOptions2.default)({}, opts, {
          validate: {},
          generatorOptions: { field: field }
        });
        genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
        if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
          genericOpts.validate.payload = _this6.createJoiValidator(field);
        }
        genericOpts.plural = false;
        return _this6.routeAttributes(method, genericOpts);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRidWxrR2V0IiwiJHNldCIsInBheWxvYWQiLCIkc2F2ZSIsInRoZW4iLCJ2IiwiJGdldCIsIiRkZWxldGUiLCJmaWVsZCIsIiRhZGQiLCJsaXN0IiwiJHJlbW92ZSIsInBhcmFtcyIsImNoaWxkSWQiLCIkbW9kaWZ5UmVsYXRpb25zaGlwIiwicXVlcnkiLCJyZXNvbHZlIiwic2NoZW1hIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiaGFuZGxlciIsInJlcGx5IiwicmVzcG9uc2UiLCJjb2RlIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYmFkSW1wbGVtZW50YXRpb24iLCIkc2NoZW1hIiwidHlwZSIsInJlbGF0aW9uc2hpcHMiLCJyZXRWYWwiLCJpZCIsIm51bWJlciIsIiRleHRyYXMiLCJleHRyYXMiLCJrZXlzIiwiZm9yRWFjaCIsImV4dHJhVHlwZSIsImV4dHJhIiwic3RyaW5nIiwiYXR0ciIsIml0ZW1TY2hlbWEiLCJyZWxOYW1lIiwibWV0YSIsImFycmF5IiwiaXRlbXMiLCJvcCIsInZhbGlkIiwiZGF0YSIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwib3B0cyIsInBsdXJhbCIsInJvdXRlUmVsYXRpb25zaGlwcyIsInJvdXRlQXR0cmlidXRlcyIsImdlbmVyaWNPcHRzIiwidmFsaWRhdGUiLCJnZW5lcmF0b3JPcHRpb25zIiwiaGFwaSIsInBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsImNyZWF0ZUpvaVZhbGlkYXRvciIsInJvdXRlQ29uZmlnIiwiY3JlYXRlSGFuZGxlciIsImNvbmZpZyIsImFwcHJvdmVIYW5kbGVyIiwidW5zaGlmdCIsImxvYWRIYW5kbGVyIiwidW5kZWZpbmVkIiwicCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsYUFBYSwrQkFBbkI7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUJULFdBQVdTLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLEdBQUQsRUFBTUMsSUFBTjtBQUFBLFdBQWVELElBQUlFLE1BQUosQ0FBV0QsSUFBWCxDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUVDLFdBQVcsRUFBYixFQUFsQixFQUFxQ0gsT0FBckMsQ0FBZjtBQUNBLFNBQUtqQixNQUFMLEdBQWNB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OUMsS0FBNUIsR0FBb0N5QyxLQUFLSyxRQUFMLENBQWM5QyxLQUFsRDtBQUNEOztBQUVELFVBQUl5QyxLQUFLSyxRQUFMLElBQWlCTCxLQUFLSyxRQUFMLENBQWNqRCxNQUFuQyxFQUEyQztBQUN6Q3dELG9CQUFZRSxNQUFaLENBQW1CVCxRQUFuQixDQUE0QmpELE1BQTVCLEdBQXFDNEMsS0FBS0ssUUFBTCxDQUFjakQsTUFBbkQ7QUFDRDs7QUFFRCxVQUFJNEMsS0FBS0ssUUFBTCxJQUFpQkwsS0FBS0ssUUFBTCxDQUFjM0QsT0FBZCxLQUEwQixJQUEvQyxFQUFxRDtBQUNuRGtFLG9CQUFZRSxNQUFaLENBQW1CVCxRQUFuQixDQUE0QjNELE9BQTVCLEdBQXNDLEtBQUtpRSxrQkFBTCxFQUF0QztBQUNELE9BRkQsTUFFTyxJQUFJWCxLQUFLSyxRQUFMLElBQWlCTCxLQUFLSyxRQUFMLENBQWMzRCxPQUFuQyxFQUE0QztBQUNqRGtFLG9CQUFZRSxNQUFaLENBQW1CVCxRQUFuQixDQUE0QjNELE9BQTVCLEdBQXNDc0QsS0FBS0ssUUFBTCxDQUFjM0QsT0FBcEQ7QUFDRDtBQUNELGFBQU9rRSxXQUFQO0FBQ0Q7Ozs7OztBQUdIbkYsZUFBZVIsTUFBZixHQUF3QixDQUN0QixNQURzQixFQUV0QixPQUZzQixFQUd0QixjQUhzQixFQUl0QixVQUpzQixFQUt0QixhQUxzQixFQU10QixhQU5zQixFQU90QixRQVBzQixFQVF0QixRQVJzQixFQVN0QixRQVRzQixDQUF4QiIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJvb20gZnJvbSAnYm9vbSc7XG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyBjcmVhdGVSb3V0ZXMgfSBmcm9tICcuL2Jhc2VSb3V0ZXMnO1xuaW1wb3J0IEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmNvbnN0IGJhc2VSb3V0ZXMgPSBjcmVhdGVSb3V0ZXMoKTtcblxuZnVuY3Rpb24gcGx1Z2luKHNlcnZlciwgXywgbmV4dCkge1xuICBzZXJ2ZXIucm91dGUoXG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5yb3V0ZXNcbiAgICAubWFwKChtZXRob2QpID0+IHRoaXMucm91dGUobWV0aG9kLCBiYXNlUm91dGVzW21ldGhvZF0pKVxuICAgIC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjLmNvbmNhdChjdXJyKSwgW10pIC8vIHJvdXRlUmVsYXRpb25zaGlwIHJldHVybnMgYW4gYXJyYXlcbiAgKTtcbiAgc2VydmVyLnJvdXRlKHRoaXMuZXh0cmFSb3V0ZXMoKSk7XG4gIG5leHQoKTtcbn1cblxuZXhwb3J0IGNsYXNzIEJhc2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IocGx1bXAsIE1vZGVsLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnBsdW1wID0gcGx1bXA7XG4gICAgdGhpcy5Nb2RlbCA9IE1vZGVsO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2lkZWxvYWRzOiBbXSB9LCBvcHRpb25zKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGx1Z2luLmF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgbmFtZTogdGhpcy5Nb2RlbC4kbmFtZSxcbiAgICB9LCB0aGlzLm9wdGlvbnMucGx1Z2luKTtcbiAgfVxuXG4gIGV4dHJhUm91dGVzKCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJlYWQoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYnVsa0dldCgpO1xuICAgIH07XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kc2V0KHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRkZWxldGUoKTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsKHJlcXVlc3QucGF5bG9hZCwgdGhpcy5wbHVtcClcbiAgICAgIC4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYWRkQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGxpc3RDaGlsZHJlbih7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpXG4gICAgICAudGhlbigobGlzdCkgPT4ge1xuICAgICAgICByZXR1cm4geyBbZmllbGRdOiBsaXN0IH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kcmVtb3ZlKGZpZWxkLCByZXF1ZXN0LnBhcmFtcy5jaGlsZElkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBtb2RpZnlDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRtb2RpZnlSZWxhdGlvbnNoaXAoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsIHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wbHVtcC5xdWVyeSh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnF1ZXJ5KTtcbiAgICB9O1xuICB9XG5cbiAgc2NoZW1hKCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSh7XG4gICAgICAgIHNjaGVtYTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLk1vZGVsKSksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpc1ttZXRob2RdKG9wdGlvbnMpO1xuICAgIHJldHVybiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyKHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmVwbHkocmVzcG9uc2UpLmNvZGUoMjAwKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5Nb2RlbC4kc2NoZW1hO1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZCBpbiBzY2hlbWEuYXR0cmlidXRlcykge1xuICAgICAgICAgIHJldHVybiB7IFtmaWVsZF06IEpvaVtzY2hlbWEuYXR0cmlidXRlc1tmaWVsZF0udHlwZV0oKSB9O1xuICAgICAgICB9IGVsc2UgaWYgKGZpZWxkIGluIHNjaGVtYS5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgY29uc3QgcmV0VmFsID0geyBpZDogSm9pLm51bWJlcigpIH07XG5cbiAgICAgICAgICBpZiAoc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGUuJGV4dHJhcykge1xuICAgICAgICAgICAgY29uc3QgZXh0cmFzID0gc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGUuJGV4dHJhcztcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZXh0cmFzKS5mb3JFYWNoKGV4dHJhID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXh0cmFUeXBlID0gZXh0cmFzW2V4dHJhXS50eXBlO1xuICAgICAgICAgICAgICByZXRWYWxbZXh0cmFdID0gSm9pW2V4dHJhVHlwZV0oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge1xuICAgICAgICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICBpZDogSm9pLm51bWJlcigpLFxuICAgICAgICAgIGF0dHJpYnV0ZXM6IHt9LFxuICAgICAgICAgIHJlbGF0aW9uc2hpcHM6IHt9LFxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5hdHRyaWJ1dGVzKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgIHJldFZhbC5hdHRyaWJ1dGVzW2F0dHJdID0gSm9pW3NjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5yZWxhdGlvbnNoaXBzKS5mb3JFYWNoKHJlbE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGl0ZW1TY2hlbWEgPSB7IGlkOiBKb2kubnVtYmVyKCkgfTtcblxuICAgICAgICAgIGlmIChzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxOYW1lXS50eXBlLiRleHRyYXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhcyA9IHNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbE5hbWVdLnR5cGUuJGV4dHJhcztcblxuICAgICAgICAgICAgZm9yIChjb25zdCBleHRyYSBpbiBleHRyYXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBndWFyZC1mb3ItaW5cbiAgICAgICAgICAgICAgY29uc3QgZXh0cmFUeXBlID0gZXh0cmFzW2V4dHJhXS50eXBlO1xuICAgICAgICAgICAgICBpdGVtU2NoZW1hLm1ldGEgPSBpdGVtU2NoZW1hLm1ldGEgfHwge307XG4gICAgICAgICAgICAgIGl0ZW1TY2hlbWEubWV0YVtleHRyYV0gPSBKb2lbZXh0cmFUeXBlXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwc1tyZWxOYW1lXSA9IEpvaS5hcnJheSgpXG4gICAgICAgICAgICAuaXRlbXMoe1xuICAgICAgICAgICAgICBvcDogSm9pLnN0cmluZygpLnZhbGlkKCdhZGQnLCAnbW9kaWZ5JywgJ3JlbW92ZScpLFxuICAgICAgICAgICAgICBkYXRhOiBpdGVtU2NoZW1hLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBsb2FkSGFuZGxlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zICYmIHJlcXVlc3QucGFyYW1zLml0ZW1JZCkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnBsdW1wLmZpbmQodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKTtcbiAgICAgICAgICByZXR1cm4gaXRlbS4kZ2V0KClcbiAgICAgICAgICAudGhlbigodGhpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseShpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3NpZ246ICdpdGVtJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGUobWV0aG9kLCBvcHRzKSB7XG4gICAgaWYgKG9wdHMucGx1cmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVJlbGF0aW9uc2hpcHMobWV0aG9kLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBvdmVycmlkZSBhcHByb3ZlSGFuZGxlciB3aXRoIHdoYXRldmVyIHBlci1yb3V0ZVxuICAvLyBsb2dpYyB5b3Ugd2FudCAtIHJlcGx5IHdpdGggQm9vbS5ub3RBdXRob3JpemVkKClcbiAgLy8gb3IgYW55IG90aGVyIHZhbHVlIG9uIG5vbi1hcHByb3ZlZCBzdGF0dXNcbiAgYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHJlcGx5KHRydWUpLFxuICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlUmVsYXRpb25zaGlwcyhtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5Nb2RlbC4kc2NoZW1hLnJlbGF0aW9uc2hpcHMpLm1hcChmaWVsZCA9PiB7XG4gICAgICBjb25zdCBnZW5lcmljT3B0cyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAge30sXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZCB9LFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgZ2VuZXJpY09wdHMuaGFwaS5wYXRoID0gZ2VuZXJpY09wdHMuaGFwaS5wYXRoLnJlcGxhY2UoJ3tmaWVsZH0nLCBmaWVsZCk7XG4gICAgICBpZiAoWydQT1NUJywgJ1BVVCcsICdQQVRDSCddLmluZGV4T2YoZ2VuZXJpY09wdHMuaGFwaS5tZXRob2QpID49IDApIHtcbiAgICAgICAgZ2VuZXJpY09wdHMudmFsaWRhdGUucGF5bG9hZCA9IHRoaXMuY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKTtcbiAgICAgIH1cbiAgICAgIGdlbmVyaWNPcHRzLnBsdXJhbCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgZ2VuZXJpY09wdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgcm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnbGlzdENoaWxkcmVuJyxcbiAgJ2FkZENoaWxkJyxcbiAgJ3JlbW92ZUNoaWxkJyxcbiAgJ21vZGlmeUNoaWxkJyxcbiAgJ2NyZWF0ZScsXG4gICd1cGRhdGUnLFxuICAnZGVsZXRlJyxcbl07XG4iXX0=
