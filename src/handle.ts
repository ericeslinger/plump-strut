import { Generator, Transformer, RouteOptions } from './dataTypes';
import * as Hapi from 'hapi';
import * as mergeOptions from 'merge-options';

export function handle(options: RouteOptions): Transformer {
  return (i: Partial<Hapi.RouteConfiguration>) => {
    function handleBlock() {
      if (options.kind === 'attributes') {
        switch (options.action) {
          case 'create':
            return {};
          case 'read':
            return {};
          case 'update':
            return {};
          case 'delete':
            return {};
          case 'query':
            return {};
        }
      } else if (options.kind === 'relationship') {
        switch (options.action) {
          case 'create':
            return {};
          case 'read':
            return {};
          case 'update':
            return {};
          case 'delete':
            return {};
        }
      }
    }
    return mergeOptions(
      i,
      {
        config: {
          cors: options.cors ? options.cors : false,
        },
      },
      handleBlock()
    );
  };
}
