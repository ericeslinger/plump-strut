import { KeyService, RouteOptions } from './dataTypes';

import {
  AuthorizerDefinition,
  AuthorizeRequest,
  AuthorizeResponse,
  FinalAuthorizeResponse,
  IOracle,
  FilterDefinition,
} from './authorize';
import { ModelData } from 'plump';

import { Request } from 'hapi';

function filter(input: ModelData, f: FilterDefinition): ModelData {
  const rV = {
    id: input.id,
    type: input.type,
    relationships: {},
    attributes: {},
  };
  ['attributes', 'relationships'].forEach(thing => {
    if (input[thing]) {
      Object.keys(input[thing]).forEach(a => {
        if (
          (f.type === 'white' && f[thing] && f[thing].indexOf(a) >= 0) ||
          (f.type === 'black' && (!f[thing] || !(f[thing].indexOf(a) >= 0)))
        ) {
          rV[thing][a] = input[thing][a];
        }
      });
    }
  });
  return rV as ModelData;
}

export class Oracle implements IOracle {
  public authorizers: { [name: string]: AuthorizerDefinition } = {};
  public filters: { [name: string]: FilterDefinition } = {};

  constructor(public keyService?: KeyService) {}

  addAuthorizer(auth: AuthorizerDefinition, forType: string) {
    this.authorizers[forType] = auth;
  }

  filter(md: ModelData): ModelData {
    if (this.filters[md.type]) {
      return filter(md, this.filters[md.type]);
    } else {
      return md;
    }
  }

  addFilter(f: FilterDefinition, forType: string) {
    this.filters[forType] = f;
  }

  dispatch(request: AuthorizeRequest): Promise<FinalAuthorizeResponse> {
    return Promise.resolve()
      .then<AuthorizeResponse>(() => {
        if (request.kind === 'compound') {
          return Promise.all(request.list.map(v => this.dispatch(v)))
            .then(
              (res: FinalAuthorizeResponse[]) =>
                request.combinator === 'or'
                  ? res.some(v => v.result)
                  : res.every(v => v.result),
            )
            .then<FinalAuthorizeResponse>(f => ({ kind: 'final', result: f }));
        } else {
          return this.authorizers[request.target.type].authorize(request);
        }
      })
      .then(v => {
        if (v.kind === 'final') {
          return v;
        } else if (v.kind === 'delegated') {
          return this.dispatch(v.delegate);
        }
      });
  }

  authorize(request: AuthorizeRequest): Promise<boolean> {
    return this.dispatch(request).then((f: FinalAuthorizeResponse) => f.result);
  }
}
