'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostgresWatcher = exports.PostgresWatcher = function () {
    function PostgresWatcher(rawDB, plump, io) {
        var _this = this;

        _classCallCheck(this, PostgresWatcher);

        this.rawDB = rawDB;
        this.plump = plump;
        this.io = io;
        this.relationshipMap = {};
        Object.keys(this.plump.terminal.types).forEach(function (typeName) {
            Object.keys(_this.plump.terminal.types[typeName].relationships).forEach(function (relName) {
                var relTable = _this.plump.terminal.types[typeName].relationships[relName].type;
                if (relTable.storeData && relTable.storeData.sql) {
                    var interesting = [];
                    if (relTable.storeData.sql.tableName) {
                        interesting.push(relTable.storeData.sql.tableName);
                    }
                    if (relTable.storeData.sql.readView) {
                        interesting.push(relTable.storeData.sql.readView);
                    }
                    if (relTable.storeData.sql.writeView) {
                        interesting.push(relTable.storeData.sql.writeView);
                    }
                    interesting.filter(function (table) {
                        return !_this.relationshipMap[table];
                    }).forEach(function (table) {
                        _this.relationshipMap[table] = Object.keys(relTable.sides).map(function (sideName) {
                            return {
                                type: relTable.sides[relTable.sides[sideName].otherName].otherType,
                                field: 'relationships.' + sideName,
                                idField: relTable.storeData.sql.joinFields[sideName]
                            };
                        });
                    });
                }
            });
        });
        this.rawDB.on('notification', function (data) {
            return _this.handlePGNotification(data);
        });
        this.rawDB.connect();
        this.rawDB.query('listen "update_watchers"');
    }

    _createClass(PostgresWatcher, [{
        key: 'handlePGNotification',
        value: function handlePGNotification(data) {
            var _this2 = this;

            var v = JSON.parse(data.payload);
            if (v.eventType === 'update') {
                this.io.to('authenticated').emit('plumpUpdate', v);
            } else if (v.eventType === 'relationshipCreate') {
                (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                    _this2.io.to('authenticated').emit('plumpUpdate', {
                        eventType: 'relationshipCreate',
                        id: v.new[relMapItem.idField],
                        type: relMapItem.type,
                        field: relMapItem.field
                    });
                });
            } else if (v.eventType === 'relationshipDelete') {
                (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                    _this2.io.to('authenticated').emit('plumpUpdate', {
                        eventType: 'relationshipDelete',
                        id: v.old[relMapItem.idField],
                        type: relMapItem.type,
                        field: relMapItem.field
                    });
                });
            } else if (v.eventType === 'relationshipUpdate') {
                (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                    _this2.io.to('authenticated').emit('plumpUpdate', {
                        eventType: 'relationshipUpdate',
                        id: v.new[relMapItem.idField],
                        type: relMapItem.type,
                        field: relMapItem.field
                    });
                });
            }
        }
    }]);

    return PostgresWatcher;
}();