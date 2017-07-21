import * as Hapi from 'hapi';
import { Transformer, Generator } from './dataTypes';

function compose(...funs: Transformer[]) {
  return (initial: Partial<Hapi.RouteConfiguration>) =>
    funs.reduce((acc, v) => v(acc), initial);
}

export function noop(v: Partial<Hapi.RouteConfiguration>) {
  return v;
}

export interface RouteGenerator {
  base: Generator;
  joi: Generator;
  authorize: Generator;
  handle: Generator;
  package: Generator;
}

export class Thing implements RouteGenerator {
  base(options: any): Transformer {
    return noop;
  }
  joi(options: any): Transformer {
    return noop;
  }
  authorize(options: any): Transformer {
    return noop;
  }
  handle(options: any): Transformer {
    return noop;
  }
  package(options: any): Transformer {
    return noop;
  }
}
