/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { Strut } from '../src/index';
import { TestType } from './testType';

import * as chai from 'chai';
import * as Hapi from 'hapi';

import 'mocha';

declare module 'hapi' {
  interface Server {
    register(
      plugins: any | any[],
      options: {
        select?: string | string[];
        routes: {
          prefix: string;
          vhost?: string | string[];
        };
      },
    ): Promise<any>;
  }
}

const expect = chai.expect;
describe('HasMany Plump Routes', () => {
  const memStore = new MemoryStore({ terminal: true });
  const testContext: {
    ms: MemoryStore;
    plump: Plump<MemoryStore>;
    strut: Strut;
  } = {
    ms: memStore,
    plump: new Plump(memStore),
    strut: null,
  };

  before(() => {
    return testContext.plump.addType(TestType).then(() => {
      testContext.strut = new Strut(testContext.plump, {
        apiPort: 4000,
        apiProtocol: 'http',
        apiRoot: '/api',
        authTypes: [],
      });
      return testContext.strut.initialize();
    });
  });

  it('C', () => {
    const one = new TestType(
      { attributes: { name: 'potato' } },
      testContext.plump,
    );
    return one
      .save()
      .then(() => {
        return testContext.strut.services.hapi.inject({
          method: 'PUT',
          url: `/api/${TestType.type}/${one.id}/children`,
          payload: JSON.stringify({ id: 100 }),
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return one
          .get({ fields: ['relationships.children'] })
          .then(v =>
            expect(v.relationships.children).to.deep.equal([
              { type: TestType.type, id: 100 },
            ]),
          );
      });
  });

  it('R', () => {
    const one = new TestType(
      { attributes: { name: 'potato' } },
      testContext.plump,
    );
    return one
      .save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get({ fields: ['relationships.children'] }))
      .then(v =>
        expect(v.relationships.children).to.deep.equal([
          { type: TestType.type, id: 100 },
        ]),
      )
      .then(() => {
        return testContext.strut.services.hapi.inject({
          method: 'GET',
          url: `/api/${TestType.type}/${one.id}/children`,
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        expect(
          JSON.parse(response.payload).relationships.children,
        ).to.deep.equal([{ type: TestType.type, id: 100 }]);
      });
  });

  it('U', () => {
    const one = new TestType(
      { attributes: { name: 'potato' } },
      testContext.plump,
    );
    return one
      .save()
      .then(() =>
        one.add('valenceChildren', { id: 100, meta: { perm: 2 } }).save(),
      )
      .then(() => one.get({ fields: ['relationships.valenceChildren'] }))
      .then(v => {
        expect(v.relationships.valenceChildren).to.deep.equal([
          { type: TestType.type, id: 100, meta: { perm: 2 } },
        ]);
      })
      .then(() => {
        return testContext.strut.services.hapi.inject({
          method: 'PATCH',
          url: `/api/${TestType.type}/${one.id}/valenceChildren/100`,
          payload: JSON.stringify({ meta: { perm: 3 } }),
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return testContext.plump
          .find({ type: 'tests', id: one.id })
          .get({ fields: ['relationships.valenceChildren'] });
      })
      .then(v =>
        expect(v.relationships.valenceChildren).to.deep.equal([
          { type: TestType.type, id: 100, meta: { perm: 3 } },
        ]),
      );
  });

  it('D', () => {
    const one = new TestType(
      { attributes: { name: 'potato' } },
      testContext.plump,
    );
    return one
      .save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get({ fields: ['relationships.children'] }))
      .then(v =>
        expect(v.relationships.children).to.deep.equal([
          { type: TestType.type, id: 100 },
        ]),
      )
      .then(() => {
        return testContext.strut.services.hapi.inject({
          method: 'DELETE',
          url: `/api/${TestType.type}/${one.id}/children/100`,
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return testContext.plump
          .find({ type: 'tests', id: one.id })
          .get({ fields: ['relationships.children'] });
      })
      .then(v => expect(v.relationships.children).to.deep.equal([]));
  });
});
