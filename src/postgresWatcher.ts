import { Plump, TerminalStore } from 'plump';
import { Client } from 'pg';

export class PostgresWatcher<T extends TerminalStore> {
  relationshipMap: {
    [key: string]: { type: string; field: string; idField: string }[];
  } = {};
  constructor(
    public rawDB: Client,
    public plump: Plump<T>,
    public io: SocketIO.Server,
  ) {
    Object.keys(this.plump.terminal.types).forEach(typeName => {
      Object.keys(this.plump.terminal.types[typeName].relationships).forEach(
        relName => {
          const relTable = this.plump.terminal.types[typeName].relationships[
            relName
          ].type;
          if (relTable.storeData && relTable.storeData.sql) {
            const interesting = [];
            if (relTable.storeData.sql.tableName) {
              interesting.push(relTable.storeData.sql.tableName);
            }
            if (relTable.storeData.sql.readView) {
              interesting.push(relTable.storeData.sql.readView);
            }
            if (relTable.storeData.sql.writeView) {
              interesting.push(relTable.storeData.sql.writeView);
            }
            interesting
              .filter(table => !this.relationshipMap[table])
              .forEach(table => {
                this.relationshipMap[table] = Object.keys(relTable.sides).map(
                  sideName => {
                    return {
                      type:
                        relTable.sides[relTable.sides[sideName].otherName]
                          .otherType, // silly side-effect of only knowing the other type
                      field: `relationships.${sideName}`,
                      idField: relTable.storeData.sql.joinFields[sideName],
                    };
                  },
                );
              });
          }
        },
      );
    });

    this.rawDB.on('notification', data => this.handlePGNotification(data));
    this.rawDB.connect();
    this.rawDB.query('listen "update_watchers"');
  }
  handlePGNotification(data) {
    const v = JSON.parse(data.payload);
    if (v.eventType === 'update') {
      this.io.to('authenticated').emit('plumpUpdate', v);
    } else if (v.eventType === 'relationshipCreate') {
      (this.relationshipMap[v.relationship] || []).forEach(relMapItem => {
        this.io.to('authenticated').emit('plumpUpdate', {
          eventType: 'relationshipCreate',
          id: v.new[relMapItem.idField],
          type: relMapItem.type,
          field: relMapItem.field,
        });
      });
    } else if (v.eventType === 'relationshipDelete') {
      (this.relationshipMap[v.relationship] || []).forEach(relMapItem => {
        this.io.to('authenticated').emit('plumpUpdate', {
          eventType: 'relationshipDelete',
          id: v.old[relMapItem.idField],
          type: relMapItem.type,
          field: relMapItem.field,
        });
      });
    } else if (v.eventType === 'relationshipUpdate') {
      (this.relationshipMap[v.relationship] || []).forEach(relMapItem => {
        this.io.to('authenticated').emit('plumpUpdate', {
          eventType: 'relationshipUpdate',
          id: v.new[relMapItem.idField],
          type: relMapItem.type,
          field: relMapItem.field,
        });
      });
    }
  }
}
