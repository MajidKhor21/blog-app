const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const checker = require("../tools/checker");
const moment = require("moment-jalaali");
const multer = require("multer");
const generalTools = require("../tools/general-tools");
const fs = require("fs");
const path = require("path");

//redirect user to dashboard page
router.get("/dashboard", checker.loginChecker, (req, res, next) => {
  req.query.showArticle = req.query.showArticle | null;
  //find all article with author's first name and last name
  Article.find({}, { __v: 0 })
    .skip(req.query.showArticle)
    .limit(6)
    .populate("author", { firstName: 1, lastName: 1, avatar: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .exec((err, articles) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      ////change create date to jalaali datetime
      let createTime = [];
      for (let index = 0; index < articles.length; index++) {
        createTime[index] = {
          date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(articles[index].createdAt).format("HH:mm"),
        };
      }
      //find count of all articles
      Article.find({})
        .count()
        .exec((err, arts) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          //render page with user , articles
          return res.status(200).render("dashboard", {
            user: req.session.user,
            msg: req.query.msg,
            articles,
            createTime,
            arts,
          });
        });
    });
});

//user information page
router.get("/info", checker.loginChecker, (req, res, next) => {
  res.render("user/user-info", { user: req.session.user });
});

//edit user information
router.get("/edit", checker.loginChecker, (req, res, next) => {
  req.session.user.lastUpdateDate = moment(req.session.user.lastUpdate).format(
    "jYYYY/jM/jD"
  );
  req.session.user.lastUpdateTime = moment(req.session.user.lastUpdate).format(
    "HH:mm"
  );
  res.render("user/user-edit", { user: req.session.user });
});

//update route
router.put("/update", (req, res) => {
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
  res.render("user/user-calendar", { user: req.session.user });
});

//get avatar edit page
router.get("/avatar", checker.loginChecker, (req, res) => {
  res.render("user/user-avatar", { user: req.session.user });
});

//upload user avatar
router.post("/uploadAvatar", (req, res) => {
  //use multer middleware to check and store avatar
  const upload = generalTools.uploadAvatar.single("avatar");

  upload(req, res, function (err) {
    if (!req.file) {
      return res.redirect("/user/dashboard");
    }
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ msg: "Server Error" });
    } else if (err) {
      res.status(406).send(err.message);
    } else {
      //update user avatar
      User.findByIdAndUpdate(
        req.session.user._id,
        { avatar: req.file.filename },
        { new: true },
        (err, user) => {
          if (err) {
            res.status(500).json({ msg: "Server Error!" });
          } else {
            //delete previous user avatar from our host
            if (
              req.session.user.avatar &&
              req.session.user.avatar !== "default"
            ) {
              fs.unlink(
                path.join(
                  __dirname,
                  "../public/images/avatars",
                  req.session.user.avatar
                ),
                (err) => {
                  if (err) {
                    res.status(500).json({ msg: "Server Error!" });
                  } else {
                    req.session.user = user;

                    res.redirect("/user/dashboard");
                  }
                }
              );
            } else {
              req.session.user = user;

              res.redirect("/user/dashboard");
            }
          }
        }
      );
    }
  });
});

//delete user's avatar
router.put("/removeAvatar", (req, res) => {
  //find user in our database and change avatar to default
  User.findByIdAndUpdate(
    req.session.user._id,
    req.body,
    { new: true },
    (err, user) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      //delete previous user's avatar from our host
      if (req.session.user.avatar && req.session.user.avatar !== "default") {
        fs.unlink(
          path.join(
            __dirname,
            "../public/images/avatars",
            req.session.user.avatar
          ),
          (err) => {
            if (err) return res.status(500).json({ msg: "Server Error" });
            req.session.user = user;
            return res.status(200).json({ msg: "ok" });
          }
        );
      } else {
        req.session.user = user;
        return res.status(200).json({ msg: "ok" });
      }
    }
  );
});

module.exports = router;
