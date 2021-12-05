class HttpError extends Error {
  constructor(statusCode, error, message) {
    super(message);
    this.error = error;
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = {
  HttpError,
};
