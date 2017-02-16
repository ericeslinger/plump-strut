/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { TestType, Plump, MemoryStore } from 'plump';
import { BaseController } from '../base';

import chai from 'chai';
import Hapi from 'hapi';
import Boom from 'boom';
import chaiAsPromised from 'chai-as-promised';

function allowScheme() {
  return {
    authenticate: (req, reply) => reply(true),
  };
}


chai.use(chaiAsPromised);
const expect = chai.expect;
describe('Base Plump Routes', () => {
  it('Allows the programmer to set authentication schemas', () => {
    const ms = new MemoryStore({ terminal: true });
    const plump = new Plump({ types: [TestType], storage: [ms] });
    const basePlugin = new BaseController(plump, TestType, { routes: { authFor: { schema: 'allow' } } });
    const hapi = new Hapi.Server();
    hapi.connection({ port: 80 });
    hapi.auth.scheme('allowScheme', allowScheme);
    hapi.auth.strategy('allow', 'allowScheme');
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } })
    .then(() => {
      return expect(hapi.inject('/api/schema')).to.eventually.have.property('statusCode', 200);
    });
  });

  it('Results in a 403 if the authorization result fails', () => {
    class FourOhThree extends BaseController {
      approveHandler() {
        return {
          method: (request, reply) => reply(Boom.forbidden()),
          assign: 'approve',
        };
      }
    }
    const ms = new MemoryStore({ terminal: true });
    const plump = new Plump({ types: [TestType], storage: [ms] });
    const basePlugin = new FourOhThree(plump, TestType);
    const hapi = new Hapi.Server();
    const one = new TestType({ name: 'potato' }, plump);
    hapi.connection({ port: 80 });
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } })
    .then(() => one.$save())
    .then(() => {
      return expect(hapi.inject(`/api/${one.$id}`)).to.eventually.have.property('statusCode', 403);
    });
  });
});
