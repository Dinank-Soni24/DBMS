const Joi = require('joi');

const tableName = {
  id: Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.base': `The id should be a type of 'text'!`,
    'string.empty': `The id cannot be an empty field.`,
    'any.required': `The id is a required field.`,
  }),
  schema: Joi.string().default('public').messages({
    'string.base': `The schema should be a type of 'text'!`,
  }),
  tableName: Joi.string().required(),
};

const conditionCol = {
  conditionColumn: Joi.string().required(),
  conditionValue: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.boolean())
    .required(),
};

// Define validation schemas
const insert = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    ...tableName,
    columnName: Joi.array().items(Joi.string().required()).min(1).required(),
    values: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.number().integer().required(),
          Joi.string().required(),
          Joi.boolean().required()
        )
      )
      .min(1)
      .required()
      .length(Joi.ref('columnName.length'))
      .messages({
        'array.base': `Both 'columnName' and 'values' should be arrays.`,
        'array.min': `Both 'columnName' and 'values' should have at least one item.`,
        'array.length': `The lengths of 'columnName' and 'values' should match.`,
      }),
  }),
};

const update = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    ...tableName,
    column: Joi.array().items(Joi.string().required()).min(1).required(),
    newValue: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.number().integer().required(),
          Joi.string().required(),
          Joi.boolean().required()
        )
      )
      .min(1)
      .required()
      .length(Joi.ref('column.length'))
      .messages({
        'array.base': `Both 'column' and 'newValue' should be arrays.`,
        'array.min': `Both 'column' and 'newValue' should have at least one item.`,
        'array.length': `The lengths of 'column' and 'newValue' should match.`,
      }),
    ...conditionCol,
  }),
};

const deleteRow = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    ...tableName,
    ...conditionCol,
  }),
};

const listRow = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({ ...tableName }),
  body: Joi.object().keys({}),
};

module.exports = {
  insert,
  update,
  deleteRow,
  listRow,
};
