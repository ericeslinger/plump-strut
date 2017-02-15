'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRoutes = createRoutes;

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRoutes() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var retVal = {
    read: {
      validate: {
        params: {
          itemId: _joi2.default.number().integer()
        }
      },
      hapi: {
        method: 'GET',
        path: '/{itemId}',
        config: {}
      }
    },
    schema: {
      hapi: {
        method: 'GET',
        path: '/schema',
        config: {}
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
        config: {}
      }
    },
    query: {
      hapi: {
        method: 'GET',
        path: '',
        config: {}
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
          payload: { output: 'data', parse: true }
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
          payload: { output: 'data', parse: true }
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
        config: {}
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
          payload: { output: 'data', parse: true }
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
          payload: { output: 'data', parse: true }
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
        config: {}
      }
    }
  };

  if (opts.authFor) {
    Object.keys(opts.authFor).forEach(function (k) {
      retVal[k].hapi.config.auth = opts.authFor[k];
    });
  }

  return retVal;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2VSb3V0ZXMuanMiXSwibmFtZXMiOlsiY3JlYXRlUm91dGVzIiwib3B0cyIsInJldFZhbCIsInJlYWQiLCJ2YWxpZGF0ZSIsInBhcmFtcyIsIml0ZW1JZCIsIm51bWJlciIsImludGVnZXIiLCJoYXBpIiwibWV0aG9kIiwicGF0aCIsImNvbmZpZyIsInNjaGVtYSIsImxpc3RDaGlsZHJlbiIsInBsdXJhbCIsInF1ZXJ5IiwiY3JlYXRlIiwicGF5bG9hZCIsIm91dHB1dCIsInBhcnNlIiwidXBkYXRlIiwicmVxdWlyZWQiLCJkZWxldGUiLCJhZGRDaGlsZCIsIm1vZGlmeUNoaWxkIiwiY2hpbGRJZCIsInJlbW92ZUNoaWxkIiwiYXV0aEZvciIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiayIsImF1dGgiXSwibWFwcGluZ3MiOiI7Ozs7O1FBRWdCQSxZLEdBQUFBLFk7O0FBRmhCOzs7Ozs7QUFFTyxTQUFTQSxZQUFULEdBQWlDO0FBQUEsTUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUN0QyxNQUFNQyxTQUFTO0FBQ2JDLFVBQU07QUFDSkMsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiO0FBREY7QUFEQSxPQUROO0FBTUpDLFlBQU07QUFDSkMsZ0JBQVEsS0FESjtBQUVKQyxjQUFNLFdBRkY7QUFHSkMsZ0JBQVE7QUFISjtBQU5GLEtBRE87QUFhYkMsWUFBUTtBQUNOSixZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxTQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFEQSxLQWJLO0FBb0JiRSxrQkFBYztBQUNaQyxjQUFRLElBREk7QUFFWlgsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiO0FBREY7QUFEQSxPQUZFO0FBT1pDLFlBQU07QUFDSkMsZ0JBQVEsS0FESjtBQUVKQyxjQUFNLG1CQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFQTSxLQXBCRDtBQWlDYkksV0FBTztBQUNMUCxZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxFQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFERCxLQWpDTTtBQXdDYkssWUFBUTtBQUNOYixnQkFBVTtBQUNSYyxpQkFBUztBQURELE9BREo7QUFJTlQsWUFBTTtBQUNKQyxnQkFBUSxNQURKO0FBRUpDLGNBQU0sRUFGRjtBQUdKQyxnQkFBUTtBQUNOTSxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBSkEsS0F4Q0s7QUFvRGJDLFlBQVE7QUFDTmpCLGdCQUFVO0FBQ1JjLGlCQUFTLElBREQ7QUFFUmIsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYyxRQUF2QjtBQURGO0FBRkEsT0FESjtBQU9OYixZQUFNO0FBQ0pDLGdCQUFRLE9BREo7QUFFSkMsY0FBTSxXQUZGO0FBR0pDLGdCQUFRO0FBQ05NLG1CQUFTLEVBQUVDLFFBQVEsTUFBVixFQUFrQkMsT0FBTyxJQUF6QjtBQURIO0FBSEo7QUFQQSxLQXBESztBQW1FYkcsWUFBUTtBQUNObkIsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYyxRQUF2QjtBQURGO0FBREEsT0FESjtBQU1OYixZQUFNO0FBQ0pDLGdCQUFRLFFBREo7QUFFSkMsY0FBTSxXQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFOQSxLQW5FSztBQStFYlksY0FBVTtBQUNSVCxjQUFRLElBREE7QUFFUlgsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYyxRQUF2QjtBQURGO0FBREEsT0FGRjtBQU9SYixZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxtQkFGRjtBQUdKQyxnQkFBUTtBQUNOTSxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBUEUsS0EvRUc7QUE4RmJLLGlCQUFhO0FBQ1hWLGNBQVEsSUFERztBQUVYWCxnQkFBVTtBQUNSQyxnQkFBUTtBQUNOQyxrQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJjLFFBQXZCLEVBREY7QUFFTkksbUJBQVMsY0FBSW5CLE1BQUosR0FBYWUsUUFBYjtBQUZIO0FBREEsT0FGQztBQVFYYixZQUFNO0FBQ0pDLGdCQUFRLE9BREo7QUFFSkMsY0FBTSw2QkFGRjtBQUdKQyxnQkFBUTtBQUNOTSxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBUkssS0E5RkE7QUE4R2JPLGlCQUFhO0FBQ1haLGNBQVEsSUFERztBQUVYWCxnQkFBVTtBQUNSQyxnQkFBUTtBQUNOQyxrQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJjLFFBQXZCLEVBREY7QUFFTkksbUJBQVMsY0FBSW5CLE1BQUosR0FBYWUsUUFBYjtBQUZIO0FBREEsT0FGQztBQVFYYixZQUFNO0FBQ0pDLGdCQUFRLFFBREo7QUFFSkMsY0FBTSw2QkFGRjtBQUdKQyxnQkFBUTtBQUhKO0FBUks7QUE5R0EsR0FBZjs7QUE4SEEsTUFBSVgsS0FBSzJCLE9BQVQsRUFBa0I7QUFDaEJDLFdBQU9DLElBQVAsQ0FBWTdCLEtBQUsyQixPQUFqQixFQUEwQkcsT0FBMUIsQ0FBa0MsVUFBQ0MsQ0FBRCxFQUFPO0FBQ3ZDOUIsYUFBTzhCLENBQVAsRUFBVXZCLElBQVYsQ0FBZUcsTUFBZixDQUFzQnFCLElBQXRCLEdBQTZCaEMsS0FBSzJCLE9BQUwsQ0FBYUksQ0FBYixDQUE3QjtBQUNELEtBRkQ7QUFHRDs7QUFFRCxTQUFPOUIsTUFBUDtBQUNEIiwiZmlsZSI6ImJhc2VSb3V0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb3V0ZXMob3B0cyA9IHt9KSB7XG4gIGNvbnN0IHJldFZhbCA9IHtcbiAgICByZWFkOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzY2hlbWE6IHtcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0aDogJy9zY2hlbWEnLFxuICAgICAgICBjb25maWc6IHt9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGxpc3RDaGlsZHJlbjoge1xuICAgICAgcGx1cmFsOiB0cnVlLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBxdWVyeToge1xuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjcmVhdGU6IHtcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBheWxvYWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0aDogJycsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdXBkYXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXlsb2FkOiB0cnVlLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVsZXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICBjb25maWc6IHt9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGFkZENoaWxkOiB7XG4gICAgICBwbHVyYWw6IHRydWUsXG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgbW9kaWZ5Q2hpbGQ6IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgIGNoaWxkSWQ6IEpvaS5udW1iZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9L3tmaWVsZH0ve2NoaWxkSWR9JyxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgcGF5bG9hZDogeyBvdXRwdXQ6ICdkYXRhJywgcGFyc2U6IHRydWUgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZW1vdmVDaGlsZDoge1xuICAgICAgcGx1cmFsOiB0cnVlLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgICAgY2hpbGRJZDogSm9pLm51bWJlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9L3tmaWVsZH0ve2NoaWxkSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBpZiAob3B0cy5hdXRoRm9yKSB7XG4gICAgT2JqZWN0LmtleXMob3B0cy5hdXRoRm9yKS5mb3JFYWNoKChrKSA9PiB7XG4gICAgICByZXRWYWxba10uaGFwaS5jb25maWcuYXV0aCA9IG9wdHMuYXV0aEZvcltrXTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXRWYWw7XG59XG4iXX0=
