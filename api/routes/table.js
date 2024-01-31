const express = require('express');
const router = express.Router();

//add controller
const tableController = require('../controller/table');

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
