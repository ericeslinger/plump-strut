import { StrutServer } from '../dataTypes';
import {
  SocketEventHandler,
  ResponseEnvelope,
  Response,
  SocketDispatch,
} from './dataTypes';
import * as SocketIO from 'socket.io';

// note: the connect events are server-level things
// fired when a socket connects, whereas the rest
// are in response to specific socket emissions.

export function respond(c: SocketIO.Socket, s: StrutServer) {
  return (r: ResponseEnvelope) => {
    if (r.broadcast === true) {
      return s.services.io.emit(r.key, r.msg);
    } else if (r.broadcast && typeof r.broadcast === 'string') {
      return s.services.io.to(r.broadcast).emit(r.key, r.msg);
    } else {
      return c.emit(r.key, r.msg);
    }
  };
}

export function dispatch(d: SocketDispatch, s: StrutServer) {
  s.services.io.on('connect', (c: SocketIO.Socket) => {
    return Promise.resolve()
      .then(() => {
        if (d.connect) {
          return d
            .connect(
              {
                request: 'connect',
                client: c,
              },
              s,
            )
            .then(respond(c, s));
        }
      })
      .then(() => {
        Object.keys(d).forEach(key => {
          if (key !== 'connect') {
            const h: SocketEventHandler = d[key];
            c.on(key, m => {
              const msg = Object.assign({}, m, { client: c });
              h(msg, s)
                .then(respond(c, s))
                .catch(e => console.log(e));
            });
          }
        });
      });
  });
}
