var express = require("express");

var router = express.Router();
var connection = require("../dbconnect");

/* GET home page. */
router.get("/", function (req, res, next) {
  connection.query(
    `SELECT p.id, p.name, p.description, COUNT(pm.member_id) AS member_count
      FROM project AS p
      LEFT JOIN project_member AS pm ON p.id = pm.project_id
      GROUP BY p.id, p.name;
`,
    function (error, results, fields) {
      if (error) throw error;
      res.render("index", {
        title: "Projects",
        projects: results,
      });
    }
  );
});

// GO TO ADD PROJECT PAGE
router.get("/add-project", function (req, res, next) {
  res.render("add-project");
});

// ADD PROJECT
router.post("/add-project", function (req, res, next) {
  console.log(req.body);

  connection.query(
    "INSERT INTO project (name, description) VALUES (?, ?)",
    [req.body.name, req.body.description],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/");
    }
  );
});

router.get("/edit-project/:id", function (req, res, next) {
  connection.query(
    `SELECT * FROM project WHERE id = ?`,
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.render("edit-project", {
        project: results[0],
      });
    }
  );
});

router.post("/edit-project/:id", function (req, res, next) {
  console.log("EDIT PROJECT");
  console.log(req.body);

  connection.query(
    `UPDATE project SET name = ?, description = ? WHERE id = ?`,
    [req.body.name, req.body.description, req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/");
    }
  );
});

router.get("/projects/:id", function (req, res, next) {
  const data = {
    project: {},
    members: [],
    tasks: {
      pending: [],
      ongoing: [],
      completed: [],
    },
    hasTasks: false,
  };

  connection.query(
    `SELECT * FROM project WHERE id = ?`,
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      Object.assign(data.project, results[0]);
    }
  );

  connection.query(
    `SELECT t.id, t.title, t.description, t.due_date, t.status
      FROM task AS t
      LEFT JOIN project AS p ON t.project_id = p.id
      WHERE p.id = ?`,
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;

      if (results.length > 0) {
        Object.assign(data, { hasTasks: true });
      }

      const pending = results.filter((task) => task.status === "pending");
      const ongoing = results.filter((task) => task.status === "ongoing");
      const completed = results.filter((task) => task.status === "completed");

      Object.assign(data.tasks, {
        pending,
        ongoing,
        completed,
      });
    }
  );

  connection.query(
    `SELECT m.id, m.name, m.contact_number
      FROM member AS m
      LEFT JOIN project_member AS pm ON m.id = pm.member_id
      WHERE pm.project_id = ?`,
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      Object.assign(data.members, results);
      res.render("project", data);
    }
  );
});

// GET MEMBERS FOR ADDING TO PROJECT
router.get("/projects/:id/members", function (req, res, next) {
  connection.query(
    `SELECT m.id, m.name, m.contact_number
      FROM member AS m
      LEFT JOIN project_member AS pm ON m.id = pm.member_id
      WHERE pm.member_id IS NULL;`,
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      console.log({ results });
      res.render("project-add-member", {
        projectId: req.params.id,
        members: results,
      });
    }
  );
});

// ADD MEMBER TO PROJECT
router.post("/projects/:id/members/:memberId", function (req, res, next) {
  connection.query(
    "INSERT INTO project_member (project_id, member_id) VALUES (?, ?)",
    [req.params.id, req.params.memberId],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/projects/" + req.params.id);
    }
  );
});

// REMOVE MEMBER FROM PROJECT
router.delete(
  "/projects/:projectId/members/:memberId",
  function (req, res, next) {
    connection.query(
      "DELETE FROM project_member WHERE project_id = ? AND member_id = ?",
      [req.params.projectId, req.params.memberId],
      function (error, results, fields) {
        if (error) throw error;
        res.redirect("/projects/" + req.params.projectId);
      }
    );
  }
);

// DELETE PROJECT
router.delete("/delete-project/:id", function (req, res, next) {
  connection.query(
    "DELETE FROM project WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/");
    }
  );
});

