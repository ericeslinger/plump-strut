"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PostgresWatcher = (function () {
    function PostgresWatcher(rawDB, plump, io) {
        var _this = this;
        this.rawDB = rawDB;
        this.plump = plump;
        this.io = io;
        this.relationshipMap = {};
        Object.keys(this.plump.terminal.types).forEach(function (typeName) {
            Object.keys(_this.plump.terminal.types[typeName].relationships).forEach(function (relName) {
                var relTable = _this.plump.terminal.types[typeName].relationships[relName].type;
                if (!_this.relationshipMap[relTable.storeData.sql.tableName] &&
                    !relTable.storeData.sql.joinQuery) {
                    _this.relationshipMap[relTable.storeData.sql.tableName] = Object.keys(relTable.sides).map(function (sideName) {
                        return {
                            type: relTable.sides[relTable.sides[sideName].otherName].otherType,
                            field: "relationships." + sideName,
                            idField: relTable.storeData.sql.joinFields[sideName],
                        };
                    });
                }
            });
        });
        this.rawDB.on('notification', function (data) { return _this.handlePGNotification(data); });
        this.rawDB.connect();
        this.rawDB.query('listen "update_watchers"');
    }
    PostgresWatcher.prototype.handlePGNotification = function (data) {
        var _this = this;
        var v = JSON.parse(data.payload);
        if (v.eventType === 'update') {
            this.io.to('authenticated').emit('plumpUpdate', v);
        }
        else if (v.eventType === 'relationshipCreate') {
            (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                _this.io.to('authenticated').emit('plumpUpdate', {
                    eventType: 'relationshipCreate',
                    id: v.new[relMapItem.idField],
                    type: relMapItem.type,
                    field: relMapItem.field,
                });
            });
        }
        else if (v.eventType === 'relationshipDelete') {
            (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                _this.io.to('authenticated').emit('plumpUpdate', {
                    eventType: 'relationshipDelete',
                    id: v.old[relMapItem.idField],
                    type: relMapItem.type,
                    field: relMapItem.field,
                });
            });
        }
        else if (v.eventType === 'relationshipUpdate') {
            (this.relationshipMap[v.relationship] || []).forEach(function (relMapItem) {
                _this.io.to('authenticated').emit('plumpUpdate', {
                    eventType: 'relationshipUpdate',
                    id: v.new[relMapItem.idField],
                    type: relMapItem.type,
                    field: relMapItem.field,
                });
            });
        }
    };
    return PostgresWatcher;
}());
exports.PostgresWatcher = PostgresWatcher;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QWEsRUFBRTtvQkFDOUMsU0FBUyxFQUFFLG9CQUFvQjtvQkFDL0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDN0IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO29CQUNyQixLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7aUJBQ3hCLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFDSCxzQkFBQztBQUFELENBdkVBLEFBdUVDLElBQUE7QUF2RVksMENBQWUiLCJmaWxlIjoicG9zdGdyZXNXYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGx1bXAsIFRlcm1pbmFsU3RvcmUgfSBmcm9tICdwbHVtcCc7XG5pbXBvcnQgeyBDbGllbnQgfSBmcm9tICdwZyc7XG5pbXBvcnQgKiBhcyBTb2NrZXRJTyBmcm9tICdzb2NrZXQuaW8nO1xuXG5leHBvcnQgY2xhc3MgUG9zdGdyZXNXYXRjaGVyPFQgZXh0ZW5kcyBUZXJtaW5hbFN0b3JlPiB7XG4gIHJlbGF0aW9uc2hpcE1hcDoge1xuICAgIFtrZXk6IHN0cmluZ106IHsgdHlwZTogc3RyaW5nOyBmaWVsZDogc3RyaW5nOyBpZEZpZWxkOiBzdHJpbmcgfVtdO1xuICB9ID0ge307XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByYXdEQjogQ2xpZW50LFxuICAgIHB1YmxpYyBwbHVtcDogUGx1bXA8VD4sXG4gICAgcHVibGljIGlvOiBTb2NrZXRJTy5TZXJ2ZXIsXG4gICkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMucGx1bXAudGVybWluYWwudHlwZXMpLmZvckVhY2godHlwZU5hbWUgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoXG4gICAgICAgIHRoaXMucGx1bXAudGVybWluYWwudHlwZXNbdHlwZU5hbWVdLnJlbGF0aW9uc2hpcHMsXG4gICAgICApLmZvckVhY2gocmVsTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbFRhYmxlID0gdGhpcy5wbHVtcC50ZXJtaW5hbC50eXBlc1t0eXBlTmFtZV0ucmVsYXRpb25zaGlwc1tcbiAgICAgICAgICByZWxOYW1lXG4gICAgICAgIF0udHlwZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICF0aGlzLnJlbGF0aW9uc2hpcE1hcFtyZWxUYWJsZS5zdG9yZURhdGEuc3FsLnRhYmxlTmFtZV0gJiZcbiAgICAgICAgICAhcmVsVGFibGUuc3RvcmVEYXRhLnNxbC5qb2luUXVlcnlcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBNYXBbcmVsVGFibGUuc3RvcmVEYXRhLnNxbC50YWJsZU5hbWVdID0gT2JqZWN0LmtleXMoXG4gICAgICAgICAgICByZWxUYWJsZS5zaWRlcyxcbiAgICAgICAgICApLm1hcChzaWRlTmFtZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB0eXBlOlxuICAgICAgICAgICAgICAgIHJlbFRhYmxlLnNpZGVzW3JlbFRhYmxlLnNpZGVzW3NpZGVOYW1lXS5vdGhlck5hbWVdLm90aGVyVHlwZSwgLy8gc2lsbHkgc2lkZS1lZmZlY3Qgb2Ygb25seSBrbm93aW5nIHRoZSBvdGhlciB0eXBlXG4gICAgICAgICAgICAgIGZpZWxkOiBgcmVsYXRpb25zaGlwcy4ke3NpZGVOYW1lfWAsXG4gICAgICAgICAgICAgIGlkRmllbGQ6IHJlbFRhYmxlLnN0b3JlRGF0YS5zcWwuam9pbkZpZWxkc1tzaWRlTmFtZV0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmF3REIub24oJ25vdGlmaWNhdGlvbicsIGRhdGEgPT4gdGhpcy5oYW5kbGVQR05vdGlmaWNhdGlvbihkYXRhKSk7XG4gICAgdGhpcy5yYXdEQi5jb25uZWN0KCk7XG4gICAgdGhpcy5yYXdEQi5xdWVyeSgnbGlzdGVuIFwidXBkYXRlX3dhdGNoZXJzXCInKTtcbiAgfVxuICBoYW5kbGVQR05vdGlmaWNhdGlvbihkYXRhKSB7XG4gICAgY29uc3QgdiA9IEpTT04ucGFyc2UoZGF0YS5wYXlsb2FkKTtcbiAgICBpZiAodi5ldmVudFR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICB0aGlzLmlvLnRvKCdhdXRoZW50aWNhdGVkJykuZW1pdCgncGx1bXBVcGRhdGUnLCB2KTtcbiAgICB9IGVsc2UgaWYgKHYuZXZlbnRUeXBlID09PSAncmVsYXRpb25zaGlwQ3JlYXRlJykge1xuICAgICAgKHRoaXMucmVsYXRpb25zaGlwTWFwW3YucmVsYXRpb25zaGlwXSB8fCBbXSkuZm9yRWFjaChyZWxNYXBJdGVtID0+IHtcbiAgICAgICAgdGhpcy5pby50bygnYXV0aGVudGljYXRlZCcpLmVtaXQoJ3BsdW1wVXBkYXRlJywge1xuICAgICAgICAgIGV2ZW50VHlwZTogJ3JlbGF0aW9uc2hpcENyZWF0ZScsXG4gICAgICAgICAgaWQ6IHYubmV3W3JlbE1hcEl0ZW0uaWRGaWVsZF0sXG4gICAgICAgICAgdHlwZTogcmVsTWFwSXRlbS50eXBlLFxuICAgICAgICAgIGZpZWxkOiByZWxNYXBJdGVtLmZpZWxkLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodi5ldmVudFR5cGUgPT09ICdyZWxhdGlvbnNoaXBEZWxldGUnKSB7XG4gICAgICAodGhpcy5yZWxhdGlvbnNoaXBNYXBbdi5yZWxhdGlvbnNoaXBdIHx8IFtdKS5mb3JFYWNoKHJlbE1hcEl0ZW0gPT4ge1xuICAgICAgICB0aGlzLmlvLnRvKCdhdXRoZW50aWNhdGVkJykuZW1pdCgncGx1bXBVcGRhdGUnLCB7XG4gICAgICAgICAgZXZlbnRUeXBlOiAncmVsYXRpb25zaGlwRGVsZXRlJyxcbiAgICAgICAgICBpZDogdi5vbGRbcmVsTWFwSXRlbS5pZEZpZWxkXSxcbiAgICAgICAgICB0eXBlOiByZWxNYXBJdGVtLnR5cGUsXG4gICAgICAgICAgZmllbGQ6IHJlbE1hcEl0ZW0uZmllbGQsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh2LmV2ZW50VHlwZSA9PT0gJ3JlbGF0aW9uc2hpcFVwZGF0ZScpIHtcbiAgICAgICh0aGlzLnJlbGF0aW9uc2hpcE1hcFt2LnJlbGF0aW9uc2hpcF0gfHwgW10pLmZvckVhY2gocmVsTWFwSXRlbSA9PiB7XG4gICAgICAgIHRoaXMuaW8udG8oJ2F1dGhlbnRpY2F0ZWQnKS5lbWl0KCdwbHVtcFVwZGF0ZScsIHtcbiAgICAgICAgICBldmVudFR5cGU6ICdyZWxhdGlvbnNoaXBVcGRhdGUnLFxuICAgICAgICAgIGlkOiB2Lm5ld1tyZWxNYXBJdGVtLmlkRmllbGRdLFxuICAgICAgICAgIHR5cGU6IHJlbE1hcEl0ZW0udHlwZSxcbiAgICAgICAgICBmaWVsZDogcmVsTWFwSXRlbS5maWVsZCxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
