const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('../api/middleware/errorHandler');
const ValidationError = require('../utils/error/Validation');

function responseTime() {
  return function responseTime(ctx, next) {
    let start = ctx[Symbol.for('request-received.startAt')] ? ctx[Symbol.for('request-received.startAt')] : process.hrtime();
    return next().then(() => {
      let delta = process.hrtime(start);

      // Format to high resolution time with nano time
      delta = delta[0] * 1000 + delta[1] / 1000000;

      // truncate to milliseconds.
      delta = Math.round(delta);

      ctx.set('X-Response-Time', delta + 'ms');
    });
  };
}

function onBodyParserError(error) {
  if (error instanceof SyntaxError) {
    throw new ValidationError({
      message: 'Request body is not correct',
    });
  }
  throw error;
}

module.exports = {
  init(koaServer, app) {
    koaServer.use(responseTime());

    koaServer.use(errorHandler({ app }));

    koaServer.use(bodyParser({
      onerror: onBodyParserError,
    }));

    koaServer.use(cors({ credentials: true }));
  }
};
