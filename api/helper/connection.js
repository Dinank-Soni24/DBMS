const { Client } = require('pg');
const { readFile } = require('./readFile');

const connectionUrl = async (id) => {
  const url = await readFile(id);
  try {
    // Create a new PostgreSQL client using the provided connection URL
    const client = new Client({
      connectionString: url.connectionUrl,
    });

    // Connect to the PostgreSQL database
    client.connect();

    return client;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  connectionUrl,
};
