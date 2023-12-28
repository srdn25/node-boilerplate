'use strict';

class BaseError extends Error {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }
}

module.exports = BaseError;
