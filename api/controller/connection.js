const { Client } = require('pg');
const mysql2 = require('mysql2/promise');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { CONNECTION_FILE_PATH } = require('../config/constant');

const connectionUrl = async (req, res) => {
  // Extract the connection URL from the request body
  const { connectionUrl, database } = req.body;
  const id = uuidv4();
  try {
    // Create a new client for the PostgreSQL database
    const client =
      database === 'postgres'
        ? new Client({
            connectionString: connectionUrl,
          })
        : await mysql2.createConnection(connectionUrl);

    // Connect to the database
    await client.connect();

    // check if the file exists
    if (!fs.existsSync(CONNECTION_FILE_PATH)) {
      // Create the file with default data or leave it empty
      fs.writeFileSync(
        CONNECTION_FILE_PATH,
        JSON.stringify({ connections: [] }, null, 2)
      );
    }

    // Read the connection data from the file
    let data = fs.readFileSync(CONNECTION_FILE_PATH);

    // Check if the file is not empty
    if (data.length > 0) {
      // Parse the data as JSON
      data = JSON.parse(data);
      // Check if the connection URL already exists in the data
      const exists = data.connections.some(
        (conn) => conn.connectionUrl === connectionUrl
      );
      // If it exists, throw an error
      if (exists) {
        console.log('Connection URL already exists.');
        throw 'Connection URL already exists.';
      }
    } else {
      // If the file is empty, initialize the data object
      data = { connections: [] };
    }

    // Add the new connection data to the existing data
    data.connections.push({ id, database, connectionUrl });

    // Write the updated data back to the file
    fs.writeFileSync(CONNECTION_FILE_PATH, JSON.stringify(data));

    // Close the client connection
    client.end();

    // Send a success response with the connected URL
    return res.status(200).json({
      message: "Connection successful. You're connected to: " + connectionUrl,
    });
  } catch (err) {
    // Handle and log errors when fetching data from database
    console.error('Error fetching data from database:', err);
    return res.status(400).json({
      message: 'Error fetching data from database',
      error: err.message || err,
    });
  }
};

const connectionList = async (req, res) => {
  try {
    // Read the connection data from the file
    let data = fs.readFileSync(CONNECTION_FILE_PATH);
    // Parse the data as JSON
    data = JSON.parse(data);
    // Send the list of connections as a JSON response
    return res.status(200).json({
      connection: data.connections,
    });
  } catch (err) {
    console.log('Error fetching database:', err);
    return res.status(400).json({
      message: 'Error fetching database',
      error: err,
    });
  }
};

module.exports = {
  connectionUrl,
  connectionList,
};
