const User = require("../models/user");
const checker = {};

checker.sessionChecker = function (req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
    return res.redirect("/user/dashboard");
  }
  return next();
};

checker.loginChecker = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  } else {
    User.findOne({ _id: req.session.user._id }, (err, user) => {
      if (err) console.log(err);
      if (!user) return res.redirect("/logout");
    });
  }

  next();
};

module.exports = checker;
