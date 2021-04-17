const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const User = require("../models/user");
const Comment = require("../models/comment");
const multer = require("multer");
const moment = require("moment-jalaali");
const generalTools = require("../tools/general-tools");
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
      User.findOne({ _id: req.session.user._id }, (err, user) => {
        if (err) return res.status(500).json({ msg: "Server Error" });
        if (!user) {
          return res.status(404).redirect("/logout");
        }
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
            User.findByIdAndUpdate(
              req.session.user._id,
              { $inc: { articleCounter: 1 } },
              { new: true },
              (err, user) => {
                if (err) return res.status(500).json({ msg: "Server Error" });
                req.session.user = user;
                req.flash("successfullyAdded", "با موفقیت اضافه شد.");
                return res.redirect("/user/dashboard");
              }
            );
          });
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
        url: `/images/uploads/${req.file.filename}`,
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
  let perPage = 2;
  let page = req.query.page || 1;
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
          Comment.find({ article: req.params.id })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate("author", { firstName: 1, lastName: 1, avatar: 1 })
            .sort({ createdAt: -1 })
            .exec((err, comments) => {
              if (err) return res.status(500).json({ msg: "Server Error" });
              const commentCreateTime = [];
              for (let index = 0; index < comments.length; index++) {
                commentCreateTime[index] = {
                  date: moment(comments[index].createdAt).format("jYYYY/jM/jD"),
                  time: moment(comments[index].createdAt).format("HH:mm"),
                };
              }
              Comment.find({})
                .count()
                .exec((err, commentCount) => {
                  if (err) return res.status(500).json({ msg: "Server Error" });
                  console.log(commentCount);
                  res.render("article/single-article", {
                    user: req.session.user,
                    messages: req.flash("messages"),
                    successfullyAdded: req.flash("successfullyAdded"),
                    article,
                    createTime,
                    art,
                    comments,
                    commentCreateTime,
                    page: req.query.page,
                    current: page,
                    pages: Math.ceil(commentCount / perPage),
                  });
                });
            });
        }
      );
    });
});

//get edit articles page
router.get("/edit", async (req, res) => {
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

    res.status(200).render("article/all-article", {
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
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
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
  try {
    //get article's requested
    let article = await Article.findById(req.params.id);
    if (!article) throw new Error("article not found");
    //check if who is requested for delete this article is admin or author of this article
    if (
      article.author == req.session.user._id ||
      req.session.user.role === "admin"
    ) {
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
      await User.findByIdAndUpdate(req.session.user._id, {
        $inc: { articleCounter: -1 },
      });
      req.flash("delete", "مقاله با موفقیت حذف شد.");
      res.redirect("/user/dashboard");
    }
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

//comment route
router.use("/comment", require("./comment"));

module.exports = router;
