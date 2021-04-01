const fs = require("fs");
const path = require("path");

module.exports = (function () {
  fs.existsSync(path.join(__dirname, "../public/images")) ||
    fs.mkdirSync(path.join(__dirname, "../public/images"));
  fs.existsSync(path.join(__dirname, "../public/images/avatars")) ||
    fs.mkdirSync(path.join(__dirname, "../public/images/avatars"));
  fs.existsSync(path.join(__dirname, "../public/images/articles")) ||
    fs.mkdirSync(path.join(__dirname, "../public/images/articles"));
  fs.existsSync(path.join(__dirname, "../public/images/describes")) ||
    fs.mkdirSync(path.join(__dirname, "../public/images/describes"));
})();
