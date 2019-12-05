'use strict';

const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
const User = require('../models').User;
const { check } = require('express-validator');

/**
 * Passes (req, res, next) into async/await callback
 * @param {Function} cb - Asyncronous callback function
 */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Send message back to client
        res.status(400).json({
          message: {
            developer: error.name,
            client: `${error.errors[0].message}, please enter another email address (${error.errors[0].instance.emailAddress}) is already taken.`
          },
          errors: error.errors.map(err => err.message),
        });
      } else if(error.name === 'SequelizeValidationError') {
        // Send message back to client
        res.status(400).json({
          message: {
            developer: error.name,
            client: `Please fill is a value for the following items: ${error.errors.map(err => err.path)}`
          },
          errors: error.errors.map(err => err.message),
        });
      } else {
        res.status(500).send(error);
      }
    }
  }
}

/**
 * Function to authenticate a new user for gaining access to the API
 * @param {Object} req - request from the user
 * @param {Object} res - response object 
 * @param {Param} next - next method
 */
const authenticateUser = async(req, res, next) => {
  let message = null;

  // Parse the users credentials from HEADER
  const credentials = auth(req);

  // If the users credentials are available, attempt to get the user by username
  if (credentials) {
    const user = await User.findOne({ 
      where: {
        emailAddress: credentials.name,
      },
    });
    // If a user was successfully retrieved from the database
    if (user) {

      // Compare the entered password with the stored hashed password
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);

      // If the passwords match
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);

        // Store the retrieved user object fo that future middleware functions will have access to it
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Please enter your username and password';
  }
  // If user authentication failed, display the message
  if (message) {
    console.warn(message);

    // Return a status of 401 Unauthorized
    res.status(401).json({ message: message });
  } else {
    next();
  }
};

/**
 * Middleware function to check post values before sending for courses
 */
const courseCheck = [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Description"'),
  check('userId')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "User ID"'),
];

/**
 * Middleware function to check PUT values before sending for courses
 */
const courseUpdateCheck = [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Title"'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Description"'),
];

/**
 * Middleware function to check post values before sending for users
 */
const createUserCheck = [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"')
    .isLength({ min: 8, max: 20 })
    .withMessage('Please enter a password between 8 and 20 characters long'),
];


module.exports = {
  asyncHandler,
  authenticateUser,
  courseCheck,
  courseUpdateCheck,
  createUserCheck
};