const express = require('express');
const router = express.Router();

const storedProcedure = require('../controller/storedProcedure');
const validate = require('../validators/validate');
const storedProcedureValidation = require('../validators/storedProcedure');

router.post(
  '/save',
  validate(storedProcedureValidation.saveProcedure),
  storedProcedure.saveQuery
);

router.post(
  '/execute',
  validate(storedProcedureValidation.executeProcedure),
  storedProcedure.executeQuery
);

router.get(
  '/list',
  validate(storedProcedureValidation.listProcedure),
  storedProcedure.listQuery
);

module.exports = router;
