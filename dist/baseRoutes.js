'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.baseRoutes = undefined;

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var baseRoutes = exports.baseRoutes = {
  read: {
    validate: {
      params: {
        itemId: _joi2.default.number().integer()
      }
    },
    hapi: {
      method: 'GET',
      path: '/{itemId}',
      config: {
        auth: 'token'
      }
    }
  },
  schema: {
    hapi: {
      method: 'GET',
      path: '/schema'
    }
  },
  listChildren: {
    plural: true,
    validate: {
      params: {
        itemId: _joi2.default.number().integer()
      }
    },
    hapi: {
      method: 'GET',
      path: '/{itemId}/{field}',
      config: {
        auth: 'token'
      }
    }
  },
  query: {
    hapi: {
      method: 'GET',
      path: '',
      config: {
        auth: 'token'
      }
    }
  },
  create: {
    validate: {
      payload: true
    },
    hapi: {
      method: 'POST',
      path: '',
      config: {
        payload: { output: 'data', parse: true },
        auth: 'token'
      }
    }
  },
  update: {
    validate: {
      payload: true,
      params: {
        itemId: _joi2.default.number().integer().required()
      }
    },
    hapi: {
      method: 'PATCH',
      path: '/{itemId}',
      config: {
        payload: { output: 'data', parse: true },
        auth: 'token'
      }
    }
  },
  delete: {
    validate: {
      params: {
        itemId: _joi2.default.number().integer().required()
      }
    },
    hapi: {
      method: 'DELETE',
      path: '/{itemId}',
      config: {
        auth: 'token'
      }
    }
  },
  addChild: {
    plural: true,
    validate: {
      params: {
        itemId: _joi2.default.number().integer().required()
      }
    },
    hapi: {
      method: 'PUT',
      path: '/{itemId}/{field}',
      config: {
        payload: { output: 'data', parse: true },
        auth: 'token'
      }
    }
  },
  modifyChild: {
    plural: true,
    validate: {
      params: {
        itemId: _joi2.default.number().integer().required(),
        childId: _joi2.default.number().required()
      }
    },
    hapi: {
      method: 'PATCH',
      path: '/{itemId}/{field}/{childId}',
      config: {
        payload: { output: 'data', parse: true },
        auth: 'token'
      }
    }
  },
  removeChild: {
    plural: true,
    validate: {
      params: {
        itemId: _joi2.default.number().integer().required(),
        childId: _joi2.default.number().required()
      }
    },
    hapi: {
      method: 'DELETE',
      path: '/{itemId}/{field}/{childId}',
      config: {
        auth: 'token'
      }
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2VSb3V0ZXMuanMiXSwibmFtZXMiOlsiYmFzZVJvdXRlcyIsInJlYWQiLCJ2YWxpZGF0ZSIsInBhcmFtcyIsIml0ZW1JZCIsIm51bWJlciIsImludGVnZXIiLCJoYXBpIiwibWV0aG9kIiwicGF0aCIsImNvbmZpZyIsImF1dGgiLCJzY2hlbWEiLCJsaXN0Q2hpbGRyZW4iLCJwbHVyYWwiLCJxdWVyeSIsImNyZWF0ZSIsInBheWxvYWQiLCJvdXRwdXQiLCJwYXJzZSIsInVwZGF0ZSIsInJlcXVpcmVkIiwiZGVsZXRlIiwiYWRkQ2hpbGQiLCJtb2RpZnlDaGlsZCIsImNoaWxkSWQiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7QUFFTyxJQUFNQSxrQ0FBYTtBQUN4QkMsUUFBTTtBQUNKQyxjQUFVO0FBQ1JDLGNBQVE7QUFDTkMsZ0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiO0FBREY7QUFEQSxLQUROO0FBTUpDLFVBQU07QUFDSkMsY0FBUSxLQURKO0FBRUpDLFlBQU0sV0FGRjtBQUdKQyxjQUFRO0FBQ05DLGNBQU07QUFEQTtBQUhKO0FBTkYsR0FEa0I7QUFleEJDLFVBQVE7QUFDTkwsVUFBTTtBQUNKQyxjQUFRLEtBREo7QUFFSkMsWUFBTTtBQUZGO0FBREEsR0FmZ0I7QUFxQnhCSSxnQkFBYztBQUNaQyxZQUFRLElBREk7QUFFWlosY0FBVTtBQUNSQyxjQUFRO0FBQ05DLGdCQUFRLGNBQUlDLE1BQUosR0FBYUMsT0FBYjtBQURGO0FBREEsS0FGRTtBQU9aQyxVQUFNO0FBQ0pDLGNBQVEsS0FESjtBQUVKQyxZQUFNLG1CQUZGO0FBR0pDLGNBQVE7QUFDTkMsY0FBTTtBQURBO0FBSEo7QUFQTSxHQXJCVTtBQW9DeEJJLFNBQU87QUFDTFIsVUFBTTtBQUNKQyxjQUFRLEtBREo7QUFFSkMsWUFBTSxFQUZGO0FBR0pDLGNBQVE7QUFDTkMsY0FBTTtBQURBO0FBSEo7QUFERCxHQXBDaUI7QUE2Q3hCSyxVQUFRO0FBQ05kLGNBQVU7QUFDUmUsZUFBUztBQURELEtBREo7QUFJTlYsVUFBTTtBQUNKQyxjQUFRLE1BREo7QUFFSkMsWUFBTSxFQUZGO0FBR0pDLGNBQVE7QUFDTk8saUJBQVMsRUFBRUMsUUFBUSxNQUFWLEVBQWtCQyxPQUFPLElBQXpCLEVBREg7QUFFTlIsY0FBTTtBQUZBO0FBSEo7QUFKQSxHQTdDZ0I7QUEwRHhCUyxVQUFRO0FBQ05sQixjQUFVO0FBQ1JlLGVBQVMsSUFERDtBQUVSZCxjQUFRO0FBQ05DLGdCQUFRLGNBQUlDLE1BQUosR0FBYUMsT0FBYixHQUF1QmUsUUFBdkI7QUFERjtBQUZBLEtBREo7QUFPTmQsVUFBTTtBQUNKQyxjQUFRLE9BREo7QUFFSkMsWUFBTSxXQUZGO0FBR0pDLGNBQVE7QUFDTk8saUJBQVMsRUFBRUMsUUFBUSxNQUFWLEVBQWtCQyxPQUFPLElBQXpCLEVBREg7QUFFTlIsY0FBTTtBQUZBO0FBSEo7QUFQQSxHQTFEZ0I7QUEwRXhCVyxVQUFRO0FBQ05wQixjQUFVO0FBQ1JDLGNBQVE7QUFDTkMsZ0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCZSxRQUF2QjtBQURGO0FBREEsS0FESjtBQU1OZCxVQUFNO0FBQ0pDLGNBQVEsUUFESjtBQUVKQyxZQUFNLFdBRkY7QUFHSkMsY0FBUTtBQUNOQyxjQUFNO0FBREE7QUFISjtBQU5BLEdBMUVnQjtBQXdGeEJZLFlBQVU7QUFDUlQsWUFBUSxJQURBO0FBRVJaLGNBQVU7QUFDUkMsY0FBUTtBQUNOQyxnQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJlLFFBQXZCO0FBREY7QUFEQSxLQUZGO0FBT1JkLFVBQU07QUFDSkMsY0FBUSxLQURKO0FBRUpDLFlBQU0sbUJBRkY7QUFHSkMsY0FBUTtBQUNOTyxpQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekIsRUFESDtBQUVOUixjQUFNO0FBRkE7QUFISjtBQVBFLEdBeEZjO0FBd0d4QmEsZUFBYTtBQUNYVixZQUFRLElBREc7QUFFWFosY0FBVTtBQUNSQyxjQUFRO0FBQ05DLGdCQUFRLGNBQUlDLE1BQUosR0FBYUMsT0FBYixHQUF1QmUsUUFBdkIsRUFERjtBQUVOSSxpQkFBUyxjQUFJcEIsTUFBSixHQUFhZ0IsUUFBYjtBQUZIO0FBREEsS0FGQztBQVFYZCxVQUFNO0FBQ0pDLGNBQVEsT0FESjtBQUVKQyxZQUFNLDZCQUZGO0FBR0pDLGNBQVE7QUFDTk8saUJBQVMsRUFBRUMsUUFBUSxNQUFWLEVBQWtCQyxPQUFPLElBQXpCLEVBREg7QUFFTlIsY0FBTTtBQUZBO0FBSEo7QUFSSyxHQXhHVztBQXlIeEJlLGVBQWE7QUFDWFosWUFBUSxJQURHO0FBRVhaLGNBQVU7QUFDUkMsY0FBUTtBQUNOQyxnQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJlLFFBQXZCLEVBREY7QUFFTkksaUJBQVMsY0FBSXBCLE1BQUosR0FBYWdCLFFBQWI7QUFGSDtBQURBLEtBRkM7QUFRWGQsVUFBTTtBQUNKQyxjQUFRLFFBREo7QUFFSkMsWUFBTSw2QkFGRjtBQUdKQyxjQUFRO0FBQ05DLGNBQU07QUFEQTtBQUhKO0FBUks7QUF6SFcsQ0FBbkIiLCJmaWxlIjoiYmFzZVJvdXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBKb2kgZnJvbSAnam9pJztcblxuZXhwb3J0IGNvbnN0IGJhc2VSb3V0ZXMgPSB7XG4gIHJlYWQ6IHtcbiAgICB2YWxpZGF0ZToge1xuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBoYXBpOiB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgYXV0aDogJ3Rva2VuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2NoZW1hOiB7XG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHBhdGg6ICcvc2NoZW1hJyxcbiAgICB9LFxuICB9LFxuICBsaXN0Q2hpbGRyZW46IHtcbiAgICBwbHVyYWw6IHRydWUsXG4gICAgdmFsaWRhdGU6IHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgYXV0aDogJ3Rva2VuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcXVlcnk6IHtcbiAgICBoYXBpOiB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgcGF0aDogJycsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgYXV0aDogJ3Rva2VuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiB7XG4gICAgdmFsaWRhdGU6IHtcbiAgICAgIHBheWxvYWQ6IHRydWUsXG4gICAgfSxcbiAgICBoYXBpOiB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHBhdGg6ICcnLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIGF1dGg6ICd0b2tlbicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHVwZGF0ZToge1xuICAgIHZhbGlkYXRlOiB7XG4gICAgICBwYXlsb2FkOiB0cnVlLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGhhcGk6IHtcbiAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIGF1dGg6ICd0b2tlbicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGRlbGV0ZToge1xuICAgIHZhbGlkYXRlOiB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIGF1dGg6ICd0b2tlbicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGFkZENoaWxkOiB7XG4gICAgcGx1cmFsOiB0cnVlLFxuICAgIHZhbGlkYXRlOiB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgYXV0aDogJ3Rva2VuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgbW9kaWZ5Q2hpbGQ6IHtcbiAgICBwbHVyYWw6IHRydWUsXG4gICAgdmFsaWRhdGU6IHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgY2hpbGRJZDogSm9pLm51bWJlcigpLnJlcXVpcmVkKCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICBjb25maWc6IHtcbiAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgYXV0aDogJ3Rva2VuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcmVtb3ZlQ2hpbGQ6IHtcbiAgICBwbHVyYWw6IHRydWUsXG4gICAgdmFsaWRhdGU6IHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgY2hpbGRJZDogSm9pLm51bWJlcigpLnJlcXVpcmVkKCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGFwaToge1xuICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfS97Y2hpbGRJZH0nLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIGF1dGg6ICd0b2tlbicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59O1xuIl19
