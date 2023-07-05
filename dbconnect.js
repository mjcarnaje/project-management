var mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "project_management",
  port: 3306,
});

connection.query(
  `
  CREATE TABLE IF NOT EXISTS project (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description VARCHAR(255),
  date_created DATE DEFAULT (CURRENT_DATE)
);`,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project table if not existed");
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  contact_number CHAR(11)
);`,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created member table if not existed");
  }
);

connection.query(
  // no separate table for project-task relationship
  // uses project_id FK since it is 1-to-many
  `CREATE TABLE IF NOT EXISTS task (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description VARCHAR(255),
  progress_status ENUM('Not Started', 'In Progress', 'Completed'),
  project_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project (id) 
);`,
// task column: add date_created? or target_date?
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created task table if not existed");
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS project_member (
  project_id INT,
  member_id INT,
  FOREIGN KEY (project_id) REFERENCES project(id),
  FOREIGN KEY (member_id) REFERENCES member(id),
  PRIMARY KEY (project_id, member_id)
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project_member table if not existed");
  }
);

// create separate table for member-task relationship since it is many-to-many
connection.query(
  `
  CREATE TABLE IF NOT EXISTS member_task (
  task_id INT,
  member_id INT,
  FOREIGN KEY (task_id) REFERENCES task(id),
  FOREIGN KEY (member_id) REFERENCES member(id),
  PRIMARY KEY (task_id, member_id)
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created member_task table if not existed");
  }
);

module.exports = connection;
