/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { BaseController, StrutServer } from '../src/index';
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
          prefix: string;
          vhost?: string | string[];
        };
      },
    ): Promise<any>;
  }
}

const expect = chai.expect;
describe('HasMany Plump Routes', () => {
  const context = {
    ms: new MemoryStore({ terminal: true }),
    plump: new Plump(),
    strut: null,
  };

  before(() => {
    return context.plump
      .setTerminal(context.ms)
      .then(() => context.plump.addType(TestType))
      .then(() => {
        context.strut = new StrutServer(context.plump, {
          apiPort: 4000,
          apiProtocol: 'http',
          apiRoot: '/api',
          authTypes: [],
        });
        return context.strut.initialize();
      });
  });

  it('C', () => {
    const one = new TestType({ name: 'potato' }, context.plump);
    return one
      .save()
      .then(() => {
        return context.strut.hapi.inject({
          method: 'PUT',
          url: `/api/${TestType.type}/${one.id}/children`,
          payload: JSON.stringify({ id: 100 }),
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return one
          .get('relationships.children')
          .then(v =>
            expect(v.relationships.children).to.deep.equal([
              { type: TestType.type, id: 100 },
            ]),
          );
      });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato' }, context.plump);
    return one
      .save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get('relationships.children'))
      .then(v =>
        expect(v.relationships.children).to.deep.equal([
          { type: TestType.type, id: 100 },
        ]),
      )
      .then(() => {
        return context.strut.hapi.inject({
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
    const one = new TestType({ name: 'potato' }, context.plump);
    return one
      .save()
      .then(() =>
        one.add('valenceChildren', { id: 100, meta: { perm: 2 } }).save(),
      )
      .then(() => one.get('relationships.valenceChildren'))
      .then(v => {
        expect(v.relationships.valenceChildren).to.deep.equal([
          { type: TestType.type, id: 100, meta: { perm: 2 } },
        ]);
      })
      .then(() => {
        return context.strut.hapi.inject({
          method: 'PATCH',
          url: `/api/${TestType.type}/${one.id}/valenceChildren/100`,
          payload: JSON.stringify({ meta: { perm: 3 } }),
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return context.plump
          .find({ type: 'tests', id: one.id })
          .get('relationships.valenceChildren');
      })
      .then(v =>
        expect(v.relationships.valenceChildren).to.deep.equal([
          { type: TestType.type, id: 100, meta: { perm: 3 } },
        ]),
      );
  });

  it('D', () => {
    const one = new TestType({ name: 'potato' }, context.plump);
    return one
      .save()
      .then(() => one.add('children', { id: 100 }).save())
      .then(() => one.get('relationships.children'))
      .then(v =>
        expect(v.relationships.children).to.deep.equal([
          { type: TestType.type, id: 100 },
        ]),
      )
      .then(() => {
        return context.strut.hapi.inject({
          method: 'DELETE',
          url: `/api/${TestType.type}/${one.id}/children/100`,
        });
      })
      .then(response => {
        expect(response).to.have.property('statusCode', 200);
        return context.plump
          .find({ type: 'tests', id: one.id })
          .get('relationships.children');
      })
      .then(v => expect(v.relationships.children).to.deep.equal([]));
  });
});
