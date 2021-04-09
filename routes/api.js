const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

router.get("/", (req, res) => {
  res.redirect("/login");
});

// define register route
router.use("/register", checker.sessionChecker, require("./register"));

// define login route
router.use("/login", checker.sessionChecker, require("./login"));

//define reset password route
router.use("/reset", checker.sessionChecker, require("./reset"));

//define user route
router.use("/user", checker.loginChecker, require("./user"));

//logout
router.get("/logout", (req, res) => {
  res.clearCookie("user_sid");
  res.redirect("/login");
});

//define article route
router.use("/article", checker.loginChecker, require("./article"));

//create admin user at first
router.post("/createAdmin", (req, res) => {
  console.log(1);
  User.findOne({ role: "admin" }, (err, existAdmin) => {
    if (err) return res.status(500).send("err in create admin");
    if (existAdmin) return res.status(404).send("Not Found!");

    new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: "admin",
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
    }).save((err) => {
      if (err) return res.send("err in create admin2");
      return res.send("admin created successfully");
    });
  });
});

router.get("/404", (req, res) => {
  return res.render("404");
});

module.exports = router;
