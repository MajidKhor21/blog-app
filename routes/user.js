const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

router.get("/dashboard", checker.loginChecker, (req, res) => {
  console.log(req.session.user);
  res.render("dashboard", { user: req.session.user });
});

module.exports = router;
