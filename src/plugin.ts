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
  RouteController,
} from './dataTypes';

function compose(
  o: RouteOptions,
  services: StrutServices,
  funs: SegmentGenerator[],
) {
  return (initial: Partial<StrutRouteConfiguration> = {}) =>
    funs
      .map(f => f(o, services))
      .reduce((acc, v) => v(acc) || acc, initial) as StrutRouteConfiguration;
}

export function plugin(
  ctrl: RouteController,
  // gen: SegmentGenerator[],
  routeOptions: BasicRouteOptions,
  services: StrutServices,
) {
  function p(server: Hapi.Server, _, next) {
    const routes: Hapi.RouteConfiguration[] = [];
    if (routeOptions.model) {
      ctrl.attributes.forEach(action => {
        const o = Object.assign({}, routeOptions, {
          kind: 'attributes',
          action: action,
        }) as RouteOptions;
        routes.push(compose(o, services, ctrl.generators)());
      });
      Object.keys(
        routeOptions.model.schema.relationships,
      ).forEach(relationship => {
        ctrl.relationships.forEach(action => {
          const o = Object.assign({}, routeOptions, {
            kind: 'relationship',
            action: action,
            relationship: relationship,
          }) as RouteOptions;
          routes.push(compose(o, services, ctrl.generators)());
        });
      });
    }
    ctrl.other.forEach(action => {
      const o = Object.assign({}, routeOptions, {
        kind: 'other',
        action: action,
      }) as RouteOptions;
      routes.push(compose(o, services, ctrl.generators)());
    });
    server.route(routes.filter(v => !!v));
    next();
  }
  p['attributes'] = Object.assign(
    {},
    {
      version: '1.0.0',
      name: routeOptions.routeName || routeOptions.model.type,
    },
  );
  return p;
}
