const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checker = require("../tools/checker");
const moment = require("moment-jalaali");
const multer = require("multer");
const generalTools = require("../tools/general-tools");

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
  req.session.user.lastUpdateDate = moment(req.session.user.lastUpdate).format(
    "jYYYY/jM/jD"
  );
  req.session.user.lastUpdateTime = moment(req.session.user.lastUpdate).format(
    "HH:mm"
  );
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
  //find user by username and check this username exist in our database
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (!user) return res.status(400).json({ msg: "not found" });
    //find user by user._id and update with req.body
    User.findByIdAndUpdate(
      { _id: user._id },
      req.body,
      { new: true },
      (err, user2) => {
        if (err) return res.status(500).json({ msg: "server error" });
        req.session.user = user2;
        return res.status(200).json({ msg: "ok" });
      }
    );
  });
});

//display calendar in dashboard
router.get("/calendar", checker.loginChecker, (req, res) => {
  res.render("user-calendar", { user: req.session.user });
});

//get avatar edit page
router.get("/avatar", checker.loginChecker, (req, res) => {
  res.render("user-avatar", { user: req.session.user });
});

//upload user avatar
router.post("/uploadAvatar", (req, res) => {
  console.log(req.body);
  const upload = generalTools.uploadAvatar.single("avatar");

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(404).send("Server Error!");
    } else if (err) {
      res.status(406).send(err.message);
    } else {
      let a = req.file;
      console.log(a);
      res.json(true);
    }
  });
});

module.exports = router;
