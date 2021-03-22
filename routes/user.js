const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

router.get("/dashboard", checker.loginChecker, (req, res) => {
  console.log(req.session.user);
  res.render("dashboard", { user: req.session.user });
});

router.get("/info", checker.loginChecker, (req, res) => {
  if (req.session.user.gender === "male") {
    req.session.user.gender = "مرد";
  } else if (req.session.user.gender === "female") {
    req.session.user.gender = "زن";
  }
  if (req.session.user.role === "admin") {
    req.session.user.role = "مدیر";
  } else if (req.session.user.role === "blogger") {
    req.session.user.role = "نویسنده";
  }
  console.log(req.session.user.gender);
  res.render("user-info", { user: req.session.user });
});

module.exports = router;
