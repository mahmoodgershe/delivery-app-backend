module.exports = class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.statusCode = 400;
    this.errors = errors;
  }
};
