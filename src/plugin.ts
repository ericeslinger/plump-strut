import { Model, ModelData, ModelReference } from 'plump';
import * as Hapi from 'hapi';
import {
  Transformer,
  RouteGenerator,
  SegmentGenerator,
  BasicRouteOptions,
  StrutRouteConfiguration,
  RouteOptions,
  StrutServices,
} from './dataTypes';

function compose(
  o: RouteOptions,
  services: StrutServices,
  funs: SegmentGenerator[]
) {
  return (initial: Partial<StrutRouteConfiguration> = {}) =>
    funs
      .map(f => f(o, services))
      .reduce((acc, v) => v(acc), initial) as StrutRouteConfiguration;
}

export function plugin(
  gen: SegmentGenerator[],
  routeOptions: BasicRouteOptions,
  services: StrutServices
) {
  function p(server: Hapi.Server, _, next) {
    const routes: Hapi.RouteConfiguration[] = [];
    ['create', 'read', 'update', 'delete', 'query'].forEach(action => {
      const o = Object.assign({}, routeOptions, {
        kind: 'attributes',
        action: action,
      }) as RouteOptions;
      routes.push(compose(o, services, gen)());
    });
    Object.keys(
      routeOptions.model.schema.relationships
    ).forEach(relationship => {
      ['create', 'read', 'update', 'delete'].forEach(action => {
        const o = Object.assign({}, routeOptions, {
          kind: 'relationship',
          action: action,
          relationship: relationship,
        }) as RouteOptions;
        routes.push(compose(o, services, gen)());
      });
    });
    server.route(routes.filter(v => !!v));
    next();
  }
  p['attributes'] = Object.assign(
    {},
    {
      version: '1.0.0',
      name: routeOptions.model.type,
    }
  );
  return p;
}
