'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const courseRoute = require('./routes/courseRoute');
const userRoute = require('./routes/userRoute');
const database = require('./models').sequelize;
const dbName = require('./config/config.json').development.storage;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// test database connection
(async () => {
  try {
    await database.authenticate();
    console.log(`Successfully connected to ${dbName}`);
  } catch (error) {
    console.error(`Unable to connect to ${dbName}: `, error);
  }
})();

// setup express to use JSON
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Include the API routes
app.use('/api', courseRoute);
app.use('/api', userRoute);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((error, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(error.stack)}`);
  }

  // if (error.message === 'SequelizeUniqueConstraintError') {
  //   // Send message back to client
  //   res.status(400).json({
  //     errors: {
  //       developer: error.errors[0].type,
  //       client: `${error.errors[0].message}, please enter another email address (${error.errors[0].instance.emailAddress}) is already taken.`
  //     },
  //   });
  // } else if(error.message === 'SequelizeValidationError') {
  //   // Send message back to client
  //   res.status(400).json({
  //     fullErrorList: error,
  //     errors: {
  //       developer: error.errors[0].type,
  //       client: `${error.errors[0].message}, please enter another email address (${error.errors[0].instance.emailAddress}) is already taken.`
  //     },
  //   });
  // } else {
  //   res.status(error.status || 500).json({
  //     message: error.message,
  //     error: {},
  //   });
  // }

  res.status(error.status || 500).json({
    message: error.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
