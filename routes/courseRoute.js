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

  res.status(200).json(course);

}));

// POST /api/courses (201) - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', MW.authenticateUser, MW.courseCheck, MW.asyncHandler(async (req, res) => {

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
        res.location(`/api/courses/${createCourse.id}`);

        // Send the status of 201 for newly created user
        res.status(201).end();
      }
    } catch (error) {
      console.log(error);
      if (error.name === 'SequelizeValidationError') {
        const catchErrors = error.errors.map(err => err.message);

        console.log(catchErrors);

        res.status(400).json({ errors: catchErrors });
        
      } else {
        // Send 500 status back to client
        res.status(500).send(error);
      }
    }
  } else {
    // If User is not authenticated send 403 status and message back to client
    res.status(403).json({ message: 
      {
        developer: 'Forbidden, unauthorized user access',
        client: 'The user information that you entered does not match what we have in our records for the owner of this course.'
      } 
    });
  }

/************** OLD VERSION  ********************/

  // // Get validation result from request body
  // const errors = validationResult(req);
  
  // // If there are validation errors
  // if (!errors.isEmpty()) {
  //   // Map over the errors to get a list of error messages
  //   const errorMessages = errors.array().map(error => error.msg);

  //   res.status(401).json({ errors: errorMessages });
  // } else {
  //   // GET the course from the request body
  //   const request = req.body;
  //   const createCourse = await Course.create(request);

  //   // Add the course to the database
  //   createCourse;

  //   // set the location header for the URI
  //   res.location(`/api/courses/${createCourse.id}`);

  //   // Send the status of 201 for newly created user
  //   res.status(201).end();
  // }
}));

// PUT /api/courses/:id (204) - Updates a course and returns no content
router.put('/courses/:id', MW.authenticateUser, MW.asyncHandler(async (req, res) => {
  const request = req.body;
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);

    // If User is authenticated => proceed
    if (user) {
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
      } else {
        // If all necessary compenents were not entered send bad request status
        res.status(400).json({ message:  
          {
            developer: 'Bad request, missing necessary information "Title" and "Descritpion" are required.',
            client: 'Please ensure that you filled out all required fields, "Title" and "Description" are required to update.'
          } 
        });
      }
    } else {
      // If User is not authenticated send 403 status and message back to client
      res.status(403).json({ message: 
        {
          developer: 'Forbidden, unauthorized user access',
          client: 'The user information that you entered does not match what we have in our records for the owner of this course.'
        } 
      });
    }
}));

// DELETE /api/courses/:id (204) - Deletes a course and returns no content
router.delete('/courses/:id', MW.authenticateUser, MW.asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  const user = req.currentUser;

  // If User is authenticated => proceed
  if (user) {
    // If the course exists => proceed
    if (course) {
      // DELETE the course and end cycle
      await course.destroy();
      res.status(204).end();
    } else {
      // if the course DOES NOT exist send 404 response to client
      res.status(404).json({ message: 
        {
          developer: 'The course does not exist.',
          client: 'The course that you are looking for cannot be found...'
        } 
      });
    }
  } else {
    // If User is not authenticated send 403 status and message back to client
    res.status(403).json({ message: 
      {
        developer: 'Forbidden, unauthorized user access',
        client: 'The user information that you entered does not match what we have in our records for the owner of this course.'
      } 
    });
  }
}));

module.exports = router;