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
  }, []) // routeMany returns an array
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
        if (field) {
          var relSchema = this.Model.$schema.relationships[field].type;
          var validate = _defineProperty({}, relSchema.$sides[field].other.field, _joi2.default.number());
          if (relSchema.$extras) {
            for (var extra in relSchema.$extras) {
              // eslint-disable-line guard-for-in
              validate[extra] = _joi2.default[relSchema.$extras[extra].type]();
            }
          }
          return validate;
        } else {
          var retVal = {};
          var attributes = this.Model.$schema.attributes;
          for (var attr in attributes) {
            if (!attributes[attr].readOnly) {
              retVal[attr] = _joi2.default[attributes[attr].type]();
            }
          }
          return retVal;
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
        return this.routeMany(method, opts);
      } else {
        return this.routeOne(method, opts);
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
    key: 'routeMany',
    value: function routeMany(method, opts) {
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
        return _this7.routeOne(method, genericOpts);
      });
    }
  }, {
    key: 'routeOne',
    value: function routeOne(method, opts) {
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

BaseController.routes = ['read', 'query', 'schema', 'listChildren', 'addChild', 'removeChild', 'modifyChild', 'create', 'update', 'delete'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRnZXQiLCJ0aGVuIiwib2JqIiwiYWxsIiwiZmllbGQiLCJ2YWx1ZXMiLCJzaWRlcyIsImZvckVhY2giLCJ2IiwiaWR4IiwicmVzcCIsIiRzZXQiLCJwYXlsb2FkIiwiJHNhdmUiLCIkZGVsZXRlIiwiJGFkZCIsImxpc3QiLCIkcmVtb3ZlIiwicGFyYW1zIiwiY2hpbGRJZCIsIiRtb2RpZnlSZWxhdGlvbnNoaXAiLCJxdWVyeSIsInJlc29sdmUiLCJzY2hlbWEiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJoYW5kbGVyIiwicmVwbHkiLCJyZXNwb25zZSIsImNvZGUiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJiYWRJbXBsZW1lbnRhdGlvbiIsInJlbFNjaGVtYSIsIiRzY2hlbWEiLCJyZWxhdGlvbnNoaXBzIiwidHlwZSIsInZhbGlkYXRlIiwiJHNpZGVzIiwib3RoZXIiLCJudW1iZXIiLCIkZXh0cmFzIiwiZXh0cmEiLCJyZXRWYWwiLCJhdHRyIiwicmVhZE9ubHkiLCJpdGVtSWQiLCJmaW5kIiwidGhpbmciLCJub3RGb3VuZCIsIm9wdHMiLCJwbHVyYWwiLCJyb3V0ZU1hbnkiLCJyb3V0ZU9uZSIsImtleXMiLCJnZW5lcmljT3B0cyIsImdlbmVyYXRvck9wdGlvbnMiLCJoYXBpIiwicGF0aCIsInJlcGxhY2UiLCJpbmRleE9mIiwiY3JlYXRlSm9pVmFsaWRhdG9yIiwicm91dGVDb25maWciLCJjcmVhdGVIYW5kbGVyIiwiY29uZmlnIiwiYXBwcm92ZUhhbmRsZXIiLCJ1bnNoaWZ0IiwibG9hZEhhbmRsZXIiLCJ1bmRlZmluZWQiLCJwIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxhQUFhLCtCQUFuQjs7QUFFQSxTQUFTQyxNQUFULENBQWdCQyxNQUFoQixFQUF3QkMsQ0FBeEIsRUFBMkJDLElBQTNCLEVBQWlDO0FBQUE7O0FBQy9CRixTQUFPRyxLQUFQLENBQ0UsS0FBS0MsV0FBTCxDQUFpQkMsTUFBakIsQ0FDQ0MsR0FERCxDQUNLLFVBQUNDLE1BQUQ7QUFBQSxXQUFZLE1BQUtKLEtBQUwsQ0FBV0ksTUFBWCxFQUFtQlQsV0FBV1MsTUFBWCxDQUFuQixDQUFaO0FBQUEsR0FETCxFQUVDQyxNQUZELENBRVEsVUFBQ0MsR0FBRCxFQUFNQyxJQUFOO0FBQUEsV0FBZUQsSUFBSUUsTUFBSixDQUFXRCxJQUFYLENBQWY7QUFBQSxHQUZSLEVBRXlDLEVBRnpDLENBREYsQ0FHK0M7QUFIL0M7QUFLQVYsU0FBT0csS0FBUCxDQUFhLEtBQUtTLFdBQUwsRUFBYjtBQUNBVjtBQUNEOztJQUVZVyxjLFdBQUFBLGM7QUFDWCwwQkFBWUMsS0FBWixFQUFtQkMsS0FBbkIsRUFBd0M7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQUE7O0FBQ3RDLFNBQUtGLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLE9BQUwsR0FBZUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRUMsV0FBVyxFQUFiLEVBQWxCLEVBQXFDSCxPQUFyQyxDQUFmO0FBQ0EsU0FBS2pCLE1BQUwsR0FBY0EsT0FBT3FCLElBQVAsQ0FBWSxJQUFaLENBQWQ7QUFDQSxTQUFLckIsTUFBTCxD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QUFMLENBQWM1QixPQUFuQyxFQUE0QztBQUNqRHFELG9CQUFZRSxNQUFaLENBQW1CM0IsUUFBbkIsQ0FBNEI1QixPQUE1QixHQUFzQ3lDLEtBQUtiLFFBQUwsQ0FBYzVCLE9BQXBEO0FBQ0Q7QUFDRCxhQUFPcUQsV0FBUDtBQUNEOzs7Ozs7QUFHSGhGLGVBQWVSLE1BQWYsR0FBd0IsQ0FDdEIsTUFEc0IsRUFFdEIsT0FGc0IsRUFHdEIsUUFIc0IsRUFJdEIsY0FKc0IsRUFLdEIsVUFMc0IsRUFNdEIsYUFOc0IsRUFPdEIsYUFQc0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsRUFVdEIsUUFWc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgY3JlYXRlUm91dGVzIH0gZnJvbSAnLi9iYXNlUm91dGVzJztcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5jb25zdCBiYXNlUm91dGVzID0gY3JlYXRlUm91dGVzKCk7XG5cbmZ1bmN0aW9uIHBsdWdpbihzZXJ2ZXIsIF8sIG5leHQpIHtcbiAgc2VydmVyLnJvdXRlKFxuICAgIHRoaXMuY29uc3RydWN0b3Iucm91dGVzXG4gICAgLm1hcCgobWV0aG9kKSA9PiB0aGlzLnJvdXRlKG1ldGhvZCwgYmFzZVJvdXRlc1ttZXRob2RdKSlcbiAgICAucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKSAvLyByb3V0ZU1hbnkgcmV0dXJucyBhbiBhcnJheVxuICApO1xuICBzZXJ2ZXIucm91dGUodGhpcy5leHRyYVJvdXRlcygpKTtcbiAgbmV4dCgpO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihwbHVtcCwgTW9kZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGx1bXAgPSBwbHVtcDtcbiAgICB0aGlzLk1vZGVsID0gTW9kZWw7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaWRlbG9hZHM6IFtdIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4uYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBuYW1lOiB0aGlzLk1vZGVsLiRuYW1lLFxuICAgIH0sIHRoaXMub3B0aW9ucy5wbHVnaW4pO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoKVxuICAgICAgLnRoZW4oKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gQmx1ZWJpcmQuYWxsKHRoaXMub3B0aW9ucy5zaWRlbG9hZHMubWFwKChmaWVsZCkgPT4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKSkpXG4gICAgICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgICAgICBjb25zdCBzaWRlcyA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2LCBpZHgpID0+IHtcbiAgICAgICAgICAgIHNpZGVzW3RoaXMub3B0aW9ucy5zaWRlbG9hZHNbaWR4XV0gPSB2O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvYmosIHNpZGVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgW3RoaXMuTW9kZWwuJG5hbWVdOiBbcmVzcF0sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICB1cGRhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kc2V0KHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRkZWxldGUoKTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsKHJlcXVlc3QucGF5bG9hZCwgdGhpcy5wbHVtcClcbiAgICAgIC4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYWRkQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGxpc3RDaGlsZHJlbih7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpXG4gICAgICAudGhlbigobGlzdCkgPT4ge1xuICAgICAgICByZXR1cm4geyBbZmllbGRdOiBsaXN0IH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmVtb3ZlQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kcmVtb3ZlKGZpZWxkLCByZXF1ZXN0LnBhcmFtcy5jaGlsZElkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBtb2RpZnlDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRtb2RpZnlSZWxhdGlvbnNoaXAoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsIHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wbHVtcC5xdWVyeSh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnF1ZXJ5KTtcbiAgICB9O1xuICB9XG5cbiAgc2NoZW1hKCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSh7XG4gICAgICAgIHNjaGVtYTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLk1vZGVsKSksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpc1ttZXRob2RdKG9wdGlvbnMpO1xuICAgIHJldHVybiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyKHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmVwbHkocmVzcG9uc2UpLmNvZGUoMjAwKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGNvbnN0IHJlbFNjaGVtYSA9IHRoaXMuTW9kZWwuJHNjaGVtYS5yZWxhdGlvbnNoaXBzW2ZpZWxkXS50eXBlO1xuICAgICAgICBjb25zdCB2YWxpZGF0ZSA9IHtcbiAgICAgICAgICBbcmVsU2NoZW1hLiRzaWRlc1tmaWVsZF0ub3RoZXIuZmllbGRdOiBKb2kubnVtYmVyKCksXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZWxTY2hlbWEuJGV4dHJhcykge1xuICAgICAgICAgIGZvciAoY29uc3QgZXh0cmEgaW4gcmVsU2NoZW1hLiRleHRyYXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBndWFyZC1mb3ItaW5cbiAgICAgICAgICAgIHZhbGlkYXRlW2V4dHJhXSA9IEpvaVtyZWxTY2hlbWEuJGV4dHJhc1tleHRyYV0udHlwZV0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge307XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLk1vZGVsLiRzY2hlbWEuYXR0cmlidXRlcztcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cl0ucmVhZE9ubHkpIHtcbiAgICAgICAgICAgIHJldFZhbFthdHRyXSA9IEpvaVthdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvYWRIYW5kbGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucGx1bXAuZmluZCh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpO1xuICAgICAgICAgIHJldHVybiBpdGVtLiRnZXQoKVxuICAgICAgICAgIC50aGVuKCh0aGluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgIHJlcGx5KGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzc2lnbjogJ2l0ZW0nLFxuICAgIH07XG4gIH1cblxuICByb3V0ZShtZXRob2QsIG9wdHMpIHtcbiAgICBpZiAob3B0cy5wbHVyYWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlTWFueShtZXRob2QsIG9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZU9uZShtZXRob2QsIG9wdHMpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gb3ZlcnJpZGUgYXBwcm92ZUhhbmRsZXIgd2l0aCB3aGF0ZXZlciBwZXItcm91dGVcbiAgLy8gbG9naWMgeW91IHdhbnQgLSByZXBseSB3aXRoIEJvb20ubm90QXV0aG9yaXplZCgpXG4gIC8vIG9yIGFueSBvdGhlciB2YWx1ZSBvbiBub24tYXBwcm92ZWQgc3RhdHVzXG4gIGFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgIH07XG4gIH1cblxuICByb3V0ZU1hbnkobWV0aG9kLCBvcHRzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuTW9kZWwuJHNjaGVtYS5yZWxhdGlvbnNoaXBzKS5tYXAoZmllbGQgPT4ge1xuICAgICAgY29uc3QgZ2VuZXJpY09wdHMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICAgIHt9LFxuICAgICAgICBvcHRzLFxuICAgICAgICB7XG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICAgIGdlbmVyYXRvck9wdGlvbnM6IHsgZmllbGQ6IGZpZWxkIH0sXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBnZW5lcmljT3B0cy5oYXBpLnBhdGggPSBnZW5lcmljT3B0cy5oYXBpLnBhdGgucmVwbGFjZSgne2ZpZWxkfScsIGZpZWxkKTtcbiAgICAgIGlmIChbJ1BPU1QnLCAnUFVUJywgJ1BBVENIJ10uaW5kZXhPZihnZW5lcmljT3B0cy5oYXBpLm1ldGhvZCkgPj0gMCkge1xuICAgICAgICBnZW5lcmljT3B0cy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpO1xuICAgICAgfVxuICAgICAgZ2VuZXJpY09wdHMucGx1cmFsID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZU9uZShtZXRob2QsIGdlbmVyaWNPcHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvdXRlT25lKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnc2NoZW1hJyxcbiAgJ2xpc3RDaGlsZHJlbicsXG4gICdhZGRDaGlsZCcsXG4gICdyZW1vdmVDaGlsZCcsXG4gICdtb2RpZnlDaGlsZCcsXG4gICdjcmVhdGUnLFxuICAndXBkYXRlJyxcbiAgJ2RlbGV0ZScsXG5dO1xuIl19
