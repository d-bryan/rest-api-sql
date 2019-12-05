'use strict';

// Include neccessary components for API routes
const express = require('express');
const router = express.Router();
// Middleware components
const MW = require('../middleware/middleware');
const { validationResult } = require('express-validator');
// Import Sequelize Models
const Course = require('../models').Course;
const User = require('../models').User;




// COURSE ROUTES
// GET /api/courses (200) - Returns a list of courses (Including the user that owns each course)
router.get('/courses', MW.asyncHandler(async(req, res) => {
  const courses = await Course.findAll({
    attributes: ['id', 'userId', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }]
  });
  res.status(200).json(courses);

}));

// GET /api/courses/:id (200) - Returns the course (Including the user that owns the course) For the provided Course ID
router.get('/courses/:id', MW.asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    attributes: ['id', 'userId', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    where: {
      id: req.params.id
    },
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    }]
  });

  if (course === null) {
    res.status(404).json({
      message: 'Sorry we cannot find that course.'
    });
  } else {
    res.status(200).json(course);
  }

}));

// POST /api/courses (201) - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', MW.authenticateUser, MW.courseCheck, MW.asyncHandler(async (req, res, next) => {

  // Get validation result from request body
  const errors = validationResult(req);
  // Map over the errors to get a list of error messages
  const errorMessages = errors.array().map(error => error.msg);
  const request = req.body;
  const user = req.currentUser;
  const createCourse = await Course.create(request);


  if (user) {
    
      try {
      // If there are validation errors
      if (!errors.isEmpty()) {
        // Send 400 Bad Request back to client with errors
        res.status(400).json({ errors: errorMessages });
      } else {

        // Add the course to the database
        createCourse;

        // set the location header for the URI
        res.location(`/courses/${createCourse.id}`);

        // Send the status of 201 for newly created user
        res.status(201).end();
      }
    } catch (error) {
      next(error);
    }
  } else {
    // If User is not authenticated send 403 status and message back to client
    res.status(403).json({ 
      message: 
        'Please login first to create a new course.'
    });
  }
}));

// PUT /api/courses/:id (204) - Updates a course and returns no content
router.put('/courses/:id', MW.authenticateUser, MW.courseUpdateCheck, MW.asyncHandler(async (req, res) => {
  const request = req.body;
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);

  const errors = validationResult(req);
  const errorMessages = errors.array().map(error => error.msg);
  console.log(errorMessages);

    // If User is authenticated => proceed
    if (user && user.id === course.userId) {
      // If title and description in request body => proceed
      if (request.title && request.description) {
        // If the course does not exist then sent 404 back to client
        if (course === null) {
          res.status(404).json({ 
            message: 
              'The course that you are looking for cannot be found...'
          });
        } else {
          // update the course if exists with request data
          await course.update(request);
          res.status(204).end();
        }
      } else {

        if (!errors.isEmpty()) {
          // If all necessary compenents were not entered send bad request status
          res.status(400).json({ errors: errorMessages });
        }
      }
    } else {
      // If User is not authenticated send 403 status and message back to client
      res.status(403).json({ 
        message: 
           'The user information that you entered does not match what we have in our records for the owner of this course.' 
      });
    }
}));

// DELETE /api/courses/:id (204) - Deletes a course and returns no content
router.delete('/courses/:id', MW.authenticateUser, MW.asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  const user = req.currentUser;

  // If User is authenticated => proceed
  if (user) {
    try {
      // If the course exists => proceed
      if (course) {
        // If the course userId matches the users ID => proceed
        if (course.userId === user.id) {
          // DELETE the course and end cycle
          await course.destroy();
          res.status(204).end();
        } else {
          // if the course DOES NOT belong to the person attempting to delete send 400 response to client
          res.status(403).json({ 
            message: 
              'The course that you are attempting to delete does not belong to you.'
          });
        }
      } else {
        // if the course DOES NOT exist send 404 response to client
        res.status(404).json({ 
          message:
           'The course that you are looking for cannot be found...' 
        });
      }
    } catch (error) {
      next(error);
    }
  } else {
    // If User is not authenticated send 403 status and message back to client
    res.status(403).json({ 
      message: 
        'The user information that you entered does not match what we have in our records for the owner of this course.'
    });
  }
}));

module.exports = router;