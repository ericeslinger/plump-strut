"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mergeOptions = require("merge-options");
exports.base = function (options, services) {
    return function (i) {
        function routeBlock() {
            if (options.kind === 'attributes') {
                switch (options.action) {
                    case 'create':
                        return {
                            method: 'POST',
                            path: '',
                            config: {
                                payload: { output: 'data', parse: true },
                            },
                        };
                    case 'read':
                        return {
                            method: 'GET',
                            path: '/{itemId}',
                        };
                    case 'update':
                        return {
                            method: 'PATCH',
                            path: '/{itemId}',
                            config: {
                                payload: { output: 'data', parse: true },
                            },
                        };
                    case 'delete':
                        return {
                            method: 'DELETE',
                            path: '/{itemId}',
                        };
                    case 'query':
                        return {
                            method: 'GET',
                            path: '',
                        };
                }
            }
            else if (options.kind === 'relationship') {
                switch (options.action) {
                    case 'create':
                        return {
                            method: 'PUT',
                            path: "/{itemId}/" + options.relationship,
                            config: {
                                payload: { output: 'data', parse: true },
                            },
                        };
                    case 'read':
                        return {
                            method: 'GET',
                            path: "/{itemId}/" + options.relationship,
                        };
                    case 'update':
                        return {
                            method: 'PATCH',
                            path: "/{itemId}/" + options.relationship + "/{childId}",
                            config: {
                                payload: { output: 'data', parse: true },
                            },
                        };
                    case 'delete':
                        return {
                            method: 'DELETE',
                            path: "/{itemId}/" + options.relationship + "/{childId}",
                        };
                }
            }
        }
        return mergeOptions({}, i, {
            config: {
                cors: options.cors ? options.cors : false,
                pre: [],
            },
        }, routeBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRTZXJ2aWNlcyxcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuZXhwb3J0IGNvbnN0IGJhc2U6IFNlZ21lbnRHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXMsXG4pID0+IHtcbiAgcmV0dXJuIChpOiBQYXJ0aWFsPEhhcGkuUm91dGVDb25maWd1cmF0aW9uPikgPT4ge1xuICAgIGZ1bmN0aW9uIHJvdXRlQmxvY2soKSB7XG4gICAgICBpZiAob3B0aW9ucy5raW5kID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgcGF0aDogJycsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHBhdGg6ICcnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmtpbmQgPT09ICdyZWxhdGlvbnNoaXAnKSB7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgcGF0aDogYC97aXRlbUlkfS8ke29wdGlvbnMucmVsYXRpb25zaGlwfWAsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3JlYWQnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgcGF0aDogYC97aXRlbUlkfS8ke29wdGlvbnMucmVsYXRpb25zaGlwfWAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgICAgICAgIHBhdGg6IGAve2l0ZW1JZH0vJHtvcHRpb25zLnJlbGF0aW9uc2hpcH0ve2NoaWxkSWR9YCxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICAgIHBhdGg6IGAve2l0ZW1JZH0vJHtvcHRpb25zLnJlbGF0aW9uc2hpcH0ve2NoaWxkSWR9YCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAgaSxcbiAgICAgIHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgY29yczogb3B0aW9ucy5jb3JzID8gb3B0aW9ucy5jb3JzIDogZmFsc2UsXG4gICAgICAgICAgcHJlOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb3V0ZUJsb2NrKCksXG4gICAgKTtcbiAgfTtcbn07XG4iXX0=
