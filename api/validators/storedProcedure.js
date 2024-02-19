const Joi = require('joi');

const tableName = {
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
  schema: Joi.string().default('public').required(),
  name: Joi.string().required(),
};

// Define validation schemas
const saveProcedure = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object({
    ...tableName,
    columns: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        method: Joi.string().valid('IN', 'OUT', 'INOUT').required(),
      })
    ),
    query: Joi.string().required(),
  }),
};

const executeProcedure = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    ...tableName,
    values: Joi.array().items(
      Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string(),
        Joi.boolean()
      )
    ),
  }),
};

const listProcedure = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required().messages({
      'string.base': `The id should be a type of 'text'!`,
      'string.empty': `The id cannot be an empty field.`,
      'any.required': `The id is a required field.`,
    }),
    schema: Joi.string().default('public').messages({
      'string.base': `The schema should be a type of 'text'!`,
    }),
  }),
  body: Joi.object().keys({}),
};

module.exports = {
  saveProcedure,
  executeProcedure,
  listProcedure,
};
