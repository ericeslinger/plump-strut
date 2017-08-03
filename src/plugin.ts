import { Model, ModelData, ModelReference } from 'plump';
import * as Hapi from 'hapi';
import {
  Transformer,
  RouteGenerator,
  BasicRouteOptions,
  StrutRouteConfiguration,
  RouteOptions,
  StrutServices,
} from './dataTypes';

function compose(...funs: Transformer[]) {
  return (initial: Partial<StrutRouteConfiguration> = {}) =>
    funs.reduce((acc, v) => v(acc), initial) as StrutRouteConfiguration;
}

export function plugin(
  gen: RouteGenerator,
  routeOptions: BasicRouteOptions,
  services: StrutServices,
) {
  function p(server: Hapi.Server, _, next) {
    const routes: Hapi.RouteConfiguration[] = [];
    ['create', 'read', 'update', 'delete', 'query'].forEach(action => {
      const o = Object.assign({}, routeOptions, {
        kind: 'attributes',
        action: action,
      }) as RouteOptions;
      routes.push(
        compose(
          gen.base(o, services),
          gen.joi(o, services),
          gen.authorize(o, services),
          gen.handle(o, services),
        )(),
      );
    });
    Object.keys(
      routeOptions.model.schema.relationships,
    ).forEach(relationship => {
      ['create', 'read', 'update', 'delete'].forEach(action => {
        const o = Object.assign({}, routeOptions, {
          kind: 'relationship',
          action: action,
          relationship: relationship,
        }) as RouteOptions;
        routes.push(
          compose(
            gen.base(o, services),
            gen.joi(o, services),
            gen.authorize(o, services),
            gen.handle(o, services),
          )(),
        );
      });
    });
    server.route(routes);
    next();
  }
  p['attributes'] = Object.assign(
    {},
    {
      version: '1.0.0',
      name: routeOptions.model.type,
    },
  );
  return p;
}
