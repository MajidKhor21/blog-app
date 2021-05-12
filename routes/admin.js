const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const Comment = require("../models/comment");
const moment = require("moment-jalaali");
const fs = require("fs");
const path = require("path");
const reset = require("../tools/reset");

//manage all users route
router.get("/members", async (req, res, next) => {
  try {
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
        date: moment(users[index].createdAt).format("HH:mm - jYYYY/jM/jD"),
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
  } catch (err) {
    next(err);
  }
});

//reset password route for admin only
router.get("/members/reset/:id", async (req, res, next) => {
  try {
    await reset.sendEmailByAdmin(req);
    req.flash(
      "resetPassword",
      "لینک بازیابی رمز عبور به آدرس ایمیل کاربر مورد نظر ارسال شد."
    );
    return res.redirect("/user/manage/members");
  } catch (err) {
    next(err);
  }
});

//delete user with articles route for admin only
router.delete("/members/:id", async (req, res, next) => {
  try {
    const user = await User.find({ _id: req.params.id });
    if (!user.length > 0) {
      const error = new Error("user not found");
      error.status = 404;
      next(error);
    }
    const articles = await Article.find({ author: req.params.id });
    let commentsByMember = await Comment.find({ author: req.params.id });
    commentsByMember.forEach(async (element) => {
      await Article.findByIdAndUpdate(element.article, {
        $inc: { commentCounter: -1 },
      });
    });
    if (articles) {
      articles.forEach(async (art) => {
        let comments = await Comment.find({ article: art._id });
        comments.forEach(async (element) => {
          await User.findByIdAndUpdate(element.author, {
            $inc: { commentCounter: -1 },
          });
        });
      });
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
      for (let index = 0; index < articles.length; index++) {
        await Comment.deleteMany({ article: articles[index]._id });
      }
    }
    if (user[0].avatar !== "default") {
      fs.unlinkSync(
        path.join(__dirname, "../public/images/avatars/", user[0].avatar)
      );
    }
    await User.deleteOne({ _id: req.params.id });
    await Comment.deleteMany({ author: req.params.id });
    req.flash("deleted", "کاربر مورد نظر با موفقیت حذف شد.");
    return res.status(200).redirect("/user/manage/members");
  } catch (err) {
    next(err);
  }
});

//show all articles route for admin only
router.get("/articles", async (req, res, next) => {
  try {
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
        date: moment(articles[index].lastUpdate).format("HH:mm - jYYYY/jM/jD"),
      };
      createAt[index] = {
        date: moment(articles[index].createdAt).format("HH:mm - jYYYY/jM/jD"),
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
      successfullyDelete: req.flash("delete"),
      user: req.session.user,
      page: req.query.page,
      order: req.query.order,
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    next(err);
  }
});

//delete user's articles by admin
router.delete("/articles/:id", async (req, res, next) => {
  try {
    //get article's requested
    let article = await Article.findById(req.params.id);
    if (!article) {
      const error = new Error("article not found");
      error.status = 404;
      next(error);
    }
    //check if who is requested for delete this article is admin!!
    if (req.session.user.role === "admin") {
      //delete picture of article from our host
      fs.unlinkSync(
        path.join(__dirname, "../public/images/articles/", article.picture)
      );
      //find source of images that uses in describe and delete them from our host
      let regex = new RegExp("<" + "img" + " .*?" + "src" + '="(.*?)"', "gi"),
        result,
        articlePic = [];
      while ((result = regex.exec(article.describe))) {
        articlePic.push(result[1]);
      }
      articlePic.forEach((element) => {
        fs.unlinkSync(path.join(__dirname, "../public", element));
      });
      let comments = await Comment.find({ article: req.params.id });
      comments.forEach(async (element) => {
        await User.findByIdAndUpdate(element.author, {
          $inc: { commentCounter: -1 },
        });
      });
      //find and delete article
      await Article.findByIdAndDelete(req.params.id);
      await User.findOneAndUpdate(
        { _id: article.author },
        { $inc: { articleCounter: -1 } }
      );
      await Comment.deleteMany({ article: req.params.id });
      req.flash("delete", "مقاله با موفقیت حذف شد.");
      res.redirect("/user/manage/articles");
    } else {
      const error = new Error("Permission Denied");
      error.status = 403;
      next(error);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
