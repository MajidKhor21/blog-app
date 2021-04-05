let uac = {};

uac.userManagement = (req, res, next) => {
  if (req.session.user.role !== "admin")
    return res.status(404).redirect("/404");
  return next();
};

module.exports = uac;
