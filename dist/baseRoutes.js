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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2VSb3V0ZXMuanMiXSwibmFtZXMiOlsiY3JlYXRlUm91dGVzIiwib3B0cyIsInJldFZhbCIsInJlYWQiLCJ2YWxpZGF0ZSIsInBhcmFtcyIsIml0ZW1JZCIsIm51bWJlciIsImludGVnZXIiLCJoYXBpIiwibWV0aG9kIiwicGF0aCIsImNvbmZpZyIsImxpc3RDaGlsZHJlbiIsInBsdXJhbCIsInF1ZXJ5IiwiY3JlYXRlIiwicGF5bG9hZCIsIm91dHB1dCIsInBhcnNlIiwidXBkYXRlIiwicmVxdWlyZWQiLCJkZWxldGUiLCJhZGRDaGlsZCIsIm1vZGlmeUNoaWxkIiwiY2hpbGRJZCIsInJlbW92ZUNoaWxkIiwiYXV0aEZvciIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiayIsImF1dGgiXSwibWFwcGluZ3MiOiI7Ozs7O1FBRWdCQSxZLEdBQUFBLFk7O0FBRmhCOzs7Ozs7QUFFTyxTQUFTQSxZQUFULEdBQWlDO0FBQUEsTUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUN0QyxNQUFNQyxTQUFTO0FBQ2JDLFVBQU07QUFDSkMsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiO0FBREY7QUFEQSxPQUROO0FBTUpDLFlBQU07QUFDSkMsZ0JBQVEsS0FESjtBQUVKQyxjQUFNLFdBRkY7QUFHSkMsZ0JBQVE7QUFISjtBQU5GLEtBRE87QUFhYkMsa0JBQWM7QUFDWkMsY0FBUSxJQURJO0FBRVpWLGdCQUFVO0FBQ1JDLGdCQUFRO0FBQ05DLGtCQUFRLGNBQUlDLE1BQUosR0FBYUMsT0FBYjtBQURGO0FBREEsT0FGRTtBQU9aQyxZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxtQkFGRjtBQUdKQyxnQkFBUTtBQUhKO0FBUE0sS0FiRDtBQTBCYkcsV0FBTztBQUNMTixZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxFQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFERCxLQTFCTTtBQWlDYkksWUFBUTtBQUNOWixnQkFBVTtBQUNSYSxpQkFBUztBQURELE9BREo7QUFJTlIsWUFBTTtBQUNKQyxnQkFBUSxNQURKO0FBRUpDLGNBQU0sRUFGRjtBQUdKQyxnQkFBUTtBQUNOSyxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBSkEsS0FqQ0s7QUE2Q2JDLFlBQVE7QUFDTmhCLGdCQUFVO0FBQ1JhLGlCQUFTLElBREQ7QUFFUlosZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYSxRQUF2QjtBQURGO0FBRkEsT0FESjtBQU9OWixZQUFNO0FBQ0pDLGdCQUFRLE9BREo7QUFFSkMsY0FBTSxXQUZGO0FBR0pDLGdCQUFRO0FBQ05LLG1CQUFTLEVBQUVDLFFBQVEsTUFBVixFQUFrQkMsT0FBTyxJQUF6QjtBQURIO0FBSEo7QUFQQSxLQTdDSztBQTREYkcsWUFBUTtBQUNObEIsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYSxRQUF2QjtBQURGO0FBREEsT0FESjtBQU1OWixZQUFNO0FBQ0pDLGdCQUFRLFFBREo7QUFFSkMsY0FBTSxXQUZGO0FBR0pDLGdCQUFRO0FBSEo7QUFOQSxLQTVESztBQXdFYlcsY0FBVTtBQUNSVCxjQUFRLElBREE7QUFFUlYsZ0JBQVU7QUFDUkMsZ0JBQVE7QUFDTkMsa0JBQVEsY0FBSUMsTUFBSixHQUFhQyxPQUFiLEdBQXVCYSxRQUF2QjtBQURGO0FBREEsT0FGRjtBQU9SWixZQUFNO0FBQ0pDLGdCQUFRLEtBREo7QUFFSkMsY0FBTSxtQkFGRjtBQUdKQyxnQkFBUTtBQUNOSyxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBUEUsS0F4RUc7QUF1RmJLLGlCQUFhO0FBQ1hWLGNBQVEsSUFERztBQUVYVixnQkFBVTtBQUNSQyxnQkFBUTtBQUNOQyxrQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJhLFFBQXZCLEVBREY7QUFFTkksbUJBQVMsY0FBSWxCLE1BQUosR0FBYWMsUUFBYjtBQUZIO0FBREEsT0FGQztBQVFYWixZQUFNO0FBQ0pDLGdCQUFRLE9BREo7QUFFSkMsY0FBTSw2QkFGRjtBQUdKQyxnQkFBUTtBQUNOSyxtQkFBUyxFQUFFQyxRQUFRLE1BQVYsRUFBa0JDLE9BQU8sSUFBekI7QUFESDtBQUhKO0FBUkssS0F2RkE7QUF1R2JPLGlCQUFhO0FBQ1haLGNBQVEsSUFERztBQUVYVixnQkFBVTtBQUNSQyxnQkFBUTtBQUNOQyxrQkFBUSxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsR0FBdUJhLFFBQXZCLEVBREY7QUFFTkksbUJBQVMsY0FBSWxCLE1BQUosR0FBYWMsUUFBYjtBQUZIO0FBREEsT0FGQztBQVFYWixZQUFNO0FBQ0pDLGdCQUFRLFFBREo7QUFFSkMsY0FBTSw2QkFGRjtBQUdKQyxnQkFBUTtBQUhKO0FBUks7QUF2R0EsR0FBZjs7QUF1SEEsTUFBSVgsS0FBSzBCLE9BQVQsRUFBa0I7QUFDaEJDLFdBQU9DLElBQVAsQ0FBWTVCLEtBQUswQixPQUFqQixFQUEwQkcsT0FBMUIsQ0FBa0MsVUFBQ0MsQ0FBRCxFQUFPO0FBQ3ZDN0IsYUFBTzZCLENBQVAsRUFBVXRCLElBQVYsQ0FBZUcsTUFBZixDQUFzQm9CLElBQXRCLEdBQTZCL0IsS0FBSzBCLE9BQUwsQ0FBYUksQ0FBYixDQUE3QjtBQUNELEtBRkQ7QUFHRDs7QUFFRCxTQUFPN0IsTUFBUDtBQUNEIiwiZmlsZSI6ImJhc2VSb3V0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb3V0ZXMob3B0cyA9IHt9KSB7XG4gIGNvbnN0IHJldFZhbCA9IHtcbiAgICByZWFkOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaXN0Q2hpbGRyZW46IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0ve2ZpZWxkfScsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcXVlcnk6IHtcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgcGF0aDogJycsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3JlYXRlOiB7XG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXlsb2FkOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHVwZGF0ZToge1xuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGF5bG9hZDogdHJ1ZSxcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIHBhdGg6ICcve2l0ZW1JZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlbGV0ZToge1xuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9JyxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhZGRDaGlsZDoge1xuICAgICAgcGx1cmFsOiB0cnVlLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgaXRlbUlkOiBKb2kubnVtYmVyKCkuaW50ZWdlcigpLnJlcXVpcmVkKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaGFwaToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBwYXRoOiAnL3tpdGVtSWR9L3tmaWVsZH0nLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBwYXlsb2FkOiB7IG91dHB1dDogJ2RhdGEnLCBwYXJzZTogdHJ1ZSB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1vZGlmeUNoaWxkOiB7XG4gICAgICBwbHVyYWw6IHRydWUsXG4gICAgICB2YWxpZGF0ZToge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBpdGVtSWQ6IEpvaS5udW1iZXIoKS5pbnRlZ2VyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgICBjaGlsZElkOiBKb2kubnVtYmVyKCkucmVxdWlyZWQoKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBoYXBpOiB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIHBheWxvYWQ6IHsgb3V0cHV0OiAnZGF0YScsIHBhcnNlOiB0cnVlIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVtb3ZlQ2hpbGQ6IHtcbiAgICAgIHBsdXJhbDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGl0ZW1JZDogSm9pLm51bWJlcigpLmludGVnZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICAgIGNoaWxkSWQ6IEpvaS5udW1iZXIoKS5yZXF1aXJlZCgpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGhhcGk6IHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgcGF0aDogJy97aXRlbUlkfS97ZmllbGR9L3tjaGlsZElkfScsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG5cbiAgaWYgKG9wdHMuYXV0aEZvcikge1xuICAgIE9iamVjdC5rZXlzKG9wdHMuYXV0aEZvcikuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgcmV0VmFsW2tdLmhhcGkuY29uZmlnLmF1dGggPSBvcHRzLmF1dGhGb3Jba107XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmV0VmFsO1xufVxuIl19
