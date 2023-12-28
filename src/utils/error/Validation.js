const HttpError = require('./Http');

class ValidationError extends HttpError {
  constructor(props) {
    super(props);
    this.status = this.getHttpCodes().BAD_REQUEST;
    this.code = 'BAD_REQUEST';
  }

}

module.exports = ValidationError;