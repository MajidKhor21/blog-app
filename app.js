const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("req-flash");
const favicon = require("serve-favicon");
const methodOverride = require("method-override");
require("./tools/initialization");
const {
  deleteArticlePicture,
  deleteDescribePicture,
  deleteAvatarsPicture,
} = require("./tools/cleaner");

const app = express();

// setup mongoose
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// set up express-session
app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: Number(process.env.SESSION_AGE),
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  app.locals = { req };
  next();
});

app.use("/", require("./routes/api"));

app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  const status = err.status || 500;

  return res
    .status(status)
    .render("error", { err: "خطایی در عملیات مورد نظر رخ داده است", status });
});

module.exports = app;
