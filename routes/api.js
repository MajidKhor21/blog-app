var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

module.exports = router;
