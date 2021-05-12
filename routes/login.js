const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const userLoginValidate = require("../tools/validator/userLoginValidate");
const { validationResult } = require("express-validator");

//get login page
router.get("/", (req, res, next) => {
  try {
    res.render("auth/login", {
      password: req.flash("password"),
      messages: req.flash("messages"),
      registered: req.flash("registered"),
    });
  } catch (err) {
    next(err);
  }
});

//login route
router.post("/", userLoginValidate.handle(), (req, res, next) => {
  try {
    //check req.body is valid
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      const messages = [];
      errors.forEach((err) => {
        messages.push(err.msg);
      });
      req.flash("messages", messages);
      res.status(404);
      return res.redirect("/login");
    }
    //find that username requested
    User.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      }
      if (!user) {
        req.flash("messages", "کاربری وجود ندارد");
        res.status(404);
        return res.redirect("/login");
      }
      //check that req.body.password is match with password of username that into our database
      bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
        if (err) {
          const error = new Error("Server Error");
          error.status = 500;
          next(error);
        }
        if (!isMatch) {
          req.flash("messages", "کاربری وجود ندارد");
          res.status(404);
          return res.redirect("/login");
        }
        //copy that user into session
        req.session.user = user;

        req.flash("login", "شما با موفقیت وارد شدید.");
        res.status(200).redirect("/user/dashboard");
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
