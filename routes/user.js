const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");

//redirect user to dashboard page
router.get("/dashboard", checker.loginChecker, (req, res, next) => {
  res.render("dashboard", { user: req.session.user });
});

//user information page
router.get("/info", checker.loginChecker, (req, res, next) => {
  res.render("user-info", { user: req.session.user });
});

//edit user information
router.get("/edit", checker.loginChecker, (req, res, next) => {
  res.render("user-edit", { user: req.session.user });
});

//update route
router.put("/update", (req, res) => {
  console.log(req.body);
  //check request body is not empty
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.mobileNumber ||
    !req.body.gender ||
    !req.body.username
  ) {
    return res.status(400).json({ msg: "empty field" });
  }
  //find user by username and update
  User.findOneAndUpdate(
    req.body.username,
    req.body,
    { new: true },
    (err, user) => {
      if (err) return res.status(500).json({ msg: "server error" });
      req.session.user = user;
      return res.status(200).json({ msg: "ok" });
    }
  );
});

module.exports = router;
