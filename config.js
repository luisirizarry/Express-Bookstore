// read .env files and make environmental variables
require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? process.env.DB_URI_TEST
  : process.env.DB_URI;


module.exports = {
  DB_URI
};