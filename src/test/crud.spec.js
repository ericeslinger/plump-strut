/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { TestType, Plump, MemoryStore } from 'plump';
import { BaseController } from '../base';

import chai from 'chai';
import Hapi from 'hapi';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;
describe('Base Plump Routes', () => {
  const ms = new MemoryStore({ terminal: true });
  const plump = new Plump({ types: [TestType], storage: [ms] });
  const basePlugin = new BaseController(plump, TestType);
  const hapi = new Hapi.Server();
  hapi.connection({ port: 80 });

  before(() => {
    return hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } });
  });

  it('Exposes the object schema at /schema', () => {
    return hapi.inject('/api/schema')
    .then((response) => {
      return expect(JSON.parse(response.payload).schema).to.deep.equal(TestType.toJSON());
    });
  });

  it('C', () => {
    return hapi.inject({
      method: 'POST',
      url: '/api',
      payload: JSON.stringify({ name: 'potato' }),
    })
    .then((response) => {
      return expect(JSON.parse(response.payload)).to.have.property('name', 'potato');
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => hapi.inject(`/api/${one.$id}`))
    .then((response) => {
      return expect(one.$get()).to.eventually.deep.equal(JSON.parse(response.payload).tests[0]);
    });
  });

  it('U', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => {
      return hapi.inject({
        method: 'PATCH',
        url: `/api/${one.$id}`,
        payload: JSON.stringify({ name: 'grotato' }),
      });
    })
    .then(() => expect(one.$get()).to.eventually.have.property('name', 'grotato'));
  });

  it('D', () => {
    const one = new TestType({ name: 'potato' }, plump);
    let id;
    return one.$save()
    .then(() => hapi.inject(`/api/${one.$id}`))
    .then((response) => {
      id = one.$id;
      return expect(one.$get()).to.eventually.deep.equal(JSON.parse(response.payload).tests[0]);
    }).then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.$id}`,
      });
    }).then(() => {
      return expect(hapi.inject(`/api/${id}`)).to.eventually.have.property('statusCode', 404);
    });
  });
});
