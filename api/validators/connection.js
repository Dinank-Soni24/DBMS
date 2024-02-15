const Joi = require('joi');

// Define validation schemas
const connectionSchema = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    database: Joi.string().valid('mysql', 'postgres').required(),
    connectionUrl: Joi.string().uri().required()
  }),
};

const listConnection = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({}),
};

module.exports = {
  connectionSchema,
  listConnection,
};
