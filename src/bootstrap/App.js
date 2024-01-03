const http = require('node:http');
const Koa = require('koa');
const globalMiddlewares = require('./globalMiddlewares');
const routing = require('./routing');

class App {
  constructor(config, logger) {
    this.logger = logger;
    this.config = config;
    this.debugMode = [ 'dev', 'local' ].includes(config.NODE_ENV);
  }

  async init() {
    // all third-party services should be added here
    // this.serviceApi = new ServiceApiInstance();

    this.koaServer = this.initMiddlewaresAndRoutes();
    this.httpServer = await this.initHttpServer(this.config.PORT, this.koaServer.callback());
    this.logger.info(`HTTP server started on port ${this.config.PORT}`);
  }

  initMiddlewaresAndRoutes() {
    const koa = new Koa();

    globalMiddlewares.init(koa, this);
    routing.init(koa, this);

    return koa;
  }

  initHttpServer(port, koaCallback) {
    const httpServer = http.createServer((req, res) => {
      return koaCallback(req, res);
    });

    return new Promise((resolve) => {
      httpServer.listen(port, resolve);
    }).then(() => httpServer);
  }

  isDebug() {
    return this.debugMode;
  }

  async gracefulShutdown() {
    this.logger.info('Stopping Http server')
    await this.httpServer.close();
    this.logger.info('Http server closed')
  }
}

module.exports = App;
