/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { BaseController } from '../src/base';
import { TestType } from 'plump/test/testType';

import Bluebird from 'bluebird';
Bluebird.config({
  longStackTraces: true,
});

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
        payload: JSON.stringify({ id: 100 }),
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.have.property('relationships')
      .that.deep.equals({ children: [{ id: 100 }] });
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('children', 100).$save())
    .then(() => {
      return hapi.inject({
        method: 'GET',
        url: `/api/${one.$id}/children`,
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return expect(one.$get('children')).to.eventually.have.property('relationships')
        .that.deep.equals({ children: [{ id: 100 }] });
    });
  });

  it('U', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('valenceChildren', 100, { perm: 2 }).$save())
    .then(() => {
      return expect(one.$get('valenceChildren')).to.eventually.have.property('relationships')
      .that.deep.equals({ valenceChildren: [{ id: 100, meta: { perm: 2 } }] });
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
        .to.eventually.have.property('relationships')
        .that.deep.equals({ valenceChildren: [{ id: 100, meta: { perm: 3 } }] });
    });
  });

  it('D', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.$save()
    .then(() => one.$add('children', 100).$save())
    .then(() => {
      return expect(one.$get('children')).to.eventually.have.property('relationships')
      .that.deep.equals({ children: [{ id: 100 }] });
    })
    .then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.$id}/children/100`,
      });
    })
    .then(() => {
      return expect(plump.find('tests', one.$id).$get('children')).to.eventually.have.property('relationships')
      .that.deep.equals({ children: [] });
    });
  });
});
