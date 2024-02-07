const { Client } = require('pg');
const mysql2 = require('mysql2/promise');
const { readFile } = require('./readFile');

const connectionUrl = async (id) => {
  const url = await readFile(id);
  try {
    let client =
      url.database === 'postgres'
        ? new Client({
            connectionString: url.connectionUrl,
          })
        : url.database === 'mysql'
        ? await mysql2.createConnection(url.connectionUrl)
        : null;

    // Connect to the PostgreSQL database
    await client.connect();

    return {
      client,
      database: url.database,
      databaseName: client?.config?.database || client?.database,
    };
  } catch (error) {
    console.log('Error', error);
    return { error: error.message };
  }
};

module.exports = {
  connectionUrl,
};
