const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(process.cwd(), '.test.env')});

const configLoader = require('../src/configLoader');
const App = require('../src/bootstrap/App');

const config = configLoader();

module.exports = async function() {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };
  const app = new App(config, logger);

  await app.init();

  return app;
};
