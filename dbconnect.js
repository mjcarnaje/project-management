var mysql = require("mysql2");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
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
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project table if not existed");
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS member (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255),
   email VARCHAR(255),
   gender ENUM('male', 'female', 'other'),
   contact_number CHAR(11)
);`,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created member table if not existed");
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS project_member (
  project_id INT,
  member_id INT,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, member_id)
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created project_member table if not existed");
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS task (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description VARCHAR(255),
  due_date DATE,
  status ENUM('pending', 'ongoing', 'completed'),
  project_id INT,
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created task table if not existed");
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS task_member (
  task_id INT,
  member_id INT,
  FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, member_id)
);
  `,
  function (error, results, fields) {
    if (error) throw error;
    console.log("Created task_member table if not existed");
  }
);

module.exports = connection;
