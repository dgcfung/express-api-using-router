require('dotenv').config()

module.exports = {
  development: {
    database: process.env.DEV_DATABASE,
    host: process.env.DEV_HOST,
    dialect: 'postgres'
  },
  test: {
    database: process.env.TEST_DATABASE,
    host: process.env.TEST_HOST,
    dialect: 'postgres'
  },
  production: {
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres'
  },
}