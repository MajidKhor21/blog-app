const checker = {};

checker.sessionChecker = function (req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
    return res.redirect("/user/dashboard");
  }

  return next();
};

checker.loginChecker = function (req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  return next();
};

module.exports = checker;
