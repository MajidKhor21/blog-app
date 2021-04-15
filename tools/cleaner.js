const Article = require("../models/article");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");

const deleteArticlePicture = schedule.scheduleJob("00 03 * * *", function () {
  Article.find({}, { picture: 1, _id: 0 }, (err, articles) => {
    fs.readdir(
      path.join(__dirname, "../public/images/articles"),
      (err, files) => {
        if (err) {
          console.log(err);
        }
        let pics = [];
        for (let i = 0; i < articles.length; i++) {
          pics.push(articles[i].picture);
        }
        let difference = pics
          .filter((x) => !files.includes(x))
          .concat(files.filter((x) => !pics.includes(x)));
        for (let index = 0; index < difference.length; index++) {
          fs.unlinkSync(
            path.join(__dirname, "../public/images/articles", difference[index])
          );
        }
      }
    );
  });
});

const deleteDescribePicture = schedule.scheduleJob("30 03 * * *", function () {
  Article.find({}, { describe: 1, _id: 0 }, (err, articles) => {
    let regex = new RegExp(
        "<" + "img" + " .*?" + "src" + '="/images/uploads/(.*?)"',
        "gi"
      ),
      result,
      articlePic = [];
    articles.forEach((article) => {
      while ((result = regex.exec(article.describe))) {
        articlePic.push(result[1]);
      }
    });
    let files = fs.readdirSync(
      path.join(__dirname, "../public/images/uploads")
    );
    let difference = articlePic
      .filter((x) => !files.includes(x))
      .concat(files.filter((x) => !articlePic.includes(x)));
    for (let index = 0; index < difference.length; index++) {
      fs.unlinkSync(
        path.join(__dirname, "../public/images/uploads", difference[index])
      );
    }
  });
});

module.exports = { deleteArticlePicture, deleteDescribePicture };
