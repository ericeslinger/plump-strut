'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseController = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

function plugin(server, _, next) {
  var _this = this;

  server.route(this.constructor.routes.map(function (method) {
    return _this.route(method, _this.routes[method]);
  }).reduce(function (curr, val) {
    return curr.concat(val);
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

    this.routes = (0, _baseRoutes.createRoutes)(this.options.routes);

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
        return request.pre.item.$set(request.payload).then(function (v) {
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
        return request.pre.item.$add(field, request.payload);
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
        return request.pre.item.$remove(field, request.params.childId);
      };
    }
  }, {
    key: 'modifyChild',
    value: function modifyChild(_ref6) {
      var field = _ref6.field;

      return function (request) {
        return request.pre.item.$modifyRelationship(field, request.params.childId, request.payload);
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
      var _this6 = this;

      try {
        if (field) {
          var _ret = function () {
            var validate = _defineProperty({}, _this6.Model.$fields[field].relationship.$sides[field].other.field, _joi2.default.number());
            if (_this6.Model.$fields[field].relationship.$extras) {
              Object.keys(_this6.Model.$fields[field].relationship.$extras).forEach(function (key) {
                validate[key] = _joi2.default[_this6.Model.$fields[field].relationship.$extras[key].type]();
              });
            }
            return {
              v: validate
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
          var _ret2 = function () {
            var retVal = {};
            var fields = _this6.Model.$fields;
            Object.keys(fields).forEach(function (key) {
              if (!fields[key].readOnly && fields[key].type !== 'hasMany') {
                retVal[key] = _joi2.default[fields[key].type]();
              }
            });
            return {
              v: retVal
            };
          }();

          if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        }
      } catch (err) {
        console.log(err);
        return {};
      }
    }
  }, {
    key: 'loadHandler',
    value: function loadHandler() {
      var _this7 = this;

      return {
        method: function method(request, reply) {
          if (request.params && request.params.itemId) {
            var _ret3 = function () {
              var item = _this7.plump.find(_this7.Model.$name, request.params.itemId);
              return {
                v: item.$get().then(function (thing) {
                  if (thing) {
                    reply(item);
                  } else {
                    reply(_boom2.default.notFound());
                  }
                }).catch(function (err) {
                  console.log(err);
                  reply(_boom2.default.badImplementation(err));
                })
              };
            }();

            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
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
      var _this8 = this;

      return Object.keys(this.Model.$fields).filter(function (f) {
        return _this8.Model.$fields[f].type === 'hasMany';
      }).map(function (field) {
        var genericOpts = (0, _mergeOptions2.default)({}, opts, {
          validate: {},
          generatorOptions: { field: field }
        });
        genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
        if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
          genericOpts.validate.payload = _this8.createJoiValidator(field);
        }
        genericOpts.plural = false;
        return _this8.routeOne(method, genericOpts);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsicGx1Z2luIiwic2VydmVyIiwiXyIsIm5leHQiLCJyb3V0ZSIsImNvbnN0cnVjdG9yIiwicm91dGVzIiwibWFwIiwibWV0aG9kIiwicmVkdWNlIiwiY3VyciIsInZhbCIsImNvbmNhdCIsImV4dHJhUm91dGVzIiwiQmFzZUNvbnRyb2xsZXIiLCJwbHVtcCIsIk1vZGVsIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsInNpZGVsb2FkcyIsImJpbmQiLCJhdHRyaWJ1dGVzIiwidmVyc2lvbiIsIm5hbWUiLCIkbmFtZSIsInJlcXVlc3QiLCJwcmUiLCJpdGVtIiwiJGdldCIsInRoZW4iLCJvYmoiLCJhbGwiLCJmaWVsZCIsInZhbHVlcyIsInNpZGVzIiwiZm9yRWFjaCIsInYiLCJpZHgiLCJyZXNwIiwiJHNldCIsInBheWxvYWQiLCIkZGVsZXRlIiwiJHNhdmUiLCIkYWRkIiwibGlzdCIsIiRyZW1vdmUiLCJwYXJhbXMiLCJjaGlsZElkIiwiJG1vZGlmeVJlbGF0aW9uc2hpcCIsInF1ZXJ5IiwicmVzb2x2ZSIsInNjaGVtYSIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImhhbmRsZXIiLCJyZXBseSIsInJlc3BvbnNlIiwiY29kZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImJhZEltcGxlbWVudGF0aW9uIiwidmFsaWRhdGUiLCIkZmllbGRzIiwicmVsYXRpb25zaGlwIiwiJHNpZGVzIiwib3RoZXIiLCJudW1iZXIiLCIkZXh0cmFzIiwia2V5cyIsImtleSIsInR5cGUiLCJyZXRWYWwiLCJmaWVsZHMiLCJyZWFkT25seSIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwib3B0cyIsInBsdXJhbCIsInJvdXRlTWFueSIsInJvdXRlT25lIiwiZmlsdGVyIiwiZiIsImdlbmVyaWNPcHRzIiwiZ2VuZXJhdG9yT3B0aW9ucyIsImhhcGkiLCJwYXRoIiwicmVwbGFjZSIsImluZGV4T2YiLCJjcmVhdGVKb2lWYWxpZGF0b3IiLCJyb3V0ZUNvbmZpZyIsImNyZWF0ZUhhbmRsZXIiLCJjb25maWciLCJhcHByb3ZlSGFuZGxlciIsInVuc2hpZnQiLCJsb2FkSGFuZGxlciIsInVuZGVmaW5lZCIsInAiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUIsTUFBS0YsTUFBTCxDQUFZRSxNQUFaLENBQW5CLENBQVo7QUFBQSxHQURMLEVBRUNDLE1BRkQsQ0FFUSxVQUFDQyxJQUFELEVBQU9DLEdBQVA7QUFBQSxXQUFlRCxLQUFLRSxNQUFMLENBQVlELEdBQVosQ0FBZjtBQUFBLEdBRlIsRUFFeUMsRUFGekMsQ0FERixDQUcrQztBQUgvQztBQUtBVixTQUFPRyxLQUFQLENBQWEsS0FBS1MsV0FBTCxFQUFiO0FBQ0FWO0FBQ0Q7O0lBRVlXLGMsV0FBQUEsYztBQUNYLDBCQUFZQyxLQUFaLEVBQW1CQyxLQUFuQixFQUF3QztBQUFBLFFBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFBQTs7QUFDdEMsU0FBS0YsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsU0FBS0MsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsU0FBS0MsT0FBTCxHQUFlQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixFQUFFQyxXQUFXLEVBQWIsRUFBbEIsRUFBcUNILE9BQXJDLENBQWY7O0FBRUEsU0FBS1gsTUFBTCxHQUFjLDhCQUFhLEtBQUtXLE9BQUwsQ0FBYVgsTUFBMUIsQ0FBZDs7QUFFQSxTQUFLTixNQUFMLEdBQWNBLE9BQU9xQixJQUFQLENB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QixHQUFvQ2dDLEtBQUtqQixRQUFMLENBQWNmLEtBQWxEO0FBQ0Q7O0FBRUQsVUFBSWdDLEtBQUtqQixRQUFMLElBQWlCaUIsS0FBS2pCLFFBQUwsQ0FBY2xCLE1BQW5DLEVBQTJDO0FBQ3pDZ0Qsb0JBQVlFLE1BQVosQ0FBbUJoQyxRQUFuQixDQUE0QmxCLE1BQTVCLEdBQXFDbUMsS0FBS2pCLFFBQUwsQ0FBY2xCLE1BQW5EO0FBQ0Q7O0FBRUQsVUFBSW1DLEtBQUtqQixRQUFMLElBQWlCaUIsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQWQsS0FBMEIsSUFBL0MsRUFBcUQ7QUFDbkRzRCxvQkFBWUUsTUFBWixDQUFtQmhDLFFBQW5CLENBQTRCeEIsT0FBNUIsR0FBc0MsS0FBS3FELGtCQUFMLEVBQXRDO0FBQ0QsT0FGRCxNQUVPLElBQUlaLEtBQUtqQixRQUFMLElBQWlCaUIsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQW5DLEVBQTRDO0FBQ2pEc0Qsb0JBQVlFLE1BQVosQ0FBbUJoQyxRQUFuQixDQUE0QnhCLE9BQTVCLEdBQXNDeUMsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQXBEO0FBQ0Q7QUFDRCxhQUFPc0QsV0FBUDtBQUNEOzs7Ozs7QUFHSGpGLGVBQWVSLE1BQWYsR0FBd0IsQ0FDdEIsTUFEc0IsRUFFdEIsT0FGc0IsRUFHdEIsUUFIc0IsRUFJdEIsY0FKc0IsRUFLdEIsVUFMc0IsRUFNdEIsYUFOc0IsRUFPdEIsYUFQc0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsRUFVdEIsUUFWc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgY3JlYXRlUm91dGVzIH0gZnJvbSAnLi9iYXNlUm91dGVzJztcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgbWVyZ2VPcHRpb25zIGZyb20gJ21lcmdlLW9wdGlvbnMnO1xuXG5mdW5jdGlvbiBwbHVnaW4oc2VydmVyLCBfLCBuZXh0KSB7XG4gIHNlcnZlci5yb3V0ZShcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnJvdXRlc1xuICAgIC5tYXAoKG1ldGhvZCkgPT4gdGhpcy5yb3V0ZShtZXRob2QsIHRoaXMucm91dGVzW21ldGhvZF0pKVxuICAgIC5yZWR1Y2UoKGN1cnIsIHZhbCkgPT4gY3Vyci5jb25jYXQodmFsKSwgW10pIC8vIHJvdXRlTWFueSByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHBsdW1wLCBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuTW9kZWwgPSBNb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnJvdXRlcyA9IGNyZWF0ZVJvdXRlcyh0aGlzLm9wdGlvbnMucm91dGVzKTtcblxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4uYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBuYW1lOiB0aGlzLk1vZGVsLiRuYW1lLFxuICAgIH0sIHRoaXMub3B0aW9ucy5wbHVnaW4pO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoKVxuICAgICAgLnRoZW4oKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gQmx1ZWJpcmQuYWxsKHRoaXMub3B0aW9ucy5zaWRlbG9hZHMubWFwKChmaWVsZCkgPT4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKSkpXG4gICAgICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgICAgICBjb25zdCBzaWRlcyA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2LCBpZHgpID0+IHtcbiAgICAgICAgICAgIHNpZGVzW3RoaXMub3B0aW9ucy5zaWRlbG9hZHNbaWR4XV0gPSB2O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvYmosIHNpZGVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgW3RoaXMuTW9kZWwuJG5hbWVdOiBbcmVzcF0sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICB1cGRhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kc2V0KHJlcXVlc3QucGF5bG9hZClcbiAgICAgIC50aGVuKCh2KSA9PiB7XG4gICAgICAgIHJldHVybiB2LiRnZXQoKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZGVsZXRlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5Nb2RlbChyZXF1ZXN0LnBheWxvYWQsIHRoaXMucGx1bXApXG4gICAgICAuJHNhdmUoKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGFkZENoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGFkZChmaWVsZCwgcmVxdWVzdC5wYXlsb2FkKTtcbiAgICB9O1xuICB9XG5cbiAgbGlzdENoaWxkcmVuKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldChmaWVsZClcbiAgICAgIC50aGVuKChsaXN0KSA9PiB7XG4gICAgICAgIHJldHVybiB7IFtmaWVsZF06IGxpc3QgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZW1vdmVDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRyZW1vdmUoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQpO1xuICAgIH07XG4gIH1cblxuICBtb2RpZnlDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRtb2RpZnlSZWxhdGlvbnNoaXAoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQsIHJlcXVlc3QucGF5bG9hZCk7XG4gICAgfTtcbiAgfVxuXG4gIHF1ZXJ5KCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGx1bXAucXVlcnkodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5xdWVyeSk7XG4gICAgfTtcbiAgfVxuXG4gIHNjaGVtYSgpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcmV0dXJuIEJsdWViaXJkLnJlc29sdmUoe1xuICAgICAgICBzY2hlbWE6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5Nb2RlbCkpLFxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHRoaXNbbWV0aG9kXShvcHRpb25zKTtcbiAgICByZXR1cm4gKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICByZXR1cm4gaGFuZGxlcihyZXF1ZXN0KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIHJlcGx5KHJlc3BvbnNlKS5jb2RlKDIwMCk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZSA9IHtcbiAgICAgICAgICBbdGhpcy5Nb2RlbC4kZmllbGRzW2ZpZWxkXS5yZWxhdGlvbnNoaXAuJHNpZGVzW2ZpZWxkXS5vdGhlci5maWVsZF06IEpvaS5udW1iZXIoKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuTW9kZWwuJGZpZWxkc1tmaWVsZF0ucmVsYXRpb25zaGlwLiRleHRyYXMpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLk1vZGVsLiRmaWVsZHNbZmllbGRdLnJlbGF0aW9uc2hpcC4kZXh0cmFzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlW2tleV0gPSBKb2lbdGhpcy5Nb2RlbC4kZmllbGRzW2ZpZWxkXS5yZWxhdGlvbnNoaXAuJGV4dHJhc1trZXldLnR5cGVdKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge307XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IHRoaXMuTW9kZWwuJGZpZWxkcztcbiAgICAgICAgT2JqZWN0LmtleXMoZmllbGRzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICBpZiAoKCFmaWVsZHNba2V5XS5yZWFkT25seSkgJiYgKGZpZWxkc1trZXldLnR5cGUgIT09ICdoYXNNYW55JykpIHtcbiAgICAgICAgICAgIHJldFZhbFtrZXldID0gSm9pW2ZpZWxkc1trZXldLnR5cGVdKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG5cbiAgbG9hZEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnBhcmFtcyAmJiByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5wbHVtcC5maW5kKHRoaXMuTW9kZWwuJG5hbWUsIHJlcXVlc3QucGFyYW1zLml0ZW1JZCk7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uJGdldCgpXG4gICAgICAgICAgLnRoZW4oKHRoaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpbmcpIHtcbiAgICAgICAgICAgICAgcmVwbHkoaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXBseShCb29tLm5vdEZvdW5kKCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXNzaWduOiAnaXRlbScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlKG1ldGhvZCwgb3B0cykge1xuICAgIGlmIChvcHRzLnBsdXJhbCkge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVNYW55KG1ldGhvZCwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlT25lKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBvdmVycmlkZSBhcHByb3ZlSGFuZGxlciB3aXRoIHdoYXRldmVyIHBlci1yb3V0ZVxuICAvLyBsb2dpYyB5b3Ugd2FudCAtIHJlcGx5IHdpdGggQm9vbS5ub3RBdXRob3JpemVkKClcbiAgLy8gb3IgYW55IG90aGVyIHZhbHVlIG9uIG5vbi1hcHByb3ZlZCBzdGF0dXNcbiAgYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseSh0cnVlKSxcbiAgICAgIGFzc2lnbjogJ2FwcHJvdmUnXG4gICAgfVxuICB9XG5cbiAgcm91dGVNYW55KG1ldGhvZCwgb3B0cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLk1vZGVsLiRmaWVsZHMpLmZpbHRlcigoZikgPT4gdGhpcy5Nb2RlbC4kZmllbGRzW2ZdLnR5cGUgPT09ICdoYXNNYW55JylcbiAgICAubWFwKChmaWVsZCkgPT4ge1xuICAgICAgY29uc3QgZ2VuZXJpY09wdHMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICAgIHt9LFxuICAgICAgICBvcHRzLFxuICAgICAgICB7XG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICAgIGdlbmVyYXRvck9wdGlvbnM6IHsgZmllbGQ6IGZpZWxkIH0sXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBnZW5lcmljT3B0cy5oYXBpLnBhdGggPSBnZW5lcmljT3B0cy5oYXBpLnBhdGgucmVwbGFjZSgne2ZpZWxkfScsIGZpZWxkKTtcbiAgICAgIGlmIChbJ1BPU1QnLCAnUFVUJywgJ1BBVENIJ10uaW5kZXhPZihnZW5lcmljT3B0cy5oYXBpLm1ldGhvZCkgPj0gMCkge1xuICAgICAgICBnZW5lcmljT3B0cy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpO1xuICAgICAgfVxuICAgICAgZ2VuZXJpY09wdHMucGx1cmFsID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZU9uZShtZXRob2QsIGdlbmVyaWNPcHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvdXRlT25lKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnc2NoZW1hJyxcbiAgJ2xpc3RDaGlsZHJlbicsXG4gICdhZGRDaGlsZCcsXG4gICdyZW1vdmVDaGlsZCcsXG4gICdtb2RpZnlDaGlsZCcsXG4gICdjcmVhdGUnLFxuICAndXBkYXRlJyxcbiAgJ2RlbGV0ZScsXG5dO1xuIl19
