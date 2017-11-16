/// <reference types="socket.io" />
import { Plump, TerminalStore } from 'plump';
import { Client } from 'pg';
export declare class PostgresWatcher<T extends TerminalStore> {
    rawDB: Client;
    plump: Plump<T>;
    io: SocketIO.Server;
    relationshipMap: {
        [key: string]: {
            type: string;
            field: string;
            idField: string;
        }[];
    };
    constructor(rawDB: Client, plump: Plump<T>, io: SocketIO.Server);
    handlePGNotification(data: any): void;
}
