var express = require("express");

var router = express.Router();
var connection = require("../dbconnect");

/* GET home page. */
router.get("/", function (req, res, next) {
  connection.query("SELECT * FROM project", function (error, results, fields) {
    if (error) throw error;
    res.render("index", {
      title: "Projects",
      projects: results,
    });
  });
});

router.get("/projects/:id", function (req, res, next) {
  connection.query(
    "SELECT * FROM project WHERE id = ?",
    [req.params.id],
    function (error, results, fields) {
      if (error) throw error;
      res.render("project", {
        title: results[0].name,
        project: results[0],
      });
    }
  );
});

// insert new project from action="/"
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

router.get("/members", function (req, res, next) {
  res.render("members", {
    title: "Members",
  });
});

module.exports = router;
