/* eslint-disable no-undef */
const createApp = require('./createTestApp');

let app;

beforeAll(async () => {
  app = await createApp();
  global.app = app;
  global.server = app.httpServer;
});

afterAll(async () => {
  await app.gracefulShutdown();
  global.app = undefined;
  global.server = undefined;
});
