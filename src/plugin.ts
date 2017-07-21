import { Model } from 'plump';
import * as Hapi from 'hapi';
import {
  Transformer,
  StrutRouteConfiguration,
  RouteGenerator,
  BasicRouteOptions,
  RouteOptions,
} from './dataTypes';

function compose(...funs: Transformer[]) {
  return (initial: Partial<StrutRouteConfiguration> = {}) =>
    funs.reduce((acc, v) => v(acc), initial);
}

export function plugin(gen: RouteGenerator, routeOptions: BasicRouteOptions) {
  function p(server: Hapi.Server, _, next) {
    const routes = [];
    ['create', 'read', 'update', 'delete', 'query'].forEach(action => {
      const o = Object.assign(routeOptions, {
        kind: 'attributes',
        action: action,
      }) as RouteOptions;
      routes.push(
        compose(
          gen.base(o),
          gen.joi(o),
          gen.authorize(o),
          gen.handle(o),
          gen.package(o)
        )()
      );
    });
    Object.keys(
      routeOptions.model.schema.relationships
    ).forEach(relationship => {
      ['create', 'read', 'update', 'delete', 'query'].forEach(action => {
        const o = Object.assign(routeOptions, {
          kind: 'relationship',
          action: action,
          relationship: relationship,
        }) as RouteOptions;
        routes.push(
          compose(
            gen.base(o),
            gen.joi(o),
            gen.authorize(o),
            gen.handle(o),
            gen.package(o)
          )()
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
    }
  );
}
