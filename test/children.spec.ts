/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { BaseController } from '../src/base';
import { TestType } from './testType';

import * as chai from 'chai';
import * as Hapi from 'hapi';

import 'mocha';

declare global {
  namespace Chai {
    interface Assertion {
      nested: Assertion;
    }
  }
}


declare module 'hapi' {
  interface Server {
    register(
      plugins: any | any[],
      options: {
        select?: string | string[];
        routes: {
          prefix: string; vhost?: string | string[]
        };
      }): Promise<any>;
  }
}


const expect = chai.expect;
describe('HasMany Plump Routes', () => {
  const ms = new MemoryStore({ terminal: true });
  const plump = new Plump();
  const basePlugin = new BaseController(plump, TestType);
  const hapi = new Hapi.Server();
  hapi.connection({ port: 80 });

  before(() => {
    return plump.setTerminal(ms)
    .then(() => plump.addType(TestType))
    .then(() => hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } }));
  });

  it('C', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.save()
    .then(() => {
      return hapi.inject({
        method: 'PUT',
        url: `/api/${one.id}/children`,
        payload: JSON.stringify({ id: 100 }),
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return one.get('relationships.children')
      .then((v) => expect(v.relationships.children).to.deep.equal([{ type: TestType.type,  id: 100 }]));
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.save()
    .then(() => one.add('children', { id: 100 }).save())
    .then(() => one.get('relationships.children'))
    .then((v) => expect(v.relationships.children).to.deep.equal([{ type: TestType.type, id: 100 }]))
    .then(() => {
      return hapi.inject({
        method: 'GET',
        url: `/api/${one.id}/children`,
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      expect(JSON.parse(response.payload).relationships.children).to.deep.equal([{ type: TestType.type, id: 100 }]);
    });
  });

  it('U', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.save()
    .then(() => one.add('valenceChildren', { id: 100, meta: { perm: 2 } }).save())
    .then(() => one.get('relationships.valenceChildren'))
    .then((v) => {
      expect(v.relationships.valenceChildren).to.deep.equal([{ type: TestType.type, id: 100, meta: { perm: 2 } }]);
    })
    .then(() => {
      return hapi.inject({
        method: 'PATCH',
        url: `/api/${one.id}/valenceChildren/100`,
        payload: JSON.stringify({ meta: { perm: 3 } }),
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return plump.find({ type: 'tests', id: one.id }).get('relationships.valenceChildren');
    })
    .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ type: TestType.type, id: 100, meta: { perm: 3 } }]));
  });

  it('D', () => {
    const one = new TestType({ name: 'potato' }, plump);
    return one.save()
    .then(() => one.add('children', { id: 100 }).save())
    .then(() => one.get('relationships.children'))
    .then((v) => expect(v.relationships.children).to.deep.equal([{ type: TestType.type, id: 100 }]))
    .then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.id}/children/100`,
      });
    })
    .then((response) => {
      expect(response).to.have.property('statusCode', 200);
      return plump.find({ type: 'tests', id: one.id }).get('relationships.children');
    })
    .then((v) => expect(v.relationships.children).to.deep.equal([]));
  });
});
