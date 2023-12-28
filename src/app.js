const App = require('./bootstrap/App');
const logger = require('./utils/logger');

async function startApp(config) {
  const loggerOptions = {};

  const app = new App(config, logger(loggerOptions));

  await app.init();

  return app;
}

module.exports = startApp;