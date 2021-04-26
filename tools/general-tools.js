const path = require("path");
const multer = require("multer");

let generalTools = {};

//avatar storage
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/avatars"));
  },
  filename: function (req, file, cb) {
    cb(null, `${req.session.user.username}-${Date.now()}-${file.originalname}`);
  },
});

//article picture storage
const articlePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/articles"));
  },
  filename: function (req, file, cb) {
    cb(null, `${req.session.user.username}-${Date.now()}-${file.originalname}`);
  },
});

//describe picture storage
const describePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/uploads"));
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(
      null,
      `${req.session.user.username}-${Date.now()}.${file.mimetype.substring(6)}`
    );
  },
});

//upload avatar function
generalTools.uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: function (req, file, cb) {
    // !file.originalname.match(/\.(jpg|jpeg|png)$/)
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("invalid type!"), false);
    }
  },
});

//upload article picture function
generalTools.uploadArticlePic = multer({
  storage: articlePicStorage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("invalid type!"), false);
    }
  },
});

//upload describe picture function
generalTools.uploadDescribePic = multer({
  storage: describePicStorage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("invalid type!"), false);
    }
  },
});

module.exports = generalTools;
