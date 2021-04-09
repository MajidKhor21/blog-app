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
    empty: req.flash("empty"),
    title: req.flash("title"),
  });
});

//add new article
router.post("/create", (req, res) => {
  const upload = generalTools.uploadArticlePic.single("picture");

  upload(req, res, function (err) {
    //check article picture and describe is not empty
    if (!req.file || !req.body.describe || !req.body.title || !req.body.brief) {
      req.flash("empty", "ورودی های نامعتبر");
      return res.redirect("/article/create");
    }

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
          req.flash("title", "عنوان مقاله تکراری می باشد.");
          return res.redirect("/article/create");
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
          req.flash("successfullyAdded", "با موفقیت اضافه شد.");
          return res.redirect("/user/dashboard");
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
router.get("/edit", async (req, res) => {
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
  const articles = await Article.find({
    author: req.session.user._id,
    $or: [{ title: search }, { brief: search }],
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
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
    author: req.session.user._id,
    $or: [{ title: search }, { brief: search }],
  })
    .count()
    .exec();

  return res.status(200).render("article/all-article", {
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

//get edit article single page
router.get("/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (err) return res.status(500).json({ msg: "Server Error" });
    return res.status(200).render("article/edit-article", {
      article,
      user: req.session.user,
      title: req.flash("title"),
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
            req.flash("title", "عنوان مقاله تکراری می باشد.");
            return res.redirect(`/article/edit/${req.body.id}`);
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
                    req.flash("successfullyEdit", "مقاله با موفقیت ویرایش شد.");
                    return res.redirect("/article/edit");
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
                req.flash("successfullyEdit", "مقاله با موفقیت ویرایش شد.");
                return res.redirect("/article/edit");
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
  req.flash("delete", "مقاله با موفقیت حذف شد.");
  return res.redirect("/user/dashboard");
});

module.exports = router;
