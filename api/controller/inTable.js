const { connectionUrl } = require('../helper/connection');

const insertTable = async (req, res) => {
  // Extract the required data from the request body
  const { id, tableName, values, columnName } = req.body;

  try {
    // Format the column names for the query
    const colName = columnName.map((column) => `${column}`).join(', ');

    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    const query =
      connection.database === 'postgres'
        ? `${values.map((_, index) => '$' + (index + 1)).join(',')}`
        : `${values.map((_) => '?').join(',')}`;

    // Construct and execute the query to insert into the specified table
    await connection.client.query(
      `INSERT INTO ${schema}.${tableName}(${colName}) VALUES(${query})`,
      values
    );

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

const updateTable = async (req, res) => {
  // Destructure request body
  const { id, tableName, column, conditionValue, newValue, conditionColumn } =
    req.body;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    // Format the column names for the query
    const updateCol =
      connection.database === 'postgres'
        ? column.map((col, index) => `${col} = $${index + 1}`).join(', ')
        : column.map((col) => `${col} = ?`).join(', ');

    // Format the condition value for the query
    const whereValue =
      connection.database === 'postgres' ? `$${column.length + 1}` : '?';

    // Construct and execute the update query
    const updateQuery = `
      UPDATE ${schema}.${tableName}
      SET ${updateCol}, updated_at = NOW()
      WHERE ${conditionColumn} = ${whereValue}
    `;

    // Format the new value for the query
    const values = [...newValue, conditionValue];

    // Execute the update query
    await connection.client.query(updateQuery, values);

    // Close the client connection after the operation is complete
    await connection.client.end();

    // Log success and send response
    console.log('Record updated successfully.');
    return res.status(200).json({
      message: 'Record updated successfully.',
    });
  } catch (err) {
    // Log and handle any errors
    console.error('Error updating record:', err);
    return res.status(400).json({
      message: 'Error updating record',
      error: err,
    });
  }
};

const deleteTable = async (req, res) => {
  // Destructure connectionUrl, tableName, conditionValue, and conditionColumn from request body
  const { id, tableName, conditionValue, conditionColumn } = req.body;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    // Execute a query to delete records from the specified table based on the given condition
    await connection.client.query(
      `DELETE FROM ${schema}.${tableName} WHERE ${conditionColumn} = ${
        connection.database === 'postgres' ? `$1` : '?'
      };`,
      [conditionValue]
    );

    // Close the client connection after the operation is complete
    await connection.client.end();

    console.log('Record deleted successfully.');
    // Return a success message in JSON format
    return res.status(200).json({
      message: 'Record deleted successfully.',
    });
  } catch (err) {
    // Log any errors that occur during the deletion process
    console.error('Error deleting record:', err);
    return res.status(400).json({
      message: 'Error deleting record',
      error: err,
    });
  }
};

const listTableRow = async (req, res) => {
  // Destructure connectionUrl, tableName, conditionValue, and conditionColumn from request body
  const { id, tableName } = req.query;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.query.schema
        : connection.databaseName;

    // Execute a query to list records from the specified table
    const data = await connection.client.query(
      `SELECT * FROM ${schema}.${tableName};`
    );

    // Close the client connection after the operation is complete
    await connection.client.end();

    // Log success and send response
    console.log('List table record successfully.');
    return res.status(200).json({
      table: connection.database === 'postgres' ? data.rows : data[0],
    });

  } catch (err) {
    // Log any errors that occur during the deletion process
    console.error('Error list table record:', err);
    return res.status(400).json({
      message: 'Error list table record',
      error: err,
    });
  }
};

module.exports = {
  insertTable,
  updateTable,
  deleteTable,
  listTableRow,
};
