const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const ResetPassowrd = require("../models/reset-password");
const moment = require("moment-jalaali");
const fs = require("fs");
const path = require("path");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

//manage all users route
router.get("/members", async (req, res, next) => {
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
  console.log(users);
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
    error: req.flash("error"),
    resetPassword: req.flash("resetPassword"),
    deleted: req.flash("deleted"),
    users,
    createTime,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

//reset password route for admin only
router.get("/members/reset/:id", async (req, res, next) => {
  const user = await User.find({ _id: req.params.id });
  const setPassword = new ResetPassowrd({
    email: user[0].email,
    token: uniqueString(),
  });

  await setPassword.save((err) => {
    console.log(err);
  });
  console.log(setPassword);

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

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"مکتب بلاگ 👻" <manager@maktab.info>', // sender address
    to: `${setPassword.email}`, // list of receivers
    subject: "بازیابی رمز عبور ✔", // Subject line
    text: "از طریق لینک زیر می توانید رمز عبور خود را تغییر دهید?", // plain text body
    html: `<a href="http://${req.headers.host}/reset/password/${setPassword.token}">لینک بازیابی رمز عبور</a>`, // html body
  });

  await transporter.sendMail(info, (err) => {
    if (err) console.log(err.message);

    req.flash(
      "resetPassword",
      "لینک بازیابی رمز عبور به آدرس ایمیل کاربر مورد نظر وارد شده ارسال شد."
    );
    return res.redirect("/user/manage/members");
  });
});

//delete user with articles route for admin only
router.get("/members/delete/:id", async (req, res, next) => {
  console.log(req.cookies);
  const articles = await Article.find({ author: req.params.id });
  const user = await User.find({ _id: req.params.id });
  if (articles) {
    //delete picture of article from our host
    for (let index = 0; index < articles.length; index++) {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../public/images/articles/",
          articles[index].picture
        )
      );
    }
    //find source of images that uses in describe and delete them from our host
    let regex = new RegExp("<" + "img" + " .*?" + "src" + '="(.*?)"', "gi"),
      result,
      articlePic = [];

    articles.forEach((article) => {
      while ((result = regex.exec(article.describe))) {
        articlePic.push(result[1]);
      }
    });

    articlePic.forEach((element) => {
      fs.unlinkSync(path.join(__dirname, "../public/", element));
    });
    await Article.deleteMany({ author: req.params.id });
  }
  if (user[0].avatar !== "default") {
    fs.unlinkSync(
      path.join(__dirname, "../public/images/avatars/", user[0].avatar)
    );
  }
  await User.deleteOne({ _id: req.params.id });
  req.flash("deleted", "کاربر مد نظر با موفقیت حذف شد.");
  return res.status(200).redirect("/user/manage/members");
});

router.get("/articles", async (req, res, next) => {
  //paginate user articles per page 10
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
  //show only author's articles
  const articles = await Article.find({
    $or: [{ title: search }, { brief: search }],
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate("author", { firstName: 1, lastName: 1, _id: 0 })
    .sort({ createdAt: order });
  let lastUpdate = [];
  let createAt = [];
  for (let index = 0; index < articles.length; index++) {
    lastUpdate[index] = {
      date: moment(articles[index].lastUpdate).format("jYYYY/jM/jD"),
      time: moment(articles[index].lastUpdate).format("HH:mm"),
    };
    createAt[index] = {
      date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
      time: moment(articles[index].createdAt).format("HH:mm"),
    };
  }
  const count = await Article.find({
    $or: [{ title: search }, { brief: search }],
  })
    .count()
    .exec();
  return res.status(200).render("user/admin/user-articles", {
    articles,
    lastUpdate,
    createAt,
    successfullyEdit: req.flash("successfullyEdit"),
    user: req.session.user,
    page: req.query.page,
    order: req.query.order,
    current: page,
    pages: Math.ceil(count / perPage),
  });
});

module.exports = router;
