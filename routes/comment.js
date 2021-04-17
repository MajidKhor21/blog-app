const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const User = require("../models/user");
const Comment = require("../models/comment");
const moment = require("moment-jalaali");
const commentValidate = require("../tools/validator/commentValidate");
const { validationResult } = require("express-validator");

router.get("/", (req, res, next) => {
  console.log(2);
  let page = req.query.page || 1;
  req.query.order = req.query.order || "desc";
  Comment.find({})
    .populate("author", { firstName: 1, lastName: 1, avatar: 1 })
    .populate("article", {
      viewCounter: 0,
      commentCounter: 0,
      brief: 0,
      describe: 0,
    })
    .exec((err, comments) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      let createTime = [];
      for (let index = 0; index < comments.length; index++) {
        createTime[index] = {
          date: moment(comments[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(comments[index].createdAt).format("HH:mm"),
        };
      }
      console.log(comments);
      return res.render("user/admin/comments", {
        user: req.session.user,
        page: req.query.page,
        comments,
        createTime,
      });
    });
});

router.post("/", commentValidate.handle(), (req, res, next) => {
  console.log(req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    const messages = [];
    errors.forEach((err) => {
      messages.push(err.msg);
    });
    req.flash("messages", messages);
    return res.redirect(`/article/view/${req.body.article_id}`);
  }
  const comment = new Comment({
    body: req.body.comment,
    author: req.session.user._id,
    article: req.body.article_id,
  });
  comment.save((err) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
  });
  Article.findByIdAndUpdate(
    req.body.article_id,
    { $inc: { commentCounter: 1 } },
    { new: true },
    (err) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      req.flash("successfullyAdded", "نظر شما با موفقیت ثبت شد");
      return res.redirect(`/article/view/${req.body.article_id}`);
    }
  );
});

module.exports = router;
