const express = require("express");
const router = express.Router();
const User = require("../models/user");
const ResetPassowrd = require("../models/reset-password");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

//get reset password page
router.get("/", (req, res, next) => {
  return res.render("auth/reset", {
    errors: req.flash("error"),
    success: req.flash("success"),
  });
});

//reset pass route
router.post("/", async (req, res, next) => {
  console.log(req.headers.referer);
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

  await setPassword.save((err) => {
    console.log(err);
  });

  // create reusable transporter object using the default SMTP transport
  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: "m.requiem21@gmail.com", // user
      pass: "464794646a", // password
    },
  });

  console.log(setPassword.email);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"مکتب بلاگ 👻" <manager@maktab.info>', // sender address
    to: `${setPassword.email}`, // list of receivers
    subject: "بازیابی رمز عبور ✔", // Subject line
    text: "از طریق لینک زیر می توانید رمز عبور خود را تغییر دهید?", // plain text body
    html: `<a href="${req.headers.referer}/password/${setPassword.token}">لینک بازیابی رمز عبور</a>`, // html body
  });

  console.log(info);

  await transporter.sendMail(info, (err) => {
    if (err) console.log(err.message);

    req.flash(
      "success",
      "لینک تغییر رمز عبور به آدرس ایمیل وارد شده ارسال شد."
    );
    return res.redirect("/reset");
  });
});

router.get("/password/:token", (req, res) => {
  return res.render("auth/reset-password", {
    token: req.params.token,
    password: req.flash("password"),
  });
});

router.post("/password", async (req, res) => {
  const token = req.body.token.trim();
  const regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/);

  const result = await ResetPassowrd.findOne({ token });
  if (!result) {
    req.flash("error", "درخواست نامعتبر");
    return res.redirect("/reset");
  }
  if (result.used) {
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
  await result.updateOne({ used: true });
  req.flash("password", "رمز عبور با موفقیت تغییر کرد");
  return res.redirect("/login");
});

module.exports = router;
