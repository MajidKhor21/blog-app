const express = require("express");
const router = express.Router();
const User = require("../models/user");
const ResetPassowrd = require("../models/reset-password");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");
const config = require("../config/config");

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
    //check req.body is not empty
    if (!req.body.email) {
      req.flash("error", "ایمیل خود را وارد کنید");
      return res.redirect("/reset");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "کاربری با آدرس ایمیل وارد شده یافت نشد");
      return res.redirect("/reset");
    }
    const setPassword = new ResetPassowrd({
      email: req.body.email,
      token: uniqueString(),
    });

    await setPassword.save();

    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: true,
      auth: {
        user: config.emailUser, // user
        pass: config.emailPass, // password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"مکتب بلاگ 👻" <manager@maktab.info>', // sender address
      to: `${setPassword.email}`, // list of receivers
      subject: "بازیابی رمز عبور ✔", // Subject line
      text: "از طریق لینک زیر می توانید رمز عبور خود را تغییر دهید?", // plain text body
      html: `<p>با سلام</p></ br>
      <a href="${req.headers.referer}/password/${setPassword.token}">لینک بازیابی رمز عبور</a>
      </ br></ br>
      <p> اگر شما درخواست بازیابی رمز عبور را ندادید، لطفا این ایمیل را نادیده بگیرید.</p>`, // html body
    });

    await transporter.sendMail(info);

    req.flash(
      "success",
      "لینک بازیابی رمز عبور به آدرس ایمیل وارد شده ارسال شد."
    );
    res.redirect("/reset");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/password/:token", (req, res) => {
  //check token is valid
  ResetPassowrd.findOne({ token: req.params.token }, (err, result) => {
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

router.post("/password", async (req, res) => {
  try {
    const token = req.body.token.trim();
    const regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/);
    //get token is valid
    const result = await ResetPassowrd.findOne({ token });
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
