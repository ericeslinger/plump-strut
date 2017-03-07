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
        if (field) {
          var relSchema = this.Model.$schema.relationships[field].type;
          var validate = _defineProperty({}, relSchema.$sides[field].otherName, _joi2.default.number());
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
        return this.routeRelationship(method, opts);
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
    key: 'routeRelationship',
    value: function routeRelationship(method, opts) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRnZXQiLCJ0aGVuIiwib2JqIiwiYWxsIiwiZmllbGQiLCJ2YWx1ZXMiLCJzaWRlcyIsImZvckVhY2giLCJ2IiwiaWR4IiwicmVzcCIsIiRzZXQiLCJwYXlsb2FkIiwiJHNhdmUiLCIkZGVsZXRlIiwiJGFkZCIsImxpc3QiLCIkcmVtb3ZlIiwicGFyYW1zIiwiY2hpbGRJZCIsIiRtb2RpZnlSZWxhdGlvbnNoaXAiLCJxdWVyeSIsInJlc29sdmUiLCJzY2hlbWEiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJoYW5kbGVyIiwicmVwbHkiLCJyZXNwb25zZSIsImNvZGUiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJiYWRJbXBsZW1lbnRhdGlvbiIsInJlbFNjaGVtYSIsIiRzY2hlbWEiLCJyZWxhdGlvbnNoaXBzIiwidHlwZSIsInZhbGlkYXRlIiwiJHNpZGVzIiwib3RoZXJOYW1lIiwibnVtYmVyIiwiJGV4dHJhcyIsImV4dHJhIiwicmV0VmFsIiwiYXR0ciIsInJlYWRPbmx5IiwiaXRlbUlkIiwiZmluZCIsInRoaW5nIiwibm90Rm91bmQiLCJvcHRzIiwicGx1cmFsIiwicm91dGVSZWxhdGlvbnNoaXAiLCJyb3V0ZUF0dHJpYnV0ZXMiLCJrZXlzIiwiZ2VuZXJpY09wdHMiLCJnZW5lcmF0b3JPcHRpb25zIiwiaGFwaSIsInBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsImNyZWF0ZUpvaVZhbGlkYXRvciIsInJvdXRlQ29uZmlnIiwiY3JlYXRlSGFuZGxlciIsImNvbmZpZyIsImFwcHJvdmVIYW5kbGVyIiwidW5zaGlmdCIsImxvYWRIYW5kbGVyIiwidW5kZWZpbmVkIiwicCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsYUFBYSwrQkFBbkI7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUJULFdBQVdTLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLEdBQUQsRUFBTUMsSUFBTjtBQUFBLFdBQWVELElBQUlFLE1BQUosQ0FBV0QsSUFBWCxDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUVDLFdBQVcsRUFBYixFQUFsQixFQUFxQ0gsT0FBckMsQ0FBZjtBQUNBLFNBQUtqQixNQUFMLEdBQWNBLE9BQU9xQixJQUFQLENBQVksSUFBWixDQUFk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QWlCYSxLQUFLYixRQUFMLENBQWM1QixPQUFuQyxFQUE0QztBQUNqRHFELG9CQUFZRSxNQUFaLENBQW1CM0IsUUFBbkIsQ0FBNEI1QixPQUE1QixHQUFzQ3lDLEtBQUtiLFFBQUwsQ0FBYzVCLE9BQXBEO0FBQ0Q7QUFDRCxhQUFPcUQsV0FBUDtBQUNEOzs7Ozs7QUFHSGhGLGVBQWVSLE1BQWYsR0FBd0IsQ0FDdEIsTUFEc0IsRUFFdEIsT0FGc0IsRUFHdEIsY0FIc0IsRUFJdEIsVUFKc0IsRUFLdEIsYUFMc0IsRUFNdEIsYUFOc0IsRUFPdEIsUUFQc0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgY3JlYXRlUm91dGVzIH0gZnJvbSAnLi9iYXNlUm91dGVzJztcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5jb25zdCBiYXNlUm91dGVzID0gY3JlYXRlUm91dGVzKCk7XG5cbmZ1bmN0aW9uIHBsdWdpbihzZXJ2ZXIsIF8sIG5leHQpIHtcbiAgc2VydmVyLnJvdXRlKFxuICAgIHRoaXMuY29uc3RydWN0b3Iucm91dGVzXG4gICAgLm1hcCgobWV0aG9kKSA9PiB0aGlzLnJvdXRlKG1ldGhvZCwgYmFzZVJvdXRlc1ttZXRob2RdKSlcbiAgICAucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3VyciksIFtdKSAvLyByb3V0ZVJlbGF0aW9uc2hpcCByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHBsdW1wLCBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuTW9kZWwgPSBNb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBsdWdpbi5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgIG5hbWU6IHRoaXMuTW9kZWwuJG5hbWUsXG4gICAgfSwgdGhpcy5vcHRpb25zLnBsdWdpbik7XG4gIH1cblxuICBleHRyYVJvdXRlcygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZWFkKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldCgpXG4gICAgICAudGhlbigob2JqKSA9PiB7XG4gICAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwodGhpcy5vcHRpb25zLnNpZGVsb2Fkcy5tYXAoKGZpZWxkKSA9PiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpKSlcbiAgICAgICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgICAgIGNvbnN0IHNpZGVzID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goKHYsIGlkeCkgPT4ge1xuICAgICAgICAgICAgc2lkZXNbdGhpcy5vcHRpb25zLnNpZGVsb2Fkc1tpZHhdXSA9IHY7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iaiwgc2lkZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbdGhpcy5Nb2RlbC4kbmFtZV06IFtyZXNwXSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRzZXQocmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGRlbGV0ZSgpO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuTW9kZWwocmVxdWVzdC5wYXlsb2FkLCB0aGlzLnBsdW1wKVxuICAgICAgLiRzYXZlKClcbiAgICAgIC50aGVuKCh2KSA9PiB7XG4gICAgICAgIHJldHVybiB2LiRnZXQoKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBhZGRDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRhZGQoZmllbGQsIHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgbGlzdENoaWxkcmVuKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldChmaWVsZClcbiAgICAgIC50aGVuKChsaXN0KSA9PiB7XG4gICAgICAgIHJldHVybiB7IFtmaWVsZF06IGxpc3QgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZW1vdmVDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRyZW1vdmUoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIG1vZGlmeUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJG1vZGlmeVJlbGF0aW9uc2hpcChmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCwgcmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBxdWVyeSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnBsdW1wLnF1ZXJ5KHRoaXMuTW9kZWwuJG5hbWUsIHJlcXVlc3QucXVlcnkpO1xuICAgIH07XG4gIH1cblxuICBzY2hlbWEoKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKHtcbiAgICAgICAgc2NoZW1hOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuTW9kZWwpKSxcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzW21ldGhvZF0ob3B0aW9ucyk7XG4gICAgcmV0dXJuIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgcmV0dXJuIGhhbmRsZXIocmVxdWVzdClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXBseShyZXNwb25zZSkuY29kZSgyMDApO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgY29uc3QgcmVsU2NoZW1hID0gdGhpcy5Nb2RlbC4kc2NoZW1hLnJlbGF0aW9uc2hpcHNbZmllbGRdLnR5cGU7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlID0ge1xuICAgICAgICAgIFtyZWxTY2hlbWEuJHNpZGVzW2ZpZWxkXS5vdGhlck5hbWVdOiBKb2kubnVtYmVyKCksXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZWxTY2hlbWEuJGV4dHJhcykge1xuICAgICAgICAgIGZvciAoY29uc3QgZXh0cmEgaW4gcmVsU2NoZW1hLiRleHRyYXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBndWFyZC1mb3ItaW5cbiAgICAgICAgICAgIHZhbGlkYXRlW2V4dHJhXSA9IEpvaVtyZWxTY2hlbWEuJGV4dHJhc1tleHRyYV0udHlwZV0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge307XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLk1vZGVsLiRzY2hlbWEuYXR0cmlidXRlcztcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cl0ucmVhZE9ubHkpIHtcbiAgICAgICAgICAgIHJldFZhbFthdHRyXSA9IEpvaVthdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvYWRIYW5kbGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucGx1bXAuZmluZCh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpO1xuICAgICAgICAgIHJldHVybiBpdGVtLiRnZXQoKVxuICAgICAgICAgIC50aGVuKCh0aGluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgIHJlcGx5KGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzc2lnbjogJ2l0ZW0nLFxuICAgIH07XG4gIH1cblxuICByb3V0ZShtZXRob2QsIG9wdHMpIHtcbiAgICBpZiAob3B0cy5wbHVyYWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlUmVsYXRpb25zaGlwKG1ldGhvZCwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlQXR0cmlidXRlcyhtZXRob2QsIG9wdHMpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gb3ZlcnJpZGUgYXBwcm92ZUhhbmRsZXIgd2l0aCB3aGF0ZXZlciBwZXItcm91dGVcbiAgLy8gbG9naWMgeW91IHdhbnQgLSByZXBseSB3aXRoIEJvb20ubm90QXV0aG9yaXplZCgpXG4gIC8vIG9yIGFueSBvdGhlciB2YWx1ZSBvbiBub24tYXBwcm92ZWQgc3RhdHVzXG4gIGFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgIGFzc2lnbjogJ2FwcHJvdmUnLFxuICAgIH07XG4gIH1cblxuICByb3V0ZVJlbGF0aW9uc2hpcChtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5Nb2RlbC4kc2NoZW1hLnJlbGF0aW9uc2hpcHMpLm1hcChmaWVsZCA9PiB7XG4gICAgICBjb25zdCBnZW5lcmljT3B0cyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAge30sXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZDogZmllbGQgfSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGdlbmVyaWNPcHRzLmhhcGkucGF0aCA9IGdlbmVyaWNPcHRzLmhhcGkucGF0aC5yZXBsYWNlKCd7ZmllbGR9JywgZmllbGQpO1xuICAgICAgaWYgKFsnUE9TVCcsICdQVVQnLCAnUEFUQ0gnXS5pbmRleE9mKGdlbmVyaWNPcHRzLmhhcGkubWV0aG9kKSA+PSAwKSB7XG4gICAgICAgIGdlbmVyaWNPcHRzLnZhbGlkYXRlLnBheWxvYWQgPSB0aGlzLmNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCk7XG4gICAgICB9XG4gICAgICBnZW5lcmljT3B0cy5wbHVyYWwgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlQXR0cmlidXRlcyhtZXRob2QsIGdlbmVyaWNPcHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvdXRlQXR0cmlidXRlcyhtZXRob2QsIG9wdHMpIHtcbiAgICAvKlxuICAgIG9wdHM6IHtcbiAgICAgIHByZTogW0FOWSBQUkVIQU5ETEVSc11cbiAgICAgIGhhbmRsZXI6IGhhbmRsZXIgb3ZlcnJpZGVcbiAgICAgIHZhbGlkYXRlOiB7Sm9pIGJ5IHR5cGUgKHBhcmFtLCBxdWVyeSwgcGF5bG9hZCl9LFxuICAgICAgYXV0aDogYW55dGhpbmcgb3RoZXIgdGhhbiB0b2tlbixcbiAgICAgIGhhcGk6IHtBTEwgT1RIRVIgSEFQSSBPUFRJT05TLCBNVVNUIEJFIEpTT04gU1RSSU5HSUZZQUJMRX0sXG4gICAgfSxcbiAgICAqL1xuXG4gICAgY29uc3Qgcm91dGVDb25maWcgPSBtZXJnZU9wdGlvbnMoXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogb3B0cy5oYW5kbGVyIHx8IHRoaXMuY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyksXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHByZTogW3RoaXMuYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzLmdlbmVyYXRvck9wdGlvbnMpXSxcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgb3B0cy5oYXBpXG4gICAgKTtcblxuICAgIGlmIChvcHRzLmhhcGkucGF0aC5pbmRleE9mKCdpdGVtSWQnKSA+PSAwKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcucHJlLnVuc2hpZnQodGhpcy5sb2FkSGFuZGxlcigpKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5wcmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0cy5wcmUuZm9yRWFjaCgocCkgPT4gcm91dGVDb25maWcuY29uZmlnLnByZS5wdXNoKHApKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnF1ZXJ5KSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucXVlcnkgPSBvcHRzLnZhbGlkYXRlLnF1ZXJ5O1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGFyYW1zKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGFyYW1zID0gb3B0cy52YWxpZGF0ZS5wYXJhbXM7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkID09PSB0cnVlKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IHRoaXMuY3JlYXRlSm9pVmFsaWRhdG9yKCk7XG4gICAgfSBlbHNlIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGF5bG9hZCkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBheWxvYWQgPSBvcHRzLnZhbGlkYXRlLnBheWxvYWQ7XG4gICAgfVxuICAgIHJldHVybiByb3V0ZUNvbmZpZztcbiAgfVxufVxuXG5CYXNlQ29udHJvbGxlci5yb3V0ZXMgPSBbXG4gICdyZWFkJyxcbiAgJ3F1ZXJ5JyxcbiAgJ2xpc3RDaGlsZHJlbicsXG4gICdhZGRDaGlsZCcsXG4gICdyZW1vdmVDaGlsZCcsXG4gICdtb2RpZnlDaGlsZCcsXG4gICdjcmVhdGUnLFxuICAndXBkYXRlJyxcbiAgJ2RlbGV0ZScsXG5dO1xuIl19
