import { Generator } from './dataTypes';
import { Model, ModelData } from 'plump';
import * as Hapi from 'hapi';
export interface RoutedItem extends Hapi.Request {
    pre: {
        item: {
            ref: Model<ModelData>;
            data: ModelData;
        };
    };
}
export declare const handle: Generator;
