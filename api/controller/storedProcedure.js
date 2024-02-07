const { v4: uuidv4 } = require('uuid');
const { connectionUrl } = require('../helper/connection');

const saveQuery = async (req, res) => {
  // Extract the required data from the request body
  const { name, query } = req.body;

  let client;
  try {
    const id = uuidv4();
    const values = [`${id}`, `${name}`, `${query}`];
    // Connect to the database using the provided ID
    client = await connectionUrl('988a2d93-d4cb-48ff-b984-d4f0b638815b');

    // Construct and execute the query to insert into the specified table
    await client.query(
      `INSERT INTO test.sp("id","name", "query") VALUES($1 ,$2, $3) RETURNING *`,
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

const executeQuery = async (req, res) => {
  // Extract the required data from the request body
  const { name, values } = req.body;

  let client;
  try {
    // Connect to the database using the provided ID
    client = await connectionUrl('988a2d93-d4cb-48ff-b984-d4f0b638815b');

    // Construct and execute the query to insert into the specified table
    const query = await client.query(
      `SELECT * FROM test.sp WHERE name = '${name}'`
    );

    // Replace placeholders with values from the request body
    const replacedQuery = query.rows[0].query.replace(
      /@(\w+)/g,
      (match, placeholder) => {
        // Extract the placeholder name (e.g., id, name, age, mobile)
        const value = values[placeholder];
        // Check the data type of the value and format it accordingly
        if (typeof value === 'string') {
          return `'${value}'`; // Enclose string values in single quotes
        } else {
          return value; // For other types (numbers, etc.), no formatting is needed
        }
      }
    );

    // execute the query that match the name
    const executeQuery = await client.query(`${replacedQuery}`);

    // Log and return a success message
    console.log('Record inserted successfully.');
    return res.status(200).json({
      message: 'Record inserted successfully.',
      data: executeQuery.rows,
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

module.exports = {
  saveQuery,
  executeQuery,
};
