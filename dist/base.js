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
        return request.pre.item.$set(request.payload).$save();
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
        return new _this2.Model(request.payload, _this2.plump).$save();
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
            var dataSchema = { id: _joi2.default.number() };

            if (schema.relationships[field].type.$extras) {
              var extras = schema.relationships[field].type.$extras;

              Object.keys(extras).forEach(function (extra) {
                dataSchema.meta = dataSchema.meta || {};
                dataSchema.meta[extra] = _joi2.default[extras[extra].type]();
              });
            }
            return dataSchema;
          } else {
            return {};
          }
        } else {
          var retVal = {
            type: _joi2.default.string(),
            id: _joi2.default.number(),
            attributes: {},
            relationships: {}
          };

          Object.keys(schema.attributes).forEach(function (attr) {
            retVal.attributes[attr] = _joi2.default[schema.attributes[attr].type]();
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
            retVal.relationships[relName] = _joi2.default.array().items({
              op: _joi2.default.string().valid('add', 'modify', 'remove'),
              data: itemSchema
            });
          });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInBsdWdpbiIsInNlcnZlciIsIl8iLCJuZXh0Iiwicm91dGUiLCJjb25zdHJ1Y3RvciIsInJvdXRlcyIsIm1hcCIsIm1ldGhvZCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJjb25jYXQiLCJleHRyYVJvdXRlcyIsIkJhc2VDb250cm9sbGVyIiwicGx1bXAiLCJNb2RlbCIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJzaWRlbG9hZHMiLCJiaW5kIiwiYXR0cmlidXRlcyIsInZlcnNpb24iLCJuYW1lIiwiJG5hbWUiLCJyZXF1ZXN0IiwicHJlIiwiaXRlbSIsIiRidWxrR2V0IiwiJHNldCIsInBheWxvYWQiLCIkc2F2ZSIsIiRkZWxldGUiLCJmaWVsZCIsIiRhZGQiLCIkZ2V0IiwidGhlbiIsImxpc3QiLCIkcmVtb3ZlIiwicGFyYW1zIiwiY2hpbGRJZCIsIiRtb2RpZnlSZWxhdGlvbnNoaXAiLCJxdWVyeSIsInJlc29sdmUiLCJzY2hlbWEiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJoYW5kbGVyIiwicmVwbHkiLCJyZXNwb25zZSIsImNvZGUiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJiYWRJbXBsZW1lbnRhdGlvbiIsIiRzY2hlbWEiLCJ0eXBlIiwicmVsYXRpb25zaGlwcyIsImRhdGFTY2hlbWEiLCJpZCIsIm51bWJlciIsIiRleHRyYXMiLCJleHRyYXMiLCJrZXlzIiwiZm9yRWFjaCIsIm1ldGEiLCJleHRyYSIsInJldFZhbCIsInN0cmluZyIsImF0dHIiLCJpdGVtU2NoZW1hIiwicmVsTmFtZSIsImV4dHJhVHlwZSIsImFycmF5IiwiaXRlbXMiLCJvcCIsInZhbGlkIiwiZGF0YSIsIml0ZW1JZCIsImZpbmQiLCJ0aGluZyIsIm5vdEZvdW5kIiwib3B0cyIsInBsdXJhbCIsInJvdXRlUmVsYXRpb25zaGlwcyIsInJvdXRlQXR0cmlidXRlcyIsImdlbmVyaWNPcHRzIiwidmFsaWRhdGUiLCJnZW5lcmF0b3JPcHRpb25zIiwiaGFwaSIsInBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsImNyZWF0ZUpvaVZhbGlkYXRvciIsInJvdXRlQ29uZmlnIiwiY3JlYXRlSGFuZGxlciIsImNvbmZpZyIsImFwcHJvdmVIYW5kbGVyIiwidW5zaGlmdCIsImxvYWRIYW5kbGVyIiwidW5kZWZpbmVkIiwicCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsYUFBYSwrQkFBbkI7O0FBRUEsU0FBU0MsTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0JDLENBQXhCLEVBQTJCQyxJQUEzQixFQUFpQztBQUFBOztBQUMvQkYsU0FBT0csS0FBUCxDQUNFLEtBQUtDLFdBQUwsQ0FBaUJDLE1BQWpCLENBQ0NDLEdBREQsQ0FDSyxVQUFDQyxNQUFEO0FBQUEsV0FBWSxNQUFLSixLQUFMLENBQVdJLE1BQVgsRUFBbUJULFdBQVdTLE1BQVgsQ0FBbkIsQ0FBWjtBQUFBLEdBREwsRUFFQ0MsTUFGRCxDQUVRLFVBQUNDLEdBQUQsRUFBTUMsSUFBTjtBQUFBLFdBQWVELElBQUlFLE1BQUosQ0FBV0QsSUFBWCxDQUFmO0FBQUEsR0FGUixFQUV5QyxFQUZ6QyxDQURGLENBRytDO0FBSC9DO0FBS0FWLFNBQU9HLEtBQVAsQ0FBYSxLQUFLUyxXQUFMLEVBQWI7QUFDQVY7QUFDRDs7SUFFWVcsYyxXQUFBQSxjO0FBQ1gsMEJBQVlDLEtBQVosRUFBbUJDLEtBQW5CLEVBQXdDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN0QyxTQUFLRixLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxPQUFMLEdBQWVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUVDLFdBQVcsRUFBYixFQUFsQixFQUFxQ0gsT0FBckMsQ0FBZjtBQUNBLFNBQUtqQixN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Y2xELE1BQW5DLEVBQTJDO0FBQ3pDeUQsb0JBQVlFLE1BQVosQ0FBbUJULFFBQW5CLENBQTRCbEQsTUFBNUIsR0FBcUM2QyxLQUFLSyxRQUFMLENBQWNsRCxNQUFuRDtBQUNEOztBQUVELFVBQUk2QyxLQUFLSyxRQUFMLElBQWlCTCxLQUFLSyxRQUFMLENBQWMzRCxPQUFkLEtBQTBCLElBQS9DLEVBQXFEO0FBQ25Ea0Usb0JBQVlFLE1BQVosQ0FBbUJULFFBQW5CLENBQTRCM0QsT0FBNUIsR0FBc0MsS0FBS2lFLGtCQUFMLEVBQXRDO0FBQ0QsT0FGRCxNQUVPLElBQUlYLEtBQUtLLFFBQUwsSUFBaUJMLEtBQUtLLFFBQUwsQ0FBYzNELE9BQW5DLEVBQTRDO0FBQ2pEa0Usb0JBQVlFLE1BQVosQ0FBbUJULFFBQW5CLENBQTRCM0QsT0FBNUIsR0FBc0NzRCxLQUFLSyxRQUFMLENBQWMzRCxPQUFwRDtBQUNEO0FBQ0QsYUFBT2tFLFdBQVA7QUFDRDs7Ozs7O0FBR0huRixlQUFlUixNQUFmLEdBQXdCLENBQ3RCLE1BRHNCLEVBRXRCLE9BRnNCLEVBR3RCLGNBSHNCLEVBSXRCLFVBSnNCLEVBS3RCLGFBTHNCLEVBTXRCLGFBTnNCLEVBT3RCLFFBUHNCLEVBUXRCLFFBUnNCLEVBU3RCLFFBVHNCLENBQXhCIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQm9vbSBmcm9tICdib29tJztcbmltcG9ydCBKb2kgZnJvbSAnam9pJztcbmltcG9ydCB7IGNyZWF0ZVJvdXRlcyB9IGZyb20gJy4vYmFzZVJvdXRlcyc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuY29uc3QgYmFzZVJvdXRlcyA9IGNyZWF0ZVJvdXRlcygpO1xuXG5mdW5jdGlvbiBwbHVnaW4oc2VydmVyLCBfLCBuZXh0KSB7XG4gIHNlcnZlci5yb3V0ZShcbiAgICB0aGlzLmNvbnN0cnVjdG9yLnJvdXRlc1xuICAgIC5tYXAoKG1ldGhvZCkgPT4gdGhpcy5yb3V0ZShtZXRob2QsIGJhc2VSb3V0ZXNbbWV0aG9kXSkpXG4gICAgLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIpLCBbXSkgLy8gcm91dGVSZWxhdGlvbnNoaXAgcmV0dXJucyBhbiBhcnJheVxuICApO1xuICBzZXJ2ZXIucm91dGUodGhpcy5leHRyYVJvdXRlcygpKTtcbiAgbmV4dCgpO1xufVxuXG5leHBvcnQgY2xhc3MgQmFzZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihwbHVtcCwgTW9kZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGx1bXAgPSBwbHVtcDtcbiAgICB0aGlzLk1vZGVsID0gTW9kZWw7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaWRlbG9hZHM6IFtdIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wbHVnaW4uYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgICBuYW1lOiB0aGlzLk1vZGVsLiRuYW1lLFxuICAgIH0sIHRoaXMub3B0aW9ucy5wbHVnaW4pO1xuICB9XG5cbiAgZXh0cmFSb3V0ZXMoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRidWxrR2V0KCk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnByZS5pdGVtLiRzZXQocmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZGVsZXRlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZSgpIHtcbiAgICByZXR1cm4gKHJlcXVlc3QpID0+IHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5Nb2RlbChyZXF1ZXN0LnBheWxvYWQsIHRoaXMucGx1bXApLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGFkZENoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJGFkZChmaWVsZCwgcmVxdWVzdC5wYXlsb2FkKS4kc2F2ZSgpO1xuICAgIH07XG4gIH1cblxuICBsaXN0Q2hpbGRyZW4oeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kZ2V0KGZpZWxkKVxuICAgICAgLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgW2ZpZWxkXTogbGlzdCB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHsgZmllbGQgfSkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHJlcXVlc3QucHJlLml0ZW0uJHJlbW92ZShmaWVsZCwgcmVxdWVzdC5wYXJhbXMuY2hpbGRJZCkuJHNhdmUoKTtcbiAgICB9O1xuICB9XG5cbiAgbW9kaWZ5Q2hpbGQoeyBmaWVsZCB9KSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5wcmUuaXRlbS4kbW9kaWZ5UmVsYXRpb25zaGlwKGZpZWxkLCByZXF1ZXN0LnBhcmFtcy5jaGlsZElkLCByZXF1ZXN0LnBheWxvYWQpLiRzYXZlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHF1ZXJ5KCkge1xuICAgIHJldHVybiAocmVxdWVzdCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGx1bXAucXVlcnkodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5xdWVyeSk7XG4gICAgfTtcbiAgfVxuXG4gIHNjaGVtYSgpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcmV0dXJuIEJsdWViaXJkLnJlc29sdmUoe1xuICAgICAgICBzY2hlbWE6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5Nb2RlbCkpLFxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZUhhbmRsZXIobWV0aG9kLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHRoaXNbbWV0aG9kXShvcHRpb25zKTtcbiAgICByZXR1cm4gKHJlcXVlc3QsIHJlcGx5KSA9PiB7XG4gICAgICByZXR1cm4gaGFuZGxlcihyZXF1ZXN0KVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIHJlcGx5KHJlc3BvbnNlKS5jb2RlKDIwMCk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuTW9kZWwuJHNjaGVtYTtcbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICBpZiAoZmllbGQgaW4gc2NoZW1hLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICByZXR1cm4geyBbZmllbGRdOiBKb2lbc2NoZW1hLmF0dHJpYnV0ZXNbZmllbGRdLnR5cGVdKCkgfTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZCBpbiBzY2hlbWEucmVsYXRpb25zaGlwcykge1xuICAgICAgICAgIGNvbnN0IGRhdGFTY2hlbWEgPSB7IGlkOiBKb2kubnVtYmVyKCkgfTtcblxuICAgICAgICAgIGlmIChzY2hlbWEucmVsYXRpb25zaGlwc1tmaWVsZF0udHlwZS4kZXh0cmFzKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYXMgPSBzY2hlbWEucmVsYXRpb25zaGlwc1tmaWVsZF0udHlwZS4kZXh0cmFzO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhleHRyYXMpLmZvckVhY2goZXh0cmEgPT4ge1xuICAgICAgICAgICAgICBkYXRhU2NoZW1hLm1ldGEgPSBkYXRhU2NoZW1hLm1ldGEgfHwge307XG4gICAgICAgICAgICAgIGRhdGFTY2hlbWEubWV0YVtleHRyYV0gPSBKb2lbZXh0cmFzW2V4dHJhXS50eXBlXSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkYXRhU2NoZW1hO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmV0VmFsID0ge1xuICAgICAgICAgIHR5cGU6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgICBpZDogSm9pLm51bWJlcigpLFxuICAgICAgICAgIGF0dHJpYnV0ZXM6IHt9LFxuICAgICAgICAgIHJlbGF0aW9uc2hpcHM6IHt9LFxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5hdHRyaWJ1dGVzKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgIHJldFZhbC5hdHRyaWJ1dGVzW2F0dHJdID0gSm9pW3NjaGVtYS5hdHRyaWJ1dGVzW2F0dHJdLnR5cGVdKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5yZWxhdGlvbnNoaXBzKS5mb3JFYWNoKHJlbE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGl0ZW1TY2hlbWEgPSB7IGlkOiBKb2kubnVtYmVyKCkgfTtcblxuICAgICAgICAgIGlmIChzY2hlbWEucmVsYXRpb25zaGlwc1tyZWxOYW1lXS50eXBlLiRleHRyYXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhcyA9IHNjaGVtYS5yZWxhdGlvbnNoaXBzW3JlbE5hbWVdLnR5cGUuJGV4dHJhcztcblxuICAgICAgICAgICAgZm9yIChjb25zdCBleHRyYSBpbiBleHRyYXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBndWFyZC1mb3ItaW5cbiAgICAgICAgICAgICAgY29uc3QgZXh0cmFUeXBlID0gZXh0cmFzW2V4dHJhXS50eXBlO1xuICAgICAgICAgICAgICBpdGVtU2NoZW1hLm1ldGEgPSBpdGVtU2NoZW1hLm1ldGEgfHwge307XG4gICAgICAgICAgICAgIGl0ZW1TY2hlbWEubWV0YVtleHRyYV0gPSBKb2lbZXh0cmFUeXBlXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXRWYWwucmVsYXRpb25zaGlwc1tyZWxOYW1lXSA9IEpvaS5hcnJheSgpXG4gICAgICAgICAgICAuaXRlbXMoe1xuICAgICAgICAgICAgICBvcDogSm9pLnN0cmluZygpLnZhbGlkKCdhZGQnLCAnbW9kaWZ5JywgJ3JlbW92ZScpLFxuICAgICAgICAgICAgICBkYXRhOiBpdGVtU2NoZW1hLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0VmFsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBsb2FkSGFuZGxlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zICYmIHJlcXVlc3QucGFyYW1zLml0ZW1JZCkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnBsdW1wLmZpbmQodGhpcy5Nb2RlbC4kbmFtZSwgcmVxdWVzdC5wYXJhbXMuaXRlbUlkKTtcbiAgICAgICAgICByZXR1cm4gaXRlbS4kZ2V0KClcbiAgICAgICAgICAudGhlbigodGhpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGluZykge1xuICAgICAgICAgICAgICByZXBseShpdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHJlcGx5KEJvb20uYmFkSW1wbGVtZW50YXRpb24oZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5KEJvb20ubm90Rm91bmQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3NpZ246ICdpdGVtJyxcbiAgICB9O1xuICB9XG5cbiAgcm91dGUobWV0aG9kLCBvcHRzKSB7XG4gICAgaWYgKG9wdHMucGx1cmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVJlbGF0aW9uc2hpcHMobWV0aG9kLCBvcHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBvdmVycmlkZSBhcHByb3ZlSGFuZGxlciB3aXRoIHdoYXRldmVyIHBlci1yb3V0ZVxuICAvLyBsb2dpYyB5b3Ugd2FudCAtIHJlcGx5IHdpdGggQm9vbS5ub3RBdXRob3JpemVkKClcbiAgLy8gb3IgYW55IG90aGVyIHZhbHVlIG9uIG5vbi1hcHByb3ZlZCBzdGF0dXNcbiAgYXBwcm92ZUhhbmRsZXIobWV0aG9kLCBvcHRzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4ge1xuICAgICAgbWV0aG9kOiAocmVxdWVzdCwgcmVwbHkpID0+IHJlcGx5KHRydWUpLFxuICAgICAgYXNzaWduOiAnYXBwcm92ZScsXG4gICAgfTtcbiAgfVxuXG4gIHJvdXRlUmVsYXRpb25zaGlwcyhtZXRob2QsIG9wdHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5Nb2RlbC4kc2NoZW1hLnJlbGF0aW9uc2hpcHMpLm1hcChmaWVsZCA9PiB7XG4gICAgICBjb25zdCBnZW5lcmljT3B0cyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgICAge30sXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZGF0ZToge30sXG4gICAgICAgICAgZ2VuZXJhdG9yT3B0aW9uczogeyBmaWVsZCB9LFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgZ2VuZXJpY09wdHMuaGFwaS5wYXRoID0gZ2VuZXJpY09wdHMuaGFwaS5wYXRoLnJlcGxhY2UoJ3tmaWVsZH0nLCBmaWVsZCk7XG4gICAgICBpZiAoWydQT1NUJywgJ1BVVCcsICdQQVRDSCddLmluZGV4T2YoZ2VuZXJpY09wdHMuaGFwaS5tZXRob2QpID49IDApIHtcbiAgICAgICAgZ2VuZXJpY09wdHMudmFsaWRhdGUucGF5bG9hZCA9IHRoaXMuY3JlYXRlSm9pVmFsaWRhdG9yKGZpZWxkKTtcbiAgICAgIH1cbiAgICAgIGdlbmVyaWNPcHRzLnBsdXJhbCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgZ2VuZXJpY09wdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgcm91dGVBdHRyaWJ1dGVzKG1ldGhvZCwgb3B0cykge1xuICAgIC8qXG4gICAgb3B0czoge1xuICAgICAgcHJlOiBbQU5ZIFBSRUhBTkRMRVJzXVxuICAgICAgaGFuZGxlcjogaGFuZGxlciBvdmVycmlkZVxuICAgICAgdmFsaWRhdGU6IHtKb2kgYnkgdHlwZSAocGFyYW0sIHF1ZXJ5LCBwYXlsb2FkKX0sXG4gICAgICBhdXRoOiBhbnl0aGluZyBvdGhlciB0aGFuIHRva2VuLFxuICAgICAgaGFwaToge0FMTCBPVEhFUiBIQVBJIE9QVElPTlMsIE1VU1QgQkUgSlNPTiBTVFJJTkdJRllBQkxFfSxcbiAgICB9LFxuICAgICovXG5cbiAgICBjb25zdCByb3V0ZUNvbmZpZyA9IG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiBvcHRzLmhhbmRsZXIgfHwgdGhpcy5jcmVhdGVIYW5kbGVyKG1ldGhvZCwgb3B0cy5nZW5lcmF0b3JPcHRpb25zKSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcHJlOiBbdGhpcy5hcHByb3ZlSGFuZGxlcihtZXRob2QsIG9wdHMuZ2VuZXJhdG9yT3B0aW9ucyldLFxuICAgICAgICAgIHZhbGlkYXRlOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvcHRzLmhhcGlcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFwaS5wYXRoLmluZGV4T2YoJ2l0ZW1JZCcpID49IDApIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy5wcmUudW5zaGlmdCh0aGlzLmxvYWRIYW5kbGVyKCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnByZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRzLnByZS5mb3JFYWNoKChwKSA9PiByb3V0ZUNvbmZpZy5jb25maWcucHJlLnB1c2gocCkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnZhbGlkYXRlICYmIG9wdHMudmFsaWRhdGUucXVlcnkpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5xdWVyeSA9IG9wdHMudmFsaWRhdGUucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXJhbXMpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXJhbXMgPSBvcHRzLnZhbGlkYXRlLnBhcmFtcztcbiAgICB9XG5cbiAgICBpZiAob3B0cy52YWxpZGF0ZSAmJiBvcHRzLnZhbGlkYXRlLnBheWxvYWQgPT09IHRydWUpIHtcbiAgICAgIHJvdXRlQ29uZmlnLmNvbmZpZy52YWxpZGF0ZS5wYXlsb2FkID0gdGhpcy5jcmVhdGVKb2lWYWxpZGF0b3IoKTtcbiAgICB9IGVsc2UgaWYgKG9wdHMudmFsaWRhdGUgJiYgb3B0cy52YWxpZGF0ZS5wYXlsb2FkKSB7XG4gICAgICByb3V0ZUNvbmZpZy5jb25maWcudmFsaWRhdGUucGF5bG9hZCA9IG9wdHMudmFsaWRhdGUucGF5bG9hZDtcbiAgICB9XG4gICAgcmV0dXJuIHJvdXRlQ29uZmlnO1xuICB9XG59XG5cbkJhc2VDb250cm9sbGVyLnJvdXRlcyA9IFtcbiAgJ3JlYWQnLFxuICAncXVlcnknLFxuICAnbGlzdENoaWxkcmVuJyxcbiAgJ2FkZENoaWxkJyxcbiAgJ3JlbW92ZUNoaWxkJyxcbiAgJ21vZGlmeUNoaWxkJyxcbiAgJ2NyZWF0ZScsXG4gICd1cGRhdGUnLFxuICAnZGVsZXRlJyxcbl07XG4iXX0=
