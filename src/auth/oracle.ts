import {
  AuthorizerDefinition,
  AuthorizeRequest,
  AuthorizeResponse,
  FinalAuthorizeResponse,
  KeyService,
} from './dataTypes';

import { ModelData } from 'plump';

import { Request } from 'hapi';

export interface BaseOracleRouteInfo {
  action: 'create' | 'read' | 'update' | 'delete';
  target: string;
}

export interface AttributesOracleRouteInfo extends BaseOracleRouteInfo {
  kind: 'attributes';
}

export interface RelationshipOracleRouteInfo extends BaseOracleRouteInfo {
  kind: 'relationship';
  relationship: string;
  childType: string;
}

export type OracleRouteInfo =
  | AttributesOracleRouteInfo
  | RelationshipOracleRouteInfo;

export class Oracle {
  public authorizers: { [name: string]: AuthorizerDefinition } = {};

  constructor(public keyService?: KeyService) {}

  // TODO: move this to strut.

  // package is called in strut, and used to transform the request
  // from a hapi.request object into an AuthorizeRequest.
  // the default would be a passthrough, but you could do something like
  // (we do in trellis): { User } => { Profile } map.
  package(
    req: Request & {
      auth: {
        credentials: {
          user: ModelData;
        };
      };
    },
    route: OracleRouteInfo
  ): Promise<AuthorizeRequest> {
    return Promise.resolve().then<AuthorizeRequest>(() => {
      if (route.kind === 'attributes') {
        if (route.action === 'create') {
          return {
            data: req.payload,
            target: { type: route.target },
            kind: 'attributes',
            action: 'create',
            actor: req.auth.credentials.user,
          };
        } else if (route.action === 'read') {
          return {
            target: { type: route.target, id: req.params.itemId },
            kind: 'attributes',
            action: 'read',
            actor: req.auth.credentials.user,
          };
        } else if (route.action === 'update') {
          return {
            data: req.payload,
            target: { type: route.target, id: req.params.itemId },
            kind: 'attributes',
            action: 'update',
            actor: req.auth.credentials.user,
          };
        } else if (route.action === 'delete') {
          return {
            data: req.payload,
            target: { type: route.target, id: req.params.itemId },
            kind: 'attributes',
            action: 'update',
            actor: req.auth.credentials.user,
          };
        }
      } else if (route.kind === 'relationship') {
        if (route.action === 'create') {
          return {
            kind: 'relationship',
            action: 'create',
            relationship: route.relationship,
            actor: req.auth.credentials.user,
            parent: { type: route.target, id: req.params.itemId },
            meta: req.payload.meta,
            child: { type: route.childType, id: req.payload.id },
          };
        } else if (route.action === 'read') {
          return {
            kind: 'relationship',
            action: 'read',
            relationship: route.relationship,
            actor: req.auth.credentials.user,
            parent: { type: route.target, id: req.params.itemId },
          };
        } else if (route.action === 'update') {
          return {
            kind: 'relationship',
            action: 'update',
            relationship: route.relationship,
            actor: req.auth.credentials.user,
            parent: { type: route.target, id: req.params.itemId },
            child: { type: route.childType, id: req.payload.id },
            meta: req.payload.meta,
          };
        } else if (route.action === 'delete') {
          return {
            kind: 'relationship',
            action: 'delete',
            relationship: route.relationship,
            actor: req.auth.credentials.user,
            parent: { type: route.target, id: req.params.itemId },
            child: { type: route.childType, id: req.payload.id },
          };
        }
      }
    });
  }

  addAuthorizer(auth: AuthorizerDefinition, forType: string) {
    this.authorizers[forType] = auth;
  }

  dispatch(request: AuthorizeRequest): Promise<FinalAuthorizeResponse> {
    return Promise.resolve()
      .then<AuthorizeResponse>(() => {
        if (request.kind === 'relationship') {
          return this.authorizers[request.parent.type].authorize(request);
        } else if (request.kind === 'attributes') {
          return this.authorizers[request.target.type].authorize(request);
        } else if (request.kind === 'compound') {
          return Promise.all(request.list.map(v => this.dispatch(v)))
            .then(
              (res: FinalAuthorizeResponse[]) =>
                request.combinator === 'or'
                  ? res.some(v => v.result)
                  : res.every(v => v.result)
            )
            .then<FinalAuthorizeResponse>(f => ({ kind: 'final', result: f }));
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
