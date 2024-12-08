/** Database config for database. */
const { Client } = require("pg");
const {DB_URI} = require("./config");

let db = new Client({
  connectionString: DB_URI
});

db.connect() 
  .then(() => {
    console.log(`Connected sucessfully to ${DB_URI}`);
  })
  .catch((err) => {
    console.error("Database connection error:", err.stack);
    process.exit(1);
  });

module.exports = db;
