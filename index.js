const configLoader = require('./src/configLoader');
const startApp = require('./src/app');

function logError(error = {}) {
  const { stack, message } = error;
  const msg = stack || message;
  process.stdout.write(`{ "message": "Error on start web server", "error": "${msg}" }\n`);
}

async function main() {
  const config = configLoader();
  const app = await startApp(config);
  app.logger.info('Web server is started');
}

main().catch(logError);
