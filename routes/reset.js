const express = require("express");
const router = express.Router();
const User = require("../models/user");
const ResetPassword = require("../models/reset-password");
const reset = require("../tools/reset");

//get reset password page
router.get("/", (req, res, next) => {
  return res.render("auth/reset", {
    errors: req.flash("error"),
    success: req.flash("success"),
  });
});

//reset pass route
router.post("/", async (req, res, next) => {
  try {
    await reset.sendEmail(req);
    req.flash(
      "success",
      "لینک بازیابی رمز عبور به آدرس ایمیل وارد شده ارسال شد."
    );
    res.redirect("/reset");
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/password/:token", (req, res) => {
  //check token is valid
  ResetPassword.findOne({ token: req.params.token }, (err, result) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    if (!result) {
      return res.status(400).redirect("/404");
    }
    return res.render("auth/reset-password", {
      token: req.params.token,
      password: req.flash("password"),
    });
  });
});

//reset password by user
router.post("/password", async (req, res) => {
  try {
    const token = req.body.token.trim();
    const regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/);
    //get token is valid
    const result = await ResetPassword.findOne({ token });
    if (!result) {
      req.flash("error", "درخواست نامعتبر");
      return res.redirect("/reset");
    }
    if (!req.body.password || !regex.test(req.body.password)) {
      req.flash(
        "password",
        "رمز عبور باید شامل 6 کاراکتر و یک حرف بزرگ و کوچک باشد"
      );
      return res.redirect(`/reset/password/${token}`);
    }
    const user = await User.findOneAndUpdate(
      { email: result.email },
      { $set: { password: req.body.password } }
    );
    if (!user) {
      req.flash("error", "کاربری با آدرس ایمیل وارد شده یافت نشد");
      return res.redirect("/reset");
    }
    await result.remove({ token: req.params.token });
    req.flash("password", "رمز عبور با موفقیت تغییر کرد");
    res.redirect("/login");
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
