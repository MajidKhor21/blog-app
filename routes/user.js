const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const moment = require("moment-jalaali");
const multer = require("multer");
const generalTools = require("../tools/general-tools");
const fs = require("fs");
const path = require("path");
const uac = require("../tools/uac");

//redirect user to dashboard page
router.get("/dashboard", async (req, res, next) => {
  let perPage = 6;
  let page = req.query.page || 1;
  let search = new RegExp(req.query.search, "i");
  req.query.order = req.query.order || "desc";
  let order = -1;
  if (req.query.order === "asc") {
    order = 1;
  } else if (req.query.order === "desc") {
    order = -1;
  }

  const articles = await Article.find({
    $or: [{ title: { $regex: search } }, { brief: { $regex: search } }],
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate("author", { firstName: 1, lastName: 1, avatar: 1, _id: 0 })
    .sort({ createdAt: order });
  let createTime = [];
  for (let index = 0; index < articles.length; index++) {
    createTime[index] = {
      date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
      time: moment(articles[index].createdAt).format("HH:mm"),
    };
  }
  const count = await Article.find({
    $or: [{ title: { $regex: search } }, { brief: { $regex: search } }],
  })
    .count()
    .exec();
  return res.status(200).render("dashboard", {
    user: req.session.user,
    page: req.query.page,
    successfullyAdded: req.flash("successfullyAdded"),
    remove: req.flash("delete"),
    articles,
    createTime,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

//user information page
router.get("/info", (req, res, next) => {
  res.render("user/user-info", { user: req.session.user });
});

//edit user information
router.get("/edit", (req, res, next) => {
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
    !req.body.username ||
    !req.body.email
  ) {
    return res.status(400).json({ msg: "empty field" });
  }
  //find user by username and check this username exist in our database
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (!user) return res.status(400).json({ msg: "not found" });
    User.findOneAndUpdate(
      { username: req.body.username },
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
router.get("/calendar", (req, res) => {
  res.render("user/user-calendar", { user: req.session.user });
});

//get avatar edit page
router.get("/avatar", (req, res) => {
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

//manage all users route
router.get("/manage", uac.userManagement, async (req, res, next) => {
  let perPage = 10;
  let page = req.query.page || 1;
  let search = new RegExp(req.query.search, "i");
  req.query.order = req.query.order || "desc";
  let order = -1;
  if (req.query.order === "asc") {
    order = 1;
  } else if (req.query.order === "desc") {
    order = -1;
  }

  const users = await User.find({
    role: { $ne: "admin" },
    $or: [{ firstName: search }, { lastName: search }, { username: search }],
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: order });
  let createTime = [];
  for (let index = 0; index < users.length; index++) {
    createTime[index] = {
      date: moment(users[index].createdAt).format("jYYYY/jM/jD"),
      time: moment(users[index].createdAt).format("HH:mm"),
    };
  }
  const count = await User.count({
    role: { $ne: "admin" },
    $or: [{ firstName: search }, { lastName: search }, { username: search }],
  }).exec();
  return res.status(200).render("user/admin/all-users", {
    user: req.session.user,
    msg: req.query.msg,
    page: req.query.page,
    order: req.query.order,
    invalid: req.flash("invalid"),
    users,
    createTime,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

//edit users by admin
router.get("/manage/edit/:id", uac.userManagement, (req, res, next) => {
  User.find({ _id: req.params.id }, (err, member) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    if (member.length === 0) {
      req.flash("invalid", "کاربر مد نظر وجود ندارد");
      return res.status(403).redirect("/user/manage");
    }
    member[0].lastUpdateDate = moment(req.session.user.lastUpdate).format(
      "jYYYY/jM/jD"
    );
    member[0].lastUpdateTime = moment(req.session.user.lastUpdate).format(
      "HH:mm"
    );
    return res.render("user/admin/edit-user", {
      member: member,
      user: req.session.user,
    });
  });
});

module.exports = router;
