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
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.deep.equal({ children: [{ id: 100 }] });
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('children', 100))
    .then(() => {
      return hapi.inject({
        method: 'GET',
        url: `/api/${one.$id}/children`,
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.deep.equal({ children: [{ id: 100 }] });
    });
  });

  it('U', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('valenceChildren', 100, { perm: 2 }))
    .then(() => {
      return expect(one.$get('valenceChildren')).to.eventually.deep.equal({ valenceChildren: [{ id: 100, perm: 2 }] });
    })
    .then(() => {
      return hapi.inject({
        method: 'PATCH',
        url: `/api/${one.$id}/valenceChildren/100`,
        payload: JSON.stringify({ perm: 3 }),
      });
    })
    .then(() => {
      return expect(plump.find('tests', one.$id).$get('valenceChildren'))
        .to.eventually.deep.equal({ valenceChildren: [{ id: 100, perm: 3 }] });
    });
  });

  it('D', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('children', 100))
    .then(() => {
      return expect(one.$get('children')).to.eventually.deep.equal({ children: [{ id: 100 }] });
    })
    .then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.$id}/children/100`,
      });
    })
    .then(() => {
      return expect(plump.find('tests', one.$id).$get('children')).to.eventually.deep.equal({ children: [] });
    });
  });
});
