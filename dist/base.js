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
            },
        }, routeBlock());
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0osQ0FBQyxDQUFDIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBHZW5lcmF0b3IsXG4gIFRyYW5zZm9ybWVyLFxuICBSb3V0ZU9wdGlvbnMsXG4gIFN0cnV0U2VydmljZXMsXG59IGZyb20gJy4vZGF0YVR5cGVzJztcbmltcG9ydCAqIGFzIEhhcGkgZnJvbSAnaGFwaSc7XG5pbXBvcnQgKiBhcyBtZXJnZU9wdGlvbnMgZnJvbSAnbWVyZ2Utb3B0aW9ucyc7XG5cbmV4cG9ydCBjb25zdCBiYXNlOiBHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXNcbikgPT4ge1xuICByZXR1cm4gKGk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gcm91dGVCbG9jaygpIHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncXVlcnknOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgcGF0aDogJycsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMua2luZCA9PT0gJ3JlbGF0aW9uc2hpcCcpIHtcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICBwYXRoOiBgL3tpdGVtSWR9LyR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9YCxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICBwYXRoOiBgL3tpdGVtSWR9LyR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9YCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgICAgcGF0aDogYC97aXRlbUlkfS8ke29wdGlvbnMucmVsYXRpb25zaGlwfS97Y2hpbGRJZH1gLFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgcGF0aDogYC97aXRlbUlkfS8ke29wdGlvbnMucmVsYXRpb25zaGlwfS97Y2hpbGRJZH1gLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VPcHRpb25zKFxuICAgICAge30sXG4gICAgICBpLFxuICAgICAge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBjb3JzOiBvcHRpb25zLmNvcnMgPyBvcHRpb25zLmNvcnMgOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb3V0ZUJsb2NrKClcbiAgICApO1xuICB9O1xufTtcbiJdfQ==
