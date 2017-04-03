
// import { ITest } from 'mocha';
// The typings for it don't include the timeout() function. GRRRR.
// declare module 'mocha' {
//   interface IRunnable {
//     timeout(n: number): this;
//   }
// }

import { IPromise } from 'hapi';

declare module 'hapi' {
  interface Server {
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }, callback: (err: any) => void): void;
    register(plugins: any | any[], options: {
        select?: string | string[];
        routes?: {
            prefix: string; vhost?: string | string[]
        };
    }): IPromise<any>;
  }
}
