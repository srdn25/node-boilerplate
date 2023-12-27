const App = require('./bootstrap/App');

async function startApp(config) {
  const app = new App(config);

  return app;
}

module.exports = startApp;