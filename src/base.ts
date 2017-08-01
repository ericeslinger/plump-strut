import {
  Generator,
  Transformer,
  RouteOptions,
  StrutServices,
} from './dataTypes';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';

export const base: Generator = (
  options: RouteOptions,
  services: StrutServices
) => {
  return (i: Partial<Hapi.RouteConfiguration>) => {
    function routeBlock() {
      if (options.kind === 'attributes') {
        switch (options.action) {
          case 'create':
            return {
              method: 'POST',
              path: '',
              config: {
                payload: { output: 'data', parse: true },
              },
            };
          case 'read':
            return {
              method: 'GET',
              path: '/{itemId}',
            };
          case 'update':
            return {
              method: 'PATCH',
              path: '/{itemId}',
              config: {
                payload: { output: 'data', parse: true },
              },
            };
          case 'delete':
            return {
              method: 'DELETE',
              path: '/{itemId}',
            };
          case 'query':
            return {
              method: 'GET',
              path: '',
            };
        }
      } else if (options.kind === 'relationship') {
        switch (options.action) {
          case 'create':
            return {
              method: 'PUT',
              path: `/{itemId}/${options.relationship}`,
              config: {
                payload: { output: 'data', parse: true },
              },
            };
          case 'read':
            return {
              method: 'GET',
              path: `/{itemId}/${options.relationship}`,
            };
          case 'update':
            return {
              method: 'PATCH',
              path: `/{itemId}/${options.relationship}/{childId}`,
              config: {
                payload: { output: 'data', parse: true },
              },
            };
          case 'delete':
            return {
              method: 'DELETE',
              path: `/{itemId}/${options.relationship}/{childId}`,
            };
        }
      }
    }
    return mergeOptions(
      {},
      i,
      {
        config: {
          cors: options.cors ? options.cors : false,
        },
      },
      routeBlock()
    );
  };
};
