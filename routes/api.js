const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* GET home page. */
router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/createAdmin", (req, res) => {
  User.findOne({ role: "admin" }, (err, existAdmin) => {
    if (err) return res.status(500).send("err in create admin");
    if (existAdmin) return res.status(404).send("Not Found!");

    new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      role: "admin",
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
    }).save((err) => {
      if (err) return res.send("err in create admin");
      return res.send("admin created successfully");
    });
  });
});

module.exports = router;
