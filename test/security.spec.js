/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { TestType } from 'plump/test/testType';
import { BaseController } from '../src/base';

import chai from 'chai';
import Hapi from 'hapi';
import Boom from 'boom';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const expect = chai.expect;
describe('Base Plump Routes', () => {
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