// MEMBERS PAGE
router.get("/members", function (req, res, next) {
  connection.query(
    `SELECT m.id, m.name, m.contact_number, p.name AS projectName
      FROM member AS m
      LEFT JOIN project_member AS pm ON m.id = pm.member_id
      LEFT JOIN project AS p ON pm.project_id = p.id;`,
    function (error, results, fields) {
      if (error) throw error;

      res.render("members", {
        members: results,
      });
    }
  );
});

// RENDER ADD MEMBER PAGE
router.get("/add-member", function (req, res, next) {
  res.render("add-member");
});

// ADD MEMBER
router.post("/add-member", function (req, res, next) {
  connection.query(
    "INSERT INTO member (name, contact_number) VALUES (?, ?)",
    [req.body.name, req.body.contact_number],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/members");
    }
  );
});

// RENDER EDIT MEMBER PAGE
router.get("/edit-member/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM member WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.render("edit-member", {
        member: results[0],
      });
    }
  );
});

// EDIT MEMBER
router.post("/edit-member/:id", function (req, res, next) {
  connection.query(
    "UPDATE member SET name = ?, contact_number = ? WHERE id = ?",
    [req.body.name, req.body.contact_number, req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/members");
    }
  );
});

// RENDER MEMBER PAGE
router.get("/members/:id", function (req, res, next) {
  const data = {
    member: {},
    project: {},
    tasks: {
      pending: [],
      ongoing: [],
      completed: [],
    },
  };

  connection.query(
    "SELECT * FROM member WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      Object.assign(data.member, results[0]);

      connection.query(
        `SELECT p.id, p.name, p.description
          FROM project AS p
          LEFT JOIN project_member AS pm ON p.id = pm.project_id
          WHERE pm.member_id = ?;`,
        [req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          Object.assign(data.project, results[0]);

          connection.query(
            `SELECT t.id, t.title, t.description, t.status
              FROM task AS t
              LEFT JOIN project AS p ON t.project_id = p.id
              WHERE p.id = ?;`,
            [data.project.id],
            function (error, results, fields) {
              if (error) throw error;
              const pending = results.filter(
                (task) => task.status === "pending"
              );
              const ongoing = results.filter(
                (task) => task.status === "ongoing"
              );
              const completed = results.filter(
                (task) => task.status === "completed"
              );
              Object.assign(data.tasks, { pending, ongoing, completed });
              res.render("member", data);
            }
          );
        }
      );
    }
  );
});

// DELETE MEMBER
router.delete("/members/:id", function (req, res, next) {
  connection.query(
    "DELETE FROM member WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/members");
    }
  );
});

// RENDER TASK PAGE
router.get("/projects/:id/tasks", function (req, res, next) {
  const data = {
    project: {},
    members: [],
  };

  connection.query(
    `SELECT p.id, p.name, p.description
       FROM project AS p
       WHERE p.id = ?;`,
    [req.params.id],
    function (error, results, fields) {
      if (error) reject(error);
      Object.assign(data.project, results[0]);

      connection.query(
        `SELECT m.id, m.name, m.contact_number
       FROM member AS m
       LEFT JOIN project_member AS pm ON m.id = pm.member_id
       WHERE pm.project_id = ?`,
        [req.params.id],
        function (error, results, fields) {
          if (error) reject(error);
          Object.assign(data.members, results);

          res.render("add-task", {
            project: data.project,
            members: data.members,
            projectId: req.params.id,
          });
        }
      );
    }
  );
});

// ADD TASK
router.post("/projects/:id/tasks", function (req, res, next) {
  connection.query(
    "INSERT INTO task (title, description, due_date, status, project_id) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.title,
      req.body.description,
      req.body.due_date,
      req.body.status,
      req.params.id,
    ],
    function (error, results, fields) {
      if (error) throw error;
      const taskId = results.insertId;

      const members = req.body.members || [];

      let query = "INSERT INTO task_member (task_id, member_id) VALUES ";

      for (let i = 0; i < members.length; i++) {
        query += `(${taskId}, ${members[i]}),`;
      }

      query = query.slice(0, -1);

      connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.redirect("/projects/" + req.params.id);
      });
    }
  );
});

