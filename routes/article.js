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
router.get("/create", (req, res, next) => {
  try {
    res.render("article/new-article", {
      user: req.session.user,
      empty: req.flash("empty"),
      title: req.flash("title"),
      messages: req.flash("messages"),
    });
  } catch (err) {
    next(err);
  }
});

//add new article
router.post("/create", (req, res, next) => {
  try {
    const upload = generalTools.uploadArticlePic.single("picture");
    upload(req, res, function (err) {
      if (
        !req.file ||
        !req.body.title ||
        !req.body.brief ||
        !req.body.describe
      ) {
        const error = new Error("not found");
        error.status = 500;
        next(error);
      }
      //check article picture and describe is not empty
      if (err instanceof multer.MulterError) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      } else if (err) {
        const error = new Error(err.message);
        error.status = 406;
        next(error);
      } else {
        User.findOne({ _id: req.session.user._id }, (err, user) => {
          if (err) {
            const error = new Error("Server Error");
            error.status = 500;
            next(error);
          }
          if (!user) {
            return res.status(404).redirect("/logout");
          }
          Article.findOne({ title: req.body.title }, (err, article) => {
            if (err) {
              const error = new Error("Server Error");
              error.status = 500;
              next(error);
            }
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
              if (err) {
                const error = new Error("Server Error");
                error.status = 500;
                next(error);
              }
              User.findByIdAndUpdate(
                req.session.user._id,
                { $inc: { articleCounter: 1 } },
                { new: true },
                (err, user) => {
                  if (err) {
                    const error = new Error("Server Error");
                    error.status = 500;
                    next(error);
                  }
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
  } catch (err) {
    next(err);
  }
});

//upload images of ckeditor
router.post("/uploader", (req, res, next) => {
  try {
    const upload = generalTools.uploadDescribePic.single("upload");
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      } else if (err) {
        const error = new Error(err.message);
        error.status = 406;
        next(error);
      } else {
        return res.json({
          uploaded: 1,
          filename: req.file.filename,
          url: `/images/uploads/${req.file.filename}`,
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

//show user's article
router.get("/my/:username", (req, res, next) => {
  try {
    let perPage = 6;
    let page = req.query.page || 1;
    //find all article's of this username
    Article.find({ author: req.session.user._id })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec((err, articles) => {
        if (err) {
          const error = new Error("Server Error");
          error.status = 500;
          next(error);
        }
        if (!articles) {
          const error = new Error("Not Found");
          error.status = 404;
          next(error);
        }
        //change create date to jalaali datetime
        let createTime = [];
        for (let index = 0; index < articles.length; index++) {
          createTime[index] = {
            date: moment(articles[index].createdAt).format(
              "HH:mm - jYYYY/jM/jD"
            ),
          };
        }
        //find count of all articles
        Article.count().exec((err, count) => {
          if (err) {
            const error = new Error("Server Error");
            error.status = 500;
            next(error);
          }
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
  } catch (err) {
    next(err);
  }
});

// show article in a single page
router.get("/:id", async (req, res, next) => {
  try {
    let perPage = 2;
    let page = req.query.page || 1;
    // let userModel = await UserModel.find({});
    let article = await Article.findOne({ _id: req.params.id })
      .populate("author", { _id: 1, firstName: 1, lastName: 1, avatar: 1 })
      .exec();
    if (!article) {
      const error = new Error("not found");
      error.status = 404;
      next(error);
    }
    if (!article.userView.includes(req.session.user._id)) {
      let art = await Article.findByIdAndUpdate(
        req.params.id,
        { $push: { userView: req.session.user._id }, $inc: { viewCounter: 1 } },
        { new: true }
      );
      createTime = {
        date: moment(article.createdAt).format("jYYYY/jM/jD"),
        time: moment(article.createdAt).format("HH:mm"),
      };
      let comments = await Comment.find({ article: req.params.id })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("author", { firstName: 1, lastName: 1, avatar: 1 })
        .sort({ createdAt: -1 })
        .exec();
      const commentCreateTime = [];
      for (let index = 0; index < comments.length; index++) {
        commentCreateTime[index] = {
          date: moment(comments[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(comments[index].createdAt).format("HH:mm"),
        };
      }
      const commentCount = await Comment.find({ article: req.params.id })
        .count()
        .exec();
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
    } else {
      createTime = {
        date: moment(article.createdAt).format("jYYYY/jM/jD"),
        time: moment(article.createdAt).format("HH:mm"),
      };
      let comments = await Comment.find({ article: req.params.id })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("author", { firstName: 1, lastName: 1, avatar: 1 })
        .sort({ createdAt: -1 })
        .exec();
      const commentCreateTime = [];
      for (let index = 0; index < comments.length; index++) {
        commentCreateTime[index] = {
          date: moment(comments[index].createdAt).format("jYYYY/jM/jD"),
          time: moment(comments[index].createdAt).format("HH:mm"),
        };
      }
      const commentCount = await Comment.find({ article: req.params.id })
        .count()
        .exec();
      let art = article;
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
    }
  } catch (err) {
    next(err);
  }
});

//get all articles in a page
router.get("/", async (req, res, next) => {
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
        date: moment(articles[index].lastUpdate).format("HH:mm - jYYYY/jM/jD"),
      };
      createAt[index] = {
        date: moment(articles[index].createdAt).format("HH:mm - jYYYY/jM/jD"),
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
      successfullyDelete: req.flash("delete"),
      user: req.session.user,
      page: req.query.page,
      order: req.query.order,
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    next(err);
  }
});

//get edit article single page
router.get("/edit/:id", (req, res, next) => {
  try {
    Article.findById(req.params.id, (err, article) => {
      if (err) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      }
      if (!article) {
        const error = new Error("not found");
        error.status = 404;
        next(error);
      }
      return res.status(200).render("article/edit-article", {
        article,
        user: req.session.user,
        title: req.flash("title"),
        messages: req.flash("messages"),
      });
    });
  } catch (err) {
    next(err);
  }
});

//update article route
router.put("/", (req, res, next) => {
  try {
    //update article's picture
    const upload = generalTools.uploadArticlePic.single("picture");
    upload(req, res, function (err) {
      //check article title, describe and brief is not empty
      if (!req.body.title || !req.body.brief || !req.body.describe)
        return res.redirect("/article");
      if (err instanceof multer.MulterError) {
        const error = new Error("Server Error");
        error.status = 500;
        next(error);
      } else if (err) {
        const error = new Error(err.message);
        error.status = 406;
        next(error);
      } else {
        //find one article with this title's requested and return
        Article.findOne(
          {
            $and: [{ title: req.body.title }, { _id: { $ne: req.body.id } }],
          },
          (err, article) => {
            if (err) {
              const error = new Error("Server Error");
              error.status = 500;
              next(error);
            }
            if (article) {
              req.flash("title", "عنوان مقاله تکراری می باشد.");
              return res.redirect(`/article/edit/${req.body.id}`);
            } else if (req.file) {
              //update article where update article's picture
              Article.findById(req.body.id, (err, article) => {
                if (err) {
                  const error = new Error("Server Error");
                  error.status = 500;
                  next(error);
                }
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
                    { new: true },
                    (err) => {
                      if (err) {
                        const error = new Error("Server Error");
                        error.status = 500;
                        next(error);
                      }
                      req.flash(
                        "successfullyEdit",
                        "مقاله با موفقیت ویرایش شد."
                      );
                      return res.redirect("/article");
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
                { new: true },
                (err) => {
                  if (err) return res.status(500).json({ msg: "Server Error" });
                  req.flash("successfullyEdit", "مقاله با موفقیت ویرایش شد.");
                  return res.redirect("/article");
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    next(err);
  }
});

//delete article
router.delete("/:id", async (req, res, next) => {
  try {
    //get article's requested
    let article = await Article.findById(req.params.id);
    if (!article) {
      const error = new Error("article not found");
      error.status = 404;
      next(error);
    }
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
      let comments = await Comment.find({ article: req.params.id });
      comments.forEach(async (element) => {
        await User.findByIdAndUpdate(element.author, {
          $inc: { commentCounter: -1 },
        });
      });
      //find and delete article
      await Article.findByIdAndDelete(req.params.id);
      await User.findByIdAndUpdate(req.session.user._id, {
        $inc: { articleCounter: -1 },
      });
      await Comment.deleteMany({ article: req.params.id });
      req.flash("delete", "مقاله با موفقیت حذف شد.");
      res.redirect("/article");
    } else {
      const error = new Error("Permission Denied");
      error.status = 403;
      next(error);
    }
  } catch (err) {
    next(err);
  }
});

//comment route
router.use("/comment", require("./comment"));

module.exports = router;
