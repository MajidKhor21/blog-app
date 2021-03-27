const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const checker = require("../tools/checker");
const multer = require("multer");
const moment = require("moment-jalaali");
const generalTools = require("../tools/general-tools");
const fs = require("fs");
const path = require("path");
const url = require("url");

//get new article page
router.get("/add", checker.loginChecker, (req, res) => {
  res.render("new-article", { user: req.session.user, msg: req.query.msg });
});

//add new article
router.post("/add", (req, res) => {
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
  Article.find({ author: req.session.user._id }, (err, articles) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    //change create date to jalaali datetime
    let createTime = [];
    for (let index = 0; index < articles.length; index++) {
      createTime[index] = {
        date: moment(articles[index].createdAt).format("jYYYY/jM/jD"),
        time: moment(articles[index].createdAt).format("HH:mm"),
      };
    }
    res.render("my-articles", {
      user: req.session.user,
      articles,
      createTime,
    });
  });
});

module.exports = router;
