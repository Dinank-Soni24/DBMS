/**
 * An aggregated api error handler
 */
class ApiError extends Error {
  /**
   * used for api error processing
   * @param statusCode the status code
   * @param message the error message to end user
   * @param isOperational is the unhandled error or not
   * @param stack error stack
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    // Call Error constructor
    super(message);
    this.statusCode = statusCode; // set the status code
    this.isOperational = isOperational; // set the handle or unhandle error status
    // Get and set the error stack
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;