// DELETE TASK
router.delete("/projects/:projectId/tasks/:taskId", function (req, res, next) {
  connection.query(
    "DELETE FROM task WHERE id = ?",
    [req.params.taskId],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/projects/" + req.params.projectId);
    }
  );
});

// RENDER EDIT TASK
router.get("/projects/:projectId/tasks/:taskId", function (req, res, next) {
  const data = {
    project: {},
    members: [],
    addedMembers: [],
    task: {},
  };

  // Establish a connection with your database
  // and assign it to the `connection` object.

  connection.query(
    `SELECT p.id, p.name, p.description
       FROM project AS p
       WHERE p.id = ?;`,
    [req.params.projectId],
    function (error, results, fields) {
      if (error) throw error;
      Object.assign(data.project, results[0]);

      connection.query(
        `SELECT m.id, m.name, m.contact_number
           FROM member AS m
           LEFT JOIN project_member AS pm ON m.id = pm.member_id
           WHERE pm.project_id = ?`,
        [req.params.projectId],
        function (error, results, fields) {
          if (error) throw error;
          Object.assign(data.members, results);

          connection.query(
            `SELECT m.id, m.name, m.contact_number
                FROM member AS m
                LEFT JOIN task_member AS tm ON m.id = tm.member_id
                WHERE tm.task_id = ?`,
            [req.params.taskId],
            function (error, results, fields) {
              if (error) throw error;
              Object.assign(data.addedMembers, results);

              connection.query(
                `SELECT t.id, t.title, t.description, t.due_date, t.status
                    FROM task AS t
                    WHERE t.id = ?`,
                [req.params.taskId],
                function (error, results, fields) {
                  if (error) throw error;

                  const year = results[0].due_date.getFullYear();
                  const month = results[0].due_date.getMonth() + 1;
                  const day = results[0].due_date.getDate();
                  const paddedMonth = month < 10 ? `0${month}` : month;
                  const paddedDay = day < 10 ? `0${day}` : day;
                  const formattedDueDate = `${year}-${paddedMonth}-${paddedDay}`;

                  const task = {
                    ...results[0],
                    due_date: formattedDueDate,
                  };
                  Object.assign(data.task, task);

                  console.log(data);

                  res.render("edit-task", {
                    project: data.project,
                    members: data.members,
                    addedMembers: data.addedMembers,
                    task: data.task,
                    projectId: req.params.projectId,
                    taskId: req.params.taskId,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// UPDATE TASK
router.put("/projects/:projectId/tasks/:taskId", function (req, res, next) {
  connection.query(
    "UPDATE task SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ?",
    [
      req.body.title,
      req.body.description,
      req.body.due_date,
      req.body.status,
      req.params.taskId,
    ],
    function (error, results, fields) {
      if (error) throw error;

      const members = req.body.members || [];

      connection.query(
        "DELETE FROM task_member WHERE task_id = ?",
        [req.params.taskId],
        function (error, results, fields) {
          if (error) throw error;

          let query = "INSERT INTO task_member (task_id, member_id) VALUES ";

          for (let i = 0; i < members.length; i++) {
            query += `(${req.params.taskId}, ${members[i]}),`;
          }

          query = query.slice(0, -1);

          connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.redirect("/projects/" + req.params.projectId);
          });
        }
      );
    }
  );
});

// SET MEMBER TO TASK
router.post(
  "/projects/:projectId/tasks/:taskId/members/:memberId",
  function (req, res, next) {
    connection.query(
      "INSERT INTO task_member (task_id, member_id) VALUES (?, ?)",
      [req.params.taskId, req.params.memberId],
      function (error, results, fields) {
        if (error) throw error;
        res.redirect("/projects/" + req.params.projectId);
      }
    );
  }
);

// REMOVE MEMBER FROM TASK
router.delete(
  "/projects/:projectId/tasks/:taskId/members/:memberId",
  function (req, res, next) {
    connection.query(
      "DELETE FROM task_member WHERE task_id = ? AND member_id = ?",
      [req.params.taskId, req.params.memberId],
      function (error, results, fields) {
        if (error) throw error;
        res.redirect("/projects/" + req.params.projectId);
      }
    );
  }
);

module.exports = router;
