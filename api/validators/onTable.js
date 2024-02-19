const Joi = require('joi');

// Define validation schemas
const listTable = {
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

// Define a schema for the column details
const columnSchema = Joi.object({
  colName: Joi.string().required(),
  type: Joi.string().required(),
  key: Joi.string(),
});

// Define a schema for the foreign key details
const foreignKeySchema = Joi.object({
  name: Joi.string().required(),
  colName: Joi.string().required(),
  refTable: Joi.string().required(),
  refCol: Joi.string().required(),
});

// Define the main schema for the entire object
const createTable = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
    schema: Joi.string().default('public'),
    tableName: Joi.string().required(),
    columns: Joi.array().items(columnSchema).required(),
    foreignKey: Joi.array().items(foreignKeySchema),
  }),
};

const alterTable = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
    schema: Joi.string().default('public'),
    tableName: Joi.string().required(),
    method: Joi.string().valid('ADD', 'DROP', 'RENAME').required(),
    columnName: Joi.string().required(),
    columnType: Joi.string().when('method', {
      is: 'ADD',
      then: Joi.required(),
      otherwise: Joi.when('method', {
        is: 'DROP',
        then: Joi.string().default('').valid(''),
        otherwise: Joi.forbidden().messages({
          'any.unknown': `Column type is not allowed unless method is 'ADD' or 'DROP'!`,
        }),
      }),
    }),
    newColumnName: Joi.string().when('method', {
      is: 'RENAME',
      then: Joi.required(),
      otherwise: Joi.forbidden().messages({
        'any.unknown': `New column name is not allowed unless method is 'RENAME'!`,
      }),
    }),
    foreignKey: Joi.when('method', {
      is: 'RENAME',
      then: Joi.forbidden().messages({
        'any.unknown': `Foreign key is not allowed unless method is 'ADD' & 'DROP'!`,
      }),
      otherwise: Joi.array().items(foreignKeySchema),
    }),
    primaryKey: Joi.object({
      name: Joi.string().required(),
      colName: Joi.string().required(),
    }).when('method', {
      is: 'RENAME',
      then: Joi.forbidden().messages({
        'any.unknown': `Primary key is not allowed unless method is 'ADD' & 'DROP'!`,
      }),
      otherwise: Joi.optional(),
    }),
  }),
};

module.exports = {
  listTable,
  createTable,
  alterTable,
};
