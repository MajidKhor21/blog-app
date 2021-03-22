const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const checker = require("../tools/checker");

router.get("/", checker.sessionChecker, (req, res, next) => {
  res.render("login");
});

router.post("/", (req, res, next) => {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ msg: "empty fields" });
  }
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (!user) return res.status(400).json({ msg: "user not found" });

    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
      if (err) return res.status(500).json({ msg: "server error" });
      if (!isMatch) return res.status(400).json({ msg: "user not found" });

      req.session.user = user;

      //   return res.redirect("/dashboard");
      return res.send("ok");
    });
  });
});

module.exports = router;
