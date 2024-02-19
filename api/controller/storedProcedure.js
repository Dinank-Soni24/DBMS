const { v4: uuidv4 } = require('uuid');
const { connectionUrl } = require('../helper/connection');

const saveQuery = async (req, res) => {
  // Extract the required data from the request body
  const { id, name, query, columns } = req.body;

  try {
    // Convert columns array to string
    const columnString =
      columns
        ?.map((column) => `${column.method} ${column.name} ${column.type}`)
        .join(',\n    ') || '';

    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    const procedureQuery =
      connection.database === 'postgres'
        ? `CREATE OR REPLACE PROCEDURE ${schema}.${name}(${columnString})
          LANGUAGE plpgsql
          AS $$
          BEGIN
            ${query}
          END
          $$;`
        : `
          CREATE PROCEDURE ${schema}.${name}(${columnString})
          BEGIN
              ${query}
          END`;

    console.log('procedureQuery', procedureQuery);
    // Construct and execute the query to insert into the specified table
    await connection.client.query(`${procedureQuery}`);

    // Close the client connection after the operation is complete
    await connection.client.end();

    // Log and return a success message
    console.log('Record inserted successfully.');
    return res.status(200).json({
      message: 'Record inserted successfully.',
    });
  } catch (err) {
    // Log any errors that occur during the insertion process
    console.error('Error inserting record:', err);
    return res.status(400).json({
      message: 'Error inserting record',
      error: err,
    });
  }
};

const executeQuery = async (req, res) => {
  // Extract the required data from the request body
  const { id, name, values } = req.body;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    const convertedString = values
      .map((value) => (typeof value === 'string' ? `'${value}'` : value))
      .join(', ');

    // Construct and execute the query to call the stored procedure
    const data = await connection.client.query(
      `CALL ${schema}.${name}(${convertedString})`
    );

    // Close the client connection after the operation is complete
    await connection.client.end();

    // Log and return a success message
    console.log('query executed successfully.');
    return res.status(200).json({
      message: 'query executed successfully.',
      data: connection.database === 'postgres' ? undefined : data[0][0],
    });
  } catch (err) {
    // Log any errors that occur during the insertion process
    console.error('Error executed query:', err);
    return res.status(400).json({
      message: 'Error query executed query',
      error: err,
    });
  }
};

const listQuery = async (req, res) => {
  // Get the ID from the request body
  const { id } = req.query;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.query.schema
        : connection.databaseName;

    const query =
      connection.database === 'postgres'
        ? `SELECT
              p.proname AS function_name,
              pg_get_function_result(p.oid) AS return_type,
              pg_catalog.pg_get_function_arguments(p.oid) AS parameters,
              p.pronargs
          FROM
              pg_catalog.pg_proc p
          JOIN
              pg_catalog.pg_namespace n ON n.oid = p.pronamespace
          WHERE
              n.nspname = '${schema}' and p.prokind = 'p';`
        : `SELECT
              r.SPECIFIC_NAME,
              p.ORDINAL_POSITION,
              p.PARAMETER_MODE,
              p.PARAMETER_NAME,
              p.DTD_IDENTIFIER
          FROM
              INFORMATION_SCHEMA.ROUTINES as r
          left JOIN
              INFORMATION_SCHEMA.PARAMETERS as p ON r.SPECIFIC_NAME = p.SPECIFIC_NAME
          WHERE
              r.ROUTINE_SCHEMA = '${schema}'
              or p.SPECIFIC_SCHEMA = '${schema}';`;

    // Construct and execute the query to get all stored procedures
    const data = await connection.client.query(query);

    // Close the client connection after the operation is complete
    await connection.client.end();

    // Log and return a success message
    console.log('query executed successfully.');
    return res.status(200).json({
      message: 'query executed successfully.',
      data: connection.database === 'postgres' ? data.rows : data[0],
    });
  } catch (err) {
    // Log any errors that occur during the insertion process
    console.error('Error executed query:', err);
    return res.status(400).json({
      message: 'Error query executed query',
      error: err,
    });
  }
};

module.exports = {
  saveQuery,
  executeQuery,
  listQuery,
};
