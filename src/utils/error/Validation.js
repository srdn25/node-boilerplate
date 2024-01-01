const HttpError = require('./Http');

class ValidationError extends HttpError {
  constructor(props) {
    super(props);
    this.status = this.getHttpCodes().BAD_REQUEST;
    this.code = 'BAD_REQUEST';
    this.errors = props.errors;
  }

  serialize() {
    return JSON.stringify({
      type: this.name,
      status: this.status,
      code: this.code,
      errors: JSON.stringify(this.errors),
    });
  }
}

module.exports = ValidationError;