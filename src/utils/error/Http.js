const BaseError = require('./Base');
const httpCodes = require('../../constants/httpStatusCodes');

class HttpError extends BaseError {
  constructor(props) {
    super(props);
    this.status = props.status;
    this.code = props.code;
    this.reason = props.reason;
  }

  getHttpCodes() {
    return httpCodes;
  }
}

module.exports = HttpError;