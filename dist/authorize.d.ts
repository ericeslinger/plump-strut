import { ModelData, ModelReference, IndefiniteModelData } from 'plump';
import { SegmentGenerator } from './dataTypes';
export interface AbstractAuthorizeRequest {
    kind: 'attributes' | 'relationship' | 'compound' | 'other';
}
export interface OtherAuthorizeRequest extends AbstractAuthorizeRequest {
    kind: 'other';
    action: string;
}
export interface AbstractAttributesAuthorizeRequest extends AbstractAuthorizeRequest {
    action: 'create' | 'read' | 'update' | 'delete';
    actor: ModelReference;
    kind: 'attributes';
}
export interface AttributesReadAuthorizeRequest extends AbstractAttributesAuthorizeRequest {
    action: 'read';
    target: ModelReference;
}
export interface AttributesDeleteAuthorizeRequest extends AbstractAttributesAuthorizeRequest {
    action: 'delete';
    target: ModelReference;
}
export interface AttributesCreateAuthorizeRequest extends AbstractAttributesAuthorizeRequest {
    action: 'create';
    data?: IndefiniteModelData;
    target: {
        type: string;
    };
}
export interface QueryAuthorizeRequest extends OtherAuthorizeRequest {
    action: 'query';
    actor: ModelReference;
    target: {
        type: string;
    };
}
export interface AttributesUpdateAuthorizeRequest extends AbstractAttributesAuthorizeRequest {
    action: 'update';
    target: ModelReference;
    data?: ModelData;
}
export declare type AttributesAuthorizeRequest = AttributesCreateAuthorizeRequest | AttributesReadAuthorizeRequest | AttributesUpdateAuthorizeRequest | AttributesDeleteAuthorizeRequest;
export interface AbstractRelationshipAuthorizeRequest extends AbstractAuthorizeRequest {
    kind: 'relationship';
    actor: ModelReference;
    action: 'create' | 'read' | 'update' | 'delete';
    relationship: string;
    target: ModelReference;
}
export interface RelationshipCreateAuthorizeRequest extends AbstractRelationshipAuthorizeRequest {
    action: 'create';
    child: ModelReference;
    meta?: any;
}
export interface RelationshipReadAuthorizeRequest extends AbstractRelationshipAuthorizeRequest {
    action: 'read';
}
export interface RelationshipUpdateAuthorizeRequest extends AbstractRelationshipAuthorizeRequest {
    action: 'update';
    child: ModelReference;
    meta?: any;
}
export interface RelationshipDeleteAuthorizeRequest extends AbstractRelationshipAuthorizeRequest {
    action: 'delete';
    child: ModelReference;
}
export declare type RelationshipAuthorizeRequest = RelationshipCreateAuthorizeRequest | RelationshipReadAuthorizeRequest | RelationshipUpdateAuthorizeRequest | RelationshipDeleteAuthorizeRequest;
export declare type SimpleAuthorizeRequest = RelationshipAuthorizeRequest | QueryAuthorizeRequest | AttributesAuthorizeRequest;
export interface CompoundAuthorizeRequest extends AbstractAuthorizeRequest {
    kind: 'compound';
    combinator: 'and' | 'or';
    list: (AttributesAuthorizeRequest | QueryAuthorizeRequest | RelationshipAuthorizeRequest | CompoundAuthorizeRequest)[];
}
export declare type ConcreteAuthorizeRequest = RelationshipAuthorizeRequest | QueryAuthorizeRequest | AttributesAuthorizeRequest;
export declare type AuthorizeRequest = RelationshipAuthorizeRequest | QueryAuthorizeRequest | AttributesAuthorizeRequest | CompoundAuthorizeRequest;
export interface AbstractAuthorizeResponse {
    kind: string;
}
export interface FinalAuthorizeResponse extends AbstractAuthorizeResponse {
    kind: 'final';
    result: boolean;
}
export interface DelegateAuthorizeResponse extends AbstractAuthorizeResponse {
    kind: 'delegated';
    delegate: AuthorizeRequest;
}
export declare type AuthorizeResponse = FinalAuthorizeResponse | DelegateAuthorizeResponse;
export interface ActorMapFn {
    (m: ModelData): ModelReference;
}
export interface AuthorizerDefinition {
    mapActor?: ActorMapFn;
    authorize(req: AuthorizeRequest): Promise<AuthorizeResponse>;
}
export interface FilterDefinition {
    type: 'white' | 'black';
    attributes?: string[];
    relationships?: string[];
}
export interface IOracle {
    authorizers: {
        [name: string]: AuthorizerDefinition;
    };
    filters: {
        [name: string]: FilterDefinition;
    };
    addAuthorizer(auth: AuthorizerDefinition, forType: string): void;
    addFilter(auth: FilterDefinition, forType: string): void;
    filter(m: ModelData): ModelData;
    dispatch(request: AuthorizeRequest): Promise<FinalAuthorizeResponse>;
    authorize(request: AuthorizeRequest): Promise<boolean>;
}
export declare const authorize: SegmentGenerator;
