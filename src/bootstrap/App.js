const globalMiddlewares = require('./globalMiddlewares');

class App {
  constructor(config, logger) {
    this.logger = logger;
    this.config = config;
    this.debugMode = [ 'dev', 'local' ].includes(config.NODE_ENV);
  }

  async init() {
    // all third-party services should be added here
    // this.serviceApi = new ServiceApiInstance();

    this.koaServer = await this.initMiddlewaresAndRoutes();
    this.httpServer = await this.initHttpServer(this.config.PORT, this.koaServer.callback());
    this.logger.info(`HTTP server started on port ${this.config.PORT}`);
  }

  async initMiddlewaresAndRoutes() {
    const koa = new Koa();

    globalMiddlewares.init(koa, this);

    return koa;
  }

  async initHttpServer(port, koaCallback) {
    const httpServer = http.createServer((req, res) => {
      return koaCallback(req, res);
    });

    return new Promise((resolve) => {
      httpServer.listen(port, resolve);
    }).then(() => httpServer);
  };

  isDebug() {
    return this.debugMode;
  }
}

module.exports = App;
