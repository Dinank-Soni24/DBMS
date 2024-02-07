const express = require('express');
const router = express.Router();

const storedProcedure = require('../controller/storedProcedure');

router.post('/save', storedProcedure.saveQuery)

router.post('/execute', storedProcedure.executeQuery)

module.exports = router;