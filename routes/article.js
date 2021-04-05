const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const multer = require("multer");
const moment = require("moment-jalaali");
const generalTools = require("../tools/general-tools");
const url = require("url");
const fs = require("fs");
const path = require("path");

//get new article page
router.get("/create", (req, res) => {
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
    if (!req.file || !req.body.describe || !req.body.title || !req.body.brief)
      return res.redirect(
        url.format({
          pathname: "/article/create",
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
      Article.findOne({ title: req.body.title }, (err, article) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        if (article) {
          fs.unlinkSync(
            path.join(
              __dirname,
              "../public/images/articles/",
              req.file.filename
            )
          );
          return res.status(403).redirect(
            url.format({
              pathname: "/article/create",
              query: {
                msg: "invalid-title",
              },
            })
          );
        }
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
      });
    }
  });
});

//upload images of ckeditor
router.post("/uploader", (req, res) => {
  const upload = generalTools.uploadDescribePic.single("upload");
  upload(req, res, function (err) {
    console.log(req.file);
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ msg: "Server Error" });
    } else if (err) {
      res.status(406).send(err.message);
    } else {
      return res.json({
        uploaded: 1,
        filename: req.file.filename,
        url: `${req.file.destination}/${req.file.filename}`.substring(8),
      });
    }
  });
});

//show user's article
router.get("/my/:username", (req, res) => {
  let perPage = 6;
  let page = req.query.page || 1;
  //find all article's of this username

  Article.find({ author: req.session.user._id })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 })
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
      Article.count().exec((err, count) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        res.render("article/my-articles", {
          user: req.session.user,
          page: req.query.page,
          articles,
          createTime,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

//show article in a single page
router.get("/view/:id", (req, res) => {
  //find that article's requested
  Article.findOne({ _id: req.params.id })
    .populate("author", {
      _id: 1,
      firstName: 1,
      lastName: 1,
      avatar: 1,
    })
    .exec((err, article) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      Article.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCounter: 1 } },
        { new: true },
        (err, art) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          //change create date to jalaali datetime
          createTime = {
            date: moment(article.createdAt).format("jYYYY/jM/jD"),
            time: moment(article.createdAt).format("HH:mm"),
          };
          console.log(req.session.user, article.author);
          res.render("article/single-article", {
            user: req.session.user,
            article,
            createTime,
            art,
          });
        }
      );
    });
});

//get edit articles page
router.get("/edit", (req, res) => {
  //paginate user articles per page 10
  let perPage = 10;
  let page = req.query.page || 1;
  Article.find({ author: req.session.user._id })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 })
    .exec((err, articles) => {
      if (err) return res.status(500).json({ msg: "Server Error" });
      let lastUpdate = [];
      for (let index = 0; index < articles.length; index++) {
        lastUpdate[index] = {
          date: moment(articles[index].lastUpdate).format("jYYYY/jM/jD"),
          time: moment(articles[index].lastUpdate).format("HH:mm"),
        };
      }
      //count all article's
      Article.find({ author: req.session.user._id })
        .count()
        .exec((err, count) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          return res.status(200).render("article/all-article", {
            articles,
            lastUpdate,
            user: req.session.user,
            msg: req.query.msg,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
    });
});

//get edit article single page
router.get("/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    return res.status(200).render("article/edit-article", {
      article,
      user: req.session.user,
      msg: req.query.msg,
    });
  });
});

//update article route
router.post("/update", (req, res) => {
  //update article's picture
  const upload = generalTools.uploadArticlePic.single("picture");

  upload(req, res, function (err) {
    //check article title, describe and brief is not empty
    if (!req.body.title || !req.body.brief || !req.body.describe)
      return res.redirect(
        url.format({
          pathname: "/article/edit",
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
      //find one article with this title's requested and return
      Article.findOne(
        {
          $and: [{ title: req.body.title }, { _id: { $ne: req.body.id } }],
        },
        (err, article) => {
          if (err) return res.status(500).json({ msg: "Server Error" });
          if (article) {
            return res.redirect(
              url.format({
                pathname: `/article/edit/${req.body.id}`,
                query: {
                  msg: "invalid-title",
                },
              })
            );
          } else if (req.file) {
            //update article where update article's picture
            Article.findById(req.body.id, (err, article) => {
              if (err) return res.status(500).json({ msg: "Server Error" });
              if (article && article.picture) {
                fs.unlinkSync(
                  path.join(
                    __dirname,
                    "../public/images/articles/",
                    article.picture
                  )
                );
                Article.findByIdAndUpdate(
                  req.body.id,
                  {
                    title: req.body.title,
                    brief: req.body.brief,
                    describe: req.body.describe,
                    picture: req.file.filename,
                    lastUpdate: Date.now(),
                  },
                  (err) => {
                    if (err)
                      return res.status(500).json({ msg: "Server Error" });
                    return res.redirect(
                      url.format({
                        pathname: "/article/edit",
                        query: {
                          msg: "successfully",
                        },
                      })
                    );
                  }
                );
              }
            });
          } else {
            //find article
            Article.findByIdAndUpdate(
              req.body.id,
              {
                title: req.body.title,
                brief: req.body.brief,
                describe: req.body.describe,
                lastUpdate: Date.now(),
              },
              (err) => {
                if (err) return res.status(500).json({ msg: "Server Error" });
                return res.redirect(
                  url.format({
                    pathname: "/article/edit",
                    query: {
                      msg: "successfully",
                    },
                  })
                );
              }
            );
          }
        }
      );
    }
  });
});

//delete article
router.get("/delete/:id", async (req, res) => {
  //get article's requested
  let article = await Article.findById(req.params.id);
  if (!article) {
    return res.status(500).json({ msg: "error" });
  }
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
    fs.unlinkSync(path.join(__dirname, "../public/", element));
  });

  //find and delete article
  await Article.findByIdAndDelete(req.params.id);
  return res.redirect(
    url.format({
      pathname: "/user/dashboard",
      query: {
        msg: "successfully-deleted",
      },
    })
  );
});

module.exports = router;
