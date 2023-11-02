const { Sequelize } = require('sequelize');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {

  host: PGHOST,
  
  dialect: 'postgres',
  
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      project: ENDPOINT_ID
    }
  }

});

module.exports = sequelize;