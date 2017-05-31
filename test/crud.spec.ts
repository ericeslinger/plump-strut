import { Plump, MemoryStore } from 'plump';
import { BaseController } from '../src/base';
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
          prefix: string; vhost?: string | string[]
        };
      }): Promise<any>;
  }
}



const expect = chai.expect;
describe('Base Plump Routes', () => {
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
    return hapi.inject({
      method: 'POST',
      url: '/api',
      payload: JSON.stringify({ attributes: { name: 'potato' } }),
    })
    .then((response) => {
      return expect(JSON.parse(response.payload)).to.have.deep.property('attributes.name', 'potato');
    });
  });

  it('R', () => {
    const one = new TestType({ name: 'potato', otherName: '', extended: {} }, plump);
    return one.save()
    .then(() => hapi.inject(`/api/${one.id}`))
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
    const one = new TestType({ name: 'potato' }, plump);
    return one.save()
    .then(() => {
      return hapi.inject({
        method: 'PATCH',
        url: `/api/${one.id}`,
        payload: JSON.stringify({ attributes: { name: 'grotato' } }),
      });
    })
    .then(() => one.get())
    .then((v) => expect(one).to.have.nested.property('attributes.name', 'grotato'));
  });

  it('D', () => {
    const one = new TestType({ name: 'potato', otherName: '', extended: {} }, plump);
    let id;
    return one.save()
    .then(() => hapi.inject(`/api/${one.id}`))
    .then((response) => {
      id = one.id;
      return one.get()
      .then((v) => expect(v).to.deep.equal(JSON.parse(response.payload)));
    }).then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.id}`,
      });
    }).then(() => hapi.inject(`/api/${id}`))
    .then((v) => expect(v).to.have.property('statusCode', 404));
  });
});
