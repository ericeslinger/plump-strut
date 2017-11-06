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
            else if (options.kind === 'other') {
                if (options.action === 'query') {
                    return {
                        method: 'GET',
                        path: '',
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxFQUNEO1lBQ0UsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSztnQkFDekMsR0FBRyxFQUFFLEVBQUU7YUFDUjtTQUNGLEVBQ0QsVUFBVSxFQUFFLENBQ2IsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudEdlbmVyYXRvcixcbiAgVHJhbnNmb3JtZXIsXG4gIFJvdXRlT3B0aW9ucyxcbiAgU3RydXRTZXJ2aWNlcyxcbn0gZnJvbSAnLi9kYXRhVHlwZXMnO1xuaW1wb3J0ICogYXMgSGFwaSBmcm9tICdoYXBpJztcbmltcG9ydCAqIGFzIG1lcmdlT3B0aW9ucyBmcm9tICdtZXJnZS1vcHRpb25zJztcblxuZXhwb3J0IGNvbnN0IGJhc2U6IFNlZ21lbnRHZW5lcmF0b3IgPSAoXG4gIG9wdGlvbnM6IFJvdXRlT3B0aW9ucyxcbiAgc2VydmljZXM6IFN0cnV0U2VydmljZXNcbikgPT4ge1xuICByZXR1cm4gKGk6IFBhcnRpYWw8SGFwaS5Sb3V0ZUNvbmZpZ3VyYXRpb24+KSA9PiB7XG4gICAgZnVuY3Rpb24gcm91dGVCbG9jaygpIHtcbiAgICAgIGlmIChvcHRpb25zLmtpbmQgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAncmVhZCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5raW5kID09PSAncmVsYXRpb25zaGlwJykge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgIHBhdGg6IGAve2l0ZW1JZH0vJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICdyZWFkJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHBhdGg6IGAve2l0ZW1JZH0vJHtvcHRpb25zLnJlbGF0aW9uc2hpcH1gLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgICBwYXRoOiBgL3tpdGVtSWR9LyR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9L3tjaGlsZElkfWAsXG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgICBwYXRoOiBgL3tpdGVtSWR9LyR7b3B0aW9ucy5yZWxhdGlvbnNoaXB9L3tjaGlsZElkfWAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMua2luZCA9PT0gJ290aGVyJykge1xuICAgICAgICBpZiAob3B0aW9ucy5hY3Rpb24gPT09ICdxdWVyeScpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHBhdGg6ICcnLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlT3B0aW9ucyhcbiAgICAgIHt9LFxuICAgICAgaSxcbiAgICAgIHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgY29yczogb3B0aW9ucy5jb3JzID8gb3B0aW9ucy5jb3JzIDogZmFsc2UsXG4gICAgICAgICAgcHJlOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICByb3V0ZUJsb2NrKClcbiAgICApO1xuICB9O1xufTtcbiJdfQ==
