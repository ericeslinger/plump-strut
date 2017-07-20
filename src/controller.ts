import * as Boom from 'boom';
import * as Joi from 'joi';
import * as mergeOptions from 'merge-options';
import * as Hapi from 'hapi';

import { Model, ModelData } from 'plump';
import { StrutServer } from './server';
import { Oracle } from './auth/oracle';

export interface BasicRouteData {
  action: 'create' | 'read' | 'update' | 'delete';
  kind: 'relationship' | 'attributes';
  target: string;
}

export interface AttributesRouteData extends BasicRouteData {
  kind: 'attributes';
}

export interface RelationshipRouteData extends BasicRouteData {
  kind: 'relationship';
  relationship: string;
  childType: string;
}

export type RouteData = AttributesRouteData | RelationshipRouteData;

export interface StrutRequest extends Hapi.Request {
  pre: {
    routeData: RouteData;
  };
}

export interface StrutHandler<T> {
  (request: StrutRequest): Promise<T>;
}

export interface RouteOptions {
  cors?: Hapi.CorsConfigurationObject;
}

export interface MyAdditionalConfig
  extends Hapi.RouteAdditionalConfigurationOptions {
  pre?: Hapi.RoutePrerequisiteObjects[];
}

export interface MyRouteConfig extends Hapi.RouteConfiguration {
  config: MyAdditionalConfig;
}

export class Controller<M extends typeof Model> {
  public oracle: Oracle;
  constructor(
    public strut: StrutServer,
    public model: M,
    public options: RouteOptions
  ) {
    if (strut.services.oracle) {
      this.oracle = strut.services.oracle;
    }
  }

  addAuthorization(rd: RouteData, rc: MyRouteConfig) {
    if (this.oracle) {
      if (rc.config.pre === undefined) {
        rc.config.pre = [];
      }
      rc.config.pre.push({
        method: (req, reply) => reply(true),
        assign: 'authorize',
      });
    }
  }

  generateRoute(
    kind: 'attributes' | 'relationship' | 'query',
    action: 'create' | 'read' | 'update' | 'delete'
  ): Hapi.RouteConfiguration {
    if (kind === 'attributes') {
      if (action === 'read') {
        return {
          method: 'GET',
          path: '/{itemId}',
          handler: (request: StrutRequest, reply) =>
            this.attributesRead(request).then(v => reply(v)),
          config: {
            cors: this.options.cors ? this.options.cors : false,
            validate: {
              params: {
                itemId: Joi.number().integer(),
              },
            },
          },
        };
      }
    }
  }

  prePack(r: RouteData) {
    return {
      assign: 'routeData',
      method: (req: Hapi.Request, reply: Hapi.Base_Reply) => {
        reply(r);
      },
    };
  }

  authorize() {
    return {
      assign: 'authorize',
      method: (req: StrutRequest, reply: Hapi.Base_Reply) => {
        if (this.strut.services.oracle) {
          const oracle: Oracle = this.strut.services.oracle;
          oracle
            .package(req, req.pre.routeData)
            .then(ar => oracle.dispatch(ar))
            .then(v => {
              if (v.result === true) {
                reply(true);
              } else {
                reply(Boom.unauthorized());
              }
            });
        } else {
          return reply(true);
        }
      },
    };
  }

  attributesCreate(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  attributesRead(request: StrutRequest): Promise<ModelData> {
    return Promise.resolve<ModelData>(null);
  }
  attributesUpdate(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  attributesDelete(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  relationshipCreate(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  relationshipRead(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  relationshipUpdate(): StrutHandler<void> {
    return () => Promise.resolve();
  }
  relationshipDelete(): StrutHandler<void> {
    return () => Promise.resolve();
  }
}
