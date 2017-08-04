import * as chai from 'chai';

import {
  AuthorizerDefinition,
  RelationshipAuthorizeRequest,
  AttributesUpdateAuthorizeRequest,
  AuthorizeRequest,
  AttributesAuthorizeRequest,
  DelegateAuthorizeResponse,
  SimpleAuthorizeRequest,
  AuthorizeResponse,
} from '../src/dataTypes';

import { TestType } from './testType';
import { Oracle } from '../src/oracle';
import { ModelData } from 'plump';

const expect = chai.expect;

const good: AuthorizeResponse = {
  kind: 'final',
  result: true,
};

const bad: AuthorizeResponse = {
  kind: 'final',
  result: false,
};

const authTest: AuthorizerDefinition = {
  authorize: (request: SimpleAuthorizeRequest) => {
    if (request.actor.id === 1) {
      return Promise.resolve(good);
    } else if (request.actor.id === 2) {
      return Promise.resolve(bad);
    } else if (request.actor.id === 3) {
      if (request.action === 'read') {
        return Promise.resolve(good);
      } else if (
        request.kind === 'attributes' &&
        request.action === 'update' &&
        request.target.id === 3
      ) {
        return Promise.resolve(good);
      } else {
        return Promise.resolve(bad);
      }
    } else {
      return Promise.resolve(bad);
    }
  },
};

