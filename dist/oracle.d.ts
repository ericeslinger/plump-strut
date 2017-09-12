import { KeyService } from './dataTypes';
import { AuthorizerDefinition, AuthorizeRequest, FinalAuthorizeResponse, IOracle, FilterDefinition } from './authorize';
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
