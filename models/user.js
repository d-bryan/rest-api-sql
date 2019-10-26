'use strict';

const Sequelize = require('sequelize');
const moment = require('moment');

// Create the User Model
module.exports = ( sequelize ) => {
  class User extends Sequelize.Model{

    /**
     * Returns human readable formated time for when it was created
     */
    createdTime() {
      const date = moment(this.createdAt).format('MMMM D, YYYY, h:mma');
      return date;
    }

    /**
     * Returns human readable formated time for when it was last updated
     */
    updatedTime() {
      const date = moment(this.updatedAt).format('MMMM D, YYYY, h:mma');
      return date;
    }

  }

  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"First Name" must not be empty.'
        },
        notNull: {
          msg: '"First Name" must not be empty.'
        },
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Last Name" must not be empty.'
        },
        notNull: {
          msg: '"Last Name" must not be empty.'
        },
      },
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Email Address" must not be empty.'
        },
        notNull: {
          msg: '"Email Address" must not be empty.'
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"password" must not be empty.'
        },
        notNull: {
          msg: '"password" must not be empty.'
        },
        min: {
          args: 8,
          msg: 'Please enter a password between 8 and 20 characters long.'
        },
        max: {
          args: 20,
          msg: 'Please enter a password between 8 and 20 characters long.'
        },
      },
    },
  }, { sequelize });

  // Associate Id with Courses
  User.associate = ( models ) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };



  return User;
};