/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { TestType, Plump, MemoryStore } from 'plump';
import { BaseController } from '../base';

import chai from 'chai';
import Hapi from 'hapi';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;
describe('HasMany Plump Routes', () => {
  const ms = new MemoryStore({ terminal: true });
  const plump = new Plump({ types: [TestType], storage: [ms] });
  const basePlugin = new BaseController(plump, TestType);
  const hapi = new Hapi.Server();
  hapi.connection({ port: 80 });

  before(() => {
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } });
  });

  it('C', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => {
      return hapi.inject({
        method: 'PUT',
        url: `/api/${one.$id}/children`,
        payload: JSON.stringify({ child_id: 100 }),
      });
    })
    .then((response) => {
      console.log(response.payload);
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.deep.equal({ children: [100] });
    });
  });
});
