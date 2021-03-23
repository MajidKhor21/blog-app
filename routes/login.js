const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const checker = require("../tools/checker");

//get login page
router.get("/", checker.sessionChecker, (req, res, next) => {
  res.render("login");
});

//login route
router.post("/", (req, res, next) => {
  console.log(req.body);
  //check req.body is not empty
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ msg: "empty fields" });
  }
  //find that username requested
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (!user) return res.status(400).json({ msg: "user not found" });
    //check that req.body.password is match with password of username that into our database
    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
      if (err) return res.status(500).json({ msg: "server error" });
      if (!isMatch) return res.status(400).json({ msg: "user not found" });
      //copy that user into session
      req.session.user = user;

      return res.send("ok");
    });
  });
});

module.exports = router;
