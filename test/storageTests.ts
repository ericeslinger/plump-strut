/* eslint-env node */
/* eslint no-shadow: 0, max-len: 0 */

import { TestType } from './testType';
import { MemoryStore, Plump, TerminalStore, ModelData } from 'plump';
import * as mergeOptions from 'merge-options';
import * as chai from 'chai';


const expect = chai.expect;

const sampleObject = {
  type: 'tests',
  attributes: {
    name: 'potato',
    extended: {
      actual: 'rutabaga',
      otherValue: 42,
    },
  },
  relationships: {},
};

export function testSuite(context, storeOpts ) {
  const store = Object.assign(
    {},
    {
      before: () => Promise.resolve(),
      after: () => Promise.resolve(),
    },
    storeOpts
  );
  context.describe(store.name, () => {
    let actualStore: TerminalStore;
    context.before(() => {
      return (store.before || (() => Promise.resolve()))(actualStore)
      .then(() => {
        actualStore = new store.ctor(store.opts); // eslint-disable-line new-cap
        actualStore.addSchema(TestType);
      });
    });

    context.describe('core CRUD', () => {
      context.it('supports creating values with no id field, and retrieving values', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject: ModelData) => {
          return actualStore.read({ type: 'tests', id: createdObject.id }, ['attributes', 'relationships'])
          .then((v) => {
            return expect(v)
            .to.deep.equal(
              mergeOptions({}, sampleObject, {
                id: createdObject.id,
                relationships: {
                  parents: [],
                  children: [],
                  valenceParents: [],
                  valenceChildren: [],
                  queryParents: [],
                  queryChildren: [],
                },
                attributes: {
                  id: createdObject.id,
                  otherName: '',
                },
              })
            );
          });
        });
      });

      context.it('allows objects to be stored by id', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject: ModelData) => {
          const modObject = mergeOptions({}, createdObject, { attributes: { name: 'carrot' } });
          return actualStore.writeAttributes(modObject)
          .then((updatedObject: ModelData) => {
            return actualStore.read({ type: 'tests', id: updatedObject.id }, 'attributes')
            .then(v => {
              return expect(v).to.deep.equal(
                mergeOptions(
                  {},
                  modObject,
                  {
                    id: createdObject.id,
                    relationships: {},
                    attributes: {
                      id: createdObject.id,
                      otherName: '',
                  },
                })
              );
            });
          });
        });
      });

      context.it('allows for deletion of objects by id', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject: ModelData) => {
          return actualStore.read({ type: 'tests', id: createdObject.id })
          .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'))
          .then(() => actualStore.delete({ type: 'tests', id: createdObject.id }))
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }))
          .then(v => expect(v).to.be.null);
        });
      });
    });

    context.describe('relationships', () => {
      context.it('can fetch a base and hasmany in one read', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject: ModelData) => {
          return actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 200 })
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 201 }))
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 202 }))
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 203 }))
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, ['attributes', 'relationships.children']))
          .then((v) => {
            expect(v).to.have.nested.property('attributes.name', 'potato');
            expect(v.relationships.children).to.deep.equal([{ id: 200 }, { id: 201 }, { id: 202 }, { id: 203 }]);
          });
        });
      });

      context.it('can add to a hasMany relationship', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject) => {
          return actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 100 })
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 101 }))
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 102 }))
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 103 }))
          .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: 100 }, 'children', { id: createdObject.id }))
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, ['relationships.children']))
          .then((v) => {
            expect(v.relationships.children).to.deep.equal([
              { id: 100 },
              { id: 101 },
              { id: 102 },
              { id: 103 },
            ]);
            return actualStore.read({ type: 'tests', id: createdObject.id }, ['relationships.parents']);
          })
          .then((v) => expect(v.relationships.parents).to.deep.equal([{ id: 100 }]));
        });
      });

      context.it('can add to a hasMany relationship with extras', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject) => {
          return actualStore.writeRelationshipItem(
            { type: 'tests', id: createdObject.id },
            'valenceChildren',
            { id: 100, meta: { perm: 1 } }
          )
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, 'relationships.valenceChildren'))
          .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ id: 100, meta: { perm: 1 } }]));
        });
      });

      context.it('can modify valence on a hasMany relationship', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject) => {
          return actualStore.writeRelationshipItem(
            { type: 'tests', id: createdObject.id },
            'valenceChildren',
            { id: 100, meta: { perm: 1 } }
          )
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, 'relationships.valenceChildren'))
          .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ id: 100, meta: { perm: 1 } }]))
          .then(() =>
            actualStore.writeRelationshipItem(
              { type: 'tests', id: createdObject.id },
              'valenceChildren', { id: 100, meta: { perm: 2 } }
            )
          )
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, 'relationships.valenceChildren'))
          .then((v) => expect(v.relationships.valenceChildren).to.deep.equal([{ id: 100, meta: { perm: 2 } }]));
        });
      });

      context.it('can remove from a hasMany relationship', () => {
        return actualStore.writeAttributes(sampleObject)
        .then((createdObject) => {
          return actualStore.writeRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 100 })
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, 'relationships.children'))
          .then((v) => expect(v.relationships.children).to.deep.equal([{ id: 100 }]))
          .then(() => actualStore.deleteRelationshipItem({ type: 'tests', id: createdObject.id }, 'children', { id: 100 }))
          .then(() => actualStore.read({ type: 'tests', id: createdObject.id }, 'relationships.children'))
          .then((v) => expect(v.relationships.children).to.deep.equal([]));
        });
      });
    });

    context.describe('events', () => {
      context.it('should pass basic write-invalidation events to other datastores', () => {
        const memstore = new MemoryStore();
        const testPlump = new Plump();
        return testPlump.addCache(memstore)
        .then(() => testPlump.setTerminal(actualStore))
        .then(() => testPlump.addType(TestType))
        .then(() => actualStore.writeAttributes({ type: 'tests', attributes: { name: 'potato' } }))
        .then((createdObject) => {
          return actualStore.read({ type: 'tests', id: createdObject.id })
          .then(() => {
            return new Promise((resolve) => setTimeout(resolve, 100))
            .then(() => memstore.read({ type: 'tests', id: createdObject.id }))
            .then((v) => expect (v).to.have.nested.property('attributes.name', 'potato'))
            .then(() => {
              return actualStore.writeAttributes({
                type: 'tests',
                id: createdObject.id,
                attributes: {
                  name: 'grotato',
                },
              });
            })
            .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
            .then(() => memstore.read({ type: 'tests', id: createdObject.id }))
            .then((v) => expect(v).to.be.null);
          });
        })
        .then(() => {
          return testPlump.teardown();
        })
        .catch((err) => {
          testPlump.teardown();
          throw err;
        });
      });

      context.it('should pass basic cacheable-read events up the stack', () => {
        const testPlump = new Plump();
        let testItem;
        let memstore;
        return testPlump.addType(TestType)
        .then(() => actualStore.writeAttributes({ type: 'tests', attributes: { name: 'potato' } }))
        .then((createdObject) => {
          testItem = createdObject;
          return actualStore.read({ type: 'tests', id: testItem.id });
        })
        .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'))
        .then(() => {
          memstore = new MemoryStore();
          return Promise.all([
            testPlump.addCache(memstore),
            testPlump.setTerminal(actualStore),
          ]);
        })
        .then(() => memstore.read({ type: 'tests', id: testItem.id }))
        .then(v => expect(v).to.be.null)
        .then(() => actualStore.read({ type: 'tests', id: testItem.id }))
        .then(() => {
          // NOTE: this timeout is a hack, it is because
          // cacheable read events trigger multiple async things, but don't block
          // the promise from returning
          return new Promise((resolve) => setTimeout(resolve, 100));
        })
        .then(() => memstore.read({ type: 'tests', id: testItem.id }))
        .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'))
        .then(() => testPlump.teardown())
        .catch((err) => {
          testPlump.teardown();
          throw err;
        });
      });

      context.it('should pass write-invalidation events on hasMany relationships to other datastores', () => {
        let testItem;
        const memstore = new MemoryStore();
        const testPlump = new Plump();
        return testPlump.addType(TestType)
        .then(() => testPlump.addCache(memstore))
        .then(() => testPlump.setTerminal(actualStore))
        .then(() => actualStore.writeAttributes({ type: 'tests', attributes: { name: 'potato' } }))
        .then((createdObject) => {
          testItem = createdObject;
          return actualStore.read({ type: 'tests', id: testItem.id });
        })
        .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'))
        .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: testItem.id }, 'children', { id: 100 }))
        .then(() => memstore.read({ type: 'tests', id: testItem.id }))
        .then((v) => expect(v).to.not.have.nested.property('relationships.children'))
        .then(() => actualStore.read({ type: 'tests', id: testItem.id }, 'children'))
        .then(() => {
          // NOTE: this timeout is a hack, it is because
          // cacheable read events trigger multiple async things, but don't block
          // the promise from returning
          return new Promise((resolve) => setTimeout(resolve, 100));
        })
        .then(() => memstore.read({ type: 'tests', id: testItem.id }, 'children'))
        .then((v) => expect(v.relationships.children).to.deep.equal([{ id: 100 }]))
        .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: testItem.id }, 'children', { id: 101 }))
        .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
        .then(() => memstore.read({ type: 'tests', id: testItem.id }))
        .then((v) => expect(v).to.not.have.nested.property('relationships.children'))
        .then(() => testPlump.teardown())
        .catch((err) => {
          testPlump.teardown();
          throw err;
        });
      });

      context.it('should pass cacheable-read events on hasMany relationships to other datastores', () => {
        let testItem;
        let memstore;
        const testPlump = new Plump();
        return testPlump.addType(TestType)
        .then(() => actualStore.writeAttributes({ type: 'tests', attributes: { name: 'potato' } }))
        .then((createdObject) => {
          testItem = createdObject;
          return actualStore.read({ type: 'tests', id: testItem.id });
        })
        .then((v) => expect(v).to.have.nested.property('attributes.name', 'potato'))
        .then(() => actualStore.writeRelationshipItem({ type: 'tests', id: testItem.id }, 'children', { id: 100 }))
        .then(() => {
          memstore = new MemoryStore();
          return testPlump.setTerminal(actualStore)
          .then(() => testPlump.addCache(memstore))
          .then(() => memstore.read({ type: 'tests', id: testItem.id }))
          .then((v) => expect(v).to.be.null);
        }).then(() => {
          return actualStore.read({ type: 'tests', id: testItem.id }, 'children');
        }).then(() => new Promise((resolve) => setTimeout(resolve, 100)))
        .then(() => memstore.read({ type: 'tests', id: testItem.id }, 'children'))
        .then((v) => expect(v.relationships.children).to.deep.equal([{ id: 100 }]))
        .then(() => testPlump.teardown())
        .catch((err) => {
          testPlump.teardown();
          throw err;
        });
      });
    });

    context.after(() => {
      return (store.after || (() => { return; }))(actualStore);
    });
  });
}
