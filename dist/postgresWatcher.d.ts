import { Plump } from 'plump';
import { Client } from 'pg';
export declare class PostgresWatcher {
    rawDB: Client;
    plump: Plump;
    io: SocketIO.Server;
    relationshipMap: {
        [key: string]: {
            type: string;
            field: string;
            idField: string;
        }[];
    };
    constructor(rawDB: Client, plump: Plump, io: SocketIO.Server);
    handlePGNotification(data: any): void;
}
