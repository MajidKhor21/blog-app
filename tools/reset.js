const User = require("../models/user");
const ResetPassword = require("../models/reset-password");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

module.exports = {
  sendEmail: async function (req) {
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
    const setPassword = new ResetPassword({
      email: req.body.email,
      token: uniqueString(),
    });

    await setPassword.save();

    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // user
        pass: process.env.EMAIL_PASS, // password
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
  },
  sendEmailByAdmin: async function (req) {
    const user = await User.find({ _id: req.params.id });
    const setPassword = new ResetPassword({
      email: user[0].email,
      token: uniqueString(),
    });

    await setPassword.save();

    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // user
        pass: process.env.EMAIL_PASS, // password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"مکتب بلاگ 👻" <manager@maktab.info>', // sender address
      to: `${setPassword.email}`, // list of receivers
      subject: "بازیابی رمز عبور ✔", // Subject line
      text: "از طریق لینک زیر می توانید رمز عبور خود را تغییر دهید?", // plain text body
      html: `<p>با سلام</p></ br>
      <a href="http://${req.headers.host}/reset/password/${setPassword.token}">لینک بازیابی رمز عبور</a>
      </ br></ br>
      <p> اگر شما درخواست بازیابی رمز عبور را ندادید، لطفا این ایمیل را نادیده بگیرید.</p>`, // html body
    });

    await transporter.sendMail(info);
  },
};
