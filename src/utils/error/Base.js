'use strict';

class BaseError extends Error {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }

  serialize() {
    throw new Error(`Should implement serialize method for ${this.name} error`);
  }
}

module.exports = BaseError;
