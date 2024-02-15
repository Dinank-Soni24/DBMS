const express = require('express');
const router = express.Router();

const storedProcedure = require('../controller/storedProcedure');

router.post('/save', storedProcedure.saveQuery)

router.post('/execute', storedProcedure.executeQuery)

router.get('/list', storedProcedure.listQuery)

module.exports = router;