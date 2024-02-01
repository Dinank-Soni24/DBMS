const fs = require('fs');
const { CONNECTION_FILE_PATH } = require('../config/constant');

// Define an asynchronous function to read a file based on the provided ID
const readFile = async (id) => {
  try {
    // Read the content of the file at the CONNECTION_FILE_PATH
    let data = fs.readFileSync(CONNECTION_FILE_PATH);
    // Parse the content of the file as JSON
    data = JSON.parse(data);
    // Find the connection object with the provided ID
    const connection = data.connections.find((conn) => conn.id === id);

    // Return the found connection, or null if not found
    return connection || null;
  } catch (err) {
    // Log any errors that occur during the process
    console.log(err);
    // Return null if an error occurs
    return null;
  }
};

module.exports = {
  readFile,
};
