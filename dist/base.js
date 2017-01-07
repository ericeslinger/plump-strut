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
    return _this.route(method, _baseRoutes.baseRoutes[method]);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsicGx1Z2luIiwic2VydmVyIiwiXyIsIm5leHQiLCJyb3V0ZSIsImNvbnN0cnVjdG9yIiwicm91dGVzIiwibWFwIiwibWV0aG9kIiwicmVkdWNlIiwiY3VyciIsInZhbCIsImNvbmNhdCIsImV4dHJhUm91dGVzIiwiQmFzZUNvbnRyb2xsZXIiLCJwbHVtcCIsIk1vZGVsIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsInNpZGVsb2FkcyIsImJpbmQiLCJhdHRyaWJ1dGVzIiwidmVyc2lvbiIsIm5hbWUiLCIkbmFtZSIsInJlcXVlc3QiLCJwcmUiLCJpdGVtIiwiJGdldCIsInRoZW4iLCJvYmoiLCJhbGwiLCJmaWVsZCIsInZhbHVlcyIsInNpZGVzIiwiZm9yRWFjaCIsInYiLCJpZHgiLCJyZXNwIiwiJHNldCIsInBheWxvYWQiLCIkZGVsZXRlIiwiJHNhdmUiLCIkYWRkIiwibGlzdCIsIiRyZW1vdmUiLCJwYXJhbXMiLCJjaGlsZElkIiwiJG1vZGlmeVJlbGF0aW9uc2hpcCIsInF1ZXJ5IiwicmVzb2x2ZSIsInNjaGVtYSIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImhhbmRsZXIiLCJyZXBseSIsInJlc3BvbnNlIiwiY29kZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImJhZEltcGxlbWVudGF0aW9uIiwidmFsaWRhdGUiLCIkZmllbGRzIiwicmVsYXRpb25zaGlwIiwiJHNpZGVzIiwib3RoZXIiLCJudW1iZXIiLCIkZXh0cmFzIiwia2V5cyIsImtleSIsInR5cGUiLCJyZXRWYWwiLCJmaWVsZHMiLCJyZWFkT25seSIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwib3B0cyIsInBsdXJhbCIsInJvdXRlTWFueSIsInJvdXRlT25lIiwiZmlsdGVyIiwiZiIsImdlbmVyaWNPcHRzIiwiZ2VuZXJhdG9yT3B0aW9ucyIsImhhcGkiLCJwYXRoIiwicmVwbGFjZSIsImluZGV4T2YiLCJjcmVhdGVKb2lWYWxpZGF0b3IiLCJyb3V0ZUNvbmZpZyIsImNyZWF0ZUhhbmRsZXIiLCJjb25maWciLCJhcHByb3ZlSGFuZGxlciIsInVuc2hpZnQiLCJsb2FkSGFuZGxlciIsInVuZGVmaW5lZCIsInAiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUIsdUJBQVdBLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLElBQUQsRUFBT0MsR0FBUDtBQUFBLFdBQWVELEtBQUtFLE1BQUwsQ0FBWUQsR0FBWixDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUVDLFdBQVcsRUFBYixFQUFsQixFQUFxQ0gsT0FBckMsQ0FBZjtBQUNBLFNBQUtqQixNQUFMLEdBQWNBLE9BQU9xQixJQUFQLENBQVksSUFBWixDQUFkO0FBQ0EsU0FBS3JCLE1BQUwsQ0FBWXNCLFVBQVosR0FBeUJKLE9BQU9DLE1BQVAsQ0FBYyxF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QWlCaUIsS0FBS2pCLFFBQUwsQ0FBY2xCLE1BQW5DLEVBQTJDO0FBQ3pDZ0Qsb0JBQVlFLE1BQVosQ0FBbUJoQyxRQUFuQixDQUE0QmxCLE1BQTVCLEdBQXFDbUMsS0FBS2pCLFFBQUwsQ0FBY2xCLE1BQW5EO0FBQ0Q7O0FBRUQsVUFBSW1DLEtBQUtqQixRQUFMLElBQWlCaUIsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQWQsS0FBMEIsSUFBL0MsRUFBcUQ7QUFDbkRzRCxvQkFBWUUsTUFBWixDQUFtQmhDLFFBQW5CLENBQTRCeEIsT0FBNUIsR0FBc0MsS0FBS3FELGtCQUFMLEVBQXRDO0FBQ0QsT0FGRCxNQUVPLElBQUlaLEtBQUtqQixRQUFMLElBQWlCaUIsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQW5DLEVBQTRDO0FBQ2pEc0Qsb0JBQVlFLE1BQVosQ0FBbUJoQyxRQUFuQixDQUE0QnhCLE9BQTVCLEdBQXNDeUMsS0FBS2pCLFFBQUwsQ0FBY3hCLE9BQXBEO0FBQ0Q7QUFDRCxhQUFPc0QsV0FBUDtBQUNEOzs7Ozs7QUFHSGpGLGVBQWVSLE1BQWYsR0FBd0IsQ0FDdEIsTUFEc0IsRUFFdEIsT0FGc0IsRUFHdEIsUUFIc0IsRUFJdEIsY0FKc0IsRUFLdEIsVUFMc0IsRUFNdEIsYUFOc0IsRUFPdEIsYUFQc0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsRUFVdEIsUUFWc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgYmFzZVJvdXRlcyB9IGZyb20gJy4vYmFzZVJvdXRlcyc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuZnVuY3Rpb24gcGx1Z2luKHNlcnZlciwgXywgbmV4dCkge1xuICBzZXJ2ZXIucm91dGUoXG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5yb3V0ZXNcbiAgICAubWFwKChtZXRob2QpID0+IHRoaXMucm91dGUobWV0aG9kLCBiYXNlUm91dGVzW21ldGhvZF0pKVxuICAgIC5yZWR1Y2UoKGN1cnIsIHZhbCkgPT4gY3Vyci5jb25jYXQodmFsKSwgW10pIC8vIHJvdXRlTWFueSByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHBsdW1wLCBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuTW9kZWwgPSBNb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBsdWdpbi5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgIG5hbWU6IHRoaXMuTW9kZWwuJG5hbWUsXG4gICAgfSwgdGhpcy5vcHRpb25zLnBsdWdpbik7XG4gIH1cblxuICBleHRyYVJvdXRlcygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZWFkKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldCgpXG4gICAgICAudGhlbigob2JqKSA9PiB7XG4gICAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwodGhpcy5vcHRpb25zLnNpZGVsb2Fkcy5tYXAoKGZpZWxkKSA9PiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpKSlcbiAgICAgICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgICAgIGNvbnN0IHNpZGVzID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goKHYsIGlkeCkgPT4ge1xuICAgICAgICAgICAgc2lkZXNbdGhpcy5vcHRpb25zLnNpZGVsb2Fkc1tpZHhdXSA9IHY7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iaiwgc2lkZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbdGhpcy5Nb2RlbC4kbmFtZV06IFtyZXNwXSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRzZXQocmVxdWVzdC5wYXlsb2FkKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRkZWxldGUoKTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsKHJlcXVlc3QucGF5bG9hZCwgdGhpcy5wbHVtcClcbiAgICAgIC4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYWRkQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpO1xuICAgIH07XG4gIH1cblxuICBsaXN0Q2hpbGRyZW4oeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKVxuICAgICAgLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogbGlzdCB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJHJlbW92ZShmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCk7XG4gICAgfTtcbiAgfVxuXG4gIG1vZGlmeUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJG1vZGlmeVJlbGF0aW9uc2hpcChmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCwgcmVxdWVzdC5wYXlsb2FkKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wbHVtcC5xdWVyeSh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnF1ZXJ5KTtcbiAgICB9O1xuICB9XG5cbiAgc2NoZW1hKCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSh7XG4gICAgICAgIHNjaGVtYTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLk1vZGVsKSksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSGFuZGxlcihtZXRob2QsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpc1ttZXRob2RdKG9wdGlvbnMpO1xuICAgIHJldHVybiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyKHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmVwbHkocmVzcG9uc2UpLmNvZGUoMjAwKTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlID0ge1xuICAgICAgICAgIFt0aGlzLk1vZGVsLiRmaWVsZHNbZmllbGRdLnJlbGF0aW9uc2hpcC4kc2lkZXNbZmllbGRdLm90aGVyLmZpZWxkXTogSm9pLm51bWJlcigpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5Nb2RlbC4kZmllbGRzW2ZpZWxkXS5yZWxhdGlvbnNoaXAuJGV4dHJhcykge1xuICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuTW9kZWwuJGZpZWxkc1tmaWVsZF0ucmVsYXRpb25zaGlwLiRleHRyYXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdmFsaWRhdGVba2V5XSA9IEpvaVt0aGlzLk1vZGVsLiRmaWVsZHNbZmllbGRdLnJlbGF0aW9uc2hpcC4kZXh0cmFzW2tleV0udHlwZV0oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsaWRhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXRWYWwgPSB7fTtcbiAgICAgICAgY29uc3QgZmllbGRzID0gdGhpcy5Nb2RlbC4kZmllbGRzO1xuICAgICAgICBPYmplY3Qua2V5cyhmaWVsZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgIGlmICgoIWZpZWxkc1trZXldLnJlYWRPbmx5KSAmJiAoZmllbGRzW2tleV0udHlwZSAhPT0gJ2hhc01hbnknKSkge1xuICAgICAgICAgICAgcmV0VmFsW2tleV0gPSBKb2lbZmllbGRzW2tleV0udHlwZV0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBsb2FkSGFuZGxlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zICYmIHJlcXVlc3QucGFyYW1zLml0ZW1JZCkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnBsdW1wLmZpbmQodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKTtcbiAgICAgICAgICByZXR1cm4gaXRlbS4kZ2V0KClcbiAgICAgICAgICAudGhlbigodGhpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseShpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3NpZ246ICdpdGVtJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGUobWV0aG9kLCBvcHRzKSB7XG4gICAgaWYgKG9wdHMucGx1cmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZU1hbnkobWV0aG9kLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVPbmUobWV0aG9kLCBvcHRzKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIG92ZXJyaWRlIGFwcHJvdmVIYW5kbGVyIHdpdGggd2hhdGV2ZXIgcGVyLXJvdXRlXG4gIC8vIGxvZ2ljIHlvdSB3YW50IC0gcmVwbHkgd2l0aCBCb29tLm5vdEF1dGhvcml6ZWQoKVxuICAvLyBvciBhbnkgb3RoZXIgdmFsdWUgb24gbm9uLWFwcHJvdmVkIHN0YXR1c1xuICBhcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHJlcGx5KHRydWUpLFxuICAgICAgYXNzaWduOiAnYXBwcm92ZSdcbiAgICB9XG4gIH1cblxuICByb3V0ZU1hbnkobWV0aG9kLCBvcHRzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuTW9kZWwuJGZpZWxkcykuZmlsdGVyKChmKSA9PiB0aGlzLk1vZGVsLiRmaWVsZHNbZl0udHlwZSA9PT0gJ2hhc01hbnknKVxuICAgIC5tYXAoKGZpZWxkKSA9PiB7XG4gICAgICBjb25zdCBnZW5lcmljT3B0cyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAge30sXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZDogZmllbGQgfSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGdlbmVyaWNPcHRzLmhhcGkucGF0aCA9IGdlbmVyaWNPcHRzLmhhcGkucGF0aC5yZXBsYWNlKCd7ZmllbGR9JywgZmllbGQpO1xuICAgICAgaWYgKFsnUE9TVCcsICdQVVQnLCAnUEFUQ0gnXS5pbmRleE9mKGdlbmVyaWNPcHRzLmhhcGkubWV0aG9kKSA+PSAwKSB7XG4gICAgICAgIGdlbmVyaWNPcHRzLnZhbGlkYXRlLnBheWxvYWQgPSB0aGlzLmNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCk7XG4gICAgICB9XG4gICAgICBnZW5lcmljT3B0cy5wbHVyYWwgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlT25lKG1ldGhvZCwgZ2VuZXJpY09wdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgcm91dGVPbmUobWV0aG9kLCBvcHRzKSB7XG4gICAgLypcbiAgICBvcHRzOiB7XG4gICAgICBwcmU6IFtBTlkgUFJFSEFORExFUnNdXG4gICAgICBoYW5kbGVyOiBoYW5kbGVyIG92ZXJyaWRlXG4gICAgICB2YWxpZGF0ZToge0pvaSBieSB0eXBlIChwYXJhbSwgcXVlcnksIHBheWxvYWQpfSxcbiAgICAgIGF1dGg6IGFueXRoaW5nIG90aGVyIHRoYW4gdG9rZW4sXG4gICAgICBoYXBpOiB7QUxMIE9USEVSIEhBUEkgT1BUSU9OUywgTVVTVCBCRSBKU09OIFNUUklOR0lGWUFCTEV9LFxuICAgIH0sXG4gICAgKi9cblxuICAgIGNvbnN0IHJvdXRlQ29uZmlnID0gbWVyZ2VPcHRpb25zKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6IG9wdHMuaGFuZGxlciB8fCB0aGlzLmNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRzLmdlbmVyYXRvck9wdGlvbnMpLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwcmU6IFt0aGlzLmFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKV0sXG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG9wdHMuaGFwaVxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXBpLnBhdGguaW5kZXhPZignaXRlbUlkJykgPj0gMCkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnByZS51bnNoaWZ0KHRoaXMubG9hZEhhbmRsZXIoKSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucHJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdHMucHJlLmZvckVhY2goKHApID0+IHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUucHVzaChwKSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5xdWVyeSkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnF1ZXJ5ID0gb3B0cy52YWxpZGF0ZS5xdWVyeTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBhcmFtcykge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBhcmFtcyA9IG9wdHMudmFsaWRhdGUucGFyYW1zO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGF5bG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBheWxvYWQgPSB0aGlzLmNyZWF0ZUpvaVZhbGlkYXRvcigpO1xuICAgIH0gZWxzZSBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gb3B0cy52YWxpZGF0ZS5wYXlsb2FkO1xuICAgIH1cbiAgICByZXR1cm4gcm91dGVDb25maWc7XG4gIH1cbn1cblxuQmFzZUNvbnRyb2xsZXIucm91dGVzID0gW1xuICAncmVhZCcsXG4gICdxdWVyeScsXG4gICdzY2hlbWEnLFxuICAnbGlzdENoaWxkcmVuJyxcbiAgJ2FkZENoaWxkJyxcbiAgJ3JlbW92ZUNoaWxkJyxcbiAgJ21vZGlmeUNoaWxkJyxcbiAgJ2NyZWF0ZScsXG4gICd1cGRhdGUnLFxuICAnZGVsZXRlJyxcbl07XG4iXX0=
