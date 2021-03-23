const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

router.get("/dashboard", checker.loginChecker, (req, res) => {
  console.log(new Date());
  res.render("dashboard", { user: req.session.user });
});

router.get("/info", checker.loginChecker, (req, res) => {
  res.render("user-info", { user: req.session.user });
});

router.get("/edit", checker.loginChecker, (req, res) => {
  res.render("user-edit", { user: req.session.user });
});

module.exports = router;
