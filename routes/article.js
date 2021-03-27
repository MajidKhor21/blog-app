const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const checker = require("../tools/checker");
const multer = require("multer");
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
    console.log(req.body);
    console.log(req.session.user._id);
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
      const newArticle = new Article({
        title: req.body.title,
        brief: req.body.brief,
        describe: req.body.describe,
        picture: req.file.filename,
        author: req.session.user._id,
      });
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

module.exports = router;
