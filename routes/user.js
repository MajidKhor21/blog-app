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
const userEditValidate = require("../tools/validator/userEditValidate");
const { validationResult } = require("express-validator");

//redirect user to dashboard page
router.get("/dashboard", async (req, res, next) => {
  try {
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
        date: moment(articles[index].createdAt).format("HH:mm - jYYYY/jM/jD"),
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
      login: req.flash("login"),
      avatar: req.flash("avatar"),
      articles,
      createTime,
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

//user information page
router.get("/info", (req, res, next) => {
  res.render("user/user-info", { user: req.session.user });
});

//edit user information
router.get("/edit", (req, res, next) => {
  req.session.user.lastUpdateDate = moment(req.session.user.lastUpdate).format(
    "HH:mm - jYYYY/jM/jD"
  );
  res.render("user/user-edit", {
    user: req.session.user,
    success: req.flash("success"),
    messages: req.flash("messages"),
    invalid: req.flash("invalid"),
  });
});

//update route
router.put("/", userEditValidate.handle(), (req, res) => {
  //check request body is valid
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    const messages = [];
    errors.forEach((err) => {
      messages.push(err.msg);
    });
    req.flash("messages", messages);
    return res.redirect(`/user/edit`);
  }
  //find user by username and check this username exist in our database
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).json({ msg: "server error" });
    //if username is not valid, logout and login page
    if (!user) return res.status(403).redirect("/logout");
    //find all user's with this requested mobile number
    User.find({ mobileNumber: req.body.mobileNumber }, (err, temp) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      //check all user's that find with requested user id and check equal
      if (temp.length !== 0) {
        for (const key in temp) {
          if (String(user._id) !== String(temp[key]._id)) {
            req.flash("invalid", "شماره موبایل وارد شده معتبر نمی باشد.");
            return res.redirect(`/user/edit/`);
          }
        }
      }
      if (
        user.firstName === req.body.firstName &&
        user.lastName === req.body.lastName &&
        user.gender === req.body.gender &&
        user.mobileNumber === req.body.mobileNumber
      ) {
        return res.redirect(`/user/edit`);
      }
      //if temp is empty or requested user id equal with temps id, update user
      User.findOneAndUpdate(
        { username: req.body.username },
        req.body,
        { new: true },
        (err, user2) => {
          if (err) return res.status(500).json({ msg: "server error" });
          req.session.user = user2;
          req.flash("success", "مشخصات کاربری با موفقیت ویرایش شد.");
          return res.redirect(`/user/edit`);
        }
      );
    });
  });
});

//display calendar in dashboard
router.get("/calendar", (req, res) => {
  res.render("user/user-calendar", { user: req.session.user });
});

//get avatar edit page
router.get("/avatar", (req, res) => {
  res.render("user/user-avatar", {
    user: req.session.user,
    avatar: req.flash("avatar"),
  });
});

//upload user avatar
router.put("/uploadAvatar", (req, res) => {
  //use multer middleware to check and store avatar
  const upload = generalTools.uploadAvatar.single("avatar");

  upload(req, res, function (err) {
    if (!req.file) {
      return res.redirect("/user/avatar");
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
            res.status(500).json({ msg: "Server Error" });
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
                    res.status(500).json({ msg: "Server Error" });
                  } else {
                    req.session.user = user;
                    req.flash("avatar", "عکس آواتار با موفقیت تغییر کرد.");
                    return res.redirect("/user/avatar");
                  }
                }
              );
            } else {
              req.session.user = user;
              req.flash("avatar", "عکس آواتار با موفقیت تغییر کرد.");
              return res.redirect("/user/avatar");
            }
          }
        }
      );
    }
  });
});

//delete user's avatar
router.delete("/removeAvatar", (req, res) => {
  //find user in our database and change avatar to default
  User.findByIdAndUpdate(
    req.session.user._id,
    { avatar: req.body.default },
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
            req.flash("avatar", "عکس آواتار با موفقیت حذف شد.");
            return res.redirect("/user/avatar");
          }
        );
      } else {
        req.session.user = user;
        req.flash("avatar", "عکس آواتار با موفقیت تغییر کرد.");
        return res.redirect("/user/avatar");
      }
    }
  );
});

//manage route only for admin
router.use("/manage", uac.userManagement, require("./admin"));

module.exports = router;
