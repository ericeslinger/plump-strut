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
    key: 'authorize',
    value: function authorize(user, item, level) {
      // eslint-disable-line no-unused-vars
      return _bluebird2.default.resolve(false);
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
    key: 'approveHandler',
    value: function approveHandler(methodName) {
      var _this8 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return {
        method: function method(request, reply) {
          return _bluebird2.default.resolve().then(function () {
            var user = request.auth.credentials.user;
            if (user.superuser && _this8.Model.allowSuperuserOverride(methodName)) {
              return true;
            } else {
              var actorProfile = _this8.plump.find('profiles', user.profile_id);
              if (request.params.itemId) {
                return request.pre.item.approve(actorProfile, methodName, {
                  payload: request.payload,
                  field: options.field
                });
              } else {
                return _this8.Model.approve(actorProfile, methodName, {
                  payload: request.payload,
                  field: options.field
                });
              }
            }
          }).then(function (result) {
            if (result) {
              reply(result);
            } else {
              reply(_boom2.default.forbidden());
            }
          }).catch(function (err) {
            if (err.isBoom) {
              reply(err);
            } else {
              console.log(err.stack);
              reply(_boom2.default.badImplementation(err));
            }
          });
        },
        assign: 'approve'
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
  }, {
    key: 'routeMany',
    value: function routeMany(method, opts) {
      var _this9 = this;

      return Object.keys(this.Model.$fields).filter(function (f) {
        return _this9.Model.$fields[f].type === 'hasMany';
      }).map(function (field) {
        var genericOpts = (0, _mergeOptions2.default)({}, opts, {
          validate: {},
          generatorOptions: { field: field }
        });
        genericOpts.hapi.path = genericOpts.hapi.path.replace('{field}', field);
        if (['POST', 'PUT', 'PATCH'].indexOf(genericOpts.hapi.method) >= 0) {
          genericOpts.validate.payload = _this9.createJoiValidator(field);
        }
        genericOpts.plural = false;
        return _this9.routeOne(method, genericOpts);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsicGx1Z2luIiwic2VydmVyIiwiXyIsIm5leHQiLCJyb3V0ZSIsImNvbnN0cnVjdG9yIiwicm91dGVzIiwibWFwIiwibWV0aG9kIiwicmVkdWNlIiwiY3VyciIsInZhbCIsImNvbmNhdCIsImV4dHJhUm91dGVzIiwiQmFzZUNvbnRyb2xsZXIiLCJwbHVtcCIsIk1vZGVsIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsInNpZGVsb2FkcyIsImJpbmQiLCJhdHRyaWJ1dGVzIiwidmVyc2lvbiIsIm5hbWUiLCIkbmFtZSIsInJlcXVlc3QiLCJwcmUiLCJpdGVtIiwiJGdldCIsInRoZW4iLCJvYmoiLCJhbGwiLCJmaWVsZCIsInZhbHVlcyIsInNpZGVzIiwiZm9yRWFjaCIsInYiLCJpZHgiLCJyZXNwIiwiJHNldCIsInBheWxvYWQiLCIkZGVsZXRlIiwiJHNhdmUiLCIkYWRkIiwibGlzdCIsIiRyZW1vdmUiLCJwYXJhbXMiLCJjaGlsZElkIiwiJG1vZGlmeVJlbGF0aW9uc2hpcCIsInF1ZXJ5IiwicmVzb2x2ZSIsInNjaGVtYSIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsInVzZXIiLCJsZXZlbCIsImhhbmRsZXIiLCJyZXBseSIsInJlc3BvbnNlIiwiY29kZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImJhZEltcGxlbWVudGF0aW9uIiwidmFsaWRhdGUiLCIkZmllbGRzIiwicmVsYXRpb25zaGlwIiwiJHNpZGVzIiwib3RoZXIiLCJudW1iZXIiLCIkZXh0cmFzIiwia2V5cyIsImtleSIsInR5cGUiLCJyZXRWYWwiLCJmaWVsZHMiLCJyZWFkT25seSIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwibWV0aG9kTmFtZSIsImF1dGgiLCJjcmVkZW50aWFscyIsInN1cGVydXNlciIsImFsbG93U3VwZXJ1c2VyT3ZlcnJpZGUiLCJhY3RvclByb2ZpbGUiLCJwcm9maWxlX2lkIiwiYXBwcm92ZSIsInJlc3VsdCIsImZvcmJpZGRlbiIsImlzQm9vbSIsInN0YWNrIiwib3B0cyIsInBsdXJhbCIsInJvdXRlTWFueSIsInJvdXRlT25lIiwiZmlsdGVyIiwiZiIsImdlbmVyaWNPcHRzIiwiZ2VuZXJhdG9yT3B0aW9ucyIsImhhcGkiLCJwYXRoIiwicmVwbGFjZSIsImluZGV4T2YiLCJjcmVhdGVKb2lWYWxpZGF0b3IiLCJyb3V0ZUNvbmZpZyIsImNyZWF0ZUhhbmRsZXIiLCJjb25maWciLCJhcHByb3ZlSGFuZGxlciIsInVuc2hpZnQiLCJsb2FkSGFuZGxlciIsInVuZGVmaW5lZCIsInAiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUIsdUJBQVdBLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLElBQUQsRUFBT0MsR0FBUDtBQUFBLFdBQWVELEtBQUtFLE1BQUwsQ0FBWUQsR0FBWixDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1B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c0IsRUFRdEIsUUFSc0IsRUFTdEIsUUFUc0IsRUFVdEIsUUFWc0IsQ0FBeEIiLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCb29tIGZyb20gJ2Jvb20nO1xuaW1wb3J0IEpvaSBmcm9tICdqb2knO1xuaW1wb3J0IHsgYmFzZVJvdXRlcyB9IGZyb20gJy4vYmFzZVJvdXRlcyc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuZnVuY3Rpb24gcGx1Z2luKHNlcnZlciwgXywgbmV4dCkge1xuICBzZXJ2ZXIucm91dGUoXG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5yb3V0ZXNcbiAgICAubWFwKChtZXRob2QpID0+IHRoaXMucm91dGUobWV0aG9kLCBiYXNlUm91dGVzW21ldGhvZF0pKVxuICAgIC5yZWR1Y2UoKGN1cnIsIHZhbCkgPT4gY3Vyci5jb25jYXQodmFsKSwgW10pIC8vIHJvdXRlTWFueSByZXR1cm5zIGFuIGFycmF5XG4gICk7XG4gIHNlcnZlci5yb3V0ZSh0aGlzLmV4dHJhUm91dGVzKCkpO1xuICBuZXh0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKHBsdW1wLCBNb2RlbCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wbHVtcCA9IHBsdW1wO1xuICAgIHRoaXMuTW9kZWwgPSBNb2RlbDtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNpZGVsb2FkczogW10gfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnBsdWdpbi5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgIG5hbWU6IHRoaXMuTW9kZWwuJG5hbWUsXG4gICAgfSwgdGhpcy5vcHRpb25zLnBsdWdpbik7XG4gIH1cblxuICBleHRyYVJvdXRlcygpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZWFkKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldCgpXG4gICAgICAudGhlbigob2JqKSA9PiB7XG4gICAgICAgIHJldHVybiBCbHVlYmlyZC5hbGwodGhpcy5vcHRpb25zLnNpZGVsb2Fkcy5tYXAoKGZpZWxkKSA9PiByZXF1ZXN0LnByZS5pdGVtLiRnZXQoZmllbGQpKSlcbiAgICAgICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgICAgIGNvbnN0IHNpZGVzID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goKHYsIGlkeCkgPT4ge1xuICAgICAgICAgICAgc2lkZXNbdGhpcy5vcHRpb25zLnNpZGVsb2Fkc1tpZHhdXSA9IHY7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iaiwgc2lkZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbdGhpcy5Nb2RlbC4kbmFtZV06IFtyZXNwXSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRzZXQocmVxdWVzdC5wYXlsb2FkKVxuICAgICAgLnRoZW4oKHYpID0+IHtcbiAgICAgICAgcmV0dXJuIHYuJGdldCgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRkZWxldGUoKTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsKHJlcXVlc3QucGF5bG9hZCwgdGhpcy5wbHVtcClcbiAgICAgIC4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYWRkQ2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kYWRkKGZpZWxkLCByZXF1ZXN0LnBheWxvYWQpO1xuICAgIH07XG4gIH1cblxuICBsaXN0Q2hpbGRyZW4oeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKVxuICAgICAgLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogbGlzdCB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJHJlbW92ZShmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCk7XG4gICAgfTtcbiAgfVxuXG4gIG1vZGlmeUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJG1vZGlmeVJlbGF0aW9uc2hpcChmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCwgcmVxdWVzdC5wYXlsb2FkKTtcbiAgICB9O1xuICB9XG5cbiAgcXVlcnkoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5wbHVtcC5xdWVyeSh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnF1ZXJ5KTtcbiAgICB9O1xuICB9XG5cbiAgc2NoZW1hKCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSh7XG4gICAgICAgIHNjaGVtYTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLk1vZGVsKSksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgYXV0aG9yaXplKHVzZXIsIGl0ZW0sIGxldmVsKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShmYWxzZSk7XG4gIH1cblxuICBjcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzW21ldGhvZF0ob3B0aW9ucyk7XG4gICAgcmV0dXJuIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgcmV0dXJuIGhhbmRsZXIocmVxdWVzdClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXBseShyZXNwb25zZSkuY29kZSgyMDApO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGUgPSB7XG4gICAgICAgICAgW3RoaXMuTW9kZWwuJGZpZWxkc1tmaWVsZF0ucmVsYXRpb25zaGlwLiRzaWRlc1tmaWVsZF0ub3RoZXIuZmllbGRdOiBKb2kubnVtYmVyKCksXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLk1vZGVsLiRmaWVsZHNbZmllbGRdLnJlbGF0aW9uc2hpcC4kZXh0cmFzKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXModGhpcy5Nb2RlbC4kZmllbGRzW2ZpZWxkXS5yZWxhdGlvbnNoaXAuJGV4dHJhcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZVtrZXldID0gSm9pW3RoaXMuTW9kZWwuJGZpZWxkc1tmaWVsZF0ucmVsYXRpb25zaGlwLiRleHRyYXNba2V5XS50eXBlXSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJldFZhbCA9IHt9O1xuICAgICAgICBjb25zdCBmaWVsZHMgPSB0aGlzLk1vZGVsLiRmaWVsZHM7XG4gICAgICAgIE9iamVjdC5rZXlzKGZpZWxkcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgaWYgKCghZmllbGRzW2tleV0ucmVhZE9ubHkpICYmIChmaWVsZHNba2V5XS50eXBlICE9PSAnaGFzTWFueScpKSB7XG4gICAgICAgICAgICByZXRWYWxba2V5XSA9IEpvaVtmaWVsZHNba2V5XS50eXBlXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvYWRIYW5kbGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucGx1bXAuZmluZCh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpO1xuICAgICAgICAgIHJldHVybiBpdGVtLiRnZXQoKVxuICAgICAgICAgIC50aGVuKCh0aGluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgIHJlcGx5KGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzc2lnbjogJ2l0ZW0nLFxuICAgIH07XG4gIH1cblxuICBhcHByb3ZlSGFuZGxlcihtZXRob2ROYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgcmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdXNlciA9IHJlcXVlc3QuYXV0aC5jcmVkZW50aWFscy51c2VyO1xuICAgICAgICAgIGlmICh1c2VyLnN1cGVydXNlciAmJiB0aGlzLk1vZGVsLmFsbG93U3VwZXJ1c2VyT3ZlcnJpZGUobWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBhY3RvclByb2ZpbGUgPSB0aGlzLnBsdW1wLmZpbmQoJ3Byb2ZpbGVzJywgdXNlci5wcm9maWxlX2lkKTtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnBhcmFtcy5pdGVtSWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW1cbiAgICAgICAgICAgICAgLmFwcHJvdmUoYWN0b3JQcm9maWxlLCBtZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcmVxdWVzdC5wYXlsb2FkLFxuICAgICAgICAgICAgICAgIGZpZWxkOiBvcHRpb25zLmZpZWxkLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLk1vZGVsLmFwcHJvdmUoYWN0b3JQcm9maWxlLCBtZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcmVxdWVzdC5wYXlsb2FkLFxuICAgICAgICAgICAgICAgIGZpZWxkOiBvcHRpb25zLmZpZWxkLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXBseShyZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBseShCb29tLmZvcmJpZGRlbigpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyci5pc0Jvb20pIHtcbiAgICAgICAgICAgIHJlcGx5KGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyci5zdGFjayk7XG4gICAgICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlKG1ldGhvZCwgb3B0cykge1xuICAgIGlmIChvcHRzLnBsdXJhbCkge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVNYW55KG1ldGhvZCwgb3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlT25lKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cbiAgcm91dGVNYW55KG1ldGhvZCwgb3B0cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLk1vZGVsLiRmaWVsZHMpLmZpbHRlcigoZikgPT4gdGhpcy5Nb2RlbC4kZmllbGRzW2ZdLnR5cGUgPT09ICdoYXNNYW55JylcbiAgICAubWFwKChmaWVsZCkgPT4ge1xuICAgICAgY29uc3QgZ2VuZXJpY09wdHMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICAgIHt9LFxuICAgICAgICBvcHRzLFxuICAgICAgICB7XG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICAgIGdlbmVyYXRvck9wdGlvbnM6IHsgZmllbGQ6IGZpZWxkIH0sXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBnZW5lcmljT3B0cy5oYXBpLnBhdGggPSBnZW5lcmljT3B0cy5oYXBpLnBhdGgucmVwbGFjZSgne2ZpZWxkfScsIGZpZWxkKTtcbiAgICAgIGlmIChbJ1BPU1QnLCAnUFVUJywgJ1BBVENIJ10uaW5kZXhPZihnZW5lcmljT3B0cy5oYXBpLm1ldGhvZCkgPj0gMCkge1xuICAgICAgICBnZW5lcmljT3B0cy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpO1xuICAgICAgfVxuICAgICAgZ2VuZXJpY09wdHMucGx1cmFsID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZU9uZShtZXRob2QsIGdlbmVyaWNPcHRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJvdXRlT25lKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnc2NoZW1hJyxcbiAgJ2xpc3RDaGlsZHJlbicsXG4gICdhZGRDaGlsZCcsXG4gICdyZW1vdmVDaGlsZCcsXG4gICdtb2RpZnlDaGlsZCcsXG4gICdjcmVhdGUnLFxuICAndXBkYXRlJyxcbiAgJ2RlbGV0ZScsXG5dO1xuIl19
