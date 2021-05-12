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
    next(err);
  }
});

//user information page
router.get("/info", (req, res, next) => {
  try {
    res.render("user/user-info", { user: req.session.user });
  } catch (err) {
    next(err);
  }
});

//edit user information
router.get("/edit", (req, res, next) => {
  try {
    req.session.user.lastUpdateDate = moment(
      req.session.user.lastUpdate
    ).format("HH:mm - jYYYY/jM/jD");
    res.render("user/user-edit", {
      user: req.session.user,
      success: req.flash("success"),
      messages: req.flash("messages"),
      invalid: req.flash("invalid"),
    });
  } catch (err) {
    next(err);
  }
});

//update route
router.put("/", userEditValidate.handle(), (req, res, next) => {
  try {
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
      if (err) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      }
      //if username is not valid, logout and login page
      if (!user) {
        const error = new Error("user not found");
        error.status = 404;
        next(error);
      }
      //find all user's with this requested mobile number
      User.find({ mobileNumber: req.body.mobileNumber }, (err, temp) => {
        if (err) {
          const error = new Error("Server Error");
          error.status = 500;
          next(error);
        }
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
            if (err) {
              const error = new Error("Server Error");
              error.status = 500;
              next(error);
            }
            req.session.user = user2;
            req.flash("success", "مشخصات کاربری با موفقیت ویرایش شد.");
            return res.redirect(`/user/edit`);
          }
        );
      });
    });
  } catch (err) {
    next(err);
  }
});

//display calendar in dashboard
router.get("/calendar", (req, res, next) => {
  try {
    res.render("user/user-calendar", { user: req.session.user });
  } catch (err) {
    next(err);
  }
});

//get avatar edit page
router.get("/avatar", (req, res, next) => {
  try {
    res.render("user/user-avatar", {
      user: req.session.user,
      avatar: req.flash("avatar"),
    });
  } catch (err) {
    next(err);
  }
});

//upload user avatar
router.put("/uploadAvatar", (req, res, next) => {
  try {
    //use multer middleware to check and store avatar
    const upload = generalTools.uploadAvatar.single("avatar");
    upload(req, res, function (err) {
      if (!req.file) {
        return res.redirect("/user/avatar");
      }
      if (err instanceof multer.MulterError) {
        {
          const error = new Error("Server Error");
          error.status = 500;
          next(error);
        }
      } else if (err) {
        {
          const error = new Error(err.message);
          error.status = 406;
          next(error);
        }
      } else {
        //update user avatar
        User.findByIdAndUpdate(
          req.session.user._id,
          { avatar: req.file.filename },
          { new: true },
          (err, user) => {
            if (err) {
              const error = new Error("Server Error");
              error.status = 500;
              next(error);
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
                      const error = new Error("Server Error");
                      error.status = 500;
                      next(error);
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
  } catch (err) {
    next(err);
  }
});

//delete user's avatar
router.delete("/removeAvatar", (req, res, next) => {
  try {
    //find user in our database and change avatar to default
    User.findByIdAndUpdate(
      req.session.user._id,
      { avatar: req.body.default },
      { new: true },
      (err, user) => {
        if (err) {
          const error = new Error("Server Error");
          error.status = 500;
          next(error);
        }
        //delete previous user's avatar from our host
        if (req.session.user.avatar && req.session.user.avatar !== "default") {
          fs.unlink(
            path.join(
              __dirname,
              "../public/images/avatars",
              req.session.user.avatar
            ),
            (err) => {
              if (err) {
                const error = new Error("Server Error");
                error.status = 500;
                next(error);
              }
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
  } catch (err) {
    next(err);
  }
});

//manage route only for admin
router.use("/manage", uac.userManagement, require("./admin"));

module.exports = router;
