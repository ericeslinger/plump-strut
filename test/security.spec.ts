/* eslint-env node, mocha*/
/* eslint no-shadow: 0 */

import { Plump, MemoryStore } from 'plump';
import { TestType } from './testType';
import { BaseController } from '../src/base';

import * as chai from 'chai';
import * as Hapi from 'hapi';
import * as Boom from 'boom';
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
  it('Results in a 403 if the authorization result fails', () => {
    class FourOhThree extends BaseController {
      approveHandler() {
        return {
          method: (request, reply) => reply(Boom.forbidden()),
          assign: 'approve',
        };
      }
    }
    const ms = new MemoryStore({ terminal: true });
    const plump = new Plump();
    const basePlugin = new FourOhThree(plump, TestType);
    const hapi = new Hapi.Server();
    const one = new TestType({ name: 'potato' }, plump);
    hapi.connection({ port: 80 });
    return plump.setTerminal(ms)
    .then(() => plump.addType(TestType))
    .then(() => hapi.register(basePlugin.plugin, { routes: { prefix: '/api' } }))
    .then(() => one.save())
    .then(() => hapi.inject(`/api/${one.id}`))
    .then((v) => expect(v).to.have.property('statusCode', 403));
  });
});
