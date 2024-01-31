const { Client } = require('pg');

const tableList = async (req, res) => {
  // Extract the connection URL from the request body
  const connectionUrl = req.body.connectionUrl;

  // Create a new client for the PostgreSQL database
  const client = new Client({
    connectionString: connectionUrl,
  });

  try {
    // Connect to the PostgreSQL database
    await client.connect();

    // Query to get list of tables in the 'public' schema
    const data = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );

    // Send the list of tables as a JSON response
    return res.status(200).json({
      table: data.rows,
    });
  } catch (err) {
    // Log and handle errors when fetching data from PostgreSQL
    console.error('Error fetching data from PostgreSQL:', err);
    return res.status(400).json({
      message: 'Error fetching data from PostgreSQL',
      error: err,
    });
  } finally {
    // Close the client connection after the operation is complete
    await client.end();
  }
};

const insertTable = async (req, res) => {
  // Extract the required data from the request body
  const { connectionUrl, tableName, values, columnName } = req.body;

  // Create a new PostgreSQL client using the provided connection URL
  const client = new Client({
    connectionString: connectionUrl,
  });

  try {
    // Format the column names for the query
    const colName = columnName.map((column) => `"${column}"`).join(', ');

    // Connect to the PostgreSQL database
    client.connect();

    // Construct and execute the query to insert into the specified table
    await client.query(
      `INSERT INTO public.${tableName}(${colName}) VALUES(${values
        .map((_, index) => '$' + (index + 1))
        .join(',')}) RETURNING *`,
      values
    );

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
  } finally {
    // Ensure the client is properly closed regardless of the outcome
    await client.end();
  }
};

const updateTable = async (req, res) => {
  // Destructure request body
  const {
    connectionUrl,
    tableName,
    column,
    conditionValue,
    newValue,
    conditionColumn,
  } = req.body;

  // Create a new client using the connection URL
  const client = new Client({
    connectionString: connectionUrl,
  });

  try {
    // Connect to the PostgreSQL database
    client.connect();

    // Construct and execute the update query
    const updateQuery = `
      UPDATE public.${tableName}
      SET ${column} = $1
      WHERE ${conditionColumn} = $2
    `;
    await client.query(updateQuery, [newValue, conditionValue]);

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
  } finally {
    // Close the database connection
    await client.end();
  }
};

const deleteTable = async (req, res) => {
  // Destructure connectionUrl, tableName, conditionValue, and conditionColumn from request body
  const { connectionUrl, tableName, conditionValue, conditionColumn } =
    req.body;

  // Create a new PostgreSQL client using the connectionUrl
  const client = new Client({
    connectionString: connectionUrl,
  });

  try {
    // Connect to the PostgreSQL database
    client.connect();

    // Execute a query to delete records from the specified table based on the given condition
    await client.query(
      `DELETE FROM ${tableName} WHERE ${conditionColumn} = $1`,
      [conditionValue]
    );
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
  } finally {
    // Ensure the client connection is closed, regardless of success or failure
    await client.end();
  }
}; 

const createTable = async (req, res) => {
  // Extract connectionUrl, tableName, and columns from request body
  const { connectionUrl, tableName, columns } = req.body;

  // Create a new PostgreSQL client using the provided connection URL
  const client = new Client({
    connectionString: connectionUrl,
  });

  try {
    // Generate the column string in query format
    const columnString = await columns
      .map((column) => {
        let columnDef = `${column.colName} ${column.type}`;
        if (column.key) {
          columnDef += ` ${column.key}`;
        }
        return columnDef;
      })
      .join(', ');

    // Connect to the PostgreSQL database
    client.connect();

    // Execute a query to create the table using the generated column string
    await client.query(`CREATE TABLE ${tableName} (${columnString})`);
    console.log('Table created successfully.');

    // Send a success response with a message
    return res.status(200).json({
      message: 'Table created successfully.',
    });
  } catch (err) {
    // Log any errors that occur during table creation
    console.error('Error creating table:', err);
    return res.status(400).json({
      message: 'Error creating table',
      error: err,
    });
  } finally {
    // Ensure the client connection is closed, regardless of success or failure
    await client.end();
  }
};

const alterTable = async (req, res) => {
  // Extract relevant data from request body
  const {
    connectionUrl,
    tableName,
    method,
    columnName,
    columnType,
    newColumnName,
  } = req.body;

  // Create a new PostgreSQL client
  const client = new Client({
    connectionString: connectionUrl,
  });

  // Construct the appropriate query based on the method
  const query =
    method === 'RENAME'
      ? `ALTER TABLE ${tableName} ${method} COLUMN ${columnName} to ${newColumnName}`
      : `ALTER TABLE ${tableName} ${method} COLUMN ${columnName} ${columnType}`;

  try {
    // Connect to the PostgreSQL database
    client.connect();

    // Execute the query to alter the table
    await client.query(query);
    console.log('Table altered successfully.');

    // Return a success message
    return res.status(200).json({
      message: 'Table altered successfully.',
    });
  } catch (err) {
    // Log and handle any errors that occur during the process
    console.error('Error altering table:', err);
    return res.status(400).json({
      message: 'Error altering table',
      error: err,
    });
  } finally {
    // Close the client connection
    await client.end();
  }
};

module.exports = {
  tableList,
  insertTable,
  updateTable,
  deleteTable,
  createTable,
  alterTable,
};
