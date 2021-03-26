const express = require("express");
const router = express.Router();
const User = require("../models/user");
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

router.post("/add", (req, res) => {
  const upload = generalTools.uploadArticlePic.single("picture");

  upload(req, res, function (err) {
    // let a = req.body.editor.replaceAll("\r", "");
    // req.body.editor = a;
    console.log(req.body);
    if (!req.file)
      return res.redirect(
        url.format({
          pathname: "/user/article/add",
          query: {
            msg: "error",
          },
        })
      );
    // console.log(req.file);
    // console.log(req);
    // console.log(req.body);
    // console.log(req.session.user);
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ msg: "Server Error" });
    } else if (err) {
      res.status(406).send(err.message);
    } else {
    }
  });
});

module.exports = router;
