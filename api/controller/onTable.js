const { connectionUrl } = require('../helper/connection');

const tableList = async (req, res) => {
  // Extract the 'id' from the query parameters
  const { id } = req.query;

  // Try to establish a database connection using the provided ID
  try {
    let connection = await connectionUrl(id);

    // If there is an error in connecting to the database, handle it
    if (connection.error) {
      console.error('Error connecting to database:', connection.error);
      return res.status(400).json({
        message: 'Error connecting to database',
        error: connection.error,
      });
    } else {
      // Determine the schema name based on the database type
      const schema =
        connection.database === 'postgres'
          ? req.query.schema
          : connection.databaseName;

      // Query the database to get the list of tables in the specified schema
      const data = await connection.client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}';`
      );

      // Close the database connection after the query is complete
      await connection.client.end();

      // Send the list of tables as a JSON response
      return res.status(200).json({
        table: connection.database === 'postgres' ? data.rows : data[0],
      });
    }
  } catch (err) {
    // If there is an error in fetching data from the database, handle it
    console.error('Error fetching data from PostgreSQL:', err);
    return res.status(400).json({
      message: 'Error fetching data from PostgreSQL',
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

    // Close the client connection after the operation is complete
    await connection.client.end();

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
  createTable,
  alterTable,
};
