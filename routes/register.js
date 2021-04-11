const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userRegisterValidate = require("../tools/validator/userRegisterValidate");
const { validationResult } = require("express-validator");

//get register page
router.get("/", (req, res, next) => {
  console.log(req.flash);
  res.render("auth/register", {
    messages: req.flash("errors"),
    error: req.flash("error"),
  });
});

//add a new user route
router.post("/", userRegisterValidate.handle(), (req, res, next) => {
  //check request body is valid
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    const messages = [];
    errors.forEach((err) => {
      messages.push(err.msg);
    });
    req.flash("errors", messages);
    res.status(404);
    return res.redirect("/register");
  }
  //check that requested username is not valid in our database
  User.findOne({ username: req.body.username.trim() }, (err, existUser) => {
    if (err) return res.status(500).json({ msg: "server error" });
    if (existUser) {
      req.flash("error", "نام کاربری وارد شده معتبر نمی باشد.");
      res.status(404);
      return res.redirect("/register");
    }
    //check that requested mobile number is not valid in our database
    User.findOne({ mobileNumber: req.body.mobileNumber }, (err, user) => {
      if (err) return res.status(500).json({ msg: "server error" });
      if (user) {
        req.flash("error", "شماره موبایل وارد شده معتبر نمی باشد.");
        res.status(404);
        return res.redirect("/register");
      }
      //check that requested email address is not valid in our database
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).json({ msg: "server error" });
        if (user) {
          req.flash("error", "آدرس ایمیل وارد شده معتبر نمی باشد.");
          res.status(404);
          return res.redirect("/register");
        }
        //save req.body into a new object of user and save it into database
        new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          mobileNumber: req.body.mobileNumber,
          gender: req.body.gender,
        }).save((err) => {
          if (err) return res.status(500).json({ msg: "server error" });
          req.flash("registered", "عملیات ثبت نام با موفقیت انجام شد.");
          return res.status(200).redirect("/login");
        });
      });
    });
  });
});

module.exports = router;
