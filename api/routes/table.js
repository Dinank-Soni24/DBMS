const express = require('express');
const router = express.Router();

const validate = require('../validators/validate');
const connectionValidation = require('../validators/connection');
const onTableValidation = require('../validators/onTable');
const inTableValidation = require('../validators/inTable');

//add controller
const inTableController = require('../controller/inTable');
const onTableController = require('../controller/onTable');
const connectionController = require('../controller/connection');

/****************************
 * Database method *
 ****************************/

// connection the database and store url in local file
router.post(
  '/connection',
  validate(connectionValidation.connectionSchema),
  connectionController.connectionUrl
);

// list database
router.get(
  '/connection',
  validate(connectionValidation.listConnection),
  connectionController.connectionList
);

/****************************
 * On Table method *
 ****************************/

// Get records from specific table
router.get(
  '/',
  validate(onTableValidation.listTable),
  onTableController.tableList
);

// create table
router.post(
  '/create',
  validate(onTableValidation.createTable),
  onTableController.createTable
);

// alter table (ADD, DROP, RENAME)
router.post(
  '/alter',
  validate(onTableValidation.alterTable),
  onTableController.alterTable
);

/****************************
 * In Table method *
 ****************************/

// insert data into specific table
router.post(
  '/insert',
  validate(inTableValidation.insert),
  inTableController.insertTable
);

// update data into specific table
router.post(
  '/update',
  validate(inTableValidation.update),
  inTableController.updateTable
);

// delete data from specific table
router.post(
  '/delete',
  validate(inTableValidation.deleteRow),
  inTableController.deleteTable
);

// get data from specific table
router.get(
  '/list',
  validate(inTableValidation.listRow),
  inTableController.listTableRow
);

module.exports = router;
