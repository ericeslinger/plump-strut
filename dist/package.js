"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mergeOptions = require("merge-options");
exports.base = function (options, services) {
    return function (i) {
        function packageBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {};
                    case 'read':
                        return {};
                    case 'update':
                        return {};
                    case 'delete':
                        return {};
                    case 'query':
                        return {};
                }
            }
            else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {};
                    case 'read':
                        return {};
                    case 'update':
                        return {};
                    case 'delete':
                        return {};
                }
            }
        }
        return mergeOptions(i, {}, packageBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0EsNENBQThDO0FBRWpDLFFBQUEsSUFBSSxHQUFjLFVBQzdCLE9BQXFCLEVBQ3JCLFFBQXVCO0lBRXZCLE1BQU0sQ0FBQyxVQUFDLENBQW1DO1FBQ3pDO1lBQ0UsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxNQUFNO3dCQUNULE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxPQUFPO3dCQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxNQUFNO3dCQUNULE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ1osS0FBSyxRQUFRO3dCQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6InBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBHZW5lcmF0b3IsXG4gIFRyYW5zZm9ybWVyLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFN0cnV0U2VydmljZXMsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmV4cG9ydCBjb25zdCBiYXNlOiBHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXNcbikgPT4ge1xuICByZXR1cm4gKGk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gcGFja2FnZUJsb2NrKCkge1xuICAgICAgaWYgKG9wdGlvbnMua2luZCA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICBjYXNlICdxdWVyeSc6XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAncmVsYXRpb25zaGlwJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlT3B0aW9ucyhpLCB7fSwgcGFja2FnZUJsb2NrKCkpO1xuICB9O1xufTtcbiJdfQ==
