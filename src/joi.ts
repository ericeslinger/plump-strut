import {
  SegmentGenerator,
  Transformer,
  RouteOptions,
  StrutServices,
} from './dataTypes';
import { Model, Plump } from 'plump';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';
import * as Joi from 'joi';

function attributeValidator(m: typeof Model) {
  const retVal: any = {
    type: Joi.string(),
    id: Joi[m.schema.attributes[m.schema.idAttribute].type](),
    attributes: {},
    relationships: {},
  };

  Object.keys(m.schema.attributes).forEach(attr => {
    retVal.attributes[attr] = Joi[m.schema.attributes[attr].type]();
  });

  return retVal;
}

function relationshipValidate(m: typeof Model, relationship: string, p: Plump) {
  const c: typeof Model =
    p.types[
      m.schema.relationships[relationship].type.sides[relationship].otherType
    ];
  const dataSchema = {
    id: Joi[c.schema.attributes[c.schema.idAttribute].type](),
    type: Joi.string().optional(),
  };

  if (m.schema.relationships[relationship].type.extras) {
    const extras = m.schema.relationships[relationship].type.extras;

    Object.keys(extras).forEach(extra => {
      dataSchema['meta'] = dataSchema['meta'] || {};
      dataSchema['meta'][extra] = Joi[extras[extra].type]();
    });
  }
  return dataSchema;
}

function childIdType(m: typeof Model, relationship: string, p: Plump) {
  const c: typeof Model =
    p.types[
      m.schema.relationships[relationship].type.sides[relationship].otherType
    ];
  return c.schema.attributes[c.schema.idAttribute].type;
}

export const joi: SegmentGenerator = (
  options: RouteOptions,
  services: StrutServices,
) => {
  const idType =
    options.model.schema.attributes[options.model.schema.idAttribute].type;
  return (i: Partial<Hapi.RouteConfiguration>) => {
    function joiBlock(): Partial<Hapi.RouteConfiguration> {
      if (options.kind === 'attributes') {
        switch (options.action) {
          case 'create':
            return {
              config: {
                validate: {
                  payload: attributeValidator(options.model),
                },
              },
            };
          case 'read':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                  },
                },
              },
            };
          case 'update':
            return {
              config: {
                validate: {
                  payload: attributeValidator(options.model),
                  params: {
                    itemId: Joi[idType](),
                  },
                },
              },
            };
          case 'delete':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                  },
                },
              },
            };
          case 'query':
            return {};
        }
      } else if (options.kind === 'relationship') {
        switch (options.action) {
          case 'create':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                  },
                  payload: relationshipValidate(
                    options.model,
                    options.relationship,
                    services.plump,
                  ),
                },
              },
            };
          case 'read':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                  },
                },
              },
            };
          case 'update':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                    childId: Joi[
                      childIdType(
                        options.model,
                        options.relationship,
                        services.plump,
                      )
                    ](),
                  },
                  payload: relationshipValidate(
                    options.model,
                    options.relationship,
                    services.plump,
                  ),
                },
              },
            };
          case 'delete':
            return {
              config: {
                validate: {
                  params: {
                    itemId: Joi[idType](),
                    childId: Joi[
                      childIdType(
                        options.model,
                        options.relationship,
                        services.plump,
                      )
                    ](),
                  },
                },
              },
            };
        }
      }
    }
    return mergeOptions({}, i, joiBlock());
  };
};
