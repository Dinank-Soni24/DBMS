const { connectionUrl } = require('../helper/connection');

const tableList = async (req, res) => {
  // Get the ID from the request body
  const { id } = req.body;

  // let client;
  try {
    // Connect to the database using the provided ID
    let connection = await connectionUrl(id);

    if (connection.error) {
      // Log and handle errors when connecting to PostgreSQL
      console.error('Error connecting to database:', connection.error);
      return res.status(400).json({
        message: 'Error connecting to database',
        error: connection.error,
      });
    } else {
      // Generate the schema name
      const schema =
        connection.database === 'postgres'
          ? req.body.schema
          : connection.databaseName;

      // Query to get list of tables in the 'public' schema
      const data = await connection.client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}';`
      );

      // Close the client connection after the operation is complete
      await connection.client.end();

      // Send the list of tables as a JSON response
      return res.status(200).json({
        table: connection.database === 'postgres' ? data.rows : data[0],
      });
    }
  } catch (err) {
    // Log and handle errors when fetching data from PostgreSQL
    console.error('Error fetching data from PostgreSQL:', err);
    return res.status(400).json({
      message: 'Error fetching data from PostgreSQL',
      error: err,
    });
  }
};

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

const createTable = async (req, res) => {
  // Extract connectionUrl, tableName, and columns from request body
  const { id, tableName, columns, foreignKey } = req.body;

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

    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    // Generate the column string in query format
    let colName = `${columnString}, created_at timestamp default now(), updated_at timestamp default now() ${
      connection.database === 'postgres' ? '' : 'on update now()'
    }`;

    // Add foreign key constraint if provided
    if (foreignKey) {
      // Generate the foreign key constraint string
      const fKeys = await foreignKey
        .map((key) => {
          return `CONSTRAINT ${key.name}
          FOREIGN KEY (${key.colName})
          REFERENCES ${schema}.${key.refTable}(${key.refCol})`;
        })
        .join(', ');

      colName += `, ${fKeys}`;
    }

    // Generate the table creation query
    const query = `CREATE TABLE ${schema}.${tableName} (${colName})`;

    console.log('query', query);

    // Execute a query to create the table using the generated column string
    await connection.client.query(query);

    // Close the client connection after the operation is complete
    await connection.client.end();

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
  }
};

const alterTable = async (req, res) => {
  // Extract relevant data from request body
  const {
    id,
    tableName,
    method,
    columnName,
    columnType,
    newColumnName,
    foreignKey,
    primaryKey,
  } = req.body;

  try {
    // Connect to the database using the provided ID
    const connection = await connectionUrl(id);

    // Generate the schema name
    const schema =
      connection.database === 'postgres'
        ? req.body.schema
        : connection.databaseName;

    // Construct the appropriate query based on the method
    const query =
      method === 'RENAME'
        ? `ALTER TABLE ${schema}.${tableName} ${method} COLUMN ${columnName} to ${newColumnName}`
        : // check if there is foreign key and method is add
        method === 'ADD' && foreignKey?.length > 0
        ? foreignKey
            .map((key) => {
              return `ALTER TABLE ${schema}.${tableName} ${method} CONSTRAINT ${key.name}
              FOREIGN KEY (${key.colName})
              REFERENCES ${schema}.${key.refTable}(${key.refCol});`;
            })
            .join('\n')
        : // check if there is primary key and method is add
        method === 'ADD' && primaryKey
        ? `ALTER TABLE ${schema}.${tableName} ${method} CONSTRAINT ${primaryKey.name} PRIMARY KEY (${primaryKey.colName});`
        : `ALTER TABLE ${schema}.${tableName} ${method} COLUMN ${columnName} ${columnType}`;

    console.log('query', query);

    // Execute the query to alter the table
    await connection.client.query(query);
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
