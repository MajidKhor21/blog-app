const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config/config");
const session = require("express-session");
const flash = require("req-flash");
const favicon = require("serve-favicon");
require("./tools/initialization");
const {
  deleteArticlePicture,
  deleteDescribePicture,
} = require("./tools/cleaner");

const app = express();

// setup mongoose
mongoose.connect(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// set up express-session
app.use(
  session({
    key: "user_sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: config.maxAge,
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

// catch 404 and forward to error handler
app.use("*", function (req, res, next) {
  res.status(404).render("404");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.redirect("/404");
});

module.exports = app;
