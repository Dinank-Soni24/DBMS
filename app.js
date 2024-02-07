const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// import routes
const tableRoute = require('./api/routes/table');
const storedProcedureRoute = require('./api/routes/storedProcedure');

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use('/table', tableRoute);
app.use('/query', storedProcedureRoute)

// handle 404
app.use((req, res, next) => {
  const err = new Error('not found');
  err.status = 404;
  next(err);
});

// handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    err: {
      message: err.message,
    },
  });
});

module.exports = app;
