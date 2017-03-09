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
                itemSchema[extra] = _joi2.default[extraType]();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRidWxrR2V0IiwiJHNldCIsInBheWxvYWQiLCIkc2F2ZSIsInRoZW4iLCJ2IiwiJGdldCIsIiRkZWxldGUiLCJmaWVsZCIsIiRhZGQiLCJsaXN0IiwiJHJlbW92ZSIsInBhcmFtcyIsImNoaWxkSWQiLCIkbW9kaWZ5UmVsYXRpb25zaGlwIiwicXVlcnkiLCJyZXNvbHZlIiwic2NoZW1hIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiaGFuZGxlciIsInJlcGx5IiwicmVzcG9uc2UiLCJjb2RlIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYmFkSW1wbGVtZW50YXRpb24iLCIkc2NoZW1hIiwidHlwZSIsInJlbGF0aW9uc2hpcHMiLCJyZXRWYWwiLCJpZCIsIm51bWJlciIsIiRleHRyYXMiLCJleHRyYXMiLCJrZXlzIiwiZm9yRWFjaCIsImV4dHJhVHlwZSIsImV4dHJhIiwic3RyaW5nIiwiYXR0ciIsIml0ZW1TY2hlbWEiLCJyZWxOYW1lIiwiYXJyYXkiLCJpdGVtcyIsIm9wIiwidmFsaWQiLCJkYXRhIiwiaXRlbUlkIiwiZmluZCIsInRoaW5nIiwibm90Rm91bmQiLCJvcHRzIiwicGx1cmFsIiwicm91dGVSZWxhdGlvbnNoaXBzIiwicm91dGVBdHRyaWJ1dGVzIiwiZ2VuZXJpY09wdHMiLCJ2YWxpZGF0ZSIsImdlbmVyYXRvck9wdGlvbnMiLCJoYXBpIiwicGF0aCIsInJlcGxhY2UiLCJpbmRleE9mIiwiY3JlYXRlSm9pVmFsaWRhdG9yIiwicm91dGVDb25maWciLCJjcmVhdGVIYW5kbGVyIiwiY29uZmlnIiwiYXBwcm92ZUhhbmRsZXIiLCJ1bnNoaWZ0IiwibG9hZEhhbmRsZXIiLCJ1bmRlZmluZWQiLCJwIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxhQUFhLCtCQUFuQjs7QUFFQSxTQUFTQyxNQUFULENBQWdCQyxNQUFoQixFQUF3QkMsQ0FBeEIsRUFBMkJDLElBQTNCLEVBQWlDO0FBQUE7O0FBQy9CRixTQUFPRyxLQUFQLENBQ0UsS0FBS0MsV0FBTCxDQUFpQkMsTUFBakIsQ0FDQ0MsR0FERCxDQUNLLFVBQUNDLE1BQUQ7QUFBQSxXQUFZLE1BQUtKLEtBQUwsQ0FBV0ksTUFBWCxFQUFtQlQsV0FBV1MsTUFBWCxDQUFuQixDQUFaO0FBQUEsR0FETCxFQUVDQyxNQUZELENBRVEsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsV0FBZUQsSUFBSUUsTUFBSixDQUFXRCxJQUFYLENBQWY7QUFBQSxHQUZSLEVBRXlDLEVBRnpDLENBREYsQ0FHK0M7QUFIL0M7QUFLQVYsU0FBT0csS0FBUCxDQUFhLEtBQUtTLFdBQUwsRUFBYjtBQUNBVjtBQUNEOztJQUVZVyxjLFdBQUFBLGM7QUFDWCwwQkFBWUMsS0FBWixFQUFtQkMsS0FBbkIsRUFBd0M7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQUE7O0FBQ3RDLFNBQUtGLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLE9BQUwsR0FBZUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRUMsV0FBVyxFQUFiLEVBQWxCLEVBQXFDSCxPQUFyQyxDQUFmO0FBQ0EsU0FBS2pCLE1BQUwsR0FBY0EsT0FBT3FC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TCxJQUFpQkwsS0FBS0ssUUFBTCxDQUFjaEQsTUFBbkMsRUFBMkM7QUFDekN1RCxvQkFBWUUsTUFBWixDQUFtQlQsUUFBbkIsQ0FBNEJoRCxNQUE1QixHQUFxQzJDLEtBQUtLLFFBQUwsQ0FBY2hELE1BQW5EO0FBQ0Q7O0FBRUQsVUFBSTJDLEtBQUtLLFFBQUwsSUFBaUJMLEtBQUtLLFFBQUwsQ0FBYzFELE9BQWQsS0FBMEIsSUFBL0MsRUFBcUQ7QUFDbkRpRSxvQkFBWUUsTUFBWixDQUFtQlQsUUFBbkIsQ0FBNEIxRCxPQUE1QixHQUFzQyxLQUFLZ0Usa0JBQUwsRUFBdEM7QUFDRCxPQUZELE1BRU8sSUFBSVgsS0FBS0ssUUFBTCxJQUFpQkwsS0FBS0ssUUFBTCxDQUFjMUQsT0FBbkMsRUFBNEM7QUFDakRpRSxvQkFBWUUsTUFBWixDQUFtQlQsUUFBbkIsQ0FBNEIxRCxPQUE1QixHQUFzQ3FELEtBQUtLLFFBQUwsQ0FBYzFELE9BQXBEO0FBQ0Q7QUFDRCxhQUFPaUUsV0FBUDtBQUNEOzs7Ozs7QUFHSGxGLGVBQWVSLE1BQWYsR0FBd0IsQ0FDdEIsTUFEc0IsRUFFdEIsT0FGc0IsRUFHdEIsY0FIc0IsRUFJdEIsVUFKc0IsRUFLdEIsYUFMc0IsRUFNdEIsYUFOc0IsRUFPdEIsUUFQc0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgY3JlYXRlUm91dGVzIH0gZnJvbSAnLi9iYXNlUm91dGVzJztcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5jb25zdCBiYXNlUm91dGVzID0gY3JlYXRlUm91dGVzKCk7XG5cbmZ1bmN0aW9uIHBsdWdpbihzZXJ2ZXIsIF8sIG5leHQpIHtcbiAgc2VydmVyLnJvdXRlKFxuICAgIHRoaXMuY29uc3RydWN0b3Iucm91dGVzXG4gICAgLm1hcCgobWV0aG9kKSA9PiB0aGlzLnJvdXRlKG1ldGhvZCwgYmFzZVJvdXRlc1ttZXRob2RdKSlcbiAgICAucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKSAvLyByb3V0ZVJlbGF0aW9uc2hpcCByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHBsdW1wLCBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuTW9kZWwgPSBNb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBsdWdpbi5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgIG5hbWU6IHRoaXMuTW9kZWwuJG5hbWUsXG4gICAgfSwgdGhpcy5vcHRpb25zLnBsdWdpbik7XG4gIH1cblxuICBleHRyYVJvdXRlcygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZWFkKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGJ1bGtHZXQoKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJHNldChyZXF1ZXN0LnBheWxvYWQpLiRzYXZlKClcbiAgICAgIC50aGVuKCh2KSA9PiB7XG4gICAgICAgIHJldHVybiB2LiRnZXQoKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZGVsZXRlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5Nb2RlbChyZXF1ZXN0LnBheWxvYWQsIHRoaXMucGx1bXApXG4gICAgICAuJHNhdmUoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGFkZENoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGFkZChmaWVsZCwgcmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBsaXN0Q2hpbGRyZW4oeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKVxuICAgICAgLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogbGlzdCB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJHJlbW92ZShmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgbW9kaWZ5Q2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kbW9kaWZ5UmVsYXRpb25zaGlwKGZpZWxkLCByZXF1ZXN0LnBhcmFtcy5jaGlsZElkLCByZXF1ZXN0LnBheWxvYWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHF1ZXJ5KCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGx1bXAucXVlcnkodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5xdWVyeSk7XG4gICAgfTtcbiAgfVxuXG4gIHNjaGVtYSgpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcmV0dXJuIEJsdWViaXJkLnJlc29sdmUoe1xuICAgICAgICBzY2hlbWE6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5Nb2RlbCkpLFxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHRoaXNbbWV0aG9kXShvcHRpb25zKTtcbiAgICByZXR1cm4gKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICByZXR1cm4gaGFuZGxlcihyZXF1ZXN0KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIHJlcGx5KHJlc3BvbnNlKS5jb2RlKDIwMCk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuTW9kZWwuJHNjaGVtYTtcbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICBpZiAoZmllbGQgaW4gc2NoZW1hLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICByZXR1cm4geyBbZmllbGRdOiBKb2lbc2NoZW1hLmF0dHJpYnV0ZXNbZmllbGRdLnR5cGVdKCkgfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZCBpbiBzY2hlbWEucmVsYXRpb25zaGlwcykge1xuICAgICAgICAgIGNvbnN0IHJldFZhbCA9IHsgaWQ6IEpvaS5udW1iZXIoKSB9O1xuXG4gICAgICAgICAgaWYgKHNjaGVtYS5yZWxhdGlvbnNoaXBzW2ZpZWxkXS50eXBlLiRleHRyYXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhcyA9IHNjaGVtYS5yZWxhdGlvbnNoaXBzW2ZpZWxkXS50eXBlLiRleHRyYXM7XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGV4dHJhcykuZm9yRWFjaChleHRyYSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4dHJhVHlwZSA9IGV4dHJhc1tleHRyYV0udHlwZTtcbiAgICAgICAgICAgICAgcmV0VmFsW2V4dHJhXSA9IEpvaVtleHRyYVR5cGVdKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJldFZhbCA9IHtcbiAgICAgICAgICB0eXBlOiBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgaWQ6IEpvaS5udW1iZXIoKSxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7fSxcbiAgICAgICAgICByZWxhdGlvbnNoaXBzOiB7fSxcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICByZXRWYWwuYXR0cmlidXRlc1thdHRyXSA9IEpvaVtzY2hlbWEuYXR0cmlidXRlc1thdHRyXS50eXBlXSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEucmVsYXRpb25zaGlwcykuZm9yRWFjaChyZWxOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBpdGVtU2NoZW1hID0geyBpZDogSm9pLm51bWJlcigpIH07XG5cbiAgICAgICAgICBpZiAoc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0udHlwZS4kZXh0cmFzKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYXMgPSBzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxOYW1lXS50eXBlLiRleHRyYXM7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgZXh0cmEgaW4gZXh0cmFzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ3VhcmQtZm9yLWluXG4gICAgICAgICAgICAgIGNvbnN0IGV4dHJhVHlwZSA9IGV4dHJhc1tleHRyYV0udHlwZTtcbiAgICAgICAgICAgICAgaXRlbVNjaGVtYVtleHRyYV0gPSBKb2lbZXh0cmFUeXBlXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwc1tyZWxOYW1lXSA9IEpvaS5hcnJheSgpXG4gICAgICAgICAgICAuaXRlbXMoe1xuICAgICAgICAgICAgICBvcDogSm9pLnN0cmluZygpLnZhbGlkKCdhZGQnLCAnbW9kaWZ5JywgJ3JlbW92ZScpLFxuICAgICAgICAgICAgICBkYXRhOiBpdGVtU2NoZW1hLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBsb2FkSGFuZGxlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zICYmIHJlcXVlc3QucGFyYW1zLml0ZW1JZCkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnBsdW1wLmZpbmQodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKTtcbiAgICAgICAgICByZXR1cm4gaXRlbS4kZ2V0KClcbiAgICAgICAgICAudGhlbigodGhpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseShpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3NpZ246ICdpdGVtJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGUobWV0aG9kLCBvcHRzKSB7XG4gICAgaWYgKG9wdHMucGx1cmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVJlbGF0aW9uc2hpcHMobWV0aG9kLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBvdmVycmlkZSBhcHByb3ZlSGFuZGxlciB3aXRoIHdoYXRldmVyIHBlci1yb3V0ZVxuICAvLyBsb2dpYyB5b3Ugd2FudCAtIHJlcGx5IHdpdGggQm9vbS5ub3RBdXRob3JpemVkKClcbiAgLy8gb3IgYW55IG90aGVyIHZhbHVlIG9uIG5vbi1hcHByb3ZlZCBzdGF0dXNcbiAgYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHJlcGx5KHRydWUpLFxuICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlUmVsYXRpb25zaGlwcyhtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5Nb2RlbC4kc2NoZW1hLnJlbGF0aW9uc2hpcHMpLm1hcChmaWVsZCA9PiB7XG4gICAgICBjb25zdCBnZW5lcmljT3B0cyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAge30sXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZCB9LFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgZ2VuZXJpY09wdHMuaGFwaS5wYXRoID0gZ2VuZXJpY09wdHMuaGFwaS5wYXRoLnJlcGxhY2UoJ3tmaWVsZH0nLCBmaWVsZCk7XG4gICAgICBpZiAoWydQT1NUJywgJ1BVVCcsICdQQVRDSCddLmluZGV4T2YoZ2VuZXJpY09wdHMuaGFwaS5tZXRob2QpID49IDApIHtcbiAgICAgICAgZ2VuZXJpY09wdHMudmFsaWRhdGUucGF5bG9hZCA9IHRoaXMuY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKTtcbiAgICAgIH1cbiAgICAgIGdlbmVyaWNPcHRzLnBsdXJhbCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgZ2VuZXJpY09wdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgcm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnbGlzdENoaWxkcmVuJyxcbiAgJ2FkZENoaWxkJyxcbiAgJ3JlbW92ZUNoaWxkJyxcbiAgJ21vZGlmeUNoaWxkJyxcbiAgJ2NyZWF0ZScsXG4gICd1cGRhdGUnLFxuICAnZGVsZXRlJyxcbl07XG4iXX0=
