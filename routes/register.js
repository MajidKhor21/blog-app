const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

router.get("/", checker.sessionChecker, (req, res, next) => {
  res.render("register");
});

router.post("/", (req, res, next) => {
  console.log(req.body);
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.username ||
    !req.body.password ||
    !req.body.gender ||
    !req.body.mobileNumber
  ) {
    return res.status(400).json({ msg: "empty field" });
  }
  User.findOne({ username: req.body.username.trim() }, (err, existUser) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (existUser) return res.status(400).json({ msg: "user exist" });
    User.findOne({ mobileNumber: req.body.mobileNumber }, (err, user) => {
      if (err) return res.status(500).json({ msg: "server error" });
      if (user) return res.status(400).json({ msg: "phone number" });
      new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        mobileNumber: req.body.mobileNumber,
        gender: req.body.gender,
      }).save((err) => {
        if (err) return res.status(500).json({ msg: "server error" });
        return res.status(200).json({ msg: "successfully added" });
      });
    });
  });
});

module.exports = router;
