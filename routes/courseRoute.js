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
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress', 'createdAt', 'updatedAt']
    }]
  });
  res.status(200).json(courses);

}));

// GET /api/courses/:id (200) - Returns the course (Including the user that owns the course) For the provided Course ID
router.get('/courses/:id', MW.asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: User,
      attributes: ['id', 'firstName', 'lastName', 'emailAddress', 'createdAt', 'updatedAt']
    }]
  });

  res.status(200).json(course);

}));

// POST /api/courses (201) - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', MW.courseCheck, MW.asyncHandler(async (req, res) => {
    // Get validation result from request body
    const errors = validationResult(req);

    // If there are validation errors
    if (!errors.isEmpty()) {
      // Map over the errors to get a list of error messages
      const errorMessages = errors.array().map(error => error.msg);

      res.status(400).json({ errors: errorMessages });
    } else {
      // GET the course from the request body
      const course = req.body;

      // Add the course to the database
      await Course.create(course);

      // set the location header for the URI
      res.location(`/api/courses/${course.id}`);

      // Send the status of 201 for newly created user
      res.status(201).end();
    }
}));

// PUT /api/courses/:id (204) - Updates a course and returns no content
router.put('/courses/:id', MW.asyncHandler(async (req, res, next) => {
  const request = req.body;

  try {
    // GET the course requested course number
    const course = await Course.findByPk(req.params.id)
    
    // If the requested userId matches the course userId on record => proceed
    if (request.userId === course.userId) {
      
      // If title and description in request body => proceed
      if (request.title && request.description) {
        
        // If the course does not exist then sent 404 back to client
        if (course === null) {
          res.status(404).json({ message: 
            {
              developer: 'The course does not exist.',
              client: 'The course that you are looking for cannot be found...'
            } 
          });
        } else {
          // update the course if exists with request data
          
          await course.update(request);
          res.status(204).end();
        }
      } else if (!request.title || !request.description) {

        // If all necessary compenents were not entered send bad request status
        res.status(400).json({ message:  
          {
            developer: 'Bad request, missing necessary information "Title" and "Descritpion" are required.',
            client: 'Please ensure that you filled out all required fields, "Title" and "Description" are required to update.'
          } 
        });
      }

    // Else send back a 403 forbidden status
    } else {
      res.status(403).json({ message: 
        {
          developer: 'Forbidden, unauthorized user access',
          client: 'The user information that you entered does not match what we have in our records for the owner of this course.'
        } 
      });
    }
  } catch(error) {
    return next(error);
  }
}));

// DELETE /api/courses/:id (204) - Deletes a course and returns no content
router.delete('/courses/:id', MW.authenticateUser, MW.asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if (course) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({ message: 
      {
        developer: 'The course does not exist.',
        client: 'The course that you are looking for cannot be found...'
      } 
    });
  }
  
}));

module.exports = router;