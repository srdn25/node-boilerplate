const MAX_LENGTH_ENDPOINT = 50;

function httpLogger(app, ctx) {
  let level = 'debug';
  level = ctx.status >= 400 ? 'error' : level;

  const routerPath = getRouterPathForMessage(ctx);
  app.logger[level]({
    message: `HTTP [${ctx.method}] ${routerPath} ${ctx.status}`,
    status: ctx.status,
    ...app.isDebug() ? { response: ctx.body } : {},
  });
}

function errorHandler(app, ctx, error) {
  ctx.status = error.status || 500;
  ctx.body = error.message || { error: 'Internal Server Error' };

  const message = error.message || JSON.stringify(error, (key, value) => {
    if (key !== 'stack') {
      return value
    }
  });

  const routerPath = getRouterPathForMessage(ctx);
  app.logger.error({
    message: `HTTP error [${ctx.method}] ${routerPath} ${ctx.status}: ${message}`,
    status: ctx.status,
    body: ctx.request?.body,
    error,
  });
}

function getRouterPathForMessage(ctx) {
  if (ctx.originalUrl.length < MAX_LENGTH_ENDPOINT) {
    return ctx.originalUrl;
  }
  return `${ctx.originalUrl.substring(0, MAX_LENGTH_ENDPOINT)}...`;
}

module.exports = ({ app }) => {
  // used bind for avoid to add "app" as param to next call in then
  // this is more clear code
  const logRequest = httpLogger.bind(null, app);
  const handleError = errorHandler.bind(null, app);
  return function koaErrorHandler(ctx, next) {
    return next().then(() => logRequest(ctx), (error) => handleError(ctx, error));
  };
}
