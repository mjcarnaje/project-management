var mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "test2",
  port:3306,
});

connection.query(
  "CREATE TABLE IF NOT EXISTS project (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description VARCHAR(255), target_date DATE)",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project table if not existed");
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS member (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255),contact_number CHAR(11) PRIMARY KEY, project_id INT, FOREIGN KEY (project_id) REFERENCES project(id))",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created member table if not existed");
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS task (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description VARCHAR(255),due_date DATE,progress ENUM('done', 'wip', 'not'), project_id INT, FOREIGN KEY (project_id) REFERENCES project(id))",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created task table if not existed");
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS task_member (task_id INT, member_id INT, FOREIGN KEY (task_id) REFERENCES task(id), FOREIGN KEY (member_id) REFERENCES member(id), PRIMARY KEY (task_id, member_id))",
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created task_member table if not existed");
  }
);

module.exports = connection;
