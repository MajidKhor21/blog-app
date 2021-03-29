const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const checker = require("../tools/checker");
const multer = require("multer");
const moment = require("moment-jalaali");
const generalTools = require("../tools/general-tools");
const url = require("url");

//get new article page
router.get("/create", checker.loginChecker, (req, res) => {
  res.render("article/new-article", {
    user: req.session.user,
    msg: req.query.msg,
  });
});

//add new article
router.post("/create", (req, res) => {
  const upload = generalTools.uploadArticlePic.single("picture");

  upload(req, res, function (err) {
    //check article picture and describe is not empty
    if (!req.file || !req.body.describe)
      return res.redirect(
        url.format({
          pathname: "/user/article/add",
          query: {
            msg: "error",
          },
        })
      );
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ msg: "Server Error" });
    } else if (err) {
      res.status(406).send(err.message);
    } else {
      //create article object
      const newArticle = new Article({
        title: req.body.title,
        brief: req.body.brief,
        describe: req.body.describe,
        picture: req.file.filename,
        author: req.session.user._id,
      });
      //save new article to our database
      newArticle.save((err) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        return res.redirect(
          url.format({
            pathname: "/user/dashboard",
            query: {
              msg: "successfully",
            },
          })
        );
      });
    }
  });
});

//show user's article
router.get("/:username", checker.loginChecker, (req, res) => {
  //find all article's of this username
  req.query.showArticle = req.query.showArticle | null;

  Article.find({ author: req.session.user._id })
    .skip(req.query.showArticle)
    .limit(6)
    .exec((err, articles) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      //change create date to jalaali datetime
      let createTime = [];
      for (let index = 0; index < articles.length; index++) {
        createTime[index] = {
          date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(articles[index].createdAt).format("HH:mm"),
        };
      }
      //find count of all articles
      Article.find({})
        .count()
        .exec((err, arts) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          res.render("article/my-articles", {
            user: req.session.user,
            articles,
            createTime,
            arts,
          });
        });
    });
});

//show article in a single page
router.get("/view/:id", checker.loginChecker, (req, res) => {
  //find that article's requested
  Article.findOne({ _id: req.params.id })
    .populate("author", {
      _id: 0,
      firstName: 1,
      lastName: 1,
      avatar: 1,
    })
    .exec((err, article) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      //change create date to jalaali datetime
      createTime = {
        date: moment(article.createdAt).format("jYYYY/jM/jD"),
        time: moment(article.createdAt).format("HH:mm"),
      };
      res.render("article/single-article", {
        user: req.session.user,
        article,
        createTime,
      });
    });
});

module.exports = router;
