import { AuthorizerDefinition, AuthorizeRequest, FinalAuthorizeResponse, KeyService, IOracle, FilterDefinition } from './dataTypes';
import { ModelData } from 'plump';
export declare class Oracle implements IOracle {
    keyService: KeyService;
    authorizers: {
        [name: string]: AuthorizerDefinition;
    };
    filters: {
        [name: string]: FilterDefinition;
    };
    constructor(keyService?: KeyService);
    addAuthorizer(auth: AuthorizerDefinition, forType: string): void;
    filter(md: ModelData): ModelData;
    addFilter(f: FilterDefinition, forType: string): void;
    dispatch(request: AuthorizeRequest): Promise<FinalAuthorizeResponse>;
    authorize(request: AuthorizeRequest): Promise<boolean>;
}
