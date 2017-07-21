import { Generator, Transformer, RouteOptions } from './dataTypes';
import { ModelSchema } from 'plump';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';
import * as Joi from 'joi';

function attributeValidator(schema: ModelSchema) {
  const retVal: any = {
    type: Joi.string(),
    id: Joi[schema.attributes[schema.idAttribute].type](),
    attributes: {},
    relationships: {},
  };

  Object.keys(schema.attributes).forEach(attr => {
    retVal.attributes[attr] = Joi[schema.attributes[attr].type]();
  });

  return retVal;
}

function relationshipValidate(
  schema: ModelSchema,
  relationship: string,
  childSchema: ModelSchema
) {
  const dataSchema = {
    id: Joi[childSchema.attributes[childSchema.idAttribute].type](),
  };

  if (schema.relationships[relationship].type.extras) {
    const extras = schema.relationships[relationship].type.extras;

    Object.keys(extras).forEach(extra => {
      dataSchema['meta'] = dataSchema['meta'] || {};
      dataSchema['meta'][extra] = Joi[extras[extra].type]();
    });
  }
  return dataSchema;
}

export function joi(options: RouteOptions): Transformer {
  const idType = options.schema.attributes[options.schema.idAttribute].type;
  return (i: Partial<Hapi.RouteConfiguration>) => {
    function joiBlock(): Partial<Hapi.RouteConfiguration> {
      if (options.kind === 'attributes') {
        switch (options.action) {
          case 'create':
            return {
              config: {
                validate: {
                  payload: attributeValidator(options.schema),
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
                  payload: attributeValidator(options.schema),
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
                  payload: relationshipValidate(
                    options.schema,
                    options.relationship,
                    options.childSchema
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
                    childId: Joi[
                      options.childSchema.attributes[
                        options.childSchema.idAttribute
                      ].type
                    ](),
                  },
                  payload: relationshipValidate(
                    options.schema,
                    options.relationship,
                    options.childSchema
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
                  },
                },
              },
            };
        }
      }
    }
    return mergeOptions(i, joiBlock());
  };
}
