'use strict';

var _plump = require('plump');

var _base = require('../base');

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiAsPromised2.default); /* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

var expect = _chai2.default.expect;
describe('HasMany Plump Routes', function () {
  var ms = new _plump.MemoryStore({ terminal: true });
  var plump = new _plump.Plump({ types: [_plump.TestType], storage: [ms] });
  var basePlugin = new _base.BaseController(plump, _plump.TestType);
  var hapi = new _hapi2.default.Server();
  hapi.connection({ port: 80 });

  before(function () {
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } });
  });

  it('C', function () {
    var one = new _plump.TestType({ name: 'potato' }, plump);
    return one.$save().then(function () {
      return hapi.inject({
        method: 'PUT',
        url: '/api/' + one.$id + '/children',
        payload: JSON.stringify({ child_id: 100 })
      });
    }).then(function (response) {
      console.log(response.payload);
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.deep.equal({ children: [100] });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvY2hpbGRyZW4uc3BlYy5qcyJdLCJuYW1lcyI6WyJ1c2UiLCJleHBlY3QiLCJkZXNjcmliZSIsIm1zIiwidGVybWluYWwiLCJwbHVtcCIsInR5cGVzIiwic3RvcmFnZSIsImJhc2VQbHVnaW4iLCJoYXBpIiwiU2VydmVyIiwiY29ubmVjdGlvbiIsInBvcnQiLCJiZWZvcmUiLCJyZWdpc3RlciIsInBsdWdpbiIsInJvdXRlcyIsInByZWZpeCIsIml0Iiwib25lIiwibmFtZSIsIiRzYXZlIiwidGhlbiIsImluamVjdCIsIm1ldGhvZCIsInVybCIsIiRpZCIsInBheWxvYWQiLCJKU09OIiwic3RyaW5naWZ5IiwiY2hpbGRfaWQiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJ0byIsImhhdmUiLCJwcm9wZXJ0eSIsIiRnZXQiLCJldmVudHVhbGx5IiwiZGVlcCIsImVxdWFsIiwiY2hpbGRyZW4iXSwibWFwcGluZ3MiOiI7O0FBR0E7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxlQUFLQSxHQUFMLDJCLENBVkE7QUFDQTs7QUFVQSxJQUFNQyxTQUFTLGVBQUtBLE1BQXBCO0FBQ0FDLFNBQVMsc0JBQVQsRUFBaUMsWUFBTTtBQUNyQyxNQUFNQyxLQUFLLHVCQUFnQixFQUFFQyxVQUFVLElBQVosRUFBaEIsQ0FBWDtBQUNBLE1BQU1DLFFBQVEsaUJBQVUsRUFBRUMsT0FBTyxpQkFBVCxFQUFxQkMsU0FBUyxDQUFDSixFQUFELENBQTlCLEVBQVYsQ0FBZDtBQUNBLE1BQU1LLGFBQWEseUJBQW1CSCxLQUFuQixrQkFBbkI7QUFDQSxNQUFNSSxPQUFPLElBQUksZUFBS0MsTUFBVCxFQUFiO0FBQ0FELE9BQUtFLFVBQUwsQ0FBZ0IsRUFBRUMsTUFBTSxFQUFSLEVBQWhCOztBQUVBQyxTQUFPLFlBQU07QUFDWCxXQUFPSixLQUFLSyxRQUFMLENBQWNOLFdBQVdPLE1BQXpCLEVBQWlDLEVBQUVDLFFBQVEsRUFBRUMsUUFBUSxNQUFWLEVBQVYsRUFBakMsQ0FBUDtBQUNELEdBRkQ7O0FBSUFDLEtBQUcsR0FBSCxFQUFRLFlBQU07QUFDWixRQUFNQyxNQUFNLG9CQUFhLEVBQUVDLE1BQU0sUUFBUixFQUFiLEVBQWlDZixLQUFqQyxDQUFaO0FBQ0EsV0FBT2MsSUFBSUUsS0FBSixHQUNOQyxJQURNLENBQ0QsWUFBTTtBQUNWLGFBQU9iLEtBQUtjLE1BQUwsQ0FBWTtBQUNqQkMsZ0JBQVEsS0FEUztBQUVqQkMsdUJBQWFOLElBQUlPLEdBQWpCLGNBRmlCO0FBR2pCQyxpQkFBU0MsS0FBS0MsU0FBTCxDQUFlLEVBQUVDLFVBQVUsR0FBWixFQUFmO0FBSFEsT0FBWixDQUFQO0FBS0QsS0FQTSxFQVFOUixJQVJNLENBUUQsVUFBQ1MsUUFBRCxFQUFjO0FBQ2xCQyxjQUFRQyxHQUFSLENBQVlGLFNBQVNKLE9BQXJCO0FBQ0ExQixhQUFPOEIsUUFBUCxFQUFpQkcsRUFBakIsQ0FBb0JDLElBQXBCLENBQXlCQyxRQUF6QixDQUFrQyxZQUFsQyxFQUFnRCxHQUFoRDtBQUNBLGFBQU9uQyxPQUFPa0IsSUFBSWtCLElBQUosQ0FBUyxVQUFULENBQVAsRUFBNkJILEVBQTdCLENBQWdDSSxVQUFoQyxDQUEyQ0MsSUFBM0MsQ0FBZ0RDLEtBQWhELENBQXNELEVBQUVDLFVBQVUsQ0FBQyxHQUFELENBQVosRUFBdEQsQ0FBUDtBQUNELEtBWk0sQ0FBUDtBQWFELEdBZkQ7QUFnQkQsQ0EzQkQiLCJmaWxlIjoidGVzdC9jaGlsZHJlbi5zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWVudiBub2RlLCBtb2NoYSovXG4vKiBlc2xpbnQgbm8tc2hhZG93OiAwICovXG5cbmltcG9ydCB7IFRlc3RUeXBlLCBQbHVtcCwgTWVtb3J5U3RvcmUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4uL2Jhc2UnO1xuXG5pbXBvcnQgY2hhaSBmcm9tICdjaGFpJztcbmltcG9ydCBIYXBpIGZyb20gJ2hhcGknO1xuaW1wb3J0IGNoYWlBc1Byb21pc2VkIGZyb20gJ2NoYWktYXMtcHJvbWlzZWQnO1xuXG5jaGFpLnVzZShjaGFpQXNQcm9taXNlZCk7XG5jb25zdCBleHBlY3QgPSBjaGFpLmV4cGVjdDtcbmRlc2NyaWJlKCdIYXNNYW55IFBsdW1wIFJvdXRlcycsICgpID0+IHtcbiAgY29uc3QgbXMgPSBuZXcgTWVtb3J5U3RvcmUoeyB0ZXJtaW5hbDogdHJ1ZSB9KTtcbiAgY29uc3QgcGx1bXAgPSBuZXcgUGx1bXAoeyB0eXBlczogW1Rlc3RUeXBlXSwgc3RvcmFnZTogW21zXSB9KTtcbiAgY29uc3QgYmFzZVBsdWdpbiA9IG5ldyBCYXNlQ29udHJvbGxlcihwbHVtcCwgVGVzdFR5cGUpO1xuICBjb25zdCBoYXBpID0gbmV3IEhhcGkuU2VydmVyKCk7XG4gIGhhcGkuY29ubmVjdGlvbih7IHBvcnQ6IDgwIH0pO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgcmV0dXJuIGhhcGkucmVnaXN0ZXIoYmFzZVBsdWdpbi5wbHVnaW4sIHsgcm91dGVzOiB7IHByZWZpeDogJy9hcGknIH0gfSk7XG4gIH0pO1xuXG4gIGl0KCdDJywgKCkgPT4ge1xuICAgIGNvbnN0IG9uZSA9IG5ldyBUZXN0VHlwZSh7IG5hbWU6ICdwb3RhdG8nIH0sIHBsdW1wKTtcbiAgICByZXR1cm4gb25lLiRzYXZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gaGFwaS5pbmplY3Qoe1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICB1cmw6IGAvYXBpLyR7b25lLiRpZH0vY2hpbGRyZW5gLFxuICAgICAgICBwYXlsb2FkOiBKU09OLnN0cmluZ2lmeSh7IGNoaWxkX2lkOiAxMDAgfSksXG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucGF5bG9hZCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvLmhhdmUucHJvcGVydHkoJ3N0YXR1c0NvZGUnLCAyMDApO1xuICAgICAgcmV0dXJuIGV4cGVjdChvbmUuJGdldCgnY2hpbGRyZW4nKSkudG8uZXZlbnR1YWxseS5kZWVwLmVxdWFsKHsgY2hpbGRyZW46IFsxMDBdIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
