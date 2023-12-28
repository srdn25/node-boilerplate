const pino = require('pino');

const createLogger = (options = {}) => pino(options);

module.exports = createLogger;