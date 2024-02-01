const express = require('express');
const router = express.Router();

//add controller
const tableController = require('../controller/table');
const connectionController = require('../controller/connection');

// connection the database and store url in local file
router.post('/connection', connectionController.connectionUrl);

// list database
router.get('/connection', connectionController.connectionList);

// Get records from specific table
router.post('/', tableController.tableList);

// insert data into specific table
router.post('/insert', tableController.insertTable);

// update data into specific table
router.post('/update', tableController.updateTable);

// delete data from specific table
router.post('/delete', tableController.deleteTable);

// create table
router.post('/create', tableController.createTable);

// alter table (ADD, DROP, RENAME)
router.post('/alter', tableController.alterTable);

module.exports = router;
