var mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "sample",
});

connection.query(
  "CREATE TABLE IF NOT EXISTS project (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description VARCHAR(255))",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project table if not existed");
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS member (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), project_id INT, FOREIGN KEY (project_id) REFERENCES project(id))",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created member table if not existed");
  }
);

module.exports = connection;
