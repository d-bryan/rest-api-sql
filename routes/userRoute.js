'use strict';

// Include neccessary components for API routes
const express = require('express');
const router = express.Router();
// Middleware components
const MW = require('../middleware/middleware');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
// Import Sequelize Models
const User = require('../models').User;

// USER ROUTES
// GET /api/users (200) - Returns currently authenticated user
router.get('/users', MW.authenticateUser, MW.asyncHandler(async (req, res) => {
  const user = req.currentUser;

  await res.json({
    currentUser: {
      firstName: `${user.firstName}`,
      lastName: `${user.lastName}`,
      email: user.emailAddress
    }
  });
}));

// POST /api/users (201) - Creates a user, sets the Location header to "/" and returns no content
router.post('/users', MW.userCheck, MW.asyncHandler(async (req, res) => {
  try {
    // Attempt to get the validation result from request body.
    const errors = validationResult(req);

    // If there are validation errors
    if (!errors.isEmpty()) {
      // Map over the errors to get a list of error messages
      const errorMessages = errors.array().map(error => error.msg);

      res.status(400).json({ errors: errorMessages });

    } else {
      // GET the user from the request body
      const user = req.body;

      // Hash the new users password
      user.password = bcrypt.hashSync(user.password, 10);

      // Add the user to the database
      await User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password: user.password,
      });

      // set the location header for the URI
      res.location('/');

      // Send the status of 201 for newly created user
      res.status(201).end();
    }
  } catch (error) {
    // Catch Sequelize Unique Email Error
    if(error.name === 'SequelizeUniqueConstraintError') {
      // Send message back to client
      res.status(400).json({
        errors: {
          developer: error.errors[0].type,
          client: `${error.errors[0].message}, please enter another email address (${error.errors[0].instance.emailAddress}) is already taken.`
        },
      });
    } else {
      res.status(500).send(error);
    }
  }
}));

module.exports = router;