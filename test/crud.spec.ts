/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { BaseController } from '../src/base';
import { TestType } from './testType';

import * as chai from 'chai';
import * as Hapi from 'hapi';
import * as chaiAsPromised from 'chai-as-promised';

import 'mocha';

import { IPromise } from 'hapi';

declare module 'hapi' {
  interface Server {
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }, callback: (err: any) => void): void;
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }): IPromise<any>;
  }
}


chai.use(chaiAsPromised);
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
        expect(resp.data.attributes.name).to.equal('potato');
        return expect(resp.data.id).to.equal(v.id);
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
    .then(() => expect(one.get()).to.eventually.have.deep.property('attributes.name', 'grotato'));
  });

  it('D', () => {
    const one = new TestType({ name: 'potato', otherName: '', extended: {} }, plump);
    let id;
    return one.save()
    .then(() => hapi.inject(`/api/${one.id}`))
    .then((response) => {
      id = one.id;
      return expect(one.get()).to.eventually.deep.equal(JSON.parse(response.payload).data);
    }).then(() => {
      return hapi.inject({
        method: 'DELETE',
        url: `/api/${one.id}`,
      });
    }).then(() => {
      return expect(hapi.inject(`/api/${id}`)).to.eventually.have.property('statusCode', 404);
    });
  });
});
