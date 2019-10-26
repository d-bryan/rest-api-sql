'use strict';

const Sequelize = require('sequelize');
const moment = require('moment');

// Create the Course Model
module.exports = ( sequelize ) => {
  class Course extends Sequelize.Model{

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

    /**
     * Returns the shortened deescription of the course for client side build
     */
    shortDescription() {
      const shortDesc = this.description.length > 200 ? this.description.substring(0 ,200) + '...' : this.description;
      return shortDesc;
    }

  }

  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      foreignKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Title" for the course must not be empty.'
        },
        notNull: {
          msg: '"Title" for the course must not be empty.'
        },
      },
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Description" for the course must not be empty.'
        },
        notNull: {
          msg: '"Description" for the course must not be empty.'
        },
      },
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, { sequelize });

  // Associate userId with Users
  Course.associate = ( models ) => {
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };

  return Course;
};