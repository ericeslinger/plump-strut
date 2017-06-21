const gulp = require('gulp');
const plump = require('plump');

function run(done) {
  const strut = require('../../dist/server');
  const srv = new strut.StrutServer(new plump.Plump(), null, {
    apiProtocol: 'http',
    apiRoot: '/api',
    apiPort: 4000,
    authRoot: '/auth',
  });
  srv.initialize().then(() => srv.start());
}

gulp.task('run', gulp.series('clean', 'build', run));