describe('Authorization Oracle', () => {
  describe('Filters', () => {
    it('filters out unwanted things', () => {
      const oracle = new Oracle(null);
      const testItem: ModelData = {
        id: 1,
        type: TestType.type,
        attributes: {
          id: 1,
          name: 'foo',
          otherName: 'bar',
          extended: {},
        },
      };
      oracle.addFilter(
        {
          type: 'black',
          attributes: ['otherName'],
        },
        TestType.type,
      );
      expect(oracle.filter(testItem).attributes).to.have.property(
        'name',
        'foo',
      );
      expect(oracle.filter(testItem).attributes).to.not.have.property(
        'otherName',
      );
    });
    it('filters in wanted things', () => {
      const oracle = new Oracle(null);
      const testItem: ModelData = {
        id: 1,
        type: TestType.type,
        attributes: {
          id: 1,
          name: 'foo',
          otherName: 'bar',
          extended: {},
        },
      };
      oracle.addFilter(
        {
          type: 'white',
          attributes: ['otherName'],
        },
        TestType.type,
      );
      expect(oracle.filter(testItem).attributes).to.have.property(
        'otherName',
        'bar',
      );
      expect(oracle.filter(testItem).attributes).to.not.have.property('name');
    });
  });
  describe('Basic tests', () => {
    it('does basic passing attributes tests', () => {
      const oracle = new Oracle(null);
      oracle.addAuthorizer(authTest, TestType.type);
      const person = { id: 1, type: 'profiles' };

      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests' },
          data: { type: 'tests', attributes: {} },
        }),
        oracle.authorize({
          action: 'read',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
        }),
        oracle.authorize({
          action: 'update',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
          data: { type: 'tests', id: 1, attributes: {} },
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
        }),
      ]).then(vals => expect(vals.every(v => v)).to.equal(true));
    });

    it('does basic failing attributes tests', () => {
      const oracle = new Oracle(null);
      oracle.addAuthorizer(authTest, TestType.type);
      const person = { id: 2, type: 'profiles' };

      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests' },
          data: { type: 'tests', attributes: {} },
        }),
        oracle.authorize({
          action: 'read',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
        }),
        oracle.authorize({
          action: 'update',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
          data: { type: 'tests', id: 1, attributes: {} },
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'attributes',
          actor: person,
          target: { type: 'tests', id: 1 },
        }),
      ]).then(vals => expect(vals.every(v => v === false)).to.equal(true));
    });

    it('does basic passing relationships tests', () => {
      const oracle = new Oracle(null);
      oracle.addAuthorizer(authTest, TestType.type);
      const person = { id: 1, type: 'profiles' };
      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'read',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'update',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
      ]).then(vals => expect(vals.every(v => v)).to.equal(true));
    });

    it('does basic failing relationships tests', () => {
      const oracle = new Oracle(null);
      oracle.addAuthorizer(authTest, TestType.type);
      const person = { id: 2, type: 'profiles' };
      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'read',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'update',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
      ]).then(vals => expect(vals.every(v => v === false)).to.equal(true));
    });
  });

  describe('Delegated Tests', () => {
    it('handles delegated tests', () => {
      const oracle = new Oracle(null);
      function delegatedAuthorizerTest(
        request: RelationshipAuthorizeRequest,
      ): Promise<AuthorizeResponse> {
        if (request.action === 'update') {
          return authTest.authorize(request);
        } else {
          const rV: AttributesUpdateAuthorizeRequest = {
            kind: 'attributes',
            target: request.target,
            action: 'update',
            actor: request.actor,
            data: request.target,
          };
          return Promise.resolve<DelegateAuthorizeResponse>({
            kind: 'delegated',
            delegate: rV,
          });
        }
      }
      oracle.addAuthorizer(
        { authorize: delegatedAuthorizerTest },
        TestType.type,
      );

      const person = { id: 3, type: 'profiles' };
      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'read',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'update',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          meta: { perm: 1 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
      ])
        .catch(err => expect(err).to.be.null)
        .then(vals => {
          expect(vals).to.deep.equal([false, false, false, false]);
        });
    });

    it('handles compound tests', () => {
      const oracle = new Oracle(null);
      function compoundAuthorizerTest(
        request: RelationshipAuthorizeRequest,
      ): Promise<AuthorizeResponse> {
        if (request.kind === 'relationship') {
          if (request.action === 'create') {
            return Promise.resolve<DelegateAuthorizeResponse>({
              kind: 'delegated',
              delegate: {
                kind: 'compound',
                combinator: 'or',
                list: [
                  {
                    kind: 'compound',
                    combinator: 'and',
                    list: [
                      {
                        kind: 'attributes',
                        target: request.target,
                        action: 'update',
                        actor: request.actor,
                      },
                      {
                        kind: 'attributes',
                        target: request.child,
                        action: 'read',
                        actor: request.actor,
                      },
                    ],
                  },
                  {
                    kind: 'compound',
                    combinator: 'and',
                    list: [
                      {
                        kind: 'attributes',
                        target: request.child,
                        action: 'update',
                        actor: request.actor,
                      },
                      {
                        kind: 'attributes',
                        target: request.target,
                        action: 'read',
                        actor: request.actor,
                      },
                    ],
                  },
                ],
              },
            });
          } else if (request.action === 'read') {
            return Promise.resolve<DelegateAuthorizeResponse>({
              kind: 'delegated',
              delegate: {
                kind: 'attributes',
                target: request.target,
                action: 'read',
                actor: request.actor,
              },
            });
          } else if (request.action === 'update') {
            return Promise.resolve<DelegateAuthorizeResponse>({
              kind: 'delegated',
              delegate: {
                kind: 'attributes',
                target: request.target,
                action: 'update',
                actor: request.actor,
              },
            });
          } else if (request.action === 'delete') {
            return Promise.resolve<DelegateAuthorizeResponse>({
              kind: 'delegated',
              delegate: {
                kind: 'attributes',
                target: request.target,
                action: 'update',
                actor: request.actor,
              },
            });
          }
        } else {
          return authTest.authorize(request);
        }
      }
      oracle.addAuthorizer(
        { authorize: compoundAuthorizerTest },
        TestType.type,
      );

      const person = { id: 3, type: 'profiles' };
      return Promise.all([
        oracle.authorize({
          action: 'create',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 3 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'read',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'update',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          meta: { perm: 1 },
          relationship: 'children',
        }),
        oracle.authorize({
          action: 'delete',
          kind: 'relationship',
          actor: person,
          target: { type: 'tests', id: 1 },
          child: { type: 'tests', id: 2 },
          relationship: 'children',
        }),
      ]).then(vals => {
        expect(vals).to.deep.equal([true, true, false, false]);
      });
    });
  });
});
