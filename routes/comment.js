const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const Comment = require("../models/comment");
const moment = require("moment-jalaali");
const commentValidate = require("../tools/validator/commentValidate");
const { validationResult } = require("express-validator");

//get all comments
router.get("/all", (req, res, next) => {
  try {
    if (req.session.user.role !== "admin") {
      const error = new Error("Permission Denied");
      error.status = 403;
      next(error);
    } else {
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
      Comment.find({ body: { $regex: search } })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("author", { firstName: 1, lastName: 1, avatar: 1 })
        .populate("article", {
          viewCounter: 0,
          commentCounter: 0,
          brief: 0,
          describe: 0,
        })
        .sort({ createdAt: order })
        .exec((err, comments) => {
          if (err) {
            const error = new Error("Server Error");
            error.status = 500;
            next(error);
          }
          let createTime = [];
          for (let index = 0; index < comments.length; index++) {
            createTime[index] = {
              date: moment(comments[index].createdAt).format(
                "HH:mm - jYYYY/jM/jD"
              ),
            };
          }
          Comment.find({ body: { $regex: search } })
            .count()
            .exec((err, commentCount) => {
              if (err) {
                const error = new Error("Server Error");
                error.status = 500;
                next(error);
              }
              return res.render("user/admin/comments", {
                user: req.session.user,
                page: req.query.page,
                successfullyDelete: req.flash("successfullyDelete"),
                comments,
                createTime,
                current: page,
                pages: Math.ceil(commentCount / perPage),
              });
            });
        });
    }
  } catch (err) {
    next(err);
  }
});

//create a new comment
router.post("/", commentValidate.handle(), (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array();
      const messages = [];
      errors.forEach((err) => {
        messages.push(err.msg);
      });
      req.flash("messages", messages);
      return res.redirect(`/article/${req.body.article_id}`);
    }
    const comment = new Comment({
      body: req.body.comment,
      author: req.session.user._id,
      article: req.body.article_id,
    });
    comment.save((err) => {
      if (err) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      }
      Article.findByIdAndUpdate(
        req.body.article_id,
        { $inc: { commentCounter: 1 } },
        { new: true },
        (err) => {
          if (err) {
            const error = new Error("Server Error");
            error.status = 500;
            next(error);
          }
          User.findByIdAndUpdate(
            req.session.user._id,
            { $inc: { commentCounter: 1 } },
            { new: true },
            (err) => {
              if (err) {
                const error = new Error("Server Error");
                error.status = 500;
                next(error);
              }
              req.flash("successfullyAdded", "نظر شما با موفقیت ثبت شد.");
              return res.redirect(`/article/${req.body.article_id}`);
            }
          );
        }
      );
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (req.session.user.role !== "admin") {
      const error = new Error("Permission Denied");
      error.status = 403;
      next(error);
    } else {
      const comment = await Comment.findOne({ _id: req.params.id });
      if (!comment) {
        const error = new Error("comment not found");
        error.status = 404;
        next(error);
      }
      await User.findByIdAndUpdate(comment.author, {
        $inc: { commentCounter: -1 },
      });
      await Article.findByIdAndUpdate(req.body.article_id, {
        $inc: { commentCounter: -1 },
      });
      await comment.remove();
      req.flash("successfullyDelete", "نظر مورد نظر با موفقیت حذف شد.");
      return res.redirect("/article/comment/all");
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
