const Joi = require('joi');

const pick = require('../utils/pick');
const apiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  // Pick only the part of the schema that matches the array of keys
  const validSchema = pick(schema, ['params', 'query', 'body']);

  // Pick only the part of the request that matches the valid schema keys
  const object = pick(req, Object.keys(validSchema));

  // Compile and validate the request
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  // If there is an error, return the error
  if (error) {
    const errorMessage = error.details
      .map((details) => details.message.replace(/"/g, ''))
      .join(', ');

    return next(new apiError(400, errorMessage));
  }

  Object.assign(req, value);
  next();
};

module.exports = validate;
