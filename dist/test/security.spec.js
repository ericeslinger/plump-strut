'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plump = require('plump');

var _base = require('../base');

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

function allowScheme() {
  return {
    authenticate: function authenticate(req, reply) {
      return reply(true);
    }
  };
}

_chai2.default.use(_chaiAsPromised2.default);
var expect = _chai2.default.expect;
describe('Base Plump Routes', function () {
  it('Allows the programmer to set authentication schemas', function () {
    var ms = new _plump.MemoryStore({ terminal: true });
    var plump = new _plump.Plump({ types: [_plump.TestType], storage: [ms] });
    var basePlugin = new _base.BaseController(plump, _plump.TestType, { routes: { authFor: { schema: 'allow' } } });
    var hapi = new _hapi2.default.Server();
    hapi.connection({ port: 80 });
    hapi.auth.scheme('allowScheme', allowScheme);
    hapi.auth.strategy('allow', 'allowScheme');
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } }).then(function () {
      return expect(hapi.inject('/api/schema')).to.eventually.have.property('statusCode', 200);
    });
  });

  it('Results in a 403 if the authorization result fails', function () {
    var FourOhThree = function (_BaseController) {
      _inherits(FourOhThree, _BaseController);

      function FourOhThree() {
        _classCallCheck(this, FourOhThree);

        return _possibleConstructorReturn(this, (FourOhThree.__proto__ || Object.getPrototypeOf(FourOhThree)).apply(this, arguments));
      }

      _createClass(FourOhThree, [{
        key: 'approveHandler',
        value: function approveHandler() {
          return {
            method: function method(request, reply) {
              return reply(_boom2.default.forbidden());
            },
            assign: 'approve'
          };
        }
      }]);

      return FourOhThree;
    }(_base.BaseController);

    var ms = new _plump.MemoryStore({ terminal: true });
    var plump = new _plump.Plump({ types: [_plump.TestType], storage: [ms] });
    var basePlugin = new FourOhThree(plump, _plump.TestType);
    var hapi = new _hapi2.default.Server();
    var one = new _plump.TestType({ name: 'potato' }, plump);
    hapi.connection({ port: 80 });
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } }).then(function () {
      return one.$save();
    }).then(function () {
      return expect(hapi.inject('/api/' + one.$id)).to.eventually.have.property('statusCode', 403);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3Qvc2VjdXJpdHkuc3BlYy5qcyJdLCJuYW1lcyI6WyJhbGxvd1NjaGVtZSIsImF1dGhlbnRpY2F0ZSIsInJlcSIsInJlcGx5IiwidXNlIiwiZXhwZWN0IiwiZGVzY3JpYmUiLCJpdCIsIm1zIiwidGVybWluYWwiLCJwbHVtcCIsInR5cGVzIiwic3RvcmFnZSIsImJhc2VQbHVnaW4iLCJyb3V0ZXMiLCJhdXRoRm9yIiwic2NoZW1hIiwiaGFwaSIsIlNlcnZlciIsImNvbm5lY3Rpb24iLCJwb3J0IiwiYXV0aCIsInNjaGVtZSIsInN0cmF0ZWd5IiwicmVnaXN0ZXIiLCJwbHVnaW4iLCJwcmVmaXgiLCJ0aGVuIiwiaW5qZWN0IiwidG8iLCJldmVudHVhbGx5IiwiaGF2ZSIsInByb3BlcnR5IiwiRm91ck9oVGhyZWUiLCJtZXRob2QiLCJyZXF1ZXN0IiwiZm9yYmlkZGVuIiwiYXNzaWduIiwib25lIiwibmFtZSIsIiRzYXZlIiwiJGlkIl0sIm1hcHBpbmdzIjoiOzs7O0FBR0E7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7K2VBVEE7QUFDQTs7QUFVQSxTQUFTQSxXQUFULEdBQXVCO0FBQ3JCLFNBQU87QUFDTEMsa0JBQWMsc0JBQUNDLEdBQUQsRUFBTUMsS0FBTjtBQUFBLGFBQWdCQSxNQUFNLElBQU4sQ0FBaEI7QUFBQTtBQURULEdBQVA7QUFHRDs7QUFHRCxlQUFLQyxHQUFMO0FBQ0EsSUFBTUMsU0FBUyxlQUFLQSxNQUFwQjtBQUNBQyxTQUFTLG1CQUFULEVBQThCLFlBQU07QUFDbENDLEtBQUcscURBQUgsRUFBMEQsWUFBTTtBQUM5RCxRQUFNQyxLQUFLLHVCQUFnQixFQUFFQyxVQUFVLElBQVosRUFBaEIsQ0FBWDtBQUNBLFFBQU1DLFFBQVEsaUJBQVUsRUFBRUMsT0FBTyxpQkFBVCxFQUFxQkMsU0FBUyxDQUFDSixFQUFELENBQTlCLEVBQVYsQ0FBZDtBQUNBLFFBQU1LLGFBQWEseUJBQW1CSCxLQUFuQixtQkFBb0MsRUFBRUksUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsT0FBVixFQUFYLEVBQVYsRUFBcEMsQ0FBbkI7QUFDQSxRQUFNQyxPQUFPLElBQUksZUFBS0MsTUFBVCxFQUFiO0FBQ0FELFNBQUtFLFVBQUwsQ0FBZ0IsRUFBRUMsTUFBTSxFQUFSLEVBQWhCO0FBQ0FILFNBQUtJLElBQUwsQ0FBVUMsTUFBVixDQUFpQixhQUFqQixFQUFnQ3RCLFdBQWhDO0FBQ0FpQixTQUFLSSxJQUFMLENBQVVFLFFBQVYsQ0FBbUIsT0FBbkIsRUFBNEIsYUFBNUI7QUFDQSxXQUFPTixLQUFLTyxRQUFMLENBQWNYLFdBQVdZLE1BQXpCLEVBQWlDLEVBQUVYLFFBQVEsRUFBRVksUUFBUSxNQUFWLEVBQVYsRUFBakMsRUFDTkMsSUFETSxDQUNELFlBQU07QUFDVixhQUFPdEIsT0FBT1ksS0FBS1csTUFBTCxDQUFZLGFBQVosQ0FBUCxFQUFtQ0MsRUFBbkMsQ0FBc0NDLFVBQXRDLENBQWlEQyxJQUFqRCxDQUFzREMsUUFBdEQsQ0FBK0QsWUFBL0QsRUFBNkUsR0FBN0UsQ0FBUDtBQUNELEtBSE0sQ0FBUDtBQUlELEdBWkQ7O0FBY0F6QixLQUFHLG9EQUFILEVBQXlELFlBQU07QUFBQSxRQUN2RDBCLFdBRHVEO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx5Q0FFMUM7QUFDZixpQkFBTztBQUNMQyxvQkFBUSxnQkFBQ0MsT0FBRCxFQUFVaEMsS0FBVjtBQUFBLHFCQUFvQkEsTUFBTSxlQUFLaUMsU0FBTCxFQUFOLENBQXBCO0FBQUEsYUFESDtBQUVMQyxvQkFBUTtBQUZILFdBQVA7QUFJRDtBQVAwRDs7QUFBQTtBQUFBOztBQVM3RCxRQUFNN0IsS0FBSyx1QkFBZ0IsRUFBRUMsVUFBVSxJQUFaLEVBQWhCLENBQVg7QUFDQSxRQUFNQyxRQUFRLGlCQUFVLEVBQUVDLE9BQU8saUJBQVQsRUFBcUJDLFNBQVMsQ0FBQ0osRUFBRCxDQUE5QixFQUFWLENBQWQ7QUFDQSxRQUFNSyxhQUFhLElBQUlvQixXQUFKLENBQWdCdkIsS0FBaEIsa0JBQW5CO0FBQ0EsUUFBTU8sT0FBTyxJQUFJLGVBQUtDLE1BQVQsRUFBYjtBQUNBLFFBQU1vQixNQUFNLG9CQUFhLEVBQUVDLE1BQU0sUUFBUixFQUFiLEVBQWlDN0IsS0FBakMsQ0FBWjtBQUNBTyxTQUFLRSxVQUFMLENBQWdCLEVBQUVDLE1BQU0sRUFBUixFQUFoQjtBQUNBLFdBQU9ILEtBQUtPLFFBQUwsQ0FBY1gsV0FBV1ksTUFBekIsRUFBaUMsRUFBRVgsUUFBUSxFQUFFWSxRQUFRLE1BQVYsRUFBVixFQUFqQyxFQUNOQyxJQURNLENBQ0Q7QUFBQSxhQUFNVyxJQUFJRSxLQUFKLEVBQU47QUFBQSxLQURDLEVBRU5iLElBRk0sQ0FFRCxZQUFNO0FBQ1YsYUFBT3RCLE9BQU9ZLEtBQUtXLE1BQUwsV0FBb0JVLElBQUlHLEdBQXhCLENBQVAsRUFBdUNaLEVBQXZDLENBQTBDQyxVQUExQyxDQUFxREMsSUFBckQsQ0FBMERDLFFBQTFELENBQW1FLFlBQW5FLEVBQWlGLEdBQWpGLENBQVA7QUFDRCxLQUpNLENBQVA7QUFLRCxHQXBCRDtBQXFCRCxDQXBDRCIsImZpbGUiOiJ0ZXN0L3NlY3VyaXR5LnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZW52IG5vZGUsIG1vY2hhKi9cbi8qIGVzbGludCBuby1zaGFkb3c6IDAgKi9cblxuaW1wb3J0IHsgVGVzdFR5cGUsIFBsdW1wLCBNZW1vcnlTdG9yZSB9IGZyb20gJ3BsdW1wJztcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi4vYmFzZSc7XG5cbmltcG9ydCBjaGFpIGZyb20gJ2NoYWknO1xuaW1wb3J0IEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgQm9vbSBmcm9tICdib29tJztcbmltcG9ydCBjaGFpQXNQcm9taXNlZCBmcm9tICdjaGFpLWFzLXByb21pc2VkJztcblxuZnVuY3Rpb24gYWxsb3dTY2hlbWUoKSB7XG4gIHJldHVybiB7XG4gICAgYXV0aGVudGljYXRlOiAocmVxLCByZXBseSkgPT4gcmVwbHkodHJ1ZSksXG4gIH07XG59XG5cblxuY2hhaS51c2UoY2hhaUFzUHJvbWlzZWQpO1xuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5kZXNjcmliZSgnQmFzZSBQbHVtcCBSb3V0ZXMnLCAoKSA9PiB7XG4gIGl0KCdBbGxvd3MgdGhlIHByb2dyYW1tZXIgdG8gc2V0IGF1dGhlbnRpY2F0aW9uIHNjaGVtYXMnLCAoKSA9PiB7XG4gICAgY29uc3QgbXMgPSBuZXcgTWVtb3J5U3RvcmUoeyB0ZXJtaW5hbDogdHJ1ZSB9KTtcbiAgICBjb25zdCBwbHVtcCA9IG5ldyBQbHVtcCh7IHR5cGVzOiBbVGVzdFR5cGVdLCBzdG9yYWdlOiBbbXNdIH0pO1xuICAgIGNvbnN0IGJhc2VQbHVnaW4gPSBuZXcgQmFzZUNvbnRyb2xsZXIocGx1bXAsIFRlc3RUeXBlLCB7IHJvdXRlczogeyBhdXRoRm9yOiB7IHNjaGVtYTogJ2FsbG93JyB9IH0gfSk7XG4gICAgY29uc3QgaGFwaSA9IG5ldyBIYXBpLlNlcnZlcigpO1xuICAgIGhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IDgwIH0pO1xuICAgIGhhcGkuYXV0aC5zY2hlbWUoJ2FsbG93U2NoZW1lJywgYWxsb3dTY2hlbWUpO1xuICAgIGhhcGkuYXV0aC5zdHJhdGVneSgnYWxsb3cnLCAnYWxsb3dTY2hlbWUnKTtcbiAgICByZXR1cm4gaGFwaS5yZWdpc3RlcihiYXNlUGx1Z2luLnBsdWdpbiwgeyByb3V0ZXM6IHsgcHJlZml4OiAnL2FwaScgfSB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBleHBlY3QoaGFwaS5pbmplY3QoJy9hcGkvc2NoZW1hJykpLnRvLmV2ZW50dWFsbHkuaGF2ZS5wcm9wZXJ0eSgnc3RhdHVzQ29kZScsIDIwMCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdSZXN1bHRzIGluIGEgNDAzIGlmIHRoZSBhdXRob3JpemF0aW9uIHJlc3VsdCBmYWlscycsICgpID0+IHtcbiAgICBjbGFzcyBGb3VyT2hUaHJlZSBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcbiAgICAgIGFwcHJvdmVIYW5kbGVyKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1ldGhvZDogKHJlcXVlc3QsIHJlcGx5KSA9PiByZXBseShCb29tLmZvcmJpZGRlbigpKSxcbiAgICAgICAgICBhc3NpZ246ICdhcHByb3ZlJyxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbXMgPSBuZXcgTWVtb3J5U3RvcmUoeyB0ZXJtaW5hbDogdHJ1ZSB9KTtcbiAgICBjb25zdCBwbHVtcCA9IG5ldyBQbHVtcCh7IHR5cGVzOiBbVGVzdFR5cGVdLCBzdG9yYWdlOiBbbXNdIH0pO1xuICAgIGNvbnN0IGJhc2VQbHVnaW4gPSBuZXcgRm91ck9oVGhyZWUocGx1bXAsIFRlc3RUeXBlKTtcbiAgICBjb25zdCBoYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gICAgY29uc3Qgb25lID0gbmV3IFRlc3RUeXBlKHsgbmFtZTogJ3BvdGF0bycgfSwgcGx1bXApO1xuICAgIGhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IDgwIH0pO1xuICAgIHJldHVybiBoYXBpLnJlZ2lzdGVyKGJhc2VQbHVnaW4ucGx1Z2luLCB7IHJvdXRlczogeyBwcmVmaXg6ICcvYXBpJyB9IH0pXG4gICAgLnRoZW4oKCkgPT4gb25lLiRzYXZlKCkpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIGV4cGVjdChoYXBpLmluamVjdChgL2FwaS8ke29uZS4kaWR9YCkpLnRvLmV2ZW50dWFsbHkuaGF2ZS5wcm9wZXJ0eSgnc3RhdHVzQ29kZScsIDQwMyk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
