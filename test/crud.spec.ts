import { Plump, MemoryStore } from 'plump';
import { TestType } from './testType';
import { Strut } from '../dist/index';

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
describe('Base Plump Routes', () => {
  const memStore = new MemoryStore({ terminal: true });
  const context: {
    ms: MemoryStore;
    plump: Plump<MemoryStore>;
    strut: Strut;
  } = {
    ms: memStore,
    plump: new Plump(memStore),
    strut: null,
  };

  before(() => {
    return context.plump.addType(TestType).then(() => {
      context.strut = new Strut(context.plump, {
        apiPort: 4000,
        apiProtocol: 'http',
        apiRoot: '/api',
        authTypes: [],
      });
      return context.strut.initialize();
    });
  });

  it('C', () => {
    return context.strut.services.hapi
      .inject({
        method: 'POST',
        url: `/api/${TestType.type}`,
        payload: JSON.stringify({ attributes: { name: 'potato' } }),
      })
      .then(response => {
        return expect(JSON.parse(response.payload)).to.have.nested.property(
          'attributes.name',
          'potato',
        );
      });
  });

  it('R', () => {
    const one = new TestType(
      { attributes: { name: 'potato', otherName: '', extended: {} } },
      context.plump,
    );
    return one
      .save()
      .then(() =>
        context.strut.services.hapi.inject(`/api/${TestType.type}/${one.id}`),
      )
      .then(response => {
        return one.get({ fields: ['attributes'] }).then(v => {
          const resp = JSON.parse(response.payload);
          expect(resp.attributes.name).to.equal('potato');
          return expect(resp.id).to.equal(v.id);
        });
      });
  });

  it('U', () => {
    const one = new TestType({ attributes: { name: 'potato' } }, context.plump);
    return one
      .save()
      .then(() => {
        return context.strut.services.hapi.inject({
          method: 'PATCH',
          url: `/api/${TestType.type}/${one.id}`,
          payload: JSON.stringify({ attributes: { name: 'grotato' } }),
        });
      })
      .then(() => one.get({ fields: ['attributes'] }))
      .then(v =>
        expect(v).to.have.nested.property('attributes.name', 'grotato'),
      );
  });

  it('D', () => {
    const one = new TestType(
      { attributes: { name: 'potato', otherName: '', extended: {} } },
      context.plump,
    );
    let id;
    return one
      .save()
      .then(() =>
        context.strut.services.hapi.inject(`/api/${TestType.type}/${one.id}`),
      )
      .then(response => {
        id = one.id;
        return one
          .get({ fields: ['attributes'] })
          .then(v => expect(v).to.deep.equal(JSON.parse(response.payload)));
      })
      .then(() => {
        return context.strut.services.hapi.inject({
          method: 'DELETE',
          url: `/api/${TestType.type}/${one.id}`,
        });
      })
      .then(() =>
        context.strut.services.hapi.inject(`/api/${TestType.type}/${id}`),
      )
      .then(v => expect(v).to.have.property('statusCode', 404));
  });
});
