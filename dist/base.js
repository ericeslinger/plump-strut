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
            _retVal.relationships[relName] = _joi2.default.array().items(itemSchema);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRidWxrR2V0IiwiJHNldCIsInBheWxvYWQiLCIkc2F2ZSIsInRoZW4iLCJ2IiwiJGdldCIsIiRkZWxldGUiLCJmaWVsZCIsIiRhZGQiLCJsaXN0IiwiJHJlbW92ZSIsInBhcmFtcyIsImNoaWxkSWQiLCIkbW9kaWZ5UmVsYXRpb25zaGlwIiwicXVlcnkiLCJyZXNvbHZlIiwic2NoZW1hIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiaGFuZGxlciIsInJlcGx5IiwicmVzcG9uc2UiLCJjb2RlIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYmFkSW1wbGVtZW50YXRpb24iLCIkc2NoZW1hIiwidHlwZSIsInJlbGF0aW9uc2hpcHMiLCJyZXRWYWwiLCJpZCIsIm51bWJlciIsIiRleHRyYXMiLCJleHRyYXMiLCJrZXlzIiwiZm9yRWFjaCIsImV4dHJhVHlwZSIsImV4dHJhIiwic3RyaW5nIiwiYXR0ciIsIml0ZW1TY2hlbWEiLCJyZWxOYW1lIiwiYXJyYXkiLCJpdGVtcyIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwib3B0cyIsInBsdXJhbCIsInJvdXRlUmVsYXRpb25zaGlwcyIsInJvdXRlQXR0cmlidXRlcyIsImdlbmVyaWNPcHRzIiwidmFsaWRhdGUiLCJnZW5lcmF0b3JPcHRpb25zIiwiaGFwaSIsInBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsImNyZWF0ZUpvaVZhbGlkYXRvciIsInJvdXRlQ29uZmlnIiwiY3JlYXRlSGFuZGxlciIsImNvbmZpZyIsImFwcHJvdmVIYW5kbGVyIiwidW5zaGlmdCIsImxvYWRIYW5kbGVyIiwidW5kZWZpbmVkIiwicCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsYUFBYSwrQkFBbkI7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUJULFdBQVdTLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLEdBQUQsRUFBTUMsSUFBTjtBQUFBLFdBQWVELElBQUlFLE1BQUosQ0FBV0QsSUFBWCxDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUVDLFdBQVcsRUFBYixFQUFsQixFQUFxQ0gsT0FBckMsQ0FBZjtBQUNBLFNBQUtqQixNQUFMLEdBQWNBLE9BQU9xQixJQUFQLENBQVksSUFBWixDQUFk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RDtBQUNEOztBQUVELFVBQUl3QyxLQUFLSyxRQUFMLElBQWlCTCxLQUFLSyxRQUFMLENBQWN2RCxPQUFkLEtBQTBCLElBQS9DLEVBQXFEO0FBQ25EOEQsb0JBQVlFLE1BQVosQ0FBbUJULFFBQW5CLENBQTRCdkQsT0FBNUIsR0FBc0MsS0FBSzZELGtCQUFMLEVBQXRDO0FBQ0QsT0FGRCxNQUVPLElBQUlYLEtBQUtLLFFBQUwsSUFBaUJMLEtBQUtLLFFBQUwsQ0FBY3ZELE9BQW5DLEVBQTRDO0FBQ2pEOEQsb0JBQVlFLE1BQVosQ0FBbUJULFFBQW5CLENBQTRCdkQsT0FBNUIsR0FBc0NrRCxLQUFLSyxRQUFMLENBQWN2RCxPQUFwRDtBQUNEO0FBQ0QsYUFBTzhELFdBQVA7QUFDRDs7Ozs7O0FBR0gvRSxlQUFlUixNQUFmLEdBQXdCLENBQ3RCLE1BRHNCLEVBRXRCLE9BRnNCLEVBR3RCLGNBSHNCLEVBSXRCLFVBSnNCLEVBS3RCLGFBTHNCLEVBTXRCLGFBTnNCLEVBT3RCLFFBUHNCLEVBUXRCLFFBUnNCLEVBU3RCLFFBVHNCLENBQXhCIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQm9vbSBmcm9tICdib29tJztcbmltcG9ydCBKb2kgZnJvbSAnam9pJztcbmltcG9ydCB7IGNyZWF0ZVJvdXRlcyB9IGZyb20gJy4vYmFzZVJvdXRlcyc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuY29uc3QgYmFzZVJvdXRlcyA9IGNyZWF0ZVJvdXRlcygpO1xuXG5mdW5jdGlvbiBwbHVnaW4oc2VydmVyLCBfLCBuZXh0KSB7XG4gIHNlcnZlci5yb3V0ZShcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnJvdXRlc1xuICAgIC5tYXAoKG1ldGhvZCkgPT4gdGhpcy5yb3V0ZShtZXRob2QsIGJhc2VSb3V0ZXNbbWV0aG9kXSkpXG4gICAgLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIpLCBbXSkgLy8gcm91dGVSZWxhdGlvbnNoaXAgcmV0dXJucyBhbiBhcnJheVxuICApO1xuICBzZXJ2ZXIucm91dGUodGhpcy5leHRyYVJvdXRlcygpKTtcbiAgbmV4dCgpO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihwbHVtcCwgTW9kZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGx1bXAgPSBwbHVtcDtcbiAgICB0aGlzLk1vZGVsID0gTW9kZWw7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaWRlbG9hZHM6IFtdIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4uYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBuYW1lOiB0aGlzLk1vZGVsLiRuYW1lLFxuICAgIH0sIHRoaXMub3B0aW9ucy5wbHVnaW4pO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRidWxrR2V0KCk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRzZXQocmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICByZXR1cm4gdi4kZ2V0KCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGRlbGV0ZSgpO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuTW9kZWwocmVxdWVzdC5wYXlsb2FkLCB0aGlzLnBsdW1wKVxuICAgICAgLiRzYXZlKClcbiAgICAgIC50aGVuKCh2KSA9PiB7XG4gICAgICAgIHJldHVybiB2LiRnZXQoKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBhZGRDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRhZGQoZmllbGQsIHJlcXVlc3QucGF5bG9hZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgbGlzdENoaWxkcmVuKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGdldChmaWVsZClcbiAgICAgIC50aGVuKChsaXN0KSA9PiB7XG4gICAgICAgIHJldHVybiB7IFtmaWVsZF06IGxpc3QgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZW1vdmVDaGlsZCh7IGZpZWxkIH0pIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRyZW1vdmUoZmllbGQsIHJlcXVlc3QucGFyYW1zLmNoaWxkSWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIG1vZGlmeUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJG1vZGlmeVJlbGF0aW9uc2hpcChmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCwgcmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBxdWVyeSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnBsdW1wLnF1ZXJ5KHRoaXMuTW9kZWwuJG5hbWUsIHJlcXVlc3QucXVlcnkpO1xuICAgIH07XG4gIH1cblxuICBzY2hlbWEoKSB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKHtcbiAgICAgICAgc2NoZW1hOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuTW9kZWwpKSxcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBjcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzW21ldGhvZF0ob3B0aW9ucyk7XG4gICAgcmV0dXJuIChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgcmV0dXJuIGhhbmRsZXIocmVxdWVzdClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXBseShyZXNwb25zZSkuY29kZSgyMDApO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXBseShCb29tLmJhZEltcGxlbWVudGF0aW9uKGVycikpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUpvaVZhbGlkYXRvcihmaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLk1vZGVsLiRzY2hlbWE7XG4gICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGZpZWxkIGluIHNjaGVtYS5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogSm9pW3NjaGVtYS5hdHRyaWJ1dGVzW2ZpZWxkXS50eXBlXSgpIH07XG4gICAgICAgIH0gZWxzZSBpZiAoZmllbGQgaW4gc2NoZW1hLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgICAgICBjb25zdCByZXRWYWwgPSB7IGlkOiBKb2kubnVtYmVyKCkgfTtcblxuICAgICAgICAgIGlmIChzY2hlbWEucmVsYXRpb25zaGlwc1tmaWVsZF0udHlwZS4kZXh0cmFzKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYXMgPSBzY2hlbWEucmVsYXRpb25zaGlwc1tmaWVsZF0udHlwZS4kZXh0cmFzO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhleHRyYXMpLmZvckVhY2goZXh0cmEgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBleHRyYVR5cGUgPSBleHRyYXNbZXh0cmFdLnR5cGU7XG4gICAgICAgICAgICAgIHJldFZhbFtleHRyYV0gPSBKb2lbZXh0cmFUeXBlXSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXRWYWwgPSB7XG4gICAgICAgICAgdHlwZTogSm9pLnN0cmluZygpLFxuICAgICAgICAgIGlkOiBKb2kubnVtYmVyKCksXG4gICAgICAgICAgYXR0cmlidXRlczoge30sXG4gICAgICAgICAgcmVsYXRpb25zaGlwczoge30sXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMoc2NoZW1hLmF0dHJpYnV0ZXMpLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgcmV0VmFsLmF0dHJpYnV0ZXNbYXR0cl0gPSBKb2lbc2NoZW1hLmF0dHJpYnV0ZXNbYXR0cl0udHlwZV0oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoc2NoZW1hLnJlbGF0aW9uc2hpcHMpLmZvckVhY2gocmVsTmFtZSA9PiB7XG4gICAgICAgICAgY29uc3QgaXRlbVNjaGVtYSA9IHsgaWQ6IEpvaS5udW1iZXIoKSB9O1xuXG4gICAgICAgICAgaWYgKHNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbE5hbWVdLnR5cGUuJGV4dHJhcykge1xuICAgICAgICAgICAgY29uc3QgZXh0cmFzID0gc2NoZW1hLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0udHlwZS4kZXh0cmFzO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV4dHJhIGluIGV4dHJhcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGd1YXJkLWZvci1pblxuICAgICAgICAgICAgICBjb25zdCBleHRyYVR5cGUgPSBleHRyYXNbZXh0cmFdLnR5cGU7XG4gICAgICAgICAgICAgIGl0ZW1TY2hlbWFbZXh0cmFdID0gSm9pW2V4dHJhVHlwZV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0VmFsLnJlbGF0aW9uc2hpcHNbcmVsTmFtZV0gPSBKb2kuYXJyYXkoKS5pdGVtcyhpdGVtU2NoZW1hKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvYWRIYW5kbGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdC5wYXJhbXMgJiYgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucGx1bXAuZmluZCh0aGlzLk1vZGVsLiRuYW1lLCByZXF1ZXN0LnBhcmFtcy5pdGVtSWQpO1xuICAgICAgICAgIHJldHVybiBpdGVtLiRnZXQoKVxuICAgICAgICAgIC50aGVuKCh0aGluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaW5nKSB7XG4gICAgICAgICAgICAgIHJlcGx5KGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmVwbHkoQm9vbS5iYWRJbXBsZW1lbnRhdGlvbihlcnIpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVwbHkoQm9vbS5ub3RGb3VuZCgpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzc2lnbjogJ2l0ZW0nLFxuICAgIH07XG4gIH1cblxuICByb3V0ZShtZXRob2QsIG9wdHMpIHtcbiAgICBpZiAob3B0cy5wbHVyYWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlUmVsYXRpb25zaGlwcyhtZXRob2QsIG9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZUF0dHJpYnV0ZXMobWV0aG9kLCBvcHRzKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIG92ZXJyaWRlIGFwcHJvdmVIYW5kbGVyIHdpdGggd2hhdGV2ZXIgcGVyLXJvdXRlXG4gIC8vIGxvZ2ljIHlvdSB3YW50IC0gcmVwbHkgd2l0aCBCb29tLm5vdEF1dGhvcml6ZWQoKVxuICAvLyBvciBhbnkgb3RoZXIgdmFsdWUgb24gbm9uLWFwcHJvdmVkIHN0YXR1c1xuICBhcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiB7XG4gICAgICBtZXRob2Q6IChyZXF1ZXN0LCByZXBseSkgPT4gcmVwbHkodHJ1ZSksXG4gICAgICBhc3NpZ246ICdhcHByb3ZlJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGVSZWxhdGlvbnNoaXBzKG1ldGhvZCwgb3B0cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLk1vZGVsLiRzY2hlbWEucmVsYXRpb25zaGlwcykubWFwKGZpZWxkID0+IHtcbiAgICAgIGNvbnN0IGdlbmVyaWNPcHRzID0gbWVyZ2VPcHRpb25zKFxuICAgICAgICB7fSxcbiAgICAgICAgb3B0cyxcbiAgICAgICAge1xuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgICBnZW5lcmF0b3JPcHRpb25zOiB7IGZpZWxkIH0sXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBnZW5lcmljT3B0cy5oYXBpLnBhdGggPSBnZW5lcmljT3B0cy5oYXBpLnBhdGgucmVwbGFjZSgne2ZpZWxkfScsIGZpZWxkKTtcbiAgICAgIGlmIChbJ1BPU1QnLCAnUFVUJywgJ1BBVENIJ10uaW5kZXhPZihnZW5lcmljT3B0cy5oYXBpLm1ldGhvZCkgPj0gMCkge1xuICAgICAgICBnZW5lcmljT3B0cy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoZmllbGQpO1xuICAgICAgfVxuICAgICAgZ2VuZXJpY09wdHMucGx1cmFsID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZUF0dHJpYnV0ZXMobWV0aG9kLCBnZW5lcmljT3B0cyk7XG4gICAgfSk7XG4gIH1cblxuICByb3V0ZUF0dHJpYnV0ZXMobWV0aG9kLCBvcHRzKSB7XG4gICAgLypcbiAgICBvcHRzOiB7XG4gICAgICBwcmU6IFtBTlkgUFJFSEFORExFUnNdXG4gICAgICBoYW5kbGVyOiBoYW5kbGVyIG92ZXJyaWRlXG4gICAgICB2YWxpZGF0ZToge0pvaSBieSB0eXBlIChwYXJhbSwgcXVlcnksIHBheWxvYWQpfSxcbiAgICAgIGF1dGg6IGFueXRoaW5nIG90aGVyIHRoYW4gdG9rZW4sXG4gICAgICBoYXBpOiB7QUxMIE9USEVSIEhBUEkgT1BUSU9OUywgTVVTVCBCRSBKU09OIFNUUklOR0lGWUFCTEV9LFxuICAgIH0sXG4gICAgKi9cblxuICAgIGNvbnN0IHJvdXRlQ29uZmlnID0gbWVyZ2VPcHRpb25zKFxuICAgICAge30sXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6IG9wdHMuaGFuZGxlciB8fCB0aGlzLmNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRzLmdlbmVyYXRvck9wdGlvbnMpLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwcmU6IFt0aGlzLmFwcHJvdmVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKV0sXG4gICAgICAgICAgdmFsaWRhdGU6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIG9wdHMuaGFwaVxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXBpLnBhdGguaW5kZXhPZignaXRlbUlkJykgPj0gMCkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnByZS51bnNoaWZ0KHRoaXMubG9hZEhhbmRsZXIoKSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucHJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdHMucHJlLmZvckVhY2goKHApID0+IHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUucHVzaChwKSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5xdWVyeSkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnF1ZXJ5ID0gb3B0cy52YWxpZGF0ZS5xdWVyeTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBhcmFtcykge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBhcmFtcyA9IG9wdHMudmFsaWRhdGUucGFyYW1zO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucGF5bG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgcm91dGVDb25maWcuY29uZmlnLnZhbGlkYXRlLnBheWxvYWQgPSB0aGlzLmNyZWF0ZUpvaVZhbGlkYXRvcigpO1xuICAgIH0gZWxzZSBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gb3B0cy52YWxpZGF0ZS5wYXlsb2FkO1xuICAgIH1cbiAgICByZXR1cm4gcm91dGVDb25maWc7XG4gIH1cbn1cblxuQmFzZUNvbnRyb2xsZXIucm91dGVzID0gW1xuICAncmVhZCcsXG4gICdxdWVyeScsXG4gICdsaXN0Q2hpbGRyZW4nLFxuICAnYWRkQ2hpbGQnLFxuICAncmVtb3ZlQ2hpbGQnLFxuICAnbW9kaWZ5Q2hpbGQnLFxuICAnY3JlYXRlJyxcbiAgJ3VwZGF0ZScsXG4gICdkZWxldGUnLFxuXTtcbiJdfQ==
