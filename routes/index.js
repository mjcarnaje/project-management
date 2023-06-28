var express = require("express");

var router = express.Router();
var connection = require("../dbconnect");

/* GET home page. */
router.get("/", function (req, res, next) {
  connection.query(
    `SELECT p.id, p.name, COUNT(pm.member_id) AS member_count
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

router.get("/projects/:id", function (req, res, next) {
  const data = {
    project: {},
    members: [],
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
      res.render("new-member", {
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

// ADD PROJECT
router.post("/", function (req, res, next) {
  connection.query(
    "INSERT INTO project (name, description) VALUES (?, ?)",
    [req.body.name, req.body.description],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/");
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

// ADD MEMBER
router.post("/members", function (req, res, next) {
  connection.query(
    "INSERT INTO member (name, contact_number) VALUES (?, ?)",
    [req.body.name, req.body.contact_number],
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/members");
    }
  );
});

// GET SINGLE MEMBER
router.get("/members/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM member WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.render("member", {
        member: results[0],
      });
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

module.exports = router;
