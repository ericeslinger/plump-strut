import { Plump, MemoryStore } from 'plump';
import { BaseController } from '../src/index';
import { TestType } from './testType';
import { StrutServer } from '../src/index';

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
describe('Base Plump Routes', () => {
  const context = {
    ms: new MemoryStore({ terminal: true }),
    plump: new Plump(),
    strut: null,
  };

  before(() => {
    return context.plump.setTerminal(context.ms)
    .then(() => context.plump.addType(TestType))
    .then(() => {
      context.strut = new StrutServer(context.plump, null, {
        apiPort: 4000,
        apiProtocol: 'http',
        apiRoot: '/api',
        authTypes: [],
      });
      return context.strut.initialize();
    });
  });

  it('C', () => {
    return context.strut.hapi.inject({
      method: 'POST',
      url: `/api/${TestType.type}`,
      payload: JSON.stringify({ attributes: { name: 'potato' } }),
    })
    .then((response) => {
      return expect(JSON.parse(response.payload)).to.have.nested.property('attributes.name', 'potato');
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato', otherName: '', extended: {} }, context.plump);
    return one.save()
    .then(() => context.strut.hapi.inject(`/api/${TestType.type}/${one.id}`))
    .then((response) => {
      return one.get()
      .then((v) => {
        const resp = JSON.parse(response.payload);
        expect(resp.attributes.name).to.equal('potato');
        return expect(resp.id).to.equal(v.id);
      });
    });
  });

  it('U', () => {
    const one = new TestType({ name: 'potato' }, context.plump);
    return one.save()
    .then(() => {
      return context.strut.hapi.inject({
        method: 'PATCH',
        url: `/api/${TestType.type}/${one.id}`,
        payload: JSON.stringify({ attributes: { name: 'grotato' } }),
      });
    })
    .then(() => one.get())
    .then((v) => expect(v).to.have.nested.property('attributes.name', 'grotato'));
  });

  it('D', () => {
    const one = new TestType({ name: 'potato', otherName: '', extended: {} }, context.plump);
    let id;
    return one.save()
    .then(() => context.strut.hapi.inject(`/api/${TestType.type}/${one.id}`))
    .then((response) => {
      id = one.id;
      return one.get()
      .then((v) => expect(v).to.deep.equal(JSON.parse(response.payload)));
    }).then(() => {
      return context.strut.hapi.inject({
        method: 'DELETE',
        url: `/api/${TestType.type}/${one.id}`,
      });
    }).then(() => context.strut.hapi.inject(`/api/${TestType.type}/${id}`))
    .then((v) => expect(v).to.have.property('statusCode', 404));
  });
});
