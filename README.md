
# EXPRESS REST API

## Setup 

### `Node JS` is required to run this project

If you do not have it installed then you can install it [here](https://nodejs.org/en/)

If you are not testing new features it is recommended that you download the `stable` version (Which is 12.13.0) at this time.

### Install Dependencies with `npm install`

Before proceeding ensure that you have setup the `Client` section of this project as it works in conjuction with the API.

Find the instructions to setting up the Client [here](../client/README.md)

## Overview of the Provided Project Files

I've supplied the following files for you to use: 

* The `seed` folder contains a starting set of data for your database in the form of a JSON file (`data.json`) and a collection of files (`context.js`, `database.js`, and `index.js`) that can be used to create your app's database and populate it with data (I'll explain how to do that below).
* I've included a `.gitignore` file to ensure that the `node_modules` folder doesn't get pushed to your GitHub repo.
* The `app.js` file configures Express to serve a simple REST API. I've also configured the `morgan` npm package to log HTTP requests/responses to the console.
* The `routes` directory contains the `course` and `user` routes, If you wish to add additional routes place them here.
* The `ORM` that was setup is `Sequelize` and is used to connect to the `sqlite` database. It is installed using the `sequelize-cli`
* There are two current `models` setup through the CLI `course` and `user` both of there are available in the `models` directory.
* The `nodemon.js` file configures the nodemon Node.js module, which is being used to run your REST API.
* The `package.json` file (and the associated `package-lock.json` file) contain the project's npm configuration, which includes the project's dependencies.
* The `RESTAPI.postman_collection.json` file is a collection of Postman requests that you can use to test and explore your REST API.

## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).


