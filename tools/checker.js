const User = require("../models/user");
const checker = {};

checker.sessionChecker = function (req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
    return res.redirect("/user/dashboard");
  }

  return next();
};

checker.loginChecker = async (req, res, next) => {
  const exist = await User.findOne({ _id: req.session.user._id });
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (!exist) {
    return res.redirect("/logout");
  }

  return next();
};

module.exports = checker;
