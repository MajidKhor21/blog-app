const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const User = require("../models/user");
const Comment = require("../models/comment");
const moment = require("moment-jalaali");
const commentValidate = require("../tools/validator/commentValidate");
const { validationResult } = require("express-validator");

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
  comment.save();
  req.flash("successfullyAdded", "نظر شما با موفقیت ثبت شد");
  return res.redirect(`/article/view/${req.body.article_id}`);
});

module.exports = router;